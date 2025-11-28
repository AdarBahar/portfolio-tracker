import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient } from '../lib/api';

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

const AUTH_STORAGE_KEYS = {
  USER: 'portfolio_user',
  TOKEN: 'portfolio_auth_token',
  TOKEN_EXPIRY: 'portfolio_token_expiry',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const userData = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
      const expiry = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY);

      if (userData && token) {
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

      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(userData));
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY, String(Date.now() + expiresIn * 1000));

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const loginAsDemo = async (): Promise<User> => {
    try {
      const demoUser: User = {
        id: 'demo_' + Date.now(),
        email: 'demo@demo.local',
        name: 'Demo User',
        isDemo: true,
        isAdmin: false,
      };

      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(demoUser));
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, 'demo_token');

      setUser(demoUser);
      return demoUser;
    } catch (error) {
      console.error('Demo login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY);
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

