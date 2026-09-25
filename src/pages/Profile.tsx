import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLogOut } from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-empty">
            <FiUser className="empty-icon" />
            <h2>Please log in to view your profile</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>My Profile</h1>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar">
              <FiUser className="avatar-icon" />
            </div>
            <h2 className="profile-name">{user.name || 'User'}</h2>
            <p className="profile-email">{user.email || ''}</p>

            <div className="profile-details">
              <div className="detail-item">
                <FiMail className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{user.email || 'Not provided'}</span>
                </div>
              </div>

              {user.phone && (
                <div className="detail-item">
                  <FiPhone className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{user.phone}</span>
                  </div>
                </div>
              )}

              {user.address && (
                <div className="detail-item">
                  <FiMapPin className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{user.address}</span>
                  </div>
                </div>
              )}

              {user.role === 'admin' && (
                <div className="detail-item admin-badge">
                  <span className="detail-label">Role</span>
                  <span className="detail-value">Administrator</span>
                </div>
              )}
            </div>

            <div className="profile-actions">
              <button className="btn-logout" onClick={handleLogout}>
                <FiLogOut />
                Logout
              </button>
            </div>
          </div>

          <div className="profile-links">
            <a href="/orders" className="profile-link">
              <span>My Orders</span>
            </a>
            {user.role === 'admin' && (
              <a href="/admin" className="profile-link">
                <span>Admin Dashboard</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
