// src/services/productService.js
import axios from 'axios';

// Detect environment and set API URL
const getApiUrl = () => {
  // Check if we're in local development
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  // Check if we're in production (Vercel deployment)
  if (window.location.hostname === 'handicraft-website-fyao.vercel.app' ||
      window.location.hostname.includes('vercel.app')) {
    return 'https://handicraft-website.onrender.com/api';
  }
  // Fallback to environment variable or localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

// Normalize backend product to frontend format (imageUrl -> image)
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

  // Images uploaded through backend
  if (imageUrl.startsWith('/uploads/')) {
    const backendOrigin =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : 'https://handicraft-website.onrender.com';

    return `${backendOrigin}${imageUrl}`;
  }

  return imageUrl;
};

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
    console.error("Error fetching products:", error);
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
    console.error("Error fetching paginated products:", error);
    throw error;
  }
};

// Get a single product by ID
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product", error);
    return null;
  }
};

// Add a new product
export const addProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_URL}/products`, productData);
    return response.data;  // Return the added product data
  } catch (error) {
    console.error("Error adding product", error);
    return null;  // Return null if there's an error
  }
};

// Edit an existing product
export const editProduct = async (productId, productData) => {
  try {
    const response = await axios.put(`${API_URL}/products/${productId}`, productData);
    return response.data;  // Return the updated product data
  } catch (error) {
    console.error("Error editing product", error);
    return null;  // Return null if there's an error
  }
};

// Delete a product
export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(`${API_URL}/products/${productId}`);
    return response.data;  // Return the response from the server (e.g., success message)
  } catch (error) {
    console.error("Error deleting product", error);
    return null;  // Return null if there's an error
  }
};
