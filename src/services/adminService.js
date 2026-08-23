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

export const getAdminStats = async (token) => {
  const response = await axios.get(`${API_URL}/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getAllOrders = async (token) => {
  const response = await axios.get(`${API_URL}/admin/orders`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getAllUsers = async (token) => {
  const response = await axios.get(`${API_URL}/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateOrderStatus = async (orderId, orderStatus, token) => {
  const response = await axios.patch(
    `${API_URL}/orders/${orderId}/status`,
    { orderStatus },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
