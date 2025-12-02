/**
 * Order Event Handlers for WebSocket Broadcasting
 * Broadcasts order execution and failure events to room subscribers
 */

const logger = require('../../utils/logger');

/**
 * Broadcast order executed event
 */
function broadcastOrderExecuted(wsServer, bullPenId, order) {
  try {
    const message = {
      type: 'order_executed',
      data: {
        orderId: order.id,
        bullPenId,
        userId: order.user_id,
        symbol: order.symbol,
        quantity: order.quantity,
        price: order.execution_price,
        side: order.side,
        orderType: order.order_type,
        executedAt: order.executed_at,
        status: order.status
      }
    };

    wsServer.broadcastToRoom(bullPenId, message);
    logger.log(`[OrderEvents] Broadcasted order_executed for order ${order.id} in room ${bullPenId}`);
  } catch (err) {
    logger.error('[OrderEvents] Failed to broadcast order_executed:', err);
  }
}

/**
 * Broadcast order failed event
 */
function broadcastOrderFailed(wsServer, bullPenId, order, reason) {
  try {
    const message = {
      type: 'order_failed',
      data: {
        orderId: order.id,
        bullPenId,
        userId: order.user_id,
        symbol: order.symbol,
        quantity: order.quantity,
        side: order.side,
        orderType: order.order_type,
        reason,
        status: order.status,
        failedAt: new Date().toISOString()
      }
    };

    wsServer.broadcastToRoom(bullPenId, message);
    logger.log(`[OrderEvents] Broadcasted order_failed for order ${order.id} in room ${bullPenId}`);
  } catch (err) {
    logger.error('[OrderEvents] Failed to broadcast order_failed:', err);
  }
}

/**
 * Broadcast order cancelled event
 */
function broadcastOrderCancelled(wsServer, bullPenId, order) {
  try {
    const message = {
      type: 'order_cancelled',
      data: {
        orderId: order.id,
        bullPenId,
        userId: order.user_id,
        symbol: order.symbol,
        quantity: order.quantity,
        side: order.side,
        orderType: order.order_type,
        cancelledAt: new Date().toISOString(),
        status: order.status
      }
    };

    wsServer.broadcastToRoom(bullPenId, message);
    logger.log(`[OrderEvents] Broadcasted order_cancelled for order ${order.id} in room ${bullPenId}`);
  } catch (err) {
    logger.error('[OrderEvents] Failed to broadcast order_cancelled:', err);
  }
}

module.exports = {
  broadcastOrderExecuted,
  broadcastOrderFailed,
  broadcastOrderCancelled
};

