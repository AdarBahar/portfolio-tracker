/**
 * Settlement Service
 * Handles room settlement logic: calculating payouts and updating budgets
 */

const db = require('../db');
const budgetService = require('./budgetService');
const rakeService = require('./rakeService');
const { v4: uuid } = require('uuid');
const logger = require('../utils/logger');

/**
 * Settle a completed room
 * Calculates payouts based on final leaderboard and credits/debits user budgets
 * Idempotent: uses correlation_id to prevent duplicate settlements
 * @param {number} bullPenId - Room ID
 * @returns {Promise<{success: boolean, settled_count: number, error?: string}>}
 */
async function settleRoom(bullPenId) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get room info
    const [rooms] = await connection.execute(
      `SELECT id, starting_cash, state FROM bull_pens WHERE id = ? FOR UPDATE`,
      [bullPenId]
    );

    if (!rooms.length) {
      await connection.rollback();
      return { success: false, error: 'ROOM_NOT_FOUND', settled_count: 0 };
    }

    const room = rooms[0];
    if (room.state !== 'completed') {
      await connection.rollback();
      return { success: false, error: 'ROOM_NOT_COMPLETED', settled_count: 0 };
    }

    // Get final leaderboard snapshot
    const [leaderboard] = await connection.execute(
      `SELECT user_id, rank, portfolio_value, pnl_abs, pnl_pct 
       FROM leaderboard_snapshots 
       WHERE bull_pen_id = ? AND snapshot_at = (
         SELECT MAX(snapshot_at) FROM leaderboard_snapshots WHERE bull_pen_id = ?
       )
       ORDER BY rank ASC`,
      [bullPenId, bullPenId]
    );

    if (!leaderboard.length) {
      await connection.rollback();
      return { success: false, error: 'NO_LEADERBOARD', settled_count: 0 };
    }

    // Calculate payouts (simple: winner gets all buy-ins, others get refund)
    const totalBuyIn = room.starting_cash * leaderboard.length;

    // Collect rake from the pool
    const rakeResult = await rakeService.collectRake(bullPenId, totalBuyIn);
    const rakeAmount = rakeResult.rake_amount || 0;
    const poolAfterRake = totalBuyIn - rakeAmount;

    const settlementId = `room-${bullPenId}-settlement-${uuid()}`;
    let settledCount = 0;

    for (const entry of leaderboard) {
      const userId = entry.user_id;
      const rank = entry.rank;
      const pnlAbs = Number(entry.pnl_abs);

      // Determine payout (after rake deduction)
      let payout = 0;
      let operationType = 'ROOM_SETTLEMENT_LOSS';

      if (rank === 1) {
        // Winner gets pool after rake
        payout = poolAfterRake;
        operationType = 'ROOM_SETTLEMENT_WIN';
      } else if (pnlAbs > 0) {
        // Positive P&L: credit the profit (rake already deducted from pool)
        payout = pnlAbs;
        operationType = 'ROOM_SETTLEMENT_WIN';
      } else if (pnlAbs < 0) {
        // Negative P&L: already debited on join, no additional debit needed
        payout = 0;
        operationType = 'ROOM_SETTLEMENT_LOSS';
      } else {
        // Break-even: refund buy-in (minus rake share)
        payout = room.starting_cash - (rakeAmount / leaderboard.length);
        operationType = 'ROOM_SETTLEMENT_BREAKEVEN';
      }

      // Only process if there's a payout
      if (payout > 0) {
        const idempotencyKey = `settlement-${userId}-${bullPenId}`;

        const result = await budgetService.creditBudget(userId, payout, {
          operation_type: operationType,
          bull_pen_id: bullPenId,
          correlation_id: settlementId,
          idempotency_key: idempotencyKey,
          meta: { rank, pnl_abs: pnlAbs }
        });

        if (result.error) {
          logger.warn(`Settlement credit failed for user ${userId} in room ${bullPenId}:`, result.error);
          // Continue with other users even if one fails
        } else {
          settledCount++;
        }
      }
    }

    // Mark room as settled
    await connection.execute(
      `UPDATE bull_pens SET settlement_status = 'completed' WHERE id = ?`,
      [bullPenId]
    );

    await connection.commit();
    logger.log(`[Settlement] Room ${bullPenId} settled. ${settledCount} users processed.`);
    return { success: true, settled_count: settledCount };

  } catch (err) {
    await connection.rollback();
    logger.error(`[Settlement] Error settling room ${bullPenId}:`, err);
    return { success: false, error: err.message, settled_count: 0 };
  } finally {
    connection.release();
  }
}

module.exports = {
  settleRoom
};

