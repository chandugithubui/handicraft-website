/**
 * src/components/admin/AdminGuard.tsx
 *
 * Route guard that ensures only authenticated admin/staff users can access admin routes.
 * Optionally verifies specific permission requirement.
 */

import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { FiShield, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { isAdminUser, hasUserPermission } from '../../utils/authUtils';
import LoadingSpinner from '../common/LoadingSpinner';

interface AdminGuardProps {
  requiredPermission?: string;
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  requiredPermission,
  children,
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Verifying admin credentials..." />
      </div>
    );
  }

  // If not logged in -> redirect to login with return state
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If logged in but is a regular customer/user -> redirect to profile
  if (!isAdminUser(user)) {
    return <Navigate to="/profile" replace />;
  }

  // If a specific permission is required for this subroute
  if (requiredPermission && !hasUserPermission(user, requiredPermission)) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-amber-200 shadow-card text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <FiAlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600 mb-6">
          Your current role (<span className="font-semibold text-primary">{user.role}</span>) does not have the{' '}
          <code className="px-2 py-0.5 bg-gray-100 rounded text-red-600 font-mono text-sm">
            {requiredPermission}
          </code>{' '}
          permission needed to view this section.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-600 transition-colors shadow-sm"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Admin Overview
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
