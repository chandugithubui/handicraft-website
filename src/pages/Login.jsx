/**
 * src/pages/Login.jsx
 *
 * Email/password login + Google One-Tap.
 * Google logic is fully encapsulated in useGoogleAuth —
 * this component only owns the email/password form state.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';

import { useAuth }      from '../context/AuthContext';
import useGoogleAuth    from '../hooks/useGoogleAuth';
import { login as loginApi } from '../services/authService';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  // ── Google auth (hook handles everything) ──────────────────────────────────
  const {
    handleGoogleSuccess,
    handleGoogleError,
    googleLoading,
    googleError,
  } = useGoogleAuth({ redirectTo: '/' });

  // ── Email / password form ──────────────────────────────────────────────────
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginApi(formData.email, formData.password);
      login(response.token, response.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Combined error — show whichever is set
  const displayError = error || googleError;
  const isLoading    = loading || googleLoading;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* ── Form card ── */}
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon"><FiUser /></div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Sign in to continue your journey with Handicraft Hub
            </p>
          </div>

          {displayError && (
            <div className="auth-error" role="alert">
              {displayError}
            </div>
          )}

          {/* Email / password form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                <FiMail className="label-icon" />
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                <FiLock className="label-icon" />
                Password
              </label>
              <input
                id="login-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="auth-actions">
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit-btn"
              disabled={isLoading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
              <FiArrowRight className="btn-icon" />
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider"><span>OR</span></div>

          {/* Google button — all logic lives in useGoogleAuth */}
          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="continue_with"
              shape="rectangular"
              size="large"
              width="350"
              useOneTap={false}
            />
          </div>

          {googleLoading && (
            <p className="google-loading-text">Signing in with Google…</p>
          )}

          <div className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Create one</Link>
            </p>
          </div>
        </div>

        {/* ── Info panel ── */}
        <div className="auth-info">
          <h2 className="auth-info-title">Discover Authentic Handicrafts</h2>
          <p className="auth-info-description">
            Join thousands of customers who support Indian artisans and bring
            home unique, handcrafted treasures.
          </p>
          <div className="auth-features">
            {[
              '500+ Verified Artisans',
              '10,000+ Unique Products',
              'Secure Payments',
            ].map((text) => (
              <div className="auth-feature" key={text}>
                <span className="feature-icon">✓</span>
                <span className="feature-text">{text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
