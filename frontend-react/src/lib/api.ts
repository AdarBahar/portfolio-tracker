import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

// Determine API URL based on environment
const getApiUrl = (): string => {
  // Use environment variable if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In production, use the production API endpoint
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'www.bahar.co.il' || hostname === 'bahar.co.il') {
      return 'https://www.bahar.co.il/fantasybroker-api/api';
    }
  }

  // Default to localhost for development
  return 'http://localhost:4000/api';
};

const API_BASE_URL = getApiUrl();

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use((config: any) => {
      const token = localStorage.getItem('portfolio_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('portfolio_auth_token');
          localStorage.removeItem('portfolio_user');
          localStorage.removeItem('portfolio_token_expiry');
          window.location.href = '/fantasybroker/react/login';
        }
        throw error;
      }
    );
  }

  async get<T>(url: string) {
    return this.client.get<T>(url);
  }

  async post<T>(url: string, data?: unknown) {
    return this.client.post<T>(url, data);
  }

  async put<T>(url: string, data?: unknown) {
    return this.client.put<T>(url, data);
  }

  async delete<T>(url: string) {
    return this.client.delete<T>(url);
  }
}

export const apiClient = new APIClient();

