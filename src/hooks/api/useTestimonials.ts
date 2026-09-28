import { useQuery } from '@tanstack/react-query';
import { http } from '../../services/apiClient';
import { Testimonial } from '../../types/api';

export const testimonialKeys = {
  all: ['testimonials'] as const,
  list: () => [...testimonialKeys.all, 'list'] as const,
};

/**
 * Hook to fetch all testimonials
 */
export const useTestimonials = () => {
  return useQuery<Testimonial[], Error>({
    queryKey: testimonialKeys.list(),
    queryFn: () => http.get<Testimonial[]>('/testimonials'),
  });
};
