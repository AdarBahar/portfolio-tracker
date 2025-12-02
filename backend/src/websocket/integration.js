/**
 * WebSocket Integration with Trade Room Services
 * Connects WebSocket events to Trade Room business logic
 */

const logger = require('../utils/logger');
const eventHandlers = require('./eventHandlers');

let wsServer = null;

/**
 * Initialize WebSocket integration
 */
function initializeIntegration(server) {
  wsServer = server;
  logger.log('[WebSocketIntegration] Initialized');
}

/**
 * Get WebSocket server instance
 */
function getWSServer() {
  return wsServer;
}

/**
 * Broadcast order execution to room
 */
function onOrderExecuted(bullPenId, order) {
  if (!wsServer) return;
  eventHandlers.broadcastOrderExecuted(wsServer, bullPenId, order);
}

/**
 * Broadcast order failure to room
 */
function onOrderFailed(bullPenId, order, reason) {
  if (!wsServer) return;
  eventHandlers.broadcastOrderFailed(wsServer, bullPenId, order, reason);
}

/**
 * Broadcast order cancellation to room
 */
function onOrderCancelled(bullPenId, order) {
  if (!wsServer) return;
  eventHandlers.broadcastOrderCancelled(wsServer, bullPenId, order);
}

/**
 * Broadcast leaderboard update to room
 */
function onLeaderboardUpdated(bullPenId, snapshot) {
  if (!wsServer) return;
  eventHandlers.broadcastLeaderboardUpdated(wsServer, bullPenId, snapshot);
}

/**
 * Broadcast ranking change to room
 */
function onRankingChanged(bullPenId, userId, oldRank, newRank, stats) {
  if (!wsServer) return;
  eventHandlers.broadcastRankingChanged(wsServer, bullPenId, userId, oldRank, newRank, stats);
}

/**
 * Broadcast position update to room
 */
function onPositionUpdated(bullPenId, position) {
  if (!wsServer) return;
  eventHandlers.broadcastPositionUpdated(wsServer, bullPenId, position);
}

/**
 * Broadcast position closed to room
 */
function onPositionClosed(bullPenId, position, realizedPnL) {
  if (!wsServer) return;
  eventHandlers.broadcastPositionClosed(wsServer, bullPenId, position, realizedPnL);
}

/**
 * Broadcast portfolio update to room
 */
function onPortfolioUpdated(bullPenId, userId, portfolio) {
  if (!wsServer) return;
  eventHandlers.broadcastPortfolioUpdated(wsServer, bullPenId, userId, portfolio);
}

/**
 * Broadcast room state change to room
 */
function onRoomStateChanged(bullPenId, room) {
  if (!wsServer) return;
  eventHandlers.broadcastRoomStateChanged(wsServer, bullPenId, room);
}

/**
 * Broadcast room started to room
 */
function onRoomStarted(bullPenId, room) {
  if (!wsServer) return;
  eventHandlers.broadcastRoomStarted(wsServer, bullPenId, room);
}

/**
 * Broadcast room ended to room
 */
function onRoomEnded(bullPenId, room) {
  if (!wsServer) return;
  eventHandlers.broadcastRoomEnded(wsServer, bullPenId, room);
}

/**
 * Broadcast member joined to room
 */
function onMemberJoined(bullPenId, userId, memberCount) {
  if (!wsServer) return;
  eventHandlers.broadcastMemberJoined(wsServer, bullPenId, userId, memberCount);
}

/**
 * Broadcast member left to room
 */
function onMemberLeft(bullPenId, userId, memberCount) {
  if (!wsServer) return;
  eventHandlers.broadcastMemberLeft(wsServer, bullPenId, userId, memberCount);
}

module.exports = {
  initializeIntegration,
  getWSServer,
  onOrderExecuted,
  onOrderFailed,
  onOrderCancelled,
  onLeaderboardUpdated,
  onRankingChanged,
  onPositionUpdated,
  onPositionClosed,
  onPortfolioUpdated,
  onRoomStateChanged,
  onRoomStarted,
  onRoomEnded,
  onMemberJoined,
  onMemberLeft
};

