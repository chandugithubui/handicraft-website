/**
 * src/config/api.config.js
 *
 * Single source of truth for the backend API base URL.
 * All service files import from here — never hardcode URLs elsewhere.
 *
 * Resolution order:
 *   1. REACT_APP_API_URL env var  (set this in Vercel / .env)
 *   2. Hostname-based detection   (fallback for local dev)
 */

const resolveApiUrl = (): string => {
  // Purely driven by environment variable REACT_APP_API_URL
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Fallback for local development
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = resolveApiUrl();
