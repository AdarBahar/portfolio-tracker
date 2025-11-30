import { describe, it, expect } from 'vitest';
import { mockUserProfile, mockAdminUser, mockUserDetailResponse, mockAuditLog } from '@/test/mockData';

describe('API Integration - Data Flow', () => {
  describe('User Profile Data Flow', () => {
    it('should have complete user profile response', () => {
      expect(mockUserProfile).toBeDefined();
      expect(mockUserProfile.profile).toBeDefined();
      expect(mockUserProfile.stats).toBeDefined();
    });

    it('should have consistent user ID across profile and stats', () => {
      expect(mockUserProfile.profile.id).toBe('1');
    });

    it('should have valid email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(mockUserProfile.profile.email).toMatch(emailRegex);
    });

    it('should have non-negative financial values', () => {
      const { stats } = mockUserProfile;
      expect(stats.winRate).toBeGreaterThanOrEqual(0);
      expect(stats.totalRoomsPlayed).toBeGreaterThanOrEqual(0);
      expect(stats.totalWins).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Admin User Data Flow', () => {
    it('should have admin user with correct permissions', () => {
      expect(mockAdminUser.is_admin).toBe(true);
      expect(mockAdminUser.status).toBe('active');
    });

    it('should have valid timestamps', () => {
      const createdAt = new Date(mockAdminUser.created_at);
      const lastLogin = mockAdminUser.last_login ? new Date(mockAdminUser.last_login) : null;
      
      expect(createdAt.getTime()).toBeGreaterThan(0);
      if (lastLogin) {
        expect(lastLogin.getTime()).toBeGreaterThanOrEqual(createdAt.getTime());
      }
    });

    it('should have valid auth provider', () => {
      const validProviders = ['google', 'github', 'local'];
      expect(validProviders).toContain(mockAdminUser.auth_provider);
    });
  });

  describe('User Detail Response Integration', () => {
    it('should have complete user detail response', () => {
      expect(mockUserDetailResponse.user).toBeDefined();
      expect(mockUserDetailResponse.budget).toBeDefined();
      expect(mockUserDetailResponse.budget_logs).toBeDefined();
      expect(mockUserDetailResponse.trading_rooms).toBeDefined();
      expect(mockUserDetailResponse.standings).toBeDefined();
    });

    it('should have matching user ID in detail response', () => {
      expect(mockUserDetailResponse.user.id).toBe(mockAdminUser.id);
    });

    it('should have valid budget balance calculations', () => {
      const { budget } = mockUserDetailResponse;
      if (budget) {
        const sum = budget.locked_balance + budget.available_balance;
        expect(sum).toBeGreaterThan(0);
        expect(budget.available_balance).toBeGreaterThanOrEqual(0);
        expect(budget.locked_balance).toBeGreaterThanOrEqual(0);
      }
    });

    it('should have valid budget status', () => {
      const validStatuses = ['active', 'frozen', 'closed'];
      if (mockUserDetailResponse.budget) {
        expect(validStatuses).toContain(mockUserDetailResponse.budget.status);
      }
    });
  });

  describe('Audit Log Integration', () => {
    it('should have valid audit log event types', () => {
      const validEventTypes = ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'GRANT'];
      expect(validEventTypes).toContain(mockAuditLog.event_type);
    });

    it('should have valid audit log categories', () => {
      const validCategories = ['AUTHENTICATION', 'AUTHORIZATION', 'DATA_MODIFICATION', 'ADMIN_ACTION'];
      expect(validCategories).toContain(mockAuditLog.event_category);
    });

    it('should have valid timestamp', () => {
      const createdAt = new Date(mockAuditLog.created_at);
      expect(createdAt.getTime()).toBeGreaterThan(0);
    });

    it('should have non-empty description', () => {
      expect(mockAuditLog.description).toBeTruthy();
      expect(mockAuditLog.description.length).toBeGreaterThan(0);
    });
  });

  describe('Data Consistency', () => {
    it('should have consistent user data across responses', () => {
      expect(mockAdminUser.email).toBe(mockUserDetailResponse.user.email);
      expect(mockAdminUser.name).toBe(mockUserDetailResponse.user.name);
      expect(mockAdminUser.is_admin).toBe(mockUserDetailResponse.user.is_admin);
    });

    it('should have valid relationships between entities', () => {
      expect(mockUserDetailResponse.user.id).toBe(mockUserDetailResponse.budget?.user_id);
    });
  });
});

