/**
 * src/index.js — React entry point
 *
 * GoogleOAuthProvider wraps the entire app so <GoogleLogin> buttons
 * rendered anywhere in the tree share the same Google Identity Services
 * context without re-initialising the `GIS library.
 *
 * Required environment variables:
 *   REACT_APP_GOOGLE_CLIENT_ID  — Google OAuth 2.0 Web Client ID
 *   REACT_APP_API_URL           — Backend API base URL
 *
 * Set both in:
 *   • .env             (local development)
 *   • Vercel dashboard (production / preview deployments)
 */

import React                    from 'react';
import ReactDOM                 from 'react-dom/client';
import { GoogleOAuthProvider }  from '@react-oauth/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App                      from './App';
import reportWebVitals          from './reportWebVitals';

// ── Dev-time guard ────────────────────────────────────────────────────────────
// Fail fast with a clear message instead of a cryptic Google error.
if (
  process.env.NODE_ENV === 'development' &&
  !process.env.REACT_APP_GOOGLE_CLIENT_ID
) {
  console.error(
    '[Handicraft Hub] ⚠️  REACT_APP_GOOGLE_CLIENT_ID is not set.\n' +
    'Google Sign-In will not work.\n' +
    'Add it to your .env file:\n' +
    '  REACT_APP_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com'
  );
}

// ── Render ────────────────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();
