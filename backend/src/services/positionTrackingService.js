/**
 * Position Tracking Service
 * Handles user positions in trade rooms, P&L calculations, and position updates
 */

const db = require('../db');
const logger = require('../utils/logger');

/**
 * Get user position for a symbol in a room
 * @param {number} bullPenId - Room ID
 * @param {number} userId - User ID
 * @param {string} symbol - Stock symbol
 * @returns {Promise<object|null>} Position object or null if not found
 */
async function getPosition(bullPenId, userId, symbol) {
  const [rows] = await db.execute(
    `SELECT * FROM bull_pen_positions 
     WHERE bull_pen_id = ? AND user_id = ? AND symbol = ? AND deleted_at IS NULL`,
    [bullPenId, userId, symbol]
  );
  
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get all positions for a user in a room
 * @param {number} bullPenId - Room ID
 * @param {number} userId - User ID
 * @returns {Promise<array>} Array of position objects
 */
async function getUserPositions(bullPenId, userId) {
  const [rows] = await db.execute(
    `SELECT * FROM bull_pen_positions 
     WHERE bull_pen_id = ? AND user_id = ? AND deleted_at IS NULL
     ORDER BY symbol ASC`,
    [bullPenId, userId]
  );
  
  return rows;
}

/**
 * Calculate P&L for a position
 * @param {object} position - Position object
 * @param {number} currentPrice - Current stock price
 * @returns {object} {unrealizedPnl, unrealizedPnlPct}
 */
function calculatePositionPnL(position, currentPrice) {
  const qty = Number(position.qty);
  const avgCost = Number(position.avg_cost);
  
  const unrealizedPnl = (currentPrice - avgCost) * qty;
  const unrealizedPnlPct = avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0;
  
  return {
    unrealizedPnl: Math.round(unrealizedPnl * 100) / 100,
    unrealizedPnlPct: Math.round(unrealizedPnlPct * 100) / 100,
  };
}

/**
 * Get position with current market value and P&L
 * @param {number} bullPenId - Room ID
 * @param {number} userId - User ID
 * @param {string} symbol - Stock symbol
 * @returns {Promise<object|null>} Position with market value and P&L
 */
async function getPositionWithMarketValue(bullPenId, userId, symbol) {
  const position = await getPosition(bullPenId, userId, symbol);
  if (!position) return null;
  
  // Get current market price
  const [priceRows] = await db.execute(
    'SELECT current_price FROM market_data WHERE symbol = ?',
    [symbol]
  );
  
  if (!priceRows.length) {
    return position; // Return position without market value if price not available
  }
  
  const currentPrice = Number(priceRows[0].current_price);
  const qty = Number(position.qty);
  const marketValue = currentPrice * qty;
  const pnl = calculatePositionPnL(position, currentPrice);
  
  return {
    ...position,
    currentPrice,
    marketValue,
    unrealizedPnl: pnl.unrealizedPnl,
    unrealizedPnlPct: pnl.unrealizedPnlPct,
  };
}

/**
 * Update position after order execution
 * @param {number} bullPenId - Room ID
 * @param {number} userId - User ID
 * @param {string} symbol - Stock symbol
 * @param {number} qty - Quantity (positive for buy, negative for sell)
 * @param {number} fillPrice - Execution price
 * @returns {Promise<object>} Updated position
 */
async function updatePosition(bullPenId, userId, symbol, qty, fillPrice) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const position = await getPosition(bullPenId, userId, symbol);
    
    if (!position) {
      // Create new position
      await connection.execute(
        `INSERT INTO bull_pen_positions (bull_pen_id, user_id, symbol, qty, avg_cost)
         VALUES (?, ?, ?, ?, ?)`,
        [bullPenId, userId, symbol, qty, fillPrice]
      );
    } else {
      // Update existing position
      const currentQty = Number(position.qty);
      const currentAvgCost = Number(position.avg_cost);
      const newQty = currentQty + qty;
      
      let newAvgCost = currentAvgCost;
      
      if (newQty > 0) {
        // Calculate new average cost
        if (qty > 0) {
          // Buy order
          newAvgCost = (currentQty * currentAvgCost + qty * fillPrice) / newQty;
        } else {
          // Sell order - keep average cost
          newAvgCost = currentAvgCost;
        }
      }
      
      if (newQty === 0) {
        // Close position
        await connection.execute(
          `UPDATE bull_pen_positions SET qty = 0, deleted_at = NOW()
           WHERE bull_pen_id = ? AND user_id = ? AND symbol = ?`,
          [bullPenId, userId, symbol]
        );
      } else {
        // Update position
        await connection.execute(
          `UPDATE bull_pen_positions SET qty = ?, avg_cost = ?
           WHERE bull_pen_id = ? AND user_id = ? AND symbol = ?`,
          [newQty, newAvgCost, bullPenId, userId, symbol]
        );
      }
    }
    
    await connection.commit();
    
    return await getPosition(bullPenId, userId, symbol);
  } catch (err) {
    await connection.rollback();
    logger.error(`Error updating position for user ${userId} in room ${bullPenId}:`, err);
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  getPosition,
  getUserPositions,
  calculatePositionPnL,
  getPositionWithMarketValue,
  updatePosition,
};

