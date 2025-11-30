import type { UserProfileResponse } from '@/hooks/useUserProfile';
import type { User, UserDetailResponse, AuditLog } from '@/hooks/useAdmin';

export const mockUserProfile: UserProfileResponse = {
  profile: {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/avatar.jpg',
    isAdmin: false,
    isDemo: false,
  },
  stats: {
    totalHoldings: 5,
    totalValue: 50000,
    totalGainLoss: 5000,
    portfolioPercentChange: 11.11,
  },
};

export const mockAdminUser: User = {
  id: 1,
  email: 'admin@example.com',
  name: 'Admin User',
  auth_provider: 'google',
  is_demo: false,
  is_admin: true,
  status: 'active',
  created_at: '2025-01-01T00:00:00Z',
  last_login: '2025-11-30T12:00:00Z',
};

export const mockRegularUser: User = {
  id: 2,
  email: 'user@example.com',
  name: 'Regular User',
  auth_provider: 'google',
  is_demo: false,
  is_admin: false,
  status: 'active',
  created_at: '2025-01-15T00:00:00Z',
  last_login: '2025-11-29T10:00:00Z',
};

export const mockUserDetailResponse: UserDetailResponse = {
  user: mockAdminUser,
  budget: {
    id: 1,
    user_id: 1,
    total_balance: 100000,
    locked_balance: 20000,
    available_balance: 80000,
    currency: 'USD',
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-11-30T00:00:00Z',
  },
  budget_logs: [],
  trading_rooms: [],
  standings: [],
};

export const mockAuditLog: AuditLog = {
  id: 1,
  user_id: 1,
  event_type: 'LOGIN',
  event_category: 'AUTHENTICATION',
  description: 'User logged in',
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0',
  previous_values: null,
  new_values: null,
  created_at: '2025-11-30T12:00:00Z',
};

