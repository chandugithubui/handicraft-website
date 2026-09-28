/**
 * src/hooks/api/useRbac.ts
 *
 * Type-safe React Query hooks for the RBAC management API.
 * Used exclusively in the super-admin Roles & Permissions management page.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '../../services/apiClient';
import {
  AssignUserRoleInput,
  CreateRoleInput,
  PermissionsManifest,
  RoleResponse,
  UpdateRoleInput,
  UserRoleResponse,
} from '../../types/api';

// ── Unwrap helper — backend returns { success, data } ─────────────────────────
interface ApiEnvelope<T> { success: boolean; data: T; }

// ── Query Key Factory ─────────────────────────────────────────────────────────

export const rbacKeys = {
  all:         ['rbac'] as const,
  roles:       () => [...rbacKeys.all, 'roles'] as const,
  role:        (id: string) => [...rbacKeys.roles(), id] as const,
  users:       () => [...rbacKeys.all, 'users'] as const,
  permissions: () => [...rbacKeys.all, 'permissions'] as const,
};

// ── Query Hooks ───────────────────────────────────────────────────────────────

/** Fetches all roles sorted by system-first then name. */
export const useRoles = (enabled = true) =>
  useQuery<RoleResponse[], Error>({
    queryKey: rbacKeys.roles(),
    queryFn:  () =>
      http.get<ApiEnvelope<RoleResponse[]>>('/rbac/roles').then((r) => r.data),
    enabled,
    staleTime: 1000 * 60 * 2,
  });

/** Fetches a single role by its ID or name slug. */
export const useRole = (idOrName: string, enabled = true) =>
  useQuery<RoleResponse, Error>({
    queryKey: rbacKeys.role(idOrName),
    queryFn:  () =>
      http.get<ApiEnvelope<RoleResponse>>(`/rbac/roles/${idOrName}`).then((r) => r.data),
    enabled: enabled && Boolean(idOrName),
  });

/** Fetches all users with their current roles for the assignment table. */
export const useUsersWithRoles = (enabled = true) =>
  useQuery<UserRoleResponse[], Error>({
    queryKey: rbacKeys.users(),
    queryFn:  () =>
      http.get<ApiEnvelope<UserRoleResponse[]>>('/rbac/users').then((r) => r.data),
    enabled,
    staleTime: 1000 * 30,
  });

/**
 * Fetches the permissions manifest — all available permission keys
 * organized by module. Used to render the permissions checkbox UI.
 */
export const usePermissionsManifest = (enabled = true) =>
  useQuery<PermissionsManifest, Error>({
    queryKey: rbacKeys.permissions(),
    queryFn:  () =>
      http
        .get<ApiEnvelope<PermissionsManifest>>('/rbac/permissions')
        .then((r) => r.data),
    enabled,
    staleTime: 1000 * 60 * 60, // manifest rarely changes
  });

// ── Mutation Hooks ────────────────────────────────────────────────────────────

/** Creates a new custom role. */
export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation<RoleResponse, Error, CreateRoleInput>({
    mutationFn: (dto) =>
      http.post<ApiEnvelope<RoleResponse>>('/rbac/roles', dto).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: rbacKeys.roles() }); },
  });
};

/** Updates an existing role's permissions, display name, or description. */
export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation<RoleResponse, Error, { idOrName: string } & UpdateRoleInput>({
    mutationFn: ({ idOrName, ...dto }) =>
      http
        .patch<ApiEnvelope<RoleResponse>>(`/rbac/roles/${idOrName}`, dto)
        .then((r) => r.data),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: rbacKeys.roles() });
      qc.invalidateQueries({ queryKey: rbacKeys.role(v.idOrName) });
    },
  });
};

/** Deletes a custom role and invalidates the role + user lists. */
export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (idOrName) => http.delete<void>(`/rbac/roles/${idOrName}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rbacKeys.roles() });
      qc.invalidateQueries({ queryKey: rbacKeys.users() });
    },
  });
};

/** Assigns a role to a user by userId. */
export const useAssignUserRole = () => {
  const qc = useQueryClient();
  return useMutation<UserRoleResponse, Error, AssignUserRoleInput>({
    mutationFn: ({ userId, roleName }) =>
      http
        .patch<ApiEnvelope<UserRoleResponse>>(`/rbac/users/${userId}/role`, { roleName })
        .then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: rbacKeys.users() }); },
  });
};
