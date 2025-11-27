/**
 * Unit tests for RankingService
 */

const rankingService = require('../services/rankingService');

describe('RankingService', () => {
  describe('normalizeMetric', () => {
    it('should normalize metric to [0, 1] range', () => {
      const value = 50;
      const min = 0;
      const max = 100;

      const result = rankingService.normalizeMetric(value, min, max);

      expect(result).toBe(0.5);
    });

    it('should return 0 for minimum value', () => {
      const value = 0;
      const min = 0;
      const max = 100;

      const result = rankingService.normalizeMetric(value, min, max);

      expect(result).toBe(0);
    });

    it('should return 1 for maximum value', () => {
      const value = 100;
      const min = 0;
      const max = 100;

      const result = rankingService.normalizeMetric(value, min, max);

      expect(result).toBe(1);
    });

    it('should return 0.5 when min equals max (edge case)', () => {
      const value = 50;
      const min = 50;
      const max = 50;

      const result = rankingService.normalizeMetric(value, min, max);

      expect(result).toBe(0.5);
    });

    it('should handle negative values', () => {
      const value = -50;
      const min = -100;
      const max = 0;

      const result = rankingService.normalizeMetric(value, min, max);

      expect(result).toBe(0.5);
    });
  });

  describe('computeCompositeScore', () => {
    it('should compute weighted composite score', () => {
      const normReturn = 0.8;
      const normPnl = 0.6;
      const normStars = 0.4;
      const weights = { return: 0.5, pnl: 0.2, stars: 0.3 };

      const result = rankingService.computeCompositeScore(normReturn, normPnl, normStars, weights);

      // Expected: 0.5*0.8 + 0.2*0.6 + 0.3*0.4 = 0.4 + 0.12 + 0.12 = 0.64
      expect(result).toBeCloseTo(0.64, 5);
    });

    it('should use default weights if not provided', () => {
      const normReturn = 0.5;
      const normPnl = 0.5;
      const normStars = 0.5;

      const result = rankingService.computeCompositeScore(normReturn, normPnl, normStars);

      // Expected: 0.5*0.5 + 0.2*0.5 + 0.3*0.5 = 0.25 + 0.1 + 0.15 = 0.5
      expect(result).toBeCloseTo(0.5, 5);
    });

    it('should handle zero values', () => {
      const normReturn = 0;
      const normPnl = 0;
      const normStars = 0;

      const result = rankingService.computeCompositeScore(normReturn, normPnl, normStars);

      expect(result).toBe(0);
    });

    it('should handle maximum values', () => {
      const normReturn = 1;
      const normPnl = 1;
      const normStars = 1;

      const result = rankingService.computeCompositeScore(normReturn, normPnl, normStars);

      // Expected: 0.5*1 + 0.2*1 + 0.3*1 = 1.0
      expect(result).toBeCloseTo(1.0, 5);
    });
  });

  describe('getDefaultWeights', () => {
    it('should return default weights', () => {
      const weights = rankingService.getDefaultWeights();

      expect(weights).toEqual({
        return: 0.5,
        pnl: 0.2,
        stars: 0.3,
      });
    });

    it('should have weights that sum to 1', () => {
      const weights = rankingService.getDefaultWeights();
      const sum = weights.return + weights.pnl + weights.stars;

      expect(sum).toBeCloseTo(1.0, 5);
    });
  });

  describe('applyTieBreakers', () => {
    it('should sort by score first', () => {
      const leaderboard = [
        { userId: 1, score: 0.5, pnlPct: 10, pnlAbs: 1000, roomStars: 50, tradeCount: 10, accountAge: 100 },
        { userId: 2, score: 0.8, pnlPct: 20, pnlAbs: 2000, roomStars: 100, tradeCount: 20, accountAge: 100 },
        { userId: 3, score: 0.6, pnlPct: 15, pnlAbs: 1500, roomStars: 75, tradeCount: 15, accountAge: 100 },
      ];

      const result = rankingService.applyTieBreakers(leaderboard);

      expect(result[0].userId).toBe(2); // Highest score
      expect(result[1].userId).toBe(3);
      expect(result[2].userId).toBe(1);
    });

    it('should break ties by return percentage', () => {
      const leaderboard = [
        { userId: 1, score: 0.5, pnlPct: 20, pnlAbs: 1000, roomStars: 50, tradeCount: 10, accountAge: 100 },
        { userId: 2, score: 0.5, pnlPct: 10, pnlAbs: 1000, roomStars: 50, tradeCount: 10, accountAge: 100 },
      ];

      const result = rankingService.applyTieBreakers(leaderboard);

      expect(result[0].userId).toBe(1); // Higher return%
      expect(result[1].userId).toBe(2);
    });

    it('should break ties by P&L amount', () => {
      const leaderboard = [
        { userId: 1, score: 0.5, pnlPct: 10, pnlAbs: 2000, roomStars: 50, tradeCount: 10, accountAge: 100 },
        { userId: 2, score: 0.5, pnlPct: 10, pnlAbs: 1000, roomStars: 50, tradeCount: 10, accountAge: 100 },
      ];

      const result = rankingService.applyTieBreakers(leaderboard);

      expect(result[0].userId).toBe(1); // Higher P&L
      expect(result[1].userId).toBe(2);
    });

    it('should break ties by stars', () => {
      const leaderboard = [
        { userId: 1, score: 0.5, pnlPct: 10, pnlAbs: 1000, roomStars: 100, tradeCount: 10, accountAge: 100 },
        { userId: 2, score: 0.5, pnlPct: 10, pnlAbs: 1000, roomStars: 50, tradeCount: 10, accountAge: 100 },
      ];

      const result = rankingService.applyTieBreakers(leaderboard);

      expect(result[0].userId).toBe(1); // More stars
      expect(result[1].userId).toBe(2);
    });

    it('should break ties by trade count', () => {
      const leaderboard = [
        { userId: 1, score: 0.5, pnlPct: 10, pnlAbs: 1000, roomStars: 50, tradeCount: 20, accountAge: 100 },
        { userId: 2, score: 0.5, pnlPct: 10, pnlAbs: 1000, roomStars: 50, tradeCount: 10, accountAge: 100 },
      ];

      const result = rankingService.applyTieBreakers(leaderboard);

      expect(result[0].userId).toBe(1); // More trades
      expect(result[1].userId).toBe(2);
    });

    it('should break ties by account age', () => {
      const leaderboard = [
        { userId: 1, score: 0.5, pnlPct: 10, pnlAbs: 1000, roomStars: 50, tradeCount: 10, accountAge: 200 },
        { userId: 2, score: 0.5, pnlPct: 10, pnlAbs: 1000, roomStars: 50, tradeCount: 10, accountAge: 100 },
      ];

      const result = rankingService.applyTieBreakers(leaderboard);

      expect(result[0].userId).toBe(1); // Older account
      expect(result[1].userId).toBe(2);
    });
  });
});

