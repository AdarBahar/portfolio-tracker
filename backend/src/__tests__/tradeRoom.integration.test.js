/**
 * Trade Room Integration Tests
 * Tests for Trade Room API endpoints and services
 */

const tradeRoomService = require('../services/tradeRoomService');
const positionTrackingService = require('../services/positionTrackingService');
const leaderboardSnapshotService = require('../services/leaderboardSnapshotService');
const payoutService = require('../services/payoutService');
const { validateRoomCreation, validateOrderParams } = require('../utils/tradeRoomValidation');

describe('Trade Room Service', () => {
  describe('State Machine', () => {
    test('isValidStateTransition should allow valid transitions', () => {
      expect(tradeRoomService.isValidStateTransition('draft', 'scheduled')).toBe(true);
      expect(tradeRoomService.isValidStateTransition('scheduled', 'active')).toBe(true);
      expect(tradeRoomService.isValidStateTransition('active', 'completed')).toBe(true);
    });

    test('isValidStateTransition should reject invalid transitions', () => {
      expect(tradeRoomService.isValidStateTransition('completed', 'active')).toBe(false);
      expect(tradeRoomService.isValidStateTransition('draft', 'active')).toBe(false);
    });

    test('calculateRoomStatus should return correct status based on time', () => {
      const now = new Date();
      const future = new Date(now.getTime() + 60000); // 1 minute from now
      const past = new Date(now.getTime() - 60000); // 1 minute ago

      expect(tradeRoomService.calculateRoomStatus(future, 3600)).toBe('scheduled');
      expect(tradeRoomService.calculateRoomStatus(past, 3600)).toBe('active');
      expect(tradeRoomService.calculateRoomStatus(past, 1)).toBe('completed');
    });
  });
});

describe('Position Tracking Service', () => {
  describe('P&L Calculation', () => {
    test('calculatePositionPnL should calculate correct P&L', () => {
      const position = { qty: 100, avg_cost: 50 };
      const currentPrice = 55;

      const pnl = positionTrackingService.calculatePositionPnL(position, currentPrice);

      expect(pnl.unrealizedPnl).toBe(500); // (55-50)*100
      expect(pnl.unrealizedPnlPct).toBe(10); // (55-50)/50*100
    });

    test('calculatePositionPnL should handle losses', () => {
      const position = { qty: 100, avg_cost: 50 };
      const currentPrice = 45;

      const pnl = positionTrackingService.calculatePositionPnL(position, currentPrice);

      expect(pnl.unrealizedPnl).toBe(-500); // (45-50)*100
      expect(pnl.unrealizedPnlPct).toBe(-10); // (45-50)/50*100
    });
  });
});

describe('Payout Service', () => {
  describe('Payout Calculation', () => {
    const leaderboard = [
      { user_id: 1, rank: 1, pnl_abs: 500 },
      { user_id: 2, rank: 2, pnl_abs: 200 },
      { user_id: 3, rank: 3, pnl_abs: -300 },
    ];

    test('calculatePayouts with winner-take-all model', () => {
      const payouts = payoutService.calculatePayouts(leaderboard, 1000, 'winner-take-all');

      expect(payouts[0].payout).toBe(1000); // Winner gets all
      expect(payouts[1].payout).toBe(0);
      expect(payouts[2].payout).toBe(0);
    });

    test('calculatePayouts with proportional model', () => {
      const payouts = payoutService.calculatePayouts(leaderboard, 1000, 'proportional');

      const totalPositivePnL = 500 + 200; // 700
      expect(payouts[0].payout).toBeCloseTo((500 / 700) * 1000, 2);
      expect(payouts[1].payout).toBeCloseTo((200 / 700) * 1000, 2);
      expect(payouts[2].payout).toBe(0);
    });

    test('calculatePayouts with tiered model', () => {
      const payouts = payoutService.calculatePayouts(leaderboard, 1000, 'tiered');

      expect(payouts[0].payout).toBeCloseTo(450, 0); // 50% of 900
      expect(payouts[1].payout).toBeCloseTo(270, 0); // 30% of 900
      expect(payouts[2].payout).toBeCloseTo(180, 0); // 20% of 900
    });

    test('validatePayouts should validate payout totals', () => {
      const payouts = [
        { userId: 1, payout: 500 },
        { userId: 2, payout: 300 },
        { userId: 3, payout: 200 },
      ];

      const result = payoutService.validatePayouts(payouts, 1000);
      expect(result.valid).toBe(true);
      expect(result.totalPayout).toBe(1000);
    });

    test('validatePayouts should reject invalid totals', () => {
      const payouts = [
        { userId: 1, payout: 500 },
        { userId: 2, payout: 300 },
      ];

      const result = payoutService.validatePayouts(payouts, 1000);
      expect(result.valid).toBe(false);
    });

    test('getPayoutSummary should calculate statistics', () => {
      const payouts = [
        { userId: 1, payout: 500 },
        { userId: 2, payout: 300 },
        { userId: 3, payout: 200 },
      ];

      const summary = payoutService.getPayoutSummary(payouts);

      expect(summary.totalPayout).toBe(1000);
      expect(summary.maxPayout).toBe(500);
      expect(summary.minPayout).toBe(200);
      expect(summary.avgPayout).toBeCloseTo(333.33, 1);
      expect(summary.winnersCount).toBe(3);
      expect(summary.playerCount).toBe(3);
    });
  });
});

describe('Validation', () => {
  describe('Room Creation Validation', () => {
    test('validateRoomCreation should accept valid params', () => {
      const result = validateRoomCreation({
        name: 'Test Room',
        durationSec: 3600,
        startingCash: 10000,
        maxPlayers: 10,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validateRoomCreation should reject invalid duration', () => {
      const result = validateRoomCreation({
        name: 'Test Room',
        durationSec: 30, // Too short
        startingCash: 10000,
        maxPlayers: 10,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('validateRoomCreation should reject invalid cash', () => {
      const result = validateRoomCreation({
        name: 'Test Room',
        durationSec: 3600,
        startingCash: -1000, // Negative
        maxPlayers: 10,
      });

      expect(result.valid).toBe(false);
    });
  });

  describe('Order Validation', () => {
    test('validateOrderParams should accept valid params', () => {
      const result = validateOrderParams({
        symbol: 'AAPL',
        side: 'buy',
        type: 'market',
        qty: 100,
      });

      expect(result.valid).toBe(true);
    });

    test('validateOrderParams should reject invalid side', () => {
      const result = validateOrderParams({
        symbol: 'AAPL',
        side: 'invalid',
        type: 'market',
        qty: 100,
      });

      expect(result.valid).toBe(false);
    });

    test('validateOrderParams should require limit price for limit orders', () => {
      const result = validateOrderParams({
        symbol: 'AAPL',
        side: 'buy',
        type: 'limit',
        qty: 100,
        // Missing limitPrice
      });

      expect(result.valid).toBe(false);
    });
  });
});

