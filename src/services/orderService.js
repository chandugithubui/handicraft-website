import axios from 'axios';

// Detect environment and set API URL
const getApiUrl = () => {
  // Check if we're in production (Vercel deployment)
  if (window.location.hostname === 'handicraft-website-fyao.vercel.app' ||
      window.location.hostname.includes('vercel.app')) {
    return 'https://handicraft-website.onrender.com/api';
  }
  // Fallback to environment variable or localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

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
