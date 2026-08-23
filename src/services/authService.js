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

export const register = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/auth/register`, {
    name,
    email,
    password
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password
  });
  return response.data;
};

export const getProfile = async (token) => {
  const response = await axios.get(`${API_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
