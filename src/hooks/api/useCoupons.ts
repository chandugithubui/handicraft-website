import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '../../services/apiClient';
import { Coupon, ValidateCouponInput, ValidateCouponResponse } from '../../types/api';

export const couponKeys = {
  all: ['coupons'] as const,
  active: () => [...couponKeys.all, 'active'] as const,
  admin: () => [...couponKeys.all, 'admin'] as const,
};

/**
 * Hook to validate coupon code
 */
export const useValidateCoupon = () => {
  return useMutation<ValidateCouponResponse, Error, ValidateCouponInput & { token?: string }>({
    mutationFn: ({ code, cartTotal, token }) => {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      return http.post<ValidateCouponResponse>('/coupons/validate', { code, cartTotal }, config);
    },
  });
};

/**
 * Hook to fetch active public coupons
 */
export const useActiveCoupons = () => {
  return useQuery<Coupon[], Error>({
    queryKey: couponKeys.active(),
    queryFn: () => http.get<Coupon[]>('/coupons/active'),
  });
};

/**
 * Hook to fetch admin coupons
 */
export const useAdminCoupons = (token?: string | null, enabled: boolean = true) => {
  return useQuery<Coupon[], Error>({
    queryKey: couponKeys.admin(),
    queryFn: () => {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      return http.get<Coupon[]>('/coupons', config);
    },
    enabled: enabled && (Boolean(token) || Boolean(localStorage.getItem('token'))),
  });
};
