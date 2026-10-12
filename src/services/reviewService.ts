
import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

// Use centralized API configuration
const API_URL = API_BASE_URL;

// Create a new product review
export const createReview = async (reviewData, token) => {
  const response = await axios.post(
    `${API_URL}/reviews`,
    reviewData,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

// Get reviews for a specific product
export const getProductReviews = async (productId) => {
  const response = await axios.get(
    `${API_URL}/reviews/product/${productId}`
  );

  return response.data;
};

// Delete a product review
export const deleteReview = async (reviewId, token) => {
  const response = await axios.delete(
    `${API_URL}/reviews/${reviewId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};
