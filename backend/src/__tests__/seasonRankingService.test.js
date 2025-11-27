/**
 * Unit tests for SeasonRankingService
 */

const seasonRankingService = require('../services/seasonRankingService');

// Mock database
jest.mock('../db', () => ({
  execute: jest.fn(),
}));

const db = require('../db');

describe('SeasonRankingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('aggregateSeasonStats', () => {
    it('should aggregate season stats successfully', async () => {
      const seasonId = 1;

      // Mock: Get all users in season
      db.execute.mockResolvedValueOnce([
        [
          { user_id: 1, bull_pen_id: 1 },
          { user_id: 2, bull_pen_id: 1 },
        ],
      ]);

      // Mock: Get stats for user 1
      db.execute.mockResolvedValueOnce([[{ pnl_abs: 1000, pnl_pct: 10, stars: 100 }]]);

      // Mock: Insert/update for user 1
      db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Mock: Get stats for user 2
      db.execute.mockResolvedValueOnce([[{ pnl_abs: 500, pnl_pct: 5, stars: 50 }]]);

      // Mock: Insert/update for user 2
      db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await seasonRankingService.aggregateSeasonStats(seasonId);

      expect(result.success).toBe(true);
      expect(result.aggregatedCount).toBe(2);
    });

    it('should handle database errors', async () => {
      const seasonId = 1;

      db.execute.mockRejectedValueOnce(new Error('Database error'));

      const result = await seasonRankingService.aggregateSeasonStats(seasonId);

      expect(result.success).toBe(false);
      expect(result.message).toContain('error');
    });
  });

  describe('normalizeSeasonMetrics', () => {
    it('should normalize season metrics', async () => {
      const seasonId = 1;

      // Mock: Get all season stats
      db.execute.mockResolvedValueOnce([
        [
          { user_id: 1, pnl_abs: 1000, pnl_pct: 10, stars: 100 },
          { user_id: 2, pnl_abs: 500, pnl_pct: 5, stars: 50 },
        ],
      ]);

      const result = await seasonRankingService.normalizeSeasonMetrics(seasonId);

      expect(result.success).toBe(true);
      expect(result.normalizedCount).toBe(2);
    });
  });

  describe('computeSeasonScores', () => {
    it('should compute season scores', async () => {
      const seasonId = 1;

      // Mock: Get all season stats
      db.execute.mockResolvedValueOnce([
        [
          { user_id: 1, pnl_abs: 1000, pnl_pct: 10, stars: 100 },
          { user_id: 2, pnl_abs: 500, pnl_pct: 5, stars: 50 },
        ],
      ]);

      // Mock: Update scores for user 1
      db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Mock: Update scores for user 2
      db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await seasonRankingService.computeSeasonScores(seasonId);

      expect(result.success).toBe(true);
      expect(result.scoredCount).toBe(2);
    });
  });

  describe('updateSeasonUserStats', () => {
    it('should update season user stats', async () => {
      const seasonId = 1;
      const userId = 1;
      const stats = { pnl_abs: 1000, pnl_pct: 10, stars: 100, score: 0.65 };

      db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await seasonRankingService.updateSeasonUserStats(seasonId, userId, stats);

      expect(result.success).toBe(true);
    });

    it('should handle update errors', async () => {
      const seasonId = 1;
      const userId = 1;
      const stats = { pnl_abs: 1000, pnl_pct: 10, stars: 100, score: 0.65 };

      db.execute.mockRejectedValueOnce(new Error('Database error'));

      const result = await seasonRankingService.updateSeasonUserStats(seasonId, userId, stats);

      expect(result.success).toBe(false);
    });
  });

  describe('getSeasonLeaderboard', () => {
    it('should return season leaderboard', async () => {
      const seasonId = 1;
      const limit = 10;
      const offset = 0;

      const mockLeaderboard = [
        { user_id: 1, rank: 1, pnl_abs: 1000, pnl_pct: 10, stars: 100, score: 0.65 },
        { user_id: 2, rank: 2, pnl_abs: 500, pnl_pct: 5, stars: 50, score: 0.45 },
      ];

      db.execute.mockResolvedValueOnce([mockLeaderboard]);

      const result = await seasonRankingService.getSeasonLeaderboard(seasonId, limit, offset);

      expect(result).toEqual(mockLeaderboard);
      expect(result.length).toBe(2);
    });

    it('should return empty array if no users in season', async () => {
      const seasonId = 1;
      const limit = 10;
      const offset = 0;

      db.execute.mockResolvedValueOnce([[]]);

      const result = await seasonRankingService.getSeasonLeaderboard(seasonId, limit, offset);

      expect(result).toEqual([]);
    });
  });
});

