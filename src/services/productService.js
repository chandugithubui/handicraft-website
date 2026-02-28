// src/services/productService.js
import axios from 'axios';

const API_URL = 'https://handicraft-website.onrender.com/api/products';  // Updated backend URL

// Get all products
export const getProducts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;  // Return the data to the component
  } catch (error) {
    console.error("Error fetching products", error);
    return [];
  }
};

// Add a new product
export const addProduct = async (productData) => {
  try {
    const response = await axios.post(API_URL, productData);
    return response.data;  // Return the added product data
  } catch (error) {
    console.error("Error adding product", error);
    return null;  // Return null if there's an error
  }
};

// Edit an existing product
export const editProduct = async (productId, productData) => {
  try {
    const response = await axios.put(`${API_URL}/${productId}`, productData);
    return response.data;  // Return the updated product data
  } catch (error) {
    console.error("Error editing product", error);
    return null;  // Return null if there's an error
  }
};

// Delete a product
export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(`${API_URL}/${productId}`);
    return response.data;  // Return the response from the server (e.g., success message)
  } catch (error) {
    console.error("Error deleting product", error);
    return null;  // Return null if there's an error
  }
};

// Get product by ID
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/${productId}`);
    return response.data;  // Return the product data
  } catch (error) {
    console.error("Error fetching product", error);
    return null;  // Return null if there's an error
  }
};
