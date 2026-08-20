import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const createPaymentIntent = async (amount, token) => {
  const response = await axios.post(
    `${API_URL}/payment/create-payment-intent`,
    { amount },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
