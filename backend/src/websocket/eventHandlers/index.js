/**
 * WebSocket Event Handlers Index
 * Exports all event broadcasting functions
 */

const orderEvents = require('./orderEvents');
const leaderboardEvents = require('./leaderboardEvents');
const positionEvents = require('./positionEvents');
const roomStateEvents = require('./roomStateEvents');

module.exports = {
  // Order events
  broadcastOrderExecuted: orderEvents.broadcastOrderExecuted,
  broadcastOrderFailed: orderEvents.broadcastOrderFailed,
  broadcastOrderCancelled: orderEvents.broadcastOrderCancelled,

  // Leaderboard events
  broadcastLeaderboardUpdated: leaderboardEvents.broadcastLeaderboardUpdated,
  broadcastRankingChanged: leaderboardEvents.broadcastRankingChanged,
  broadcastSnapshotCreated: leaderboardEvents.broadcastSnapshotCreated,

  // Position events
  broadcastPositionUpdated: positionEvents.broadcastPositionUpdated,
  broadcastPositionClosed: positionEvents.broadcastPositionClosed,
  broadcastPortfolioUpdated: positionEvents.broadcastPortfolioUpdated,

  // Room state events
  broadcastRoomStateChanged: roomStateEvents.broadcastRoomStateChanged,
  broadcastRoomStarted: roomStateEvents.broadcastRoomStarted,
  broadcastRoomEnded: roomStateEvents.broadcastRoomEnded,
  broadcastMemberJoined: roomStateEvents.broadcastMemberJoined,
  broadcastMemberLeft: roomStateEvents.broadcastMemberLeft
};

