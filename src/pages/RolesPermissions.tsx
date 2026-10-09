/**
 * src/pages/RolesPermissions.tsx
 *
 * Super Admin Roles & Permissions Management Page.
 * Styled 100% with Tailwind CSS utilities.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiShield,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiCheck,
  FiX,
  FiUsers,
  FiLock,
  FiArrowLeft,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiKey,
  FiSliders,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import {
  useRoles,
  useUsersWithRoles,
  usePermissionsManifest,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useAssignUserRole,
} from '../hooks/api/useRbac';
import RoleBadge from '../components/rbac/RoleBadge';
import { RoleResponse, PermissionModule } from '../types/api';

type TabType = 'roles' | 'assignments' | 'matrix';

export const RolesPermissions: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Active tab
  const [activeTab, setActiveTab] = useState<TabType>('roles');

  // Search & Filters
  const [roleSearch, setRoleSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleResponse | null>(null);

  // Form states for Create/Edit
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as string[],
  });
  const [formError, setFormError] = useState('');

  // Notification feedback state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Queries
  const {
    data: roles = [],
    isLoading: rolesLoading,
    isRefetching: rolesRefetching,
    refetch: refetchRoles,
  } = useRoles(isAuthenticated);

  const {
    data: users = [],
    isLoading: usersLoading,
    isRefetching: usersRefetching,
    refetch: refetchUsers,
  } = useUsersWithRoles(isAuthenticated && activeTab === 'assignments');

  const {
    data: manifest,
    isLoading: manifestLoading,
  } = usePermissionsManifest(isAuthenticated);

  // Mutations
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  const assignRoleMutation = useAssignUserRole();

  // All permission keys flat list
  const allPermissionKeys = useMemo(() => {
    if (!manifest?.modules) return [];
    return manifest.modules.flatMap((m) => m.permissions.map((p) => p.key));
  }, [manifest]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const q = roleSearch.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.displayName.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    });
  }, [roles, roleSearch]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole =
        selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, selectedRoleFilter]);

  // Handle open create modal
  const openCreateModal = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      permissions: [],
    });
    setFormError('');
    setIsCreateModalOpen(true);
  };

  // Handle open edit modal
  const openEditModal = (role: RoleResponse) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description || '',
      permissions: [...role.permissions],
    });
    setFormError('');
  };

  // Permission selection helpers
  const handleTogglePermission = (key: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(key);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== key)
          : [...prev.permissions, key],
      };
    });
  };

  const handleToggleModule = (module: PermissionModule) => {
    const moduleKeys = module.permissions.map((p) => p.key);
    const allSelected = moduleKeys.every((k) => formData.permissions.includes(k));

    setFormData((prev) => {
      if (allSelected) {
        return {
          ...prev,
          permissions: prev.permissions.filter((k) => !moduleKeys.includes(k)),
        };
      } else {
        const set = new Set([...prev.permissions, ...moduleKeys]);
        return {
          ...prev,
          permissions: Array.from(set),
        };
      }
    });
  };

  const handleSelectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [...allPermissionKeys],
    }));
  };

  const handleClearAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [],
    }));
  };

  // Handle Create Role Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Role identifier is required.');
      return;
    }
    if (!formData.displayName.trim()) {
      setFormError('Display name is required.');
      return;
    }
    if (formData.permissions.length === 0) {
      setFormError('Please select at least one permission.');
      return;
    }

    try {
      await createRoleMutation.mutateAsync({
        name: formData.name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
        displayName: formData.displayName.trim(),
        description: formData.description.trim(),
        permissions: formData.permissions,
      });

      setIsCreateModalOpen(false);
      showToast('success', `Role "${formData.displayName}" created successfully.`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to create role.';
      setFormError(msg);
    }
  };

  // Handle Edit Role Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    setFormError('');

    if (!formData.displayName.trim()) {
      setFormError('Display name is required.');
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({
        idOrName: editingRole.id || editingRole.name,
        displayName: formData.displayName.trim(),
        description: formData.description.trim(),
        permissions: formData.permissions,
      });

      setEditingRole(null);
      showToast('success', `Role "${formData.displayName}" updated successfully.`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to update role.';
      setFormError(msg);
    }
  };

  // Handle Delete Role Submit
  const handleDeleteSubmit = async () => {
    if (!deletingRole) return;
    try {
      await deleteRoleMutation.mutateAsync(deletingRole.id || deletingRole.name);
      setDeletingRole(null);
      showToast('success', `Role "${deletingRole.displayName}" deleted successfully.`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete role.';
      showToast('error', msg);
      setDeletingRole(null);
    }
  };

  // Handle quick user role change
  const handleUserRoleChange = async (userId: string, newRole: string, userName: string) => {
    try {
      await assignRoleMutation.mutateAsync({ userId, roleName: newRole });
      showToast('success', `Updated role for ${userName} to ${newRole}.`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to assign role to user.';
      showToast('error', msg);
    }
  };

  // Guard: Not an admin/super_admin
  if (!authLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super_admin'))) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <FiLock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Access Restricted</h2>
          <p className="text-slate-400 text-sm mb-6">
            You require Administrator or Super Admin privileges to view and manage Roles & Permissions.
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition duration-200"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Breadcrumb & Top Bar ───────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Link
                to="/admin"
                className="hover:text-indigo-400 transition flex items-center gap-1"
              >
                <FiArrowLeft className="w-3.5 h-3.5" /> Admin Dashboard
              </Link>
              <span>/</span>
              <span className="text-indigo-400">Security & RBAC</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-indigo-500/20 text-white">
                <FiShield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Roles & Permissions
                  </h1>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Super Admin
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  Manage enterprise role-based authorization, fine-grained permissions, and user assignments.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                refetchRoles();
                if (activeTab === 'assignments') refetchUsers();
              }}
              title="Refresh Data"
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition shadow-sm"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${rolesRefetching || usersRefetching ? 'animate-spin' : ''}`}
              />
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition duration-200"
            >
              <FiPlus className="w-4 h-4" />
              <span>Create Custom Role</span>
            </button>
          </div>
        </div>

        {/* ── Toast Notification Banner ──────────────────────────────────────── */}
        {notification && (
          <div
            className={`flex items-center justify-between p-4 rounded-xl border transition-all animate-fade-in ${notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/40 border-red-500/40 text-red-200'
              }`}
          >
            <div className="flex items-center gap-2.5 text-sm font-medium">
              {notification.type === 'success' ? (
                <FiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <FiAlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-200"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Navigation Tabs ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'roles'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
          >
            <FiShield className="w-4 h-4" />
            <span>Roles Catalog</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {roles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'assignments'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
          >
            <FiUsers className="w-4 h-4" />
            <span>User Assignments</span>
            {users.length > 0 && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {users.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'matrix'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
          >
            <FiKey className="w-4 h-4" />
            <span>Permissions Manifest</span>
            {manifest?.modules && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {manifest.modules.length} Modules
              </span>
            )}
          </button>
        </div>

        {/* ── TAB 1: Roles Catalog ───────────────────────────────────────────── */}
        {activeTab === 'roles' && (
          <div className="space-y-4">
            {/* Search & Stats Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:px-4">
              <div className="relative w-full sm:w-80">
                <FiSearch className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter roles by name or slug..."
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-4">
                <span>
                  Showing <strong className="text-slate-200">{filteredRoles.length}</strong> of{' '}
                  <strong className="text-slate-200">{roles.length}</strong> roles
                </span>
              </div>
            </div>

            {/* Roles Grid */}
            {rolesLoading ? (
              <div className="py-20 text-center text-slate-400">
                <FiRefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-500" />
                <p>Loading security roles...</p>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
                <FiShield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-200">No roles found</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Try adjusting your search criteria or create a new custom role.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoles.map((role) => {
                  const hasWildcard = role.permissions.includes('*');
                  return (
                    <div
                      key={role.id || role.name}
                      className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-3 sm:p-5 shadow-lg flex flex-col justify-between transition group relative overflow-hidden min-w-0"
                    >
                      {/* Top badge & Title */}
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition">
                                {role.displayName}
                              </h3>
                              {role.isSystem && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                  System
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-mono text-slate-500 mt-0.5">
                              slug: {role.name}
                            </p>
                          </div>
                          <RoleBadge role={role.name} isSystem={role.isSystem} size="sm" />
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-400 line-clamp-2 min-h-[2rem]">
                          {role.description || 'No description provided for this role.'}
                        </p>

                        {/* Permission Pills Preview */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-medium">Permissions Granted</span>
                            <span className="font-semibold text-indigo-400">
                              {hasWildcard ? 'Full Access (*)' : `${role.permissions.length} items`}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                            {hasWildcard ? (
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800">
                                * (All System Permissions)
                              </span>
                            ) : role.permissions.length === 0 ? (
                              <span className="text-[11px] text-slate-500 italic">
                                No permissions assigned
                              </span>
                            ) : (
                              role.permissions.slice(0, 5).map((perm) => (
                                <span
                                  key={perm}
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                                >
                                  {perm}
                                </span>
                              ))
                            )}
                            {!hasWildcard && role.permissions.length > 5 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/50">
                                +{role.permissions.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-800/60">
                        <button
                          onClick={() => openEditModal(role)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                          <span>Configure</span>
                        </button>

                        {!role.isSystem ? (
                          <button
                            onClick={() => setDeletingRole(role)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 transition"
                            title="Delete custom role"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        ) : (
                          <span
                            title="System roles are built-in and cannot be deleted"
                            className="text-[11px] text-slate-600 px-2 py-1 italic flex items-center gap-1"
                          >
                            <FiLock className="w-3 h-3" /> Protected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: User Role Assignments ───────────────────────────────────── */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:px-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <FiSearch className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="ALL">All Roles ({users.length})</option>
                  {roles.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-slate-400">
                Showing <strong className="text-slate-200">{filteredUsers.length}</strong> user
                {filteredUsers.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Users Table */}
            {usersLoading ? (
              <div className="py-20 text-center text-slate-400">
                <FiRefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-500" />
                <p>Loading user role accounts...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
                <FiUsers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-200">No users match filter</h3>
                <p className="text-sm text-slate-400 mt-1">Try resetting the search terms or filters.</p>
              </div>
            ) : (
              <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
                <table className="w-full min-w-[600px] text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">User</th>
                      <th className="py-3.5 px-4">Current Role</th>
                      <th className="py-3.5 px-4">Change Privilege</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.userId} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                              {u.avatar ? (
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                (u.name || u.email || 'U').charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-100 flex items-center gap-2">
                                <span>{u.name || 'Unnamed User'}</span>
                                {user?._id === u.userId && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 break-all">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <RoleBadge role={u.role} size="md" />
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={u.role}
                              disabled={assignRoleMutation.isPending}
                              onChange={(e) =>
                                handleUserRoleChange(u.userId, e.target.value, u.name || u.email)
                              }
                              className="bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
                            >
                              {roles.map((r) => (
                                <option key={r.name} value={r.name}>
                                  {r.displayName} {r.isSystem ? '(System)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: Permissions Manifest Matrix ─────────────────────────────── */}
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <FiSliders className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-slate-100">Permissions Manifest Reference</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                The manifest defines the complete surface of securable resources in the application.
                Routes and actions check these granular keys via backend middleware.
              </p>
            </div>

            {manifestLoading ? (
              <div className="py-20 text-center text-slate-400">
                <FiRefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-500" />
                <p>Loading permissions manifest...</p>
              </div>
            ) : !manifest?.modules || manifest.modules.length === 0 ? (
              <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
                <FiLock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No permission modules registered.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {manifest.modules.map((mod) => (
                  <div
                    key={mod.id}
                    className="min-w-0 bg-slate-900/70 border border-slate-800/90 rounded-2xl p-3 sm:p-5 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <h4 className="text-base font-bold text-slate-100">{mod.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{mod.description}</p>
                        </div>
                        <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-indigo-300 font-semibold">
                          {mod.permissions.length} keys
                        </span>
                      </div>

                      <div className="mt-4 space-y-2.5">
                        {mod.permissions.map((perm) => (
                          <div
                            key={perm.key}
                           className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3"
                          >
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-200">
                                  {perm.name}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400">{perm.description}</p>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800 break-all self-start sm:shrink-0">
                              {perm.key}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── MODAL: Create Role ──────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-slide-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                  <FiPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Create Custom Role</h3>
                  <p className="text-xs text-slate-400">
                    Define a role with customized access privileges
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Identifier (Slug) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. inventory_manager"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Internal key (lowercase letters, numbers, underscores).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inventory Manager"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Human-friendly name shown in UI.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the duties and privileges of this role..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Permissions Checklist */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Assign Permissions ({formData.permissions.length} selected)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Select which capabilities this role is granted.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={handleClearAllPermissions}
                      className="text-xs text-slate-400 hover:text-slate-300 underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                  {manifest?.modules?.map((mod) => {
                    const moduleKeys = mod.permissions.map((p) => p.key);
                    const allSelected = moduleKeys.every((k) =>
                      formData.permissions.includes(k)
                    );
                    const someSelected = moduleKeys.some((k) =>
                      formData.permissions.includes(k)
                    );

                    return (
                      <div
                        key={mod.id}
                        className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              ref={(el) => {
                                if (el) el.indeterminate = !allSelected && someSelected;
                              }}
                              onChange={() => handleToggleModule(mod)}
                              className="rounded border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4 bg-slate-900"
                            />
                            <span className="text-xs font-bold text-slate-200 uppercase">
                              {mod.name}
                            </span>
                          </label>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {moduleKeys.filter((k) => formData.permissions.includes(k)).length}/
                            {moduleKeys.length}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {mod.permissions.map((perm) => {
                            const isChecked = formData.permissions.includes(perm.key);
                            return (
                              <label
                                key={perm.key}
                                className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition ${isChecked
                                  ? 'bg-indigo-950/40 border-indigo-600/50 text-indigo-200'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(perm.key)}
                                  className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5 bg-slate-900"
                                />
                                <div>
                                  <div className="font-semibold text-slate-200 leading-tight">
                                    {perm.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    {perm.key}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRoleMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
                >
                  {createRoleMutation.isPending ? (
                    <>
                      <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-3.5 h-3.5" />
                      <span>Create Role</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Edit Role ────────────────────────────────────────────────── */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-slide-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <FiEdit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">
                    Configure Role: {editingRole.displayName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">slug: {editingRole.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingRole(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Permissions Checklist */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Granted Permissions ({formData.permissions.length} selected)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Configure granular action capabilities.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={handleClearAllPermissions}
                      className="text-xs text-slate-400 hover:text-slate-300 underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                  {manifest?.modules?.map((mod) => {
                    const moduleKeys = mod.permissions.map((p) => p.key);
                    const allSelected = moduleKeys.every((k) =>
                      formData.permissions.includes(k)
                    );
                    const someSelected = moduleKeys.some((k) =>
                      formData.permissions.includes(k)
                    );

                    return (
                      <div
                        key={mod.id}
                        className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              ref={(el) => {
                                if (el) el.indeterminate = !allSelected && someSelected;
                              }}
                              onChange={() => handleToggleModule(mod)}
                              className="rounded border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4 bg-slate-900"
                            />
                            <span className="text-xs font-bold text-slate-200 uppercase">
                              {mod.name}
                            </span>
                          </label>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {moduleKeys.filter((k) => formData.permissions.includes(k)).length}/
                            {moduleKeys.length}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {mod.permissions.map((perm) => {
                            const isChecked = formData.permissions.includes(perm.key);
                            return (
                              <label
                                key={perm.key}
                                className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition ${isChecked
                                  ? 'bg-indigo-950/40 border-indigo-600/50 text-indigo-200'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(perm.key)}
                                  className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5 bg-slate-900"
                                />
                                <div>
                                  <div className="font-semibold text-slate-200 leading-tight">
                                    {perm.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    {perm.key}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateRoleMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
                >
                  {updateRoleMutation.isPending ? (
                    <>
                      <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Delete Role Confirmation ─────────────────────────────────── */}
      {deletingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <FiTrash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-slate-100">
                Delete Role: {deletingRole.displayName}?
              </h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to permanently delete this custom role? Users currently assigned to
                this role may lose access to critical operations.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRole(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteRoleMutation.isPending}
                onClick={handleDeleteSubmit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 transition disabled:opacity-50"
              >
                {deleteRoleMutation.isPending ? (
                  <>
                    <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-3.5 h-3.5" />
                    <span>Delete Role</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RolesPermissions;
