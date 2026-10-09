/**
 * src/context/AuthContext.tsx
 *
 * Global authentication state.
 *
 * Session strategy
 * ─────────────────
 * Access token  : 15 minutes  (JWT in localStorage + Bearer header)
 * Refresh token : 7 days      (httpOnly cookie, rotated on every use)
 *
 * A proactive silent-refresh loop fires ~60 s before each access token
 * expires, calls POST /api/auth/refresh, and swaps in the new token
 * transparently — no user interaction needed.
 *
 * The user is only asked to log in again once the 7-day refresh token
 * itself expires — NOT every 15 minutes.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { logout as logoutApi, refreshTokens } from '../services/authService';
import { useDispatch } from 'react-redux';
import { clearCart }     from '../store/slices/cartSlice';
import { clearWishlist } from '../store/slices/wishlistSlice';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Decode a JWT payload (client-side only — no signature verification). */
const decodeJwt = (token: string): Record<string, any> | null => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

/**
 * Returns true when the token exists and has not expired.
 * Applies a 10-second buffer to avoid edge-case races.
 */
const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now() + 10_000;
};

/**
 * Milliseconds from now until 60 s before the token expires.
 * Returns 0 when the token is already expired or imminently expiring.
 */
const msUntilRefresh = (token: string | null): number => {
  if (!token) return 0;
  const payload = decodeJwt(token);
  if (!payload?.exp) return 0;
  const refreshAt = payload.exp * 1000 - 60_000; // 60 s before expiry
  return Math.max(refreshAt - Date.now(), 0);
};

/** Keys to wipe from localStorage on logout. */
const LOCAL_STORAGE_KEYS = [
  'token', 'user',
  'cart',  'cart_cache',
  'wishlist', 'wishlist_cache',
];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AuthUser {
  id:            string;
  name:          string;
  email:         string;
  role:          string;
  avatar?:       string | null;   // stored profile image
  picture?:      string | null;   // Google profile picture (alias for avatar)
  displayName?:  string | null;   // Google display name   (alias for name)
  provider?: 'local' | 'google';   // auth provider: 'google' | 'local'
  authProvider?: string | null;   // alternative provider field name
  authProviders?: string[];       // list of linked providers
  permissions?:  string[];
  [key: string]: any;             // forward-compatible with any extra server fields
}

interface AuthContextValue {
  user:            AuthUser | null;
  token:           string   | null;
  loading:         boolean;
  isAuthenticated: boolean;
  login:           (token: string, user: AuthUser) => void;
  logout:          () => Promise<void>;
  updateUser:      (patch: Partial<AuthUser>) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [token,   setToken]   = useState<string   | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const dispatch     = useDispatch();
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Cancel pending timer ───────────────────────────────────────────────────

  const cancelRefreshTimer = useCallback(() => {
    if (refreshTimer.current !== null) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  }, []);

  // ── Schedule the next silent refresh ──────────────────────────────────────

  /**
   * Sets a timer to transparently swap the access token before it expires.
   *
   * Success → stores new token, re-schedules itself.
   * Failure → full logout (refresh token expired — happens after 7 days only).
   */
  const scheduleRefresh = useCallback((currentToken: string) => {
    cancelRefreshTimer();

    const delay = msUntilRefresh(currentToken);

    refreshTimer.current = setTimeout(async () => {
      try {
        const res        = await refreshTokens();
        const newToken   = res?.tokens?.accessToken ?? res?.token ?? null;
        const newUser    = res?.user ?? null;

        if (!newToken) throw new Error('No token in refresh response');

        localStorage.setItem('token', newToken);
        setToken(newToken);

        if (newUser) {
          localStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
        }

        scheduleRefresh(newToken); // re-arm for the next cycle
      } catch {
        // Refresh token expired or revoked.
        // This happens at most once per 7 days — not every 15 minutes.
        doLogout();
      }
    }, delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelRefreshTimer]);

  // ── doLogout (internal — does not depend on logout useCallback below) ──────

  const doLogout = useCallback(async () => {
    cancelRefreshTimer();
    try { await logoutApi(); } catch { /* ignore */ }
    LOCAL_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    dispatch(clearCart());
    dispatch(clearWishlist());
    setToken(null);
    setUser(null);
  }, [cancelRefreshTimer, dispatch]);

  // ── Rehydrate on mount ─────────────────────────────────────────────────────

  useEffect(() => {
    let alive = true;

    const restore = async () => {
      // Strip oauth success query param if present (from redirect flow)
      const params = new URLSearchParams(window.location.search);
      if (params.get('oauth') === 'success') {
        params.delete('oauth');
        const clean = params.size ? `?${params.toString()}` : '';
        window.history.replaceState({}, '', window.location.pathname + clean);
      }

      // ── Strategy 1: cookie session via /me ─────────────────────────────────
      try {
        const { getCurrentUser } = await import('../services/authService');
        const res = await getCurrentUser();

        if (res?.user && alive) {
          const freshToken = res?.tokens?.accessToken ?? res?.token ?? null;

          setUser(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));

          if (freshToken) {
            localStorage.setItem('token', freshToken);
            setToken(freshToken);
            scheduleRefresh(freshToken);
          }

          setLoading(false);
          return;
        }
      } catch {
        // /me failed — no cookie session, try localStorage below
      }

      // ── Strategy 2: valid localStorage token ──────────────────────────────
      const storedToken = localStorage.getItem('token');
      const storedUser  = localStorage.getItem('user');

      if (storedToken && isTokenValid(storedToken)) {
        if (alive) {
          try {
            const parsedUser: AuthUser = JSON.parse(storedUser ?? '');
            setToken(storedToken);
            setUser(parsedUser);
            scheduleRefresh(storedToken);
          } catch {
            LOCAL_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
            dispatch(clearCart());
            dispatch(clearWishlist());
          }
        }
      } else if (storedToken) {
        // ── Strategy 3: expired token — attempt silent refresh ────────────────
        try {
          const res      = await refreshTokens();
          const newToken = res?.tokens?.accessToken ?? res?.token ?? null;

          if (newToken && alive) {
            localStorage.setItem('token', newToken);
            setToken(newToken);
            if (res?.user) {
              localStorage.setItem('user', JSON.stringify(res.user));
              setUser(res.user);
            }
            scheduleRefresh(newToken);
          }
        } catch {
          // Refresh token also expired → clean slate, user must re-login
          LOCAL_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
          dispatch(clearCart());
          dispatch(clearWishlist());
        }
      }

      if (alive) setLoading(false);
    };

    restore();

    return () => {
      alive = false;
      cancelRefreshTimer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Public actions ─────────────────────────────────────────────────────────

  /** Called after every successful login / register / Google auth. */
  const login = useCallback((newToken: string, userData: AuthUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user',  JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    scheduleRefresh(newToken); // arm the silent-refresh cycle
  }, [scheduleRefresh]);

  /** Patch specific fields on the user object without re-login. */
  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  /** Public logout — exposed via context. */
  const logout = doLogout;

  // ── Derived ────────────────────────────────────────────────────────────────

  /**
   * isAuthenticated is true when:
   *   - user object is present (from any auth method), AND
   *   - either no token (cookie-only session) or the token is not yet expired
   */
  const isAuthenticated = useMemo(
    () => Boolean(user && (token ? isTokenValid(token) : true)),
    [user, token]
  );

  const value = useMemo<AuthContextValue>(() => ({
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

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
