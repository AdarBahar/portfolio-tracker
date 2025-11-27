/**
 * Integration tests for Leaderboard with Stars
 */

jest.mock('../db', () => ({
  execute: jest.fn(),
}));

const db = require('../db');
const leaderboardController = require('../controllers/leaderboardController');

describe('Leaderboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLeaderboard with stars and scores', () => {
    it('should return leaderboard with stars and scores', async () => {
      const req = {
        params: { id: '1' },
        user: { id: 1 },
      };

      const res = {
        json: jest.fn(),
      };

      // Mock: Bull pen exists
      db.execute.mockResolvedValueOnce([[{ id: 1, name: 'Test Room', starting_cash: 10000 }]]);

      // Mock: User is member
      db.execute.mockResolvedValueOnce([[{ user_id: 1 }]]);

      // Mock: Get latest leaderboard snapshot
      db.execute.mockResolvedValueOnce([
        [
          { user_id: 1, rank: 1, stars: 150, score: 0.75 },
          { user_id: 2, rank: 2, stars: 100, score: 0.65 },
        ],
      ]);

      // Mock: Get members
      db.execute.mockResolvedValueOnce([
        [
          { user_id: 1, cash: 11000, name: 'User 1', email: 'user1@test.com' },
          { user_id: 2, cash: 10500, name: 'User 2', email: 'user2@test.com' },
        ],
      ]);

      // Mock: Get portfolio value for user 1
      db.execute.mockResolvedValueOnce([[{ cash: 11000 }]]);
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Get last trade for user 1
      db.execute.mockResolvedValueOnce([[{ last_trade_at: '2025-11-27' }]]);

      // Mock: Get portfolio value for user 2
      db.execute.mockResolvedValueOnce([[{ cash: 10500 }]]);
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Get last trade for user 2
      db.execute.mockResolvedValueOnce([[{ last_trade_at: '2025-11-26' }]]);

      await leaderboardController.getLeaderboard(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          bullPenId: 1,
          leaderboard: expect.arrayContaining([
            expect.objectContaining({
              userId: 1,
              stars: 150,
              score: 0.75,
            }),
            expect.objectContaining({
              userId: 2,
              stars: 100,
              score: 0.65,
            }),
          ]),
        })
      );
    });

    it('should sort by composite score', async () => {
      const req = {
        params: { id: '1' },
        user: { id: 1 },
      };

      const res = {
        json: jest.fn(),
      };

      // Mock: Bull pen exists
      db.execute.mockResolvedValueOnce([[{ id: 1, name: 'Test Room', starting_cash: 10000 }]]);

      // Mock: User is member
      db.execute.mockResolvedValueOnce([[{ user_id: 1 }]]);

      // Mock: Get latest leaderboard snapshot (sorted by score)
      db.execute.mockResolvedValueOnce([
        [
          { user_id: 2, rank: 1, stars: 200, score: 0.85 },
          { user_id: 1, rank: 2, stars: 100, score: 0.65 },
        ],
      ]);

      // Mock: Get members
      db.execute.mockResolvedValueOnce([
        [
          { user_id: 1, cash: 10500, name: 'User 1', email: 'user1@test.com' },
          { user_id: 2, cash: 11500, name: 'User 2', email: 'user2@test.com' },
        ],
      ]);

      // Mock: Get portfolio values and trades for both users
      for (let i = 0; i < 4; i++) {
        db.execute.mockResolvedValueOnce([[{ cash: 10500 }]]);
        db.execute.mockResolvedValueOnce([[]]);
        db.execute.mockResolvedValueOnce([[{ last_trade_at: '2025-11-27' }]]);
      }

      await leaderboardController.getLeaderboard(req, res);

      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.leaderboard[0].userId).toBe(2); // Highest score
      expect(callArgs.leaderboard[1].userId).toBe(1);
    });

    it('should handle missing snapshot gracefully', async () => {
      const req = {
        params: { id: '1' },
        user: { id: 1 },
      };

      const res = {
        json: jest.fn(),
      };

      // Mock: Bull pen exists
      db.execute.mockResolvedValueOnce([[{ id: 1, name: 'Test Room', starting_cash: 10000 }]]);

      // Mock: User is member
      db.execute.mockResolvedValueOnce([[{ user_id: 1 }]]);

      // Mock: No leaderboard snapshot
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Get members
      db.execute.mockResolvedValueOnce([
        [
          { user_id: 1, cash: 11000, name: 'User 1', email: 'user1@test.com' },
        ],
      ]);

      // Mock: Get portfolio value
      db.execute.mockResolvedValueOnce([[{ cash: 11000 }]]);
      db.execute.mockResolvedValueOnce([[]]);

      // Mock: Get last trade
      db.execute.mockResolvedValueOnce([[{ last_trade_at: '2025-11-27' }]]);

      await leaderboardController.getLeaderboard(req, res);

      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.leaderboard[0]).toEqual(
        expect.objectContaining({
          userId: 1,
          stars: 0,
          score: 0,
        })
      );
    });
  });
});

