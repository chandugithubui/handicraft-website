import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
