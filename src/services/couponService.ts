import apiClient from './apiClient';

const getHeaders = (token?: string | null): Record<string, string> => {
  const activeToken = (token && token !== 'null' && token !== 'undefined')
    ? token
    : localStorage.getItem('token');

  if (activeToken && activeToken !== 'null' && activeToken !== 'undefined') {
    return { Authorization: `Bearer ${activeToken}` };
  }
  return {};
};

export const validateCoupon = async (
  code: string,
  cartTotal: number,
  token?: string | null
) => {
  const response = await apiClient.post(
    '/coupons/validate',
    { code, cartTotal },
    { headers: getHeaders(token) }
  );
  return response.data;
};

export const getAdminCoupons = async (token?: string | null) => {
  const response = await apiClient.get('/coupons', {
    headers: getHeaders(token),
  });
  return response.data;
};

export const createCoupon = async (couponData: any, token?: string | null) => {
  const response = await apiClient.post('/coupons', couponData, {
    headers: getHeaders(token),
  });
  return response.data;
};

export const updateCoupon = async (couponId: string, couponData: any, token?: string | null) => {
  const response = await apiClient.put(`/coupons/${couponId}`, couponData, {
    headers: getHeaders(token),
  });
  return response.data;
};

export const deleteCoupon = async (couponId: string, token?: string | null) => {
  const response = await apiClient.delete(`/coupons/${couponId}`, {
    headers: getHeaders(token),
  });
  return response.data;
};

// Get active coupons for customers
export const getActiveCoupons = async () => {
  const response = await apiClient.get('/coupons/active');
  return response.data;
};