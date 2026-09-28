import { useQuery } from '@tanstack/react-query';
import { http } from '../../services/apiClient';
import { ArtisanProfileData, ArtisanWithProductsResponse } from '../../types/api';
import { Product } from '../../types';

export const artisanKeys = {
  all: ['artisans'] as const,
  list: () => [...artisanKeys.all, 'list'] as const,
  detail: (slug?: string) => [...artisanKeys.all, 'detail', slug] as const,
  products: (slug?: string) => [...artisanKeys.all, 'products', slug] as const,
  profile: (slug?: string) => [...artisanKeys.all, 'profile', slug] as const,
};

/**
 * Hook to fetch all artisans
 */
export const useArtisans = () => {
  return useQuery<ArtisanProfileData[], Error>({
    queryKey: artisanKeys.list(),
    queryFn: () => http.get<ArtisanProfileData[]>('/artisans'),
  });
};

/**
 * Hook to fetch artisan details by slug
 */
export const useArtisanBySlug = (slug?: string) => {
  return useQuery<ArtisanProfileData, Error>({
    queryKey: artisanKeys.detail(slug),
    queryFn: () => {
      if (!slug) throw new Error('Artisan slug is required');
      return http.get<ArtisanProfileData>(`/artisans/${encodeURIComponent(slug)}`);
    },
    enabled: Boolean(slug),
  });
};

/**
 * Hook to fetch products created by a specific artisan
 */
export const useArtisanProducts = (slug?: string) => {
  return useQuery<Product[], Error>({
    queryKey: artisanKeys.products(slug),
    queryFn: () => {
      if (!slug) throw new Error('Artisan slug is required');
      return http.get<Product[]>(`/artisans/${encodeURIComponent(slug)}/products`);
    },
    enabled: Boolean(slug),
  });
};

/**
 * Hook to fetch complete artisan profile (artisan info + their products)
 */
export const useArtisanProfile = (slug?: string) => {
  return useQuery<ArtisanWithProductsResponse, Error>({
    queryKey: artisanKeys.profile(slug),
    queryFn: async () => {
      if (!slug) throw new Error('Artisan slug is required');
      const [artisan, products] = await Promise.all([
        http.get<ArtisanProfileData>(`/artisans/${encodeURIComponent(slug)}`),
        http.get<Product[]>(`/artisans/${encodeURIComponent(slug)}/products`),
      ]);
      return { artisan, products };
    },
    enabled: Boolean(slug),
  });
};
