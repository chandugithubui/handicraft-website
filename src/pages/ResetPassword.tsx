import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiLock, FiArrowRight } from 'react-icons/fi';
import { resetPassword } from '../services/authService';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(
        token,
        formData.password
      );

      setSuccess(response.message);

      setFormData({
        password: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to reset password. Please try again.'
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
              <FiLock />
            </div>

            <h1 className="auth-title">
              Reset Password
            </h1>

            <p className="auth-subtitle">
              Create a new password for your Handicraft Hub account.
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
                <FiLock className="label-icon" />
                New Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter new password"
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiLock className="label-icon" />
                Confirm Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirm new password"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit-btn"
              disabled={loading || Boolean(success)}
            >
              {loading
                ? 'Resetting...'
                : success
                  ? 'Password Reset'
                  : 'Reset Password'}

              <FiArrowRight className="btn-icon" />
            </button>

          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Remember your password?{' '}
              <Link
                to="/login"
                className="auth-link"
              >
                Back to Login
              </Link>
            </p>
          </div>

        </div>

        <div className="auth-info">

          <h2 className="auth-info-title">
            Create a New Password
          </h2>

          <p className="auth-info-description">
            Choose a new password to secure your
            Handicraft Hub account.
          </p>

          <div className="auth-features">

            <div className="auth-feature">
              <span className="feature-icon">✓</span>
              <span className="feature-text">
                Minimum 6 Characters
              </span>
            </div>

            <div className="auth-feature">
              <span className="feature-icon">✓</span>
              <span className="feature-text">
                Secure Password Hashing
              </span>
            </div>

            <div className="auth-feature">
              <span className="feature-icon">✓</span>
              <span className="feature-text">
                One-Time Reset Link
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ResetPassword;