import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

const API_URL = API_BASE_URL;

// ── Admin Statistics ─────────────────────────────────────────

export const getAdminStats = async (token) => {
  const response = await axios.get(`${API_URL}/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

// ── Orders ───────────────────────────────────────────────────

export const getAllOrders = async (token) => {
  const response = await axios.get(`${API_URL}/admin/orders`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

// ── Users ────────────────────────────────────────────────────

export const getAllUsers = async (token) => {
  const response = await axios.get(`${API_URL}/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

// ── Order Status ─────────────────────────────────────────────

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

// ── Contacts ─────────────────────────────────────────────────

export const getAllContacts = async (token) => {
  const response = await axios.get(`${API_URL}/admin/contacts`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

// ── Products ─────────────────────────────────────────────────

export const getAdminProducts = async (token) => {
  const response = await axios.get(`${API_URL}/products?limit=100`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data.products;
};

export const createAdminProduct = async (productData, token) => {
  const response = await axios.post(
    `${API_URL}/products`,
    productData,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const updateAdminProduct = async (id, productData, token) => {
  const response = await axios.put(
    `${API_URL}/products/${id}`,
    productData,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const deleteAdminProduct = async (id, token) => {
  const response = await axios.delete(
    `${API_URL}/products/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

// ── Image Upload ─────────────────────────────────────────────

export const uploadProductImage = async (file, token) => {
  const formData = new FormData();

  formData.append('image', file);

  // Do not set Content-Type manually.
  // Axios automatically sets the multipart boundary.
  const response = await axios.post(
    `${API_URL}/upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};
