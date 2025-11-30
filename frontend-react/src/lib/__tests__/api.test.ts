import { describe, it, expect, beforeEach, vi } from 'vitest';
import { STORAGE_KEYS } from '@/lib/api';

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Storage Keys', () => {
    it('should have correct storage key names', () => {
      expect(STORAGE_KEYS.AUTH_TOKEN).toBe('fb_auth_token');
      expect(STORAGE_KEYS.USER).toBe('fb_user');
      expect(STORAGE_KEYS.TOKEN_EXPIRY).toBe('fb_token_expiry');
    });

    it('should use consistent prefix for all keys', () => {
      const keys = Object.values(STORAGE_KEYS);
      keys.forEach(key => {
        expect(key).toMatch(/^fb_/);
      });
    });
  });

  describe('API URL Configuration', () => {
    it('should have API URL configured', () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      expect(apiUrl).toBeDefined();
      expect(typeof apiUrl).toBe('string');
      expect(apiUrl.length).toBeGreaterThan(0);
    });

    it('should have Google Client ID configured', () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      expect(clientId).toBeDefined();
      expect(typeof clientId).toBe('string');
      expect(clientId.length).toBeGreaterThan(0);
    });
  });

  describe('Token Management', () => {
    it('should store and retrieve auth token', () => {
      const token = 'test-token-123';
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      
      const retrieved = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      expect(retrieved).toBe(token);
    });

    it('should store and retrieve token expiry', () => {
      const expiry = Date.now() + 3600000; // 1 hour from now
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());
      
      const retrieved = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
      expect(parseInt(retrieved || '0', 10)).toBe(expiry);
    });

    it('should clear all auth data on logout', () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'token');
      localStorage.setItem(STORAGE_KEYS.USER, 'user');
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, '123');
      
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
      
      expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)).toBeNull();
    });
  });
});

