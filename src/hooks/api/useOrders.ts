import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '../../services/apiClient';
import { Order } from '../../types';
import { CreateOrderInput } from '../../types/api';

export const orderKeys = {
  all: ['orders'] as const,
  myOrders: () => [...orderKeys.all, 'my-orders'] as const,
  detail: (id?: string) => [...orderKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch current user's orders
 */
export const useMyOrders = (token?: string | null, enabled: boolean = true) => {
  return useQuery<Order[], Error>({
    queryKey: orderKeys.myOrders(),
    queryFn: () => {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      return http.get<Order[]>('/orders/my-orders', config);
    },
    enabled: enabled && (Boolean(token) || Boolean(localStorage.getItem('token'))),
  });
};

/**
 * Hook to fetch single order by ID
 */
export const useOrderDetail = (orderId?: string, token?: string | null) => {
  return useQuery<Order, Error>({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => {
      if (!orderId) throw new Error('Order ID is required');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      return http.get<Order>(`/orders/${orderId}`, config);
    },
    enabled: Boolean(orderId),
  });
};

/**
 * Hook to create a new order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, { orderData: CreateOrderInput; token?: string }>({
    mutationFn: ({ orderData, token }) => {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      return http.post<Order, CreateOrderInput>('/orders', orderData, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.myOrders() });
    },
  });
};
