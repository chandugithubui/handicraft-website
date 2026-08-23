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
