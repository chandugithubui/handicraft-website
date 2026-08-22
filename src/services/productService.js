// src/services/productService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Get all products
export const getProducts = async (queryParams = '') => {
  try {
    const url = queryParams ? `${API_URL}/api/products${queryParams}` : `${API_URL}/api/products`;
    const response = await axios.get(url);
    return response.data;  // Return the data to the component
  } catch (error) {
    console.error("Error fetching products", error);
    return [];
  }
};

// Add a new product
export const addProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_URL}/api/products`, productData);
    return response.data;  // Return the added product data
  } catch (error) {
    console.error("Error adding product", error);
    return null;  // Return null if there's an error
  }
};

// Edit an existing product
export const editProduct = async (productId, productData) => {
  try {
    const response = await axios.put(`${API_URL}/api/products/${productId}`, productData);
    return response.data;  // Return the updated product data
  } catch (error) {
    console.error("Error editing product", error);
    return null;  // Return null if there's an error
  }
};

// Delete a product
export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/products/${productId}`);
    return response.data;  // Return the response from the server (e.g., success message)
  } catch (error) {
    console.error("Error deleting product", error);
    return null;  // Return null if there's an error
  }
};
