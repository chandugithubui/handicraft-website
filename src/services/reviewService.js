import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const createReview = async (reviewData, token) => {
  const response = await axios.post(`${API_URL}/reviews`, reviewData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getProductReviews = async (productId) => {
  const response = await axios.get(`${API_URL}/reviews/product/${productId}`);
  return response.data;
};

export const deleteReview = async (reviewId, token) => {
  const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
