/**
 * src/components/rbac/PermissionGate.tsx
 *
 * Production-ready RBAC authorization gate for frontend UI elements.
 * Renders children only if current user has the required permission or role.
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';

export interface PermissionGateProps {
  permission?: string;
  roles?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  roles,
  fallback = null,
  children,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Super admin always has access
  if (user.role === 'super_admin') {
    return <>{children}</>;
  }

  // Check role match
  if (roles && roles.length > 0) {
    const hasRole = roles.includes(user.role);
    if (!hasRole) return <>{fallback}</>;
  }

  // Check specific permission if user permissions list is provided in user object
  if (permission && Array.isArray((user as any).permissions)) {
    const userPermissions: string[] = (user as any).permissions;
    const hasWildcard = userPermissions.includes('*');
    const hasExact = userPermissions.includes(permission);
    const hasModuleWildcard = userPermissions.includes(`${permission.split(':')[0]}:*`);

    if (!hasWildcard && !hasExact && !hasModuleWildcard) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

export default PermissionGate;
