import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
