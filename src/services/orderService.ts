import apiClient from './apiClient';

/**
 * Creates an order on the backend with credentials and optional token.
 */
export const createOrder = async (orderData: any, token?: string | null) => {
  const config: { headers?: Record<string, string> } = {};
  const activeToken = (token && token !== 'null' && token !== 'undefined')
    ? token
    : localStorage.getItem('token');

  if (activeToken && activeToken !== 'null' && activeToken !== 'undefined') {
    config.headers = { Authorization: `Bearer ${activeToken}` };
  }

  const response = await apiClient.post('/orders', orderData, config);
  return response.data;
};

/**
 * Fetches current authenticated user's orders.
 */
export const getMyOrders = async (token?: string | null) => {
  const config: { headers?: Record<string, string> } = {};
  const activeToken = (token && token !== 'null' && token !== 'undefined')
    ? token
    : localStorage.getItem('token');

  if (activeToken && activeToken !== 'null' && activeToken !== 'undefined') {
    config.headers = { Authorization: `Bearer ${activeToken}` };
  }

  const response = await apiClient.get('/orders/my-orders', config);
  return response.data;
};

/**
 * Fetches single order by ID.
 */
export const getOrderById = async (orderId: string, token?: string | null) => {
  const config: { headers?: Record<string, string> } = {};
  const activeToken = (token && token !== 'null' && token !== 'undefined')
    ? token
    : localStorage.getItem('token');

  if (activeToken && activeToken !== 'null' && activeToken !== 'undefined') {
    config.headers = { Authorization: `Bearer ${activeToken}` };
  }

  const response = await apiClient.get(`/orders/${orderId}`, config);
  return response.data;
};
