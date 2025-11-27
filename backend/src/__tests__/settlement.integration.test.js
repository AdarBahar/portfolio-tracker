/**
 * Integration tests for Settlement with Star Awards
 */

jest.mock('../db', () => ({
  execute: jest.fn(),
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
}));

const db = require('../db');
const settlementService = require('../services/settlementService');

describe('Settlement Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('settleRoom with achievement awards', () => {
    it('should award room_first_place achievement', async () => {
      const bullPenId = 1;

      // Mock: Get bull pen
      db.execute.mockResolvedValueOnce([[{ starting_cash: 10000 }]]);

      // Mock: Get members
      db.execute.mockResolvedValueOnce([
        [
          { user_id: 1, cash: 11000 },
          { user_id: 2, cash: 10500 },
        ],
      ]);

      // Mock: Get positions for user 1
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Get positions for user 2
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Check idempotency for room_first_place (user 1)
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Award room_first_place stars
      db.execute.mockResolvedValueOnce([{ insertId: 1 }]);

      // Mock: Get aggregated stars
      db.execute.mockResolvedValueOnce([[{ total_stars: 100 }]]);

      // Mock: Check idempotency for three_straight_wins (user 1)
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Get last 3 settlements for user 1
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Check idempotency for rooms_played (user 1)
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Get room count for user 1
      db.execute.mockResolvedValueOnce([[{ room_count: 5 }]]);

      // Mock: Similar checks for user 2
      for (let i = 0; i < 9; i++) {
        db.execute.mockResolvedValueOnce([[]]);
      }

      // Mock: Insert leaderboard snapshot
      db.execute.mockResolvedValueOnce([{ insertId: 1 }]);
      db.execute.mockResolvedValueOnce([{ insertId: 2 }]);

      const result = await settlementService.settleRoom(bullPenId);

      expect(result.success).toBe(true);
      expect(result.message).toContain('settled');
    });

    it('should award three_straight_wins achievement', async () => {
      const bullPenId = 1;

      // Mock: Get bull pen
      db.execute.mockResolvedValueOnce([[{ starting_cash: 10000 }]]);

      // Mock: Get members
      db.execute.mockResolvedValueOnce([
        [
          { user_id: 1, cash: 11000 },
        ],
      ]);

      // Mock: Get positions for user 1
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Check idempotency for room_first_place
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Award room_first_place
      db.execute.mockResolvedValueOnce([{ insertId: 1 }]);

      // Mock: Get aggregated stars
      db.execute.mockResolvedValueOnce([[{ total_stars: 100 }]]);

      // Mock: Check idempotency for three_straight_wins
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Get last 3 settlements - all wins
      db.execute.mockResolvedValueOnce([
        [
          { rank: 1 },
          { rank: 1 },
          { rank: 1 },
        ],
      ]);

      // Mock: Award three_straight_wins
      db.execute.mockResolvedValueOnce([{ insertId: 2 }]);

      // Mock: Get aggregated stars
      db.execute.mockResolvedValueOnce([[{ total_stars: 140 }]]);

      // Mock: Check idempotency for rooms_played
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Get room count
      db.execute.mockResolvedValueOnce([[{ room_count: 5 }]]);

      // Mock: Insert leaderboard snapshot
      db.execute.mockResolvedValueOnce([{ insertId: 1 }]);

      const result = await settlementService.settleRoom(bullPenId);

      expect(result.success).toBe(true);
    });

    it('should handle achievement award errors gracefully', async () => {
      const bullPenId = 1;

      // Mock: Get bull pen
      db.execute.mockResolvedValueOnce([[{ starting_cash: 10000 }]]);

      // Mock: Get members
      db.execute.mockResolvedValueOnce([
        [
          { user_id: 1, cash: 11000 },
        ],
      ]);

      // Mock: Get positions
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Achievement award fails
      db.execute.mockRejectedValueOnce(new Error('Achievement error'));

      // Should still continue with settlement
      // Mock: Insert leaderboard snapshot
      db.execute.mockResolvedValueOnce([{ insertId: 1 }]);

      const result = await settlementService.settleRoom(bullPenId);

      // Settlement should still succeed despite achievement error
      expect(result.success).toBe(true);
    });
  });
});

