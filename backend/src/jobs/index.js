const cron = require('node-cron');
const db = require('../db');
const { calculatePortfolioValue } = require('../controllers/leaderboardController');
const logger = require('../utils/logger');
const settlementService = require('../services/settlementService');
const { reconciliationJob } = require('./reconciliationJob');

/**
 * Room State Manager
 * Runs every minute to transition rooms between states
 */
async function roomStateManager() {
  try {
    logger.log('[Job] Running room state manager...');

    // Transition scheduled → active
    const [scheduledRooms] = await db.execute(
      `SELECT id, name FROM bull_pens
       WHERE state = 'scheduled' AND start_time <= NOW()`
    );

    for (const room of scheduledRooms) {
      await db.execute('UPDATE bull_pens SET state = ? WHERE id = ?', ['active', room.id]);
      logger.log(`[Job] Transitioned bull pen ${room.id} (${room.name}) to active`);
    }

    // Transition active → completed
    const [activeRooms] = await db.execute(
      `SELECT id, name, start_time, duration_sec FROM bull_pens
       WHERE state = 'active' AND DATE_ADD(start_time, INTERVAL duration_sec SECOND) <= NOW()`
    );

    for (const room of activeRooms) {
      await db.execute('UPDATE bull_pens SET state = ? WHERE id = ?', ['completed', room.id]);
      logger.log(`[Job] Transitioned bull pen ${room.id} (${room.name}) to completed`);

      // Create final leaderboard snapshot
      await createLeaderboardSnapshot(room.id);

      // Settle the room (credit winners, debit losers)
      const settlementResult = await settlementService.settleRoom(room.id);
      if (settlementResult.success) {
        logger.log(`[Job] Room ${room.id} settled successfully. ${settlementResult.settled_count} users processed.`);
      } else {
        logger.error(`[Job] Room ${room.id} settlement failed:`, settlementResult.error);
      }
    }

    logger.log(`[Job] Room state manager complete. Transitioned ${scheduledRooms.length} to active, ${activeRooms.length} to completed.`);
  } catch (err) {
    logger.error('[Job] Error in room state manager:', err);
  }
}

/**
 * Create a leaderboard snapshot for a bull pen
 * @param {number} bullPenId 
 */
async function createLeaderboardSnapshot(bullPenId) {
  try {
    logger.log(`[Job] Creating leaderboard snapshot for bull pen ${bullPenId}...`);

    // Get bull pen info
    const [bullPenRows] = await db.execute('SELECT starting_cash FROM bull_pens WHERE id = ?', [bullPenId]);
    if (bullPenRows.length === 0) {
      logger.warn(`[Job] Bull pen ${bullPenId} not found, skipping snapshot`);
      return;
    }
    
    const startingCash = Number(bullPenRows[0].starting_cash);
    
    // Get all active members
    const [members] = await db.execute(
      'SELECT user_id FROM bull_pen_memberships WHERE bull_pen_id = ? AND status = "active"',
      [bullPenId]
    );
    
    const rankings = [];
    
    for (const member of members) {
      const portfolio = await calculatePortfolioValue(bullPenId, member.user_id);
      
      // Get last trade timestamp
      const [lastTradeRows] = await db.execute(
        'SELECT MAX(placed_at) as last_trade_at FROM bull_pen_orders WHERE bull_pen_id = ? AND user_id = ? AND status = "filled"',
        [bullPenId, member.user_id]
      );
      
      const pnlAbs = portfolio.totalValue - startingCash;
      const pnlPct = (pnlAbs / startingCash) * 100;
      
      rankings.push({
        userId: member.user_id,
        portfolioValue: portfolio.totalValue,
        pnlAbs,
        pnlPct,
        lastTradeAt: lastTradeRows[0].last_trade_at,
      });
    }
    
    // Sort by portfolio value descending
    rankings.sort((a, b) => b.portfolioValue - a.portfolioValue);
    
    // Insert snapshots with ranks
    for (let i = 0; i < rankings.length; i++) {
      const entry = rankings[i];
      await db.execute(
        `INSERT INTO leaderboard_snapshots 
         (bull_pen_id, user_id, snapshot_at, rank, portfolio_value, pnl_abs, pnl_pct, last_trade_at)
         VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)`,
        [bullPenId, entry.userId, i + 1, entry.portfolioValue, entry.pnlAbs, entry.pnlPct, entry.lastTradeAt]
      );
    }
    
    logger.log(`[Job] Created leaderboard snapshot for bull pen ${bullPenId} with ${rankings.length} entries`);
  } catch (err) {
    logger.error(`[Job] Error creating leaderboard snapshot for bull pen ${bullPenId}:`, err);
  }
}

/**
 * Leaderboard Updater
 * Runs every 5 minutes to create snapshots for active rooms
 */
async function leaderboardUpdater() {
  try {
    logger.log('[Job] Running leaderboard updater...');

    const [activeRooms] = await db.execute('SELECT id FROM bull_pens WHERE state = "active"');

    for (const room of activeRooms) {
      await createLeaderboardSnapshot(room.id);
    }

    logger.log(`[Job] Leaderboard updater complete. Updated ${activeRooms.length} active rooms.`);
  } catch (err) {
    logger.error('[Job] Error in leaderboard updater:', err);
  }
}

/**
 * Start all background jobs
 */
function startJobs() {
  logger.log('[Jobs] Starting background jobs...');

  // Room state manager - every minute
  cron.schedule('* * * * *', roomStateManager);
  logger.log('[Jobs] Scheduled room state manager (every minute)');

  // Leaderboard updater - every 5 minutes
  cron.schedule('*/5 * * * *', leaderboardUpdater);
  logger.log('[Jobs] Scheduled leaderboard updater (every 5 minutes)');

  // Reconciliation job - every hour
  cron.schedule('0 * * * *', reconciliationJob);
  logger.log('[Jobs] Scheduled reconciliation job (every hour)');

  logger.log('[Jobs] All background jobs started');
}

module.exports = {
  startJobs,
  roomStateManager,
  leaderboardUpdater,
  createLeaderboardSnapshot,
  reconciliationJob,
};

