import { API_BASE_URL } from '../config/api.config';
const API_URL = API_BASE_URL;

export const getArtisans = async () => {
  const response = await fetch(`${API_URL}/artisans`);

  if (!response.ok) {
    throw new Error('Failed to fetch artisans');
  }

  return response.json();
};

export const getArtisanBySlug = async (slug) => {
  const response = await fetch(`${API_URL}/artisans/${slug}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Artisan not found');
    }

    throw new Error('Failed to fetch artisan');
  }

  return response.json();
};

export const getArtisanProducts = async (slug) => {
  const response = await fetch(`${API_URL}/artisans/${slug}/products`);

  if (!response.ok) {
    throw new Error('Failed to fetch artisan products');
  }

  return response.json();
};