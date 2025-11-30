import { expect, afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Set environment variables before tests
beforeAll(() => {
  process.env.VITE_API_URL = 'http://localhost:4000/api';
  process.env.VITE_GOOGLE_CLIENT_ID = 'test-client-id';
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

