import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';
import { forgotPassword } from '../services/authService';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await forgotPassword(email);

      setSuccess(response.message);
      setEmail('');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to send password reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">

          <div className="auth-header">
            <div className="auth-icon">
              <FiMail />
            </div>

            <h1 className="auth-title">
              Forgot Password?
            </h1>

            <p className="auth-subtitle">
              Enter your email address and we'll send you
              a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <div className="form-group">
              <label className="form-label">
                <FiMail className="label-icon" />
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit-btn"
              disabled={loading}
            >
              {loading
                ? 'Sending...'
                : 'Send Reset Link'}

              <FiSend className="btn-icon" />
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              <Link
                to="/login"
                className="auth-link"
              >
                <FiArrowLeft />
                {' '}Back to Login
              </Link>
            </p>
          </div>

        </div>

        <div className="auth-info">
          <h2 className="auth-info-title">
            Secure Password Recovery
          </h2>

          <p className="auth-info-description">
            We'll send a secure password reset link
            to your registered email address.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <span className="feature-icon">✓</span>
              <span className="feature-text">
                Secure Reset Link
              </span>
            </div>

            <div className="auth-feature">
              <span className="feature-icon">✓</span>
              <span className="feature-text">
                Link Expires in 15 Minutes
              </span>
            </div>

            <div className="auth-feature">
              <span className="feature-icon">✓</span>
              <span className="feature-text">
                One-Time Use Token
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;