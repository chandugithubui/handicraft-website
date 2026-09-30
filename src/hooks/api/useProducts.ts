import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProducts,
  getPaginatedProducts,
  getProductById,
  addProduct,
  editProduct,
  deleteProduct,
} from '../../services/productService';
import { Product } from '../../types';
import { ProductQueryParams, PaginatedProductsResponse, CreateProductInput, UpdateProductInput } from '../../types/api';

/**
 * Query key factory for products
 */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ProductQueryParams | string) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id?: string) => [...productKeys.details(), id] as const,
};

/**
 * Hook to fetch products list
 * @param queryParams  - URL query string e.g. '?limit=100'
 * @param options      - React Query overrides (e.g. { enabled: false })
 */
export const useProducts = (
  queryParams: string = '',
  options: { enabled?: boolean } = {}
) => {
  return useQuery<Product[], Error>({
    queryKey: productKeys.list(queryParams),
    queryFn: () => getProducts(queryParams),
    enabled: options.enabled !== false, // default true unless caller passes false
    ...options,
  });
};

/**
 * Hook to fetch paginated products with metadata
 */
export const usePaginatedProducts = (queryParams: string = '') => {
  return useQuery<PaginatedProductsResponse, Error>({
    queryKey: productKeys.list(`paginated-${queryParams}`),
    queryFn: () => getPaginatedProducts(queryParams),
  });
};

/**
 * Hook to fetch a single product by ID
 */
export const useProductDetail = (productId?: string) => {
  return useQuery<Product | null, Error>({
    queryKey: productKeys.detail(productId),
    queryFn: () => {
      if (!productId) return Promise.resolve(null);
      return getProductById(productId);
    },
    enabled: Boolean(productId),
  });
};

/**
 * Hook to create a product
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProduct: CreateProductInput | FormData) => addProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

/**
 * Hook to update a product
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput | FormData }) =>
      editProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook to delete a product
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};
