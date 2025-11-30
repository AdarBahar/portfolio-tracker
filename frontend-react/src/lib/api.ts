import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

// Storage key namespace to avoid conflicts with other apps
const STORAGE_PREFIX = 'fb_';
export const STORAGE_KEYS = {
  AUTH_TOKEN: `${STORAGE_PREFIX}auth_token`,
  USER: `${STORAGE_PREFIX}user`,
  TOKEN_EXPIRY: `${STORAGE_PREFIX}token_expiry`,
} as const;

// Determine API URL based on environment
const getApiUrl = (): string => {
  // Use environment variable if set (preferred)
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

    // Add request interceptor for auth token with expiry validation
    this.client.interceptors.request.use((config: any) => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const expiryStr = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

      // Check if token has expired
      if (expiryStr) {
        try {
          const expiry = parseInt(expiryStr, 10);
          if (Date.now() > expiry) {
            // Token expired, clear storage
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
            return config;
          }
        } catch (e) {
          // Invalid expiry format, clear it
          localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => response,
      async (error: AxiosError) => {
        // Handle 401 Unauthorized - clear auth and redirect to login
        if (error.response?.status === 401) {
          // Clear all auth-related storage
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);

          // Redirect to login (note: this is a full page reload)
          // TODO: Consider using React Router context for navigation instead
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

  async patch<T>(url: string, data?: unknown) {
    return this.client.patch<T>(url, data);
  }

  async delete<T>(url: string) {
    return this.client.delete<T>(url);
  }
}

export const apiClient = new APIClient();

