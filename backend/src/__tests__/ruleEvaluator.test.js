/**
 * Unit tests for RuleEvaluator
 */

const ruleEvaluator = require('../services/ruleEvaluator');

// Mock database
jest.mock('../db', () => ({
  execute: jest.fn(),
}));

const db = require('../db');

describe('RuleEvaluator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('evaluateFirstRoomJoin', () => {
    it('should return true if user has no room memberships', async () => {
      const userId = 1;

      db.execute.mockResolvedValueOnce([[]]);

      const result = await ruleEvaluator.evaluateFirstRoomJoin(userId);

      expect(result).toBe(true);
    });

    it('should return false if user has existing room memberships', async () => {
      const userId = 1;

      db.execute.mockResolvedValueOnce([[{ count: 1 }]]);

      const result = await ruleEvaluator.evaluateFirstRoomJoin(userId);

      expect(result).toBe(false);
    });
  });

  describe('evaluateRoomFirstPlace', () => {
    it('should return true if rank is 1', async () => {
      const userId = 1;
      const bullPenId = 1;
      const rank = 1;

      const result = await ruleEvaluator.evaluateRoomFirstPlace(userId, bullPenId, rank);

      expect(result).toBe(true);
    });

    it('should return false if rank is not 1', async () => {
      const userId = 1;
      const bullPenId = 1;
      const rank = 2;

      const result = await ruleEvaluator.evaluateRoomFirstPlace(userId, bullPenId, rank);

      expect(result).toBe(false);
    });
  });

  describe('evaluateThreeStraightWins', () => {
    it('should return true if user has 3 consecutive wins', async () => {
      const userId = 1;

      // Mock: Get last 3 settlements
      db.execute.mockResolvedValueOnce([
        [
          { rank: 1, settled_at: '2025-11-27' },
          { rank: 1, settled_at: '2025-11-26' },
          { rank: 1, settled_at: '2025-11-25' },
        ],
      ]);

      const result = await ruleEvaluator.evaluateThreeStraightWins(userId);

      expect(result).toBe(true);
    });

    it('should return false if user does not have 3 consecutive wins', async () => {
      const userId = 1;

      // Mock: Get last 3 settlements with a loss
      db.execute.mockResolvedValueOnce([
        [
          { rank: 1, settled_at: '2025-11-27' },
          { rank: 2, settled_at: '2025-11-26' },
          { rank: 1, settled_at: '2025-11-25' },
        ],
      ]);

      const result = await ruleEvaluator.evaluateThreeStraightWins(userId);

      expect(result).toBe(false);
    });

    it('should return false if user has fewer than 3 settlements', async () => {
      const userId = 1;

      // Mock: Get fewer than 3 settlements
      db.execute.mockResolvedValueOnce([
        [
          { rank: 1, settled_at: '2025-11-27' },
          { rank: 1, settled_at: '2025-11-26' },
        ],
      ]);

      const result = await ruleEvaluator.evaluateThreeStraightWins(userId);

      expect(result).toBe(false);
    });
  });

  describe('evaluateRoomsPlayedMilestone', () => {
    it('should return true if user has played required rooms', async () => {
      const userId = 1;
      const requiredRooms = 10;

      db.execute.mockResolvedValueOnce([[{ room_count: 15 }]]);

      const result = await ruleEvaluator.evaluateRoomsPlayedMilestone(userId, requiredRooms);

      expect(result).toBe(true);
    });

    it('should return false if user has not played required rooms', async () => {
      const userId = 1;
      const requiredRooms = 10;

      db.execute.mockResolvedValueOnce([[{ room_count: 5 }]]);

      const result = await ruleEvaluator.evaluateRoomsPlayedMilestone(userId, requiredRooms);

      expect(result).toBe(false);
    });
  });

  describe('evaluateSeasonTopPercentile', () => {
    it('should return true if user is in top percentile', async () => {
      const userId = 1;
      const seasonId = 1;
      const percentile = 10;

      db.execute.mockResolvedValueOnce([[{ rank: 5, total_users: 100 }]]);

      const result = await ruleEvaluator.evaluateSeasonTopPercentile(userId, seasonId, percentile);

      expect(result).toBe(true); // Top 10% of 100 = top 10, rank 5 qualifies
    });

    it('should return false if user is not in top percentile', async () => {
      const userId = 1;
      const seasonId = 1;
      const percentile = 10;

      db.execute.mockResolvedValueOnce([[{ rank: 15, total_users: 100 }]]);

      const result = await ruleEvaluator.evaluateSeasonTopPercentile(userId, seasonId, percentile);

      expect(result).toBe(false); // Top 10% of 100 = top 10, rank 15 does not qualify
    });
  });

  describe('evaluateActivityStreak', () => {
    it('should return true if user has activity streak', async () => {
      const userId = 1;
      const consecutiveDays = 5;

      db.execute.mockResolvedValueOnce([[{ streak_days: 7 }]]);

      const result = await ruleEvaluator.evaluateActivityStreak(userId, consecutiveDays);

      expect(result).toBe(true);
    });

    it('should return false if user does not have activity streak', async () => {
      const userId = 1;
      const consecutiveDays = 5;

      db.execute.mockResolvedValueOnce([[{ streak_days: 3 }]]);

      const result = await ruleEvaluator.evaluateActivityStreak(userId, consecutiveDays);

      expect(result).toBe(false);
    });
  });

  describe('evaluateCampaignAction', () => {
    it('should return true if user completed campaign action', async () => {
      const userId = 1;
      const campaignCode = 'summer_2025';
      const requiredAction = 'deposit_100';

      db.execute.mockResolvedValueOnce([[{ completed: 1 }]]);

      const result = await ruleEvaluator.evaluateCampaignAction(userId, campaignCode, requiredAction);

      expect(result).toBe(true);
    });

    it('should return false if user did not complete campaign action', async () => {
      const userId = 1;
      const campaignCode = 'summer_2025';
      const requiredAction = 'deposit_100';

      db.execute.mockResolvedValueOnce([[]]);

      const result = await ruleEvaluator.evaluateCampaignAction(userId, campaignCode, requiredAction);

      expect(result).toBe(false);
    });
  });
});

