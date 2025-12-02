/**
 * Leaderboard Event Handlers for WebSocket Broadcasting
 * Broadcasts leaderboard updates to room subscribers
 */

const logger = require('../../utils/logger');

/**
 * Broadcast leaderboard updated event
 */
function broadcastLeaderboardUpdated(wsServer, bullPenId, snapshot) {
  try {
    const message = {
      type: 'leaderboard_update',
      data: {
        bullPenId,
        snapshotId: snapshot.id,
        timestamp: snapshot.created_at,
        rankings: snapshot.rankings || [],
        totalParticipants: snapshot.total_participants,
        snapshotNumber: snapshot.snapshot_number
      }
    };

    wsServer.broadcastToRoom(bullPenId, message);
    logger.log(`[LeaderboardEvents] Broadcasted leaderboard_update for room ${bullPenId}`);
  } catch (err) {
    logger.error('[LeaderboardEvents] Failed to broadcast leaderboard_update:', err);
  }
}

/**
 * Broadcast user ranking changed event
 */
function broadcastRankingChanged(wsServer, bullPenId, userId, oldRank, newRank, stats) {
  try {
    const message = {
      type: 'ranking_changed',
      data: {
        bullPenId,
        userId,
        oldRank,
        newRank,
        portfolioValue: stats.portfolioValue,
        totalPnL: stats.totalPnL,
        pnLPercent: stats.pnLPercent,
        changedAt: new Date().toISOString()
      }
    };

    wsServer.broadcastToRoom(bullPenId, message);
    logger.log(`[LeaderboardEvents] Broadcasted ranking_changed for user ${userId} in room ${bullPenId}`);
  } catch (err) {
    logger.error('[LeaderboardEvents] Failed to broadcast ranking_changed:', err);
  }
}

/**
 * Broadcast leaderboard snapshot created event
 */
function broadcastSnapshotCreated(wsServer, bullPenId, snapshot) {
  try {
    const message = {
      type: 'snapshot_created',
      data: {
        bullPenId,
        snapshotId: snapshot.id,
        snapshotNumber: snapshot.snapshot_number,
        timestamp: snapshot.created_at,
        participantCount: snapshot.total_participants
      }
    };

    wsServer.broadcastToRoom(bullPenId, message);
    logger.log(`[LeaderboardEvents] Broadcasted snapshot_created for room ${bullPenId}`);
  } catch (err) {
    logger.error('[LeaderboardEvents] Failed to broadcast snapshot_created:', err);
  }
}

module.exports = {
  broadcastLeaderboardUpdated,
  broadcastRankingChanged,
  broadcastSnapshotCreated
};

