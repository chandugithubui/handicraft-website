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

export const createRazorpayOrder = async (amount) => {
  const response = await axios.post(
    `${API_URL}/payment/create-order`,
    { amount }
  );
  return response.data;
};

export const verifyRazorpayPayment = async (paymentData) => {
  const response = await axios.post(
    `${API_URL}/payment/verify-payment`,
    paymentData
  );
  return response.data;
};
