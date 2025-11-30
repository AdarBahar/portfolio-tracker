import { describe, it, expect } from 'vitest';
import { mockAdminUser, mockRegularUser, mockUserDetailResponse, mockAuditLog } from '@/test/mockData';

describe('useAdmin Hooks - Data Validation', () => {
  describe('User data structure', () => {
    it('should have all required user fields', () => {
      expect(mockAdminUser).toHaveProperty('id');
      expect(mockAdminUser).toHaveProperty('email');
      expect(mockAdminUser).toHaveProperty('name');
      expect(mockAdminUser).toHaveProperty('auth_provider');
      expect(mockAdminUser).toHaveProperty('is_demo');
      expect(mockAdminUser).toHaveProperty('is_admin');
      expect(mockAdminUser).toHaveProperty('status');
      expect(mockAdminUser).toHaveProperty('created_at');
      expect(mockAdminUser).toHaveProperty('last_login');
    });

    it('should have correct data types for user', () => {
      expect(typeof mockAdminUser.id).toBe('number');
      expect(typeof mockAdminUser.email).toBe('string');
      expect(typeof mockAdminUser.name).toBe('string');
      expect(typeof mockAdminUser.is_admin).toBe('boolean');
      expect(typeof mockAdminUser.is_demo).toBe('boolean');
    });

    it('should distinguish between admin and regular users', () => {
      expect(mockAdminUser.is_admin).toBe(true);
      expect(mockRegularUser.is_admin).toBe(false);
    });
  });

  describe('UserDetailResponse structure', () => {
    it('should have user, budget, budget_logs, trading_rooms, and standings', () => {
      expect(mockUserDetailResponse).toHaveProperty('user');
      expect(mockUserDetailResponse).toHaveProperty('budget');
      expect(mockUserDetailResponse).toHaveProperty('budget_logs');
      expect(mockUserDetailResponse).toHaveProperty('trading_rooms');
      expect(mockUserDetailResponse).toHaveProperty('standings');
    });

    it('should have valid budget data', () => {
      const { budget } = mockUserDetailResponse;
      expect(budget).toHaveProperty('id');
      expect(budget).toHaveProperty('total_balance');
      expect(budget).toHaveProperty('available_balance');
      expect(budget).toHaveProperty('locked_balance');
      expect(budget?.total_balance).toBeGreaterThanOrEqual(0);
    });

    it('should have arrays for logs, rooms, and standings', () => {
      expect(Array.isArray(mockUserDetailResponse.budget_logs)).toBe(true);
      expect(Array.isArray(mockUserDetailResponse.trading_rooms)).toBe(true);
      expect(Array.isArray(mockUserDetailResponse.standings)).toBe(true);
    });
  });

  describe('AuditLog structure', () => {
    it('should have all required audit log fields', () => {
      expect(mockAuditLog).toHaveProperty('id');
      expect(mockAuditLog).toHaveProperty('user_id');
      expect(mockAuditLog).toHaveProperty('event_type');
      expect(mockAuditLog).toHaveProperty('event_category');
      expect(mockAuditLog).toHaveProperty('description');
      expect(mockAuditLog).toHaveProperty('created_at');
    });

    it('should have correct data types for audit log', () => {
      expect(typeof mockAuditLog.id).toBe('number');
      expect(typeof mockAuditLog.user_id).toBe('number');
      expect(typeof mockAuditLog.event_type).toBe('string');
      expect(typeof mockAuditLog.event_category).toBe('string');
      expect(typeof mockAuditLog.description).toBe('string');
    });

    it('should have non-empty event type and category', () => {
      expect(mockAuditLog.event_type).toBeTruthy();
      expect(mockAuditLog.event_category).toBeTruthy();
    });
  });
});

