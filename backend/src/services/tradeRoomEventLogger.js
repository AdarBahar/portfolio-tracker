/**
 * Trade Room Event Logger
 * Comprehensive audit logging for all Trade Room events
 */

const db = require('../db');
const logger = require('../utils/logger');

/**
 * Log a Trade Room event
 * @param {object} event - Event object
 * @returns {Promise<void>}
 */
async function logEvent(event) {
  const {
    eventType,
    bullPenId,
    userId,
    description,
    metadata = {},
    severity = 'info',
  } = event;
  
  try {
    await db.execute(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, description, metadata, severity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        eventType,
        'bull_pen',
        bullPenId,
        description,
        JSON.stringify(metadata),
        severity,
      ]
    );
    
    logger.info(`[TradeRoomEvent] ${eventType}: ${description}`, { bullPenId, userId, metadata });
  } catch (err) {
    logger.error(`Failed to log Trade Room event: ${eventType}`, err);
  }
}

/**
 * Log room creation
 */
async function logRoomCreated(bullPenId, userId, roomData) {
  await logEvent({
    eventType: 'ROOM_CREATED',
    bullPenId,
    userId,
    description: `Room "${roomData.name}" created by user ${userId}`,
    metadata: {
      roomName: roomData.name,
      maxPlayers: roomData.max_players,
      startingCash: roomData.starting_cash,
      durationSec: roomData.duration_sec,
    },
  });
}

/**
 * Log user joining room
 */
async function logUserJoined(bullPenId, userId, buyIn) {
  await logEvent({
    eventType: 'USER_JOINED',
    bullPenId,
    userId,
    description: `User ${userId} joined room with buy-in $${buyIn}`,
    metadata: { buyIn },
  });
}

/**
 * Log user leaving room
 */
async function logUserLeft(bullPenId, userId, refund) {
  await logEvent({
    eventType: 'USER_LEFT',
    bullPenId,
    userId,
    description: `User ${userId} left room, refunded $${refund}`,
    metadata: { refund },
  });
}

/**
 * Log order placed
 */
async function logOrderPlaced(bullPenId, userId, orderData) {
  await logEvent({
    eventType: 'ORDER_PLACED',
    bullPenId,
    userId,
    description: `${orderData.side.toUpperCase()} order for ${orderData.qty} ${orderData.symbol} at $${orderData.price}`,
    metadata: {
      symbol: orderData.symbol,
      side: orderData.side,
      qty: orderData.qty,
      price: orderData.price,
      type: orderData.type,
      orderId: orderData.id,
    },
  });
}

/**
 * Log order executed
 */
async function logOrderExecuted(bullPenId, userId, orderData) {
  await logEvent({
    eventType: 'ORDER_EXECUTED',
    bullPenId,
    userId,
    description: `Order ${orderData.id} executed: ${orderData.qty} ${orderData.symbol} @ $${orderData.fillPrice}`,
    metadata: {
      orderId: orderData.id,
      symbol: orderData.symbol,
      qty: orderData.qty,
      fillPrice: orderData.fillPrice,
      totalValue: orderData.qty * orderData.fillPrice,
    },
  });
}

/**
 * Log room state change
 */
async function logRoomStateChanged(bullPenId, oldState, newState) {
  await logEvent({
    eventType: 'ROOM_STATE_CHANGED',
    bullPenId,
    userId: null,
    description: `Room state changed from ${oldState} to ${newState}`,
    metadata: { oldState, newState },
  });
}

/**
 * Log room settlement
 */
async function logRoomSettled(bullPenId, settlementData) {
  await logEvent({
    eventType: 'ROOM_SETTLED',
    bullPenId,
    userId: null,
    description: `Room settled: ${settlementData.playerCount} players, total payouts $${settlementData.totalPayouts}`,
    metadata: {
      playerCount: settlementData.playerCount,
      totalPayouts: settlementData.totalPayouts,
      rakeCollected: settlementData.rakeCollected,
      winner: settlementData.winner,
    },
    severity: 'info',
  });
}

/**
 * Get audit logs for a room
 */
async function getRoomAuditLogs(bullPenId, limit = 100) {
  const [rows] = await db.execute(
    `SELECT * FROM audit_logs 
     WHERE resource_type = 'bull_pen' AND resource_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [bullPenId, limit]
  );
  
  return rows;
}

module.exports = {
  logEvent,
  logRoomCreated,
  logUserJoined,
  logUserLeft,
  logOrderPlaced,
  logOrderExecuted,
  logRoomStateChanged,
  logRoomSettled,
  getRoomAuditLogs,
};

