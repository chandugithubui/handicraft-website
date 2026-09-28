import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '../../services/apiClient';
import { ProductReviewsSummaryResponse, CreateReviewInput } from '../../types/api';

export const reviewKeys = {
  all: ['reviews'] as const,
  product: (productId?: string) => [...reviewKeys.all, 'product', productId] as const,
};

/**
 * Hook to fetch reviews for a product
 */
export const useProductReviews = (productId?: string) => {
  return useQuery<ProductReviewsSummaryResponse, Error>({
    queryKey: reviewKeys.product(productId),
    queryFn: () => {
      if (!productId) {
        return Promise.resolve({ reviews: [], totalReviews: 0, averageRating: 0 });
      }
      return http.get<ProductReviewsSummaryResponse>(`/reviews/product/${productId}`);
    },
    enabled: Boolean(productId),
  });
};

/**
 * Hook to submit a new review
 */
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewData, token }: { reviewData: CreateReviewInput; token?: string }) => {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      return http.post('/reviews', reviewData, config);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.product(variables.reviewData.product),
      });
    },
  });
};

/**
 * Hook to delete a review
 */
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, token }: { reviewId: string; token?: string }) => {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      return http.delete(`/reviews/${reviewId}`, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
};
