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

// ── Google OAuth & Token Rotation ─────────────────────────────────────────────

/**
 * Initiates the Google OAuth 2.0 flow by redirecting the browser to the backend
 * authorization initiation endpoint.
 *
 * @param {string} [returnTo] - Allowed frontend URL to return to after successful login.
 */
export const initiateGoogleLogin = (returnTo = window.location.origin) => {
  const target = new URL(`${API_BASE_URL}/auth/google`);
  if (returnTo) {
    target.searchParams.set('returnTo', returnTo);
  }
  window.location.href = target.toString();
};

/**
 * Exchange Google credential / ID token directly with the backend.
 */
export const googleLogin = async (credential: string) => {
  const { data } = await authApi.post('/google', { credential });
  return data;
};

/**
 * Fetches the current user profile from /me endpoint.
 * Works seamlessly with httpOnly session cookies or Bearer Authorization header.
 * @returns {{ success: boolean, user: object }}
 */
export const getCurrentUser = async () => {
  const { data } = await authApi.get('/me');
  return data;
};

/**
 * Rotates the refresh token and acquires a new access token via httpOnly cookies.
 * @returns {{ success: boolean, user: object, tokens: object }}
 */
export const refreshTokens = async () => {
  const { data } = await authApi.post('/refresh');
  return data;
};

