/**
 * Unit tests for AchievementsService
 */

const achievementsService = require('../services/achievementsService');

// Mock database
jest.mock('../db', () => ({
  execute: jest.fn(),
}));

const db = require('../db');

describe('AchievementsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('awardStars', () => {
    it('should award stars successfully', async () => {
      const userId = 1;
      const reasonCode = 'first_room_join';
      const starsDelta = 10;
      const context = { bullPenId: null, seasonId: null, source: 'achievement' };

      // Mock idempotency check - no existing award
      db.execute.mockResolvedValueOnce([[]]);

      // Mock insert
      db.execute.mockResolvedValueOnce([{ insertId: 1 }]);

      // Mock get aggregated stars
      db.execute.mockResolvedValueOnce([[{ total_stars: 10 }]]);

      const result = await achievementsService.awardStars(userId, reasonCode, starsDelta, context);

      expect(result.success).toBe(true);
      expect(result.starId).toBe(1);
      expect(result.totalStars).toBe(10);
      expect(db.execute).toHaveBeenCalledTimes(3);
    });

    it('should prevent duplicate awards (idempotency)', async () => {
      const userId = 1;
      const reasonCode = 'first_room_join';
      const starsDelta = 10;
      const context = { bullPenId: null, seasonId: null, source: 'achievement' };

      // Mock idempotency check - existing award found
      db.execute.mockResolvedValueOnce([[{ id: 1 }]]);

      const result = await achievementsService.awardStars(userId, reasonCode, starsDelta, context);

      expect(result.success).toBe(false);
      expect(result.message).toContain('already awarded');
    });

    it('should handle database errors gracefully', async () => {
      const userId = 1;
      const reasonCode = 'first_room_join';
      const starsDelta = 10;
      const context = { bullPenId: null, seasonId: null, source: 'achievement' };

      // Mock database error
      db.execute.mockRejectedValueOnce(new Error('Database error'));

      const result = await achievementsService.awardStars(userId, reasonCode, starsDelta, context);

      expect(result.success).toBe(false);
      expect(result.message).toContain('error');
    });
  });

  describe('getAggregatedStars', () => {
    it('should return aggregated stars for a user', async () => {
      const userId = 1;
      const scope = 'lifetime';

      db.execute.mockResolvedValueOnce([[{ total_stars: 150 }]]);

      const result = await achievementsService.getAggregatedStars(userId, scope);

      expect(result).toBe(150);
      expect(db.execute).toHaveBeenCalledTimes(1);
    });

    it('should return 0 if no stars found', async () => {
      const userId = 1;
      const scope = 'lifetime';

      db.execute.mockResolvedValueOnce([[]]);

      const result = await achievementsService.getAggregatedStars(userId, scope);

      expect(result).toBe(0);
    });
  });

  describe('getStarEvents', () => {
    it('should return star events for a user', async () => {
      const userId = 1;
      const filters = { limit: 10, offset: 0 };

      const mockEvents = [
        { id: 1, reason_code: 'first_room_join', stars_delta: 10 },
        { id: 2, reason_code: 'room_first_place', stars_delta: 100 },
      ];

      db.execute.mockResolvedValueOnce([mockEvents]);

      const result = await achievementsService.getStarEvents(userId, filters);

      expect(result).toEqual(mockEvents);
      expect(result.length).toBe(2);
    });
  });

  describe('checkIdempotency', () => {
    it('should return true if award already exists', async () => {
      const userId = 1;
      const reasonCode = 'first_room_join';
      const bullPenId = null;
      const seasonId = null;

      db.execute.mockResolvedValueOnce([[{ id: 1 }]]);

      const result = await achievementsService.checkIdempotency(userId, reasonCode, bullPenId, seasonId);

      expect(result).toBe(true);
    });

    it('should return false if award does not exist', async () => {
      const userId = 1;
      const reasonCode = 'first_room_join';
      const bullPenId = null;
      const seasonId = null;

      db.execute.mockResolvedValueOnce([[]]);

      const result = await achievementsService.checkIdempotency(userId, reasonCode, bullPenId, seasonId);

      expect(result).toBe(false);
    });
  });
});

