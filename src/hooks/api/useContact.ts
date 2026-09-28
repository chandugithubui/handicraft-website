import { useMutation } from '@tanstack/react-query';
import { http } from '../../services/apiClient';
import { ContactInput, ContactResponse } from '../../types/api';

/**
 * Hook to submit contact form
 */
export const useSubmitContact = () => {
  return useMutation<ContactResponse, Error, ContactInput>({
    mutationFn: (formData: ContactInput) => http.post<ContactResponse, ContactInput>('/contacts', formData),
  });
};
