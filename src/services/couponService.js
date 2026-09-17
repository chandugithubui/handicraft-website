import axios from 'axios';

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://handicraft-website.onrender.com/api';

export const validateCoupon = async (
  code,
  cartTotal,
  token
) => {
  try {
    const response = await axios.post(
      `${API_URL}/coupons/validate`,
      {
        code,
        cartTotal
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getAdminCoupons = async (token) => {
  const response = await axios.get(
    `${API_URL}/coupons`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const createCoupon = async (couponData, token) => {
  const response = await axios.post(
    `${API_URL}/coupons`,
    couponData,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};
export const updateCoupon = async (couponId, couponData, token) => {
  const response = await axios.put(
    `${API_URL}/coupons/${couponId}`,
    couponData,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};
export const deleteCoupon = async (couponId, token) => {
  const response = await axios.delete(
    `${API_URL}/coupons/${couponId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};