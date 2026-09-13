const getApiUrl = () => {
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    return 'http://localhost:5000/api';
  }

  return 'https://handicraft-website.onrender.com/api';
};

const API_URL = getApiUrl();

export const getTestimonials = async () => {
  const response = await fetch(`${API_URL}/testimonials`);

  if (!response.ok) {
    throw new Error('Failed to fetch testimonials');
  }

  return response.json();
};