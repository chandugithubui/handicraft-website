/**
 * src/services/authService.js
 *
 * All HTTP calls to /api/auth/*.
 * Uses a single pre-configured axios instance so headers,
 * base URL, and cookie credentials are set in one place.
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

// ── Axios instance ────────────────────────────────────────────────────────────

/**
 * Shared instance for all auth requests.
 *
 * withCredentials: true  — sends the httpOnly hh_token cookie on every
 *                          cross-origin request (Vercel → Render backend).
 */
const authApi = axios.create({
  baseURL:         `${API_BASE_URL}/auth`,
  withCredentials: true,
  headers:         { 'Content-Type': 'application/json' },
});

/**
 * Attach the JWT from localStorage on every request (Bearer header).
 * The backend accepts EITHER the header OR the cookie — whichever arrives.
 */
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth service functions ────────────────────────────────────────────────────

/**
 * Register a new local account.
 * @returns {{ token: string, user: object, message: string }}
 */
export const register = async (name, email, password) => {
  const { data } = await authApi.post('/register', { name, email, password });
  return data;
};

/**
 * Sign in with email + password.
 * @returns {{ token: string, user: object, message: string }}
 */
export const login = async (email, password) => {
  const { data } = await authApi.post('/login', { email, password });
  return data;
};

/**
 * Authenticate (or register) via Google One-Tap / popup.
 * Sends the raw Google ID token — backend verifies with Google and
 * issues a Handicraft Hub JWT.
 *
 * @param {string} credential - Raw Google ID token from @react-oauth/google
 * @returns {{ token: string, user: object, message: string }}
 */
export const googleLogin = async (credential) => {
  const { data } = await authApi.post('/google', { credential });
  return data;
};

/**
 * Fetch the authenticated user's profile.
 * Token is attached automatically by the request interceptor.
 * @returns {{ user: object }}
 */
export const getProfile = async () => {
  const { data } = await authApi.get('/profile');
  return data;
};

/**
 * Sign out — clears the httpOnly cookie server-side.
 * Caller is responsible for clearing localStorage / AuthContext state.
 */
export const logout = async () => {
  try {
    await authApi.post('/logout');
  } catch {
    // Ignore network errors on logout — local state is cleared regardless
  }
};

/**
 * Request a password-reset email.
 * @param {string} email
 * @returns {{ message: string }}
 */
export const forgotPassword = async (email) => {
  const { data } = await authApi.post('/forgot-password', { email });
  return data;
};

/**
 * Submit a new password using the reset token from the email link.
 * @param {string} token    - Raw token from URL param
 * @param {string} password - New password
 * @returns {{ message: string }}
 */
export const resetPassword = async (token, password) => {
  const { data } = await authApi.post(`/reset-password/${token}`, { password });
  return data;
};
