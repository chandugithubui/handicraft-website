/**
 * src/context/AuthContext.jsx
 *
 * Global authentication state.
 *
 * Improvements over the original:
 *  - Token expiry guard on rehydration — an expired JWT in localStorage
 *    is silently cleared instead of being treated as valid.
 *  - updateUser() helper — lets Profile page patch user fields in context
 *    without a full re-login.
 *  - logout() calls the backend to clear the httpOnly cookie before
 *    wiping local state.
 *  - isAuthenticated is derived from both token presence AND expiry,
 *    not just token presence.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { logout as logoutApi } from '../services/authService';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Decode a JWT payload without verifying the signature.
 * We only use this client-side to check the `exp` claim so we
 * don't show a stale session on page load.
 *
 * @param {string} token
 * @returns {object|null} decoded payload, or null if malformed
 */
const decodeJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

/**
 * Returns true if the token exists and has not yet expired.
 * Adds a 10-second buffer so we never present an about-to-expire token.
 *
 * @param {string|null} token
 */
const isTokenValid = (token) => {
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload?.exp) return false;
  // exp is in seconds; subtract 10s buffer
  return payload.exp * 1000 > Date.now() + 10_000;
};

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  // loading stays true until rehydration completes
  const [loading, setLoading] = useState(true);

  // ── Rehydrate session on mount (cookies + localStorage fallback) ───────────
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      // Check if arriving from OAuth redirect
      const params = new URLSearchParams(window.location.search);
      const isOAuthSuccess = params.get('oauth') === 'success';

      if (isOAuthSuccess) {
        // Clean URL without triggering page reload
        params.delete('oauth');
        const cleanSearch = params.toString() ? `?${params.toString()}` : '';
        window.history.replaceState({}, document.title, window.location.pathname + cleanSearch);
      }

      // 1. Try fetching current user from httpOnly cookie session (/me)
      try {
        const { getCurrentUser } = await import('../services/authService');
        const res = await getCurrentUser();
        if (res?.user && isMounted) {
          setUser(res.user);
          // Sync stored user representation
          localStorage.setItem('user', JSON.stringify(res.user));
          setLoading(false);
          return;
        }
      } catch {
        // Cookie session not present or expired — try localStorage fallback below
      }

      // 2. Fallback to localStorage token if available and valid
      const storedToken = localStorage.getItem('token');
      const storedUser  = localStorage.getItem('user');

      if (storedToken && isTokenValid(storedToken)) {
        if (isMounted) {
          setToken(storedToken);
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Persist a successful auth result (login / register / oauth).
   * @param {string} [newToken]
   * @param {object} userData
   */
  const login = useCallback((newToken, userData) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    }
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  }, []);

  /**
   * Patch fields on the current user object in context.
   */
  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  /**
   * Sign out: clear server session cookie, wipe local storage, reset React state.
   */
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────────

  /**
   * User is authenticated if user object exists (from verified httpOnly cookie or valid token).
   */
  const isAuthenticated = useMemo(
    () => Boolean(user && (token ? isTokenValid(token) : true)),
    [user, token]
  );


  // ── Context value ──────────────────────────────────────────────────────────

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
  }), [user, token, loading, isAuthenticated, login, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to consume auth context.
 * Throws a clear error if used outside <AuthProvider>.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
};
