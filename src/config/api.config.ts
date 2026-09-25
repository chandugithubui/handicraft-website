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

const resolveApiUrl = () => {
  // Explicit override always wins (Vercel env var, .env.local, etc.)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  const { hostname } = window.location;

  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }

  // Any Vercel preview / production deployment → Render backend
  if (hostname.includes('vercel.app') || hostname.includes('handicraft')) {
    return 'https://handicraft-website.onrender.com/api';
  }

  // Safe fallback
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = resolveApiUrl();
