
import { API_BASE_URL } from '../config/api.config';

// Use centralized API configuration
const API_URL = API_BASE_URL;

// Fetch all testimonials
export const getTestimonials = async () => {
  const response = await fetch(`${API_URL}/testimonials`);

  if (!response.ok) {
    throw new Error('Failed to fetch testimonials');
  }

  return response.json();
};
