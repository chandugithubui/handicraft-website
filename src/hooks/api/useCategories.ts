import { useQuery } from '@tanstack/react-query';
import { http } from '../../services/apiClient';
import { Category } from '../../types/api';
import { Product } from '../../types';

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
  detail: (id?: string) => [...categoryKeys.all, 'detail', id] as const,
  products: (id?: string) => [...categoryKeys.all, 'products', id] as const,
};

/**
 * Hook to fetch all categories
 */
export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: categoryKeys.list(),
    queryFn: () => http.get<Category[]>('/categories'),
  });
};

/**
 * Hook to fetch single category by ID
 */
export const useCategory = (categoryId?: string) => {
  return useQuery<Category | null, Error>({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: async () => {
      if (!categoryId || categoryId === 'all') return null;
      try {
        return await http.get<Category>(`/categories/${categoryId}`);
      } catch (err) {
        return null;
      }
    },
    enabled: Boolean(categoryId) && categoryId !== 'all',
  });
};

/**
 * Hook to fetch products by category
 */
export const useCategoryProducts = (categoryId?: string) => {
  return useQuery<Product[], Error>({
    queryKey: categoryKeys.products(categoryId),
    queryFn: async () => {
      const url =
        !categoryId || categoryId === 'all'
          ? '/products?limit=100'
          : `/products?category=${encodeURIComponent(categoryId)}&limit=100`;

      const res = await http.get<Product[] | { products: Product[] }>(url);
      if (Array.isArray(res)) return res;
      return res.products || [];
    },
    enabled: Boolean(categoryId),
  });
};
