import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const createOrder = async (orderData, token) => {
  const response = await axios.post(`${API_URL}/orders`, orderData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getMyOrders = async (token) => {
  const response = await axios.get(`${API_URL}/orders/my-orders`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getOrderById = async (orderId, token) => {
  const response = await axios.get(`${API_URL}/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
