const cron = require('node-cron');
const db = require('../db');
const { calculatePortfolioValue } = require('../controllers/leaderboardController');
const logger = require('../utils/logger');
const settlementService = require('../services/settlementService');
const rankingService = require('../services/rankingService');
const achievementsService = require('../services/achievementsService');
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
 * Integrates composite scoring with stars and tie-breaking
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

      // Get room stars for this user
      const [starRows] = await db.execute(
        `SELECT COALESCE(SUM(stars_delta), 0) as room_stars
         FROM user_star_events
         WHERE user_id = ? AND bull_pen_id = ? AND deleted_at IS NULL`,
        [member.user_id, bullPenId]
      );

      // Get trade count for tie-breaking
      const [tradeRows] = await db.execute(
        `SELECT COUNT(*) as trade_count FROM bull_pen_orders
         WHERE bull_pen_id = ? AND user_id = ? AND status = "filled"`,
        [bullPenId, member.user_id]
      );

      // Get account age for tie-breaking
      const [userRows] = await db.execute(
        `SELECT DATEDIFF(NOW(), created_at) as account_age_days FROM users WHERE id = ?`,
        [member.user_id]
      );

      const pnlAbs = portfolio.totalValue - startingCash;
      const pnlPct = (pnlAbs / startingCash) * 100;

      rankings.push({
        userId: member.user_id,
        portfolioValue: portfolio.totalValue,
        pnlAbs,
        pnlPct,
        roomStars: starRows[0]?.room_stars || 0,
        lastTradeAt: lastTradeRows[0]?.last_trade_at,
        tradeCount: tradeRows[0]?.trade_count || 0,
        accountAge: userRows[0]?.account_age_days || 0,
      });
    }

    // Calculate composite scores using rankingService
    const scores = rankings.map(entry => ({
      userId: entry.userId,
      pnlPct: entry.pnlPct,
      pnlAbs: entry.pnlAbs,
      roomStars: entry.roomStars,
      tradeCount: entry.tradeCount,
      accountAge: entry.accountAge,
      portfolioValue: entry.portfolioValue,
      lastTradeAt: entry.lastTradeAt,
    }));

    // Normalize metrics
    const returns = scores.map(s => s.pnlPct);
    const pnls = scores.map(s => s.pnlAbs);
    const stars = scores.map(s => s.roomStars);

    const minReturn = Math.min(...returns);
    const maxReturn = Math.max(...returns);
    const minPnl = Math.min(...pnls);
    const maxPnl = Math.max(...pnls);
    const minStars = Math.min(...stars);
    const maxStars = Math.max(...stars);

    // Compute composite scores
    const weights = rankingService.getDefaultWeights();
    const scoredRankings = scores.map(entry => {
      const normReturn = rankingService.normalizeMetric(entry.pnlPct, minReturn, maxReturn);
      const normPnl = rankingService.normalizeMetric(entry.pnlAbs, minPnl, maxPnl);
      const normStars = rankingService.normalizeMetric(entry.roomStars, minStars, maxStars);
      const score = rankingService.computeCompositeScore(normReturn, normPnl, normStars, weights);

      return {
        ...entry,
        score,
        normReturn,
        normPnl,
        normStars,
      };
    });

    // Apply tie-breakers and assign ranks
    const ranked = rankingService.applyTieBreakers(scoredRankings);

    // Insert snapshots with ranks and scores
    for (let i = 0; i < ranked.length; i++) {
      const entry = ranked[i];
      await db.execute(
        `INSERT INTO leaderboard_snapshots
         (bull_pen_id, user_id, snapshot_at, rank, portfolio_value, pnl_abs, pnl_pct, stars, score, last_trade_at)
         VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
        [bullPenId, entry.userId, i + 1, entry.portfolioValue, entry.pnlAbs, entry.pnlPct, entry.roomStars, entry.score, entry.lastTradeAt]
      );
    }

    logger.log(`[Job] Created leaderboard snapshot for bull pen ${bullPenId} with ${ranked.length} entries (composite scoring applied)`);
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

