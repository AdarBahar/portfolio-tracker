/**
 * Integration tests for Admin Endpoints
 */

// Mock database
jest.mock('../db', () => ({
  execute: jest.fn(),
}));

const db = require('../db');
const adminController = require('../controllers/adminController');

describe('Admin Endpoints - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('grantStars endpoint', () => {
    it('should grant stars to a user successfully', async () => {
      const req = {
        params: { id: '1' },
        body: { stars: 100, reason: 'Manual grant for testing' },
        user: { id: 999 }, // Admin user
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock: User exists
      db.execute.mockResolvedValueOnce([[{ id: 1, email: 'user@test.com', name: 'Test User' }]]);

      // Mock: Award stars - idempotency check
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Insert star event
      db.execute.mockResolvedValueOnce([{ insertId: 1 }]);

      // Mock: Get aggregated stars
      db.execute.mockResolvedValueOnce([[{ total_stars: 100 }]]);

      // Mock: Audit log
      db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await adminController.grantStars(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('Granted 100 stars'),
        })
      );
    });

    it('should reject invalid star amount', async () => {
      const req = {
        params: { id: '1' },
        body: { stars: -10, reason: 'Invalid' },
        user: { id: 999 },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await adminController.grantStars(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('invalid'),
        })
      );
    });

    it('should reject missing reason', async () => {
      const req = {
        params: { id: '1' },
        body: { stars: 100 },
        user: { id: 999 },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await adminController.grantStars(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('reason'),
        })
      );
    });

    it('should handle user not found', async () => {
      const req = {
        params: { id: '999' },
        body: { stars: 100, reason: 'Test' },
        user: { id: 999 },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock: User not found
      db.execute.mockResolvedValueOnce([[]]);

      await adminController.grantStars(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

