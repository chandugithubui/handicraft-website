import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '../../services/apiClient';
import { AdminStatsResponse, UpdateOrderStatusInput } from '../../types/api';
import { Order, User } from '../../types';

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  orders: () => [...adminKeys.all, 'orders'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  contacts: () => [...adminKeys.all, 'contacts'] as const,
};

/**
 * Hook to fetch admin dashboard statistics
 */
export const useAdminStats = (token?: string | null, enabled: boolean = true) => {
  return useQuery<AdminStatsResponse, Error>({
    queryKey: adminKeys.stats(),
    queryFn: () => {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      return http.get<AdminStatsResponse>('/admin/stats', config);
    },
    enabled: enabled && (Boolean(token) || Boolean(localStorage.getItem('token'))),
  });
};

/**
 * Hook to fetch all orders for admin
 */
export const useAdminOrders = (token?: string | null, enabled: boolean = true) => {
  return useQuery<Order[], Error>({
    queryKey: adminKeys.orders(),
    queryFn: () => {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      return http.get<Order[]>('/admin/orders', config);
    },
    enabled: enabled && (Boolean(token) || Boolean(localStorage.getItem('token'))),
  });
};

/**
 * Hook to fetch all users for admin
 */
export const useAdminUsers = (token?: string | null, enabled: boolean = true) => {
  return useQuery<User[], Error>({
    queryKey: adminKeys.users(),
    queryFn: () => {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      return http.get<User[]>('/admin/users', config);
    },
    enabled: enabled && (Boolean(token) || Boolean(localStorage.getItem('token'))),
  });
};

/**
 * Hook to fetch all contact inquiries for admin
 */
export const useAdminContacts = (token?: string | null, enabled: boolean = true) => {
  return useQuery<any[], Error>({
    queryKey: adminKeys.contacts(),
    queryFn: () => {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      return http.get<any[]>('/admin/contacts', config);
    },
    enabled: enabled && (Boolean(token) || Boolean(localStorage.getItem('token'))),
  });
};

/**
 * Hook to update an order's status
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, UpdateOrderStatusInput & { token?: string }>({
    mutationFn: ({ orderId, orderStatus, token }) => {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      return http.patch<Order>(`/orders/${orderId}/status`, { orderStatus }, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.orders() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
};
