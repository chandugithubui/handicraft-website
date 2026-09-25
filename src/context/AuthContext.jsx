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
  // loading stays true until localStorage rehydration completes
  // so children don't flash an unauthenticated state on first render
  const [loading, setLoading] = useState(true);

  // ── Rehydrate from localStorage on mount ───────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');

    if (storedToken && isTokenValid(storedToken)) {
      // Token is present and not expired — restore session
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupted user JSON — clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else if (storedToken) {
      // Token exists but is expired — clean up silently
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    setLoading(false);
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Persist a successful auth result (login / register / Google).
   * Called by Login, Register, and useGoogleAuth hook after a successful API call.
   *
   * @param {string} newToken
   * @param {object} userData  - public user shape: { id, name, email, role, avatar }
   */
  const login = useCallback((newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user',  JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  /**
   * Patch fields on the current user object in context + localStorage.
   * Useful for profile updates without requiring a full re-login.
   *
   * @param {Partial<object>} patch - fields to merge into user
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
   * Sign out:
   *   1. Ask the backend to clear the httpOnly cookie.
   *   2. Wipe localStorage.
   *   3. Clear React state.
   *
   * Fire-and-forget on the API call — local state is always cleared
   * even if the network request fails.
   */
  const logout = useCallback(async () => {
    try {
      await logoutApi(); // clears httpOnly hh_token cookie
    } catch {
      // Network failure — proceed with local cleanup anyway
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────────

  /**
   * isAuthenticated is true only when a non-expired token is present.
   * Memoised so consumers do not re-render on unrelated state changes.
   */
  const isAuthenticated = useMemo(
    () => isTokenValid(token),
    [token]
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
