/**
 * Leaderboard Snapshot Service
 * Handles periodic leaderboard snapshots and ranking calculations
 */

const db = require('../db');
const logger = require('../utils/logger');
const wsIntegration = require('../websocket/integration');

/**
 * Create leaderboard snapshot for a room
 * Captures current rankings, P&L, and portfolio values
 * @param {number} bullPenId - Room ID
 * @returns {Promise<{success: boolean, snapshotCount: number, error?: string}>}
 */
async function createLeaderboardSnapshot(bullPenId) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get room info
    const [rooms] = await connection.execute(
      'SELECT starting_cash FROM bull_pens WHERE id = ? AND deleted_at IS NULL',
      [bullPenId]
    );
    
    if (!rooms.length) {
      await connection.rollback();
      return { success: false, error: 'ROOM_NOT_FOUND', snapshotCount: 0 };
    }
    
    const startingCash = Number(rooms[0].starting_cash);
    
    // Get all active members with their current portfolio values
    const [members] = await connection.execute(
      `SELECT m.user_id, m.cash, u.name
       FROM bull_pen_memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.bull_pen_id = ? AND m.status = 'active' AND m.deleted_at IS NULL`,
      [bullPenId]
    );
    
    // Calculate portfolio values and P&L for each member
    const leaderboardData = [];
    
    for (const member of members) {
      const cash = Number(member.cash);
      
      // Get positions value
      const [positions] = await connection.execute(
        `SELECT symbol, qty FROM bull_pen_positions 
         WHERE bull_pen_id = ? AND user_id = ? AND deleted_at IS NULL`,
        [bullPenId, member.user_id]
      );
      
      let positionsValue = 0;
      
      for (const position of positions) {
        const [priceRows] = await connection.execute(
          'SELECT current_price FROM market_data WHERE symbol = ?',
          [position.symbol]
        );
        
        if (priceRows.length > 0) {
          const currentPrice = Number(priceRows[0].current_price);
          const qty = Number(position.qty);
          positionsValue += qty * currentPrice;
        }
      }
      
      const portfolioValue = cash + positionsValue;
      const pnlAbs = portfolioValue - startingCash;
      const pnlPct = (pnlAbs / startingCash) * 100;
      
      leaderboardData.push({
        userId: member.user_id,
        userName: member.name,
        portfolioValue,
        cash,
        positionsValue,
        pnlAbs,
        pnlPct,
      });
    }
    
    // Sort by portfolio value (descending) to assign ranks
    leaderboardData.sort((a, b) => b.portfolioValue - a.portfolioValue);
    
    // Insert snapshot records
    let snapshotCount = 0;
    
    for (let i = 0; i < leaderboardData.length; i++) {
      const entry = leaderboardData[i];
      const rank = i + 1;
      
      await connection.execute(
        `INSERT INTO leaderboard_snapshots 
         (bull_pen_id, user_id, rank, portfolio_value, cash, pnl_abs, pnl_pct, snapshot_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          bullPenId,
          entry.userId,
          rank,
          entry.portfolioValue,
          entry.cash,
          entry.pnlAbs,
          entry.pnlPct,
        ]
      );
      
      snapshotCount++;
    }
    
    await connection.commit();
    logger.info(`Leaderboard snapshot created for room ${bullPenId}: ${snapshotCount} entries`);

    // Broadcast leaderboard update via WebSocket
    try {
      wsIntegration.onLeaderboardUpdated(bullPenId, {
        id: bullPenId,
        created_at: new Date().toISOString(),
        rankings: leaderboardData,
        total_participants: leaderboardData.length,
        snapshot_number: snapshotCount
      });
    } catch (wsErr) {
      logger.warn('[WebSocket] Failed to broadcast leaderboard update:', wsErr);
    }

    return { success: true, snapshotCount };
  } catch (err) {
    await connection.rollback();
    logger.error(`Error creating leaderboard snapshot for room ${bullPenId}:`, err);
    return { success: false, error: err.message, snapshotCount: 0 };
  } finally {
    connection.release();
  }
}

/**
 * Get latest leaderboard snapshot for a room
 * @param {number} bullPenId - Room ID
 * @returns {Promise<array>} Array of snapshot entries
 */
async function getLatestSnapshot(bullPenId) {
  const [rows] = await db.execute(
    `SELECT * FROM leaderboard_snapshots
     WHERE bull_pen_id = ? AND snapshot_at = (
       SELECT MAX(snapshot_at) FROM leaderboard_snapshots WHERE bull_pen_id = ?
     )
     ORDER BY rank ASC`,
    [bullPenId, bullPenId]
  );
  
  return rows;
}

/**
 * Get snapshot history for a room
 * @param {number} bullPenId - Room ID
 * @param {number} limit - Number of snapshots to return (default 10)
 * @returns {Promise<array>} Array of snapshot timestamps
 */
async function getSnapshotHistory(bullPenId, limit = 10) {
  const [rows] = await db.execute(
    `SELECT DISTINCT snapshot_at FROM leaderboard_snapshots
     WHERE bull_pen_id = ?
     ORDER BY snapshot_at DESC
     LIMIT ?`,
    [bullPenId, limit]
  );
  
  return rows.map(r => r.snapshot_at);
}

module.exports = {
  createLeaderboardSnapshot,
  getLatestSnapshot,
  getSnapshotHistory,
};

