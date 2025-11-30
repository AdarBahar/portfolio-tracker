import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient, STORAGE_KEYS } from '../lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  isDemo: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credential: string, apiUrl: string) => Promise<User>;
  loginAsDemo: () => Promise<User>;
  logout: () => void;
  initialize: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

      if (userData && token) {
        try {
          const parsedUser = JSON.parse(userData);

          // Check token expiry for non-demo users
          if (!parsedUser.isDemo && expiry) {
            const expiryTime = parseInt(expiry, 10);
            if (Date.now() > expiryTime) {
              logout();
              return;
            }
          }

          setUser(parsedUser);
        } catch (parseError) {
          // Invalid JSON in user data, clear storage
          console.error('Failed to parse user data:', parseError);
          logout();
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credential: string, _apiUrl: string): Promise<User> => {
    try {
      const response = await apiClient.post<any>('/auth/google', { credential });
      const { user: userData, token, expiresIn } = response.data;

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, String(Date.now() + expiresIn * 1000));

      // Clear React Query cache to ensure fresh data for new user
      queryClient.clear();

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const loginAsDemo = async (): Promise<User> => {
    try {
      // Generate unique demo session ID
      const demoSessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const demoUser: User = {
        id: demoSessionId,
        email: 'demo@demo.local',
        name: 'Demo User',
        isDemo: true,
        isAdmin: false,
      };

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
      // Generate unique demo token per session
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `demo_token_${demoSessionId}`);
      // Demo users don't have token expiry

      // Clear React Query cache to ensure fresh data for demo user
      queryClient.clear();

      setUser(demoUser);
      return demoUser;
    } catch (error) {
      console.error('Demo login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);

    // Clear React Query cache to prevent stale data from being shown
    queryClient.clear();

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginAsDemo,
        logout,
        initialize,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

