import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '../../services/apiClient';
import {
  NewsletterSubscribeInput,
  NewsletterResponse,
  NewsletterSubscribersResponse,
} from '../../types/api';

export const newsletterKeys = {
  all: ['newsletter'] as const,
  subscribers: () => [...newsletterKeys.all, 'subscribers'] as const,
};

/**
 * Hook to subscribe to newsletter
 */
export const useSubscribeNewsletter = () => {
  return useMutation<NewsletterResponse, Error, NewsletterSubscribeInput>({
    mutationFn: (data: NewsletterSubscribeInput) =>
      http.post<NewsletterResponse, NewsletterSubscribeInput>('/newsletter/subscribe', data),
  });
};

/**
 * Hook to unsubscribe from newsletter
 */
export const useUnsubscribeNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation<NewsletterResponse, Error, { email: string }>({
    mutationFn: (data: { email: string }) =>
      http.post<NewsletterResponse, { email: string }>('/newsletter/unsubscribe', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsletterKeys.subscribers() });
    },
  });
};

/**
 * Hook to fetch subscribers list (admin only)
 */
export const useNewsletterSubscribers = (token?: string | null, enabled: boolean = true) => {
  return useQuery<NewsletterSubscribersResponse, Error>({
    queryKey: newsletterKeys.subscribers(),
    queryFn: () => {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      return http.get<NewsletterSubscribersResponse>('/newsletter/subscribers', config);
    },
    enabled: enabled && (Boolean(token) || Boolean(localStorage.getItem('token'))),
  });
};
