import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config/api.config';

/**
 * Centralized Axios instance for all API calls.
 * Automatically attaches auth token, credentials, and default headers.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to normalize errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

/**
 * Type-safe HTTP helper wrappers
 */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.post<T>(url, body, config).then((res) => res.data),

  put: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.put<T>(url, body, config).then((res) => res.data),

  patch: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.patch<T>(url, body, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};

export default apiClient;
