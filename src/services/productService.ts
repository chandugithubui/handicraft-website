
// src/services/productService.js

import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

// Use the centralized API URL configuration.
// Production: REACT_APP_API_URL from Vercel
// Development: http://localhost:5000/api
const API_URL = API_BASE_URL;

// Normalize backend product image URLs
const resolveProductImage = (imageUrl) => {
  if (!imageUrl) return '';

  // Already a full external URL
  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://')
  ) {
    return imageUrl;
  }

  // Existing frontend public images
  if (imageUrl.startsWith('/images/')) {
    return imageUrl;
  }

  // Images uploaded through the backend
  if (imageUrl.startsWith('/uploads/')) {
    const backendOrigin = new URL(API_BASE_URL).origin;
    return `${backendOrigin}${imageUrl}`;
  }

  return imageUrl;
};

// Normalize backend product to frontend format
const normalizeProduct = (product) => ({
  ...product,
  image: resolveProductImage(product.imageUrl || product.image),
  stock: product.stock !== undefined ? product.stock : 10
});

// Get all products
export const getProducts = async (queryParams = '') => {
  try {
    const url = queryParams
      ? `${API_URL}/products${queryParams}`
      : `${API_URL}/products`;

    const response = await axios.get(url);

    const products = Array.isArray(response.data)
      ? response.data
      : response.data.products;

    const normalizedProducts = products.map(normalizeProduct);

    return normalizedProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get products with pagination metadata
export const getPaginatedProducts = async (queryParams = '') => {
  try {
    const url = queryParams
      ? `${API_URL}/products${queryParams}`
      : `${API_URL}/products`;

    const response = await axios.get(url);

    const normalizedProducts =
      response.data.products.map(normalizeProduct);

    return {
      products: normalizedProducts,
      pagination: response.data.pagination
    };
  } catch (error) {
    console.error('Error fetching paginated products:', error);
    throw error;
  }
};

// Get a single product by ID
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product', error);
    return null;
  }
};

// Add a new product
export const addProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_URL}/products`, productData);
    return response.data;
  } catch (error) {
    console.error('Error adding product', error);
    return null;
  }
};

// Edit an existing product
export const editProduct = async (productId, productData) => {
  try {
    const response = await axios.put(
      `${API_URL}/products/${productId}`,
      productData
    );

    return response.data;
  } catch (error) {
    console.error('Error editing product', error);
    return null;
  }
};

// Delete a product
export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/products/${productId}`
    );

    return response.data;
  } catch (error) {
    console.error('Error deleting product', error);
    return null;
  }
};
