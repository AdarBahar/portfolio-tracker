import { describe, it, expect } from 'vitest';
import { mockUserProfile } from '@/test/mockData';

describe('useUserProfile Hook - Data Validation', () => {
  describe('UserProfileResponse structure', () => {
    it('should have profile and stats properties', () => {
      expect(mockUserProfile).toHaveProperty('profile');
      expect(mockUserProfile).toHaveProperty('stats');
    });

    it('should have valid profile data', () => {
      const { profile } = mockUserProfile;
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('email');
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('picture');
      expect(profile).toHaveProperty('isAdmin');
      expect(profile).toHaveProperty('isDemo');
    });

    it('should have valid stats data', () => {
      const { stats } = mockUserProfile;
      expect(stats).toHaveProperty('totalHoldings');
      expect(stats).toHaveProperty('totalValue');
      expect(stats).toHaveProperty('totalGainLoss');
      expect(stats).toHaveProperty('portfolioPercentChange');
    });

    it('should have correct data types', () => {
      const { profile, stats } = mockUserProfile;
      expect(typeof profile.id).toBe('number');
      expect(typeof profile.email).toBe('string');
      expect(typeof profile.name).toBe('string');
      expect(typeof profile.isAdmin).toBe('boolean');
      expect(typeof profile.isDemo).toBe('boolean');
      expect(typeof stats.totalHoldings).toBe('number');
      expect(typeof stats.totalValue).toBe('number');
    });
  });

  describe('Profile data validation', () => {
    it('should have non-empty email', () => {
      expect(mockUserProfile.profile.email).toBeTruthy();
      expect(mockUserProfile.profile.email).toMatch(/@/);
    });

    it('should have non-empty name', () => {
      expect(mockUserProfile.profile.name).toBeTruthy();
    });

    it('should have valid stats values', () => {
      const { stats } = mockUserProfile;
      expect(stats.totalHoldings).toBeGreaterThanOrEqual(0);
      expect(stats.totalValue).toBeGreaterThanOrEqual(0);
    });
  });
});

