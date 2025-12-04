/**
 * Position Event Handlers for WebSocket Broadcasting
 * Broadcasts position updates to room subscribers
 * Also adds updates to polling queue for clients using polling fallback
 */

const logger = require('../../utils/logger');
const { addRoomUpdate } = require('../../controllers/pollingController');

/**
 * Broadcast position updated event
 */
function broadcastPositionUpdated(wsServer, bullPenId, position) {
  try {
    const message = {
      type: 'position_update',
      data: {
        bullPenId,
        positionId: position.id,
        userId: position.user_id,
        symbol: position.symbol,
        quantity: position.quantity,
        averagePrice: position.average_price,
        currentPrice: position.current_price,
        totalCost: position.total_cost,
        currentValue: position.current_value,
        unrealizedPnL: position.unrealized_pnl,
        unrealizedPnLPercent: position.unrealized_pnl_percent,
        updatedAt: position.updated_at
      }
    };

    wsServer.broadcastToRoom(bullPenId, message);
    addRoomUpdate(bullPenId, 'position_update', message.data);
    logger.log(`[PositionEvents] Broadcasted position_update for position ${position.id} in room ${bullPenId}`);
  } catch (err) {
    logger.error('[PositionEvents] Failed to broadcast position_update:', err);
  }
}

/**
 * Broadcast position closed event
 */
function broadcastPositionClosed(wsServer, bullPenId, position, realizedPnL) {
  try {
    const message = {
      type: 'position_closed',
      data: {
        bullPenId,
        positionId: position.id,
        userId: position.user_id,
        symbol: position.symbol,
        quantity: position.quantity,
        averagePrice: position.average_price,
        exitPrice: position.current_price,
        realizedPnL,
        realizedPnLPercent: (realizedPnL / position.total_cost) * 100,
        closedAt: new Date().toISOString()
      }
    };

    wsServer.broadcastToRoom(bullPenId, message);
    addRoomUpdate(bullPenId, 'position_closed', message.data);
    logger.log(`[PositionEvents] Broadcasted position_closed for position ${position.id} in room ${bullPenId}`);
  } catch (err) {
    logger.error('[PositionEvents] Failed to broadcast position_closed:', err);
  }
}

/**
 * Broadcast portfolio value updated event
 */
function broadcastPortfolioUpdated(wsServer, bullPenId, userId, portfolio) {
  try {
    const message = {
      type: 'portfolio_update',
      data: {
        bullPenId,
        userId,
        totalValue: portfolio.totalValue,
        cashBalance: portfolio.cashBalance,
        investedValue: portfolio.investedValue,
        totalPnL: portfolio.totalPnL,
        totalPnLPercent: portfolio.totalPnLPercent,
        updatedAt: new Date().toISOString()
      }
    };

    wsServer.broadcastToRoom(bullPenId, message);
    addRoomUpdate(bullPenId, 'portfolio_update', message.data);
    logger.log(`[PositionEvents] Broadcasted portfolio_update for user ${userId} in room ${bullPenId}`);
  } catch (err) {
    logger.error('[PositionEvents] Failed to broadcast portfolio_update:', err);
  }
}

module.exports = {
  broadcastPositionUpdated,
  broadcastPositionClosed,
  broadcastPortfolioUpdated
};

