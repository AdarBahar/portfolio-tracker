const db = require('../db');
const { badRequest, forbidden, notFound, internalError } = require('../utils/apiError');
const logger = require('../utils/logger');

/**
 * Calculate portfolio value for a user in a bull pen
 * @param {number} bullPenId 
 * @param {number} userId 
 * @param {object} connection - DB connection (optional, for transactions)
 * @returns {Promise<{cash: number, positionsValue: number, totalValue: number}>}
 */
async function calculatePortfolioValue(bullPenId, userId, connection) {
  const conn = connection || db;

  // Get user's cash balance
  const [membershipRows] = await conn.execute(
    'SELECT cash FROM bull_pen_memberships WHERE bull_pen_id = ? AND user_id = ? AND status = "active" AND deleted_at IS NULL',
    [bullPenId, userId]
  );

  if (membershipRows.length === 0) {
    return { cash: 0, positionsValue: 0, totalValue: 0 };
  }

  const cash = Number(membershipRows[0].cash);

  // Get user's positions
  const [positionRows] = await conn.execute(
    'SELECT symbol, qty FROM bull_pen_positions WHERE bull_pen_id = ? AND user_id = ? AND deleted_at IS NULL',
    [bullPenId, userId]
  );

  let positionsValue = 0;

  for (const position of positionRows) {
    // Get current price from market_data
    const [priceRows] = await conn.execute(
      'SELECT current_price FROM market_data WHERE symbol = ?',
      [position.symbol]
    );

    if (priceRows.length > 0) {
      const currentPrice = Number(priceRows[0].current_price);
      const qty = Number(position.qty);
      positionsValue += qty * currentPrice;
    }
  }

  return {
    cash,
    positionsValue,
    totalValue: cash + positionsValue,
  };
}

/**
 * GET /api/bull-pens/:id/leaderboard
 * Get current leaderboard for a bull pen
 */
async function getLeaderboard(req, res) {
  const userId = req.user && req.user.id;
  const bullPenId = parseInt(req.params.id, 10);
  
  if (!bullPenId) {
    return badRequest(res, 'Missing bull pen id');
  }
  
  try {
    // Verify bull pen exists
    const [bullPenRows] = await db.execute('SELECT * FROM bull_pens WHERE id = ? AND deleted_at IS NULL', [bullPenId]);
    const bullPen = bullPenRows[0];

    if (!bullPen) {
      return notFound(res, 'Bull pen not found');
    }

    // Verify user is a member
    const [membershipRows] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE bull_pen_id = ? AND user_id = ? AND deleted_at IS NULL',
      [bullPenId, userId]
    );

    if (membershipRows.length === 0) {
      return forbidden(res, 'You must be a member of this bull pen to view the leaderboard');
    }

    // Get all active members
    const [members] = await db.execute(
      `SELECT m.user_id, m.cash, u.name, u.email
       FROM bull_pen_memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.bull_pen_id = ? AND m.status = 'active' AND m.deleted_at IS NULL AND u.deleted_at IS NULL`,
      [bullPenId]
    );
    
    // Get latest leaderboard snapshot for stars and scores
    const [snapshotRows] = await db.execute(
      `SELECT user_id, rank, stars, score FROM leaderboard_snapshots
       WHERE bull_pen_id = ? AND snapshot_at = (
         SELECT MAX(snapshot_at) FROM leaderboard_snapshots WHERE bull_pen_id = ?
       )`,
      [bullPenId, bullPenId]
    );

    // Create map of snapshot data for quick lookup
    const snapshotMap = {};
    snapshotRows.forEach(row => {
      snapshotMap[row.user_id] = {
        rank: row.rank,
        stars: row.stars || 0,
        score: row.score || 0,
      };
    });

    // Calculate portfolio value for each member
    const leaderboard = [];

    for (const member of members) {
      const portfolio = await calculatePortfolioValue(bullPenId, member.user_id);

      // Get last trade timestamp
      const [lastTradeRows] = await db.execute(
        'SELECT MAX(placed_at) as last_trade_at FROM bull_pen_orders WHERE bull_pen_id = ? AND user_id = ? AND status = "filled" AND deleted_at IS NULL',
        [bullPenId, member.user_id]
      );

      const startingCash = Number(bullPen.starting_cash);
      const pnlAbs = portfolio.totalValue - startingCash;
      const pnlPct = (pnlAbs / startingCash) * 100;

      // Get snapshot data if available
      const snapshotData = snapshotMap[member.user_id] || { rank: null, stars: 0, score: 0 };

      leaderboard.push({
        userId: member.user_id,
        userName: member.name,
        userEmail: member.email,
        portfolioValue: portfolio.totalValue,
        cash: portfolio.cash,
        positionsValue: portfolio.positionsValue,
        pnlAbs,
        pnlPct,
        stars: snapshotData.stars,
        score: snapshotData.score,
        lastTradeAt: lastTradeRows[0]?.last_trade_at,
      });
    }

    // Sort by score (composite ranking) if available, otherwise by portfolio value
    leaderboard.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return b.portfolioValue - a.portfolioValue;
    });

    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return res.json({
      bullPenId,
      bullPenName: bullPen.name,
      startingCash: Number(bullPen.starting_cash),
      leaderboard,
    });
  } catch (err) {
    logger.error('Error fetching leaderboard:', err);
    return internalError(res, 'Failed to fetch leaderboard');
  }
}

module.exports = {
  getLeaderboard,
  calculatePortfolioValue, // Export for use in background jobs
};

