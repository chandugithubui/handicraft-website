import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../services/authService';
import GoogleSignInButton from '../components/GoogleSignInButton';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }

    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('oauth_error');
    if (oauthError) {
      setError(`Google sign-up was not completed (${oauthError}). Please try again.`);
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await registerApi(
        formData.name,
        formData.email,
        formData.password,
      );
      login(response.token, response.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* ── Form card ── */}
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon"><FiUser /></div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Join Handicraft Hub and discover authentic Indian handicrafts
            </p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          {/* ── Google OAuth Button ── */}
          <GoogleSignInButton label="Sign up with Google" />

          <div className="auth-divider">
            <span>or sign up with email</span>
          </div>

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                <FiUser className="label-icon" />
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                <FiMail className="label-icon" />
                Email Address
              </label>
              <input
                id="reg-email"
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
              <label className="form-label" htmlFor="reg-password">
                <FiLock className="label-icon" />
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Create a password (min 6 characters)"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">
                <FiLock className="label-icon" />
                Confirm Password
              </label>
              <input
                id="reg-confirm"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirm your password"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create Account'}
              <FiArrowRight className="btn-icon" />
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>

        {/* ── Info panel ── */}
        <div className="auth-info">
          <h2 className="auth-info-title">Join Our Community</h2>
          <p className="auth-info-description">
            Become part of a community that celebrates Indian craftsmanship
            and supports local artisans.
          </p>
          <div className="auth-features">
            {[
              'Exclusive Member Deals',
              'Early Access to New Products',
              'Artisan Stories & Updates',
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

export default Register;
