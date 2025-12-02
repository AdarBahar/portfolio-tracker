/**
 * Room State Event Handlers for WebSocket Broadcasting
 * Broadcasts room state changes to subscribers
 */

const logger = require('../../utils/logger');

/**
 * Broadcast room state changed event
 */
function broadcastRoomStateChanged(wsServer, bullPenId, room) {
  try {
    const message = {
      type: 'room_state_changed',
      data: {
        bullPenId,
        state: room.state,
        status: room.status,
        startTime: room.start_time,
        endTime: room.end_time,
        duration: room.duration_minutes,
        memberCount: room.member_count,
        changedAt: new Date().toISOString()
      }
    };

    wsServer.broadcastToRoom(bullPenId, message);
    logger.log(`[RoomStateEvents] Broadcasted room_state_changed for room ${bullPenId} to state ${room.state}`);
  } catch (err) {
    logger.error('[RoomStateEvents] Failed to broadcast room_state_changed:', err);
  }
}

/**
 * Broadcast room started event
 */
function broadcastRoomStarted(wsServer, bullPenId, room) {
  try {
    const message = {
      type: 'room_started',
      data: {
        bullPenId,
        startTime: room.start_time,
        endTime: room.end_time,
        durationMinutes: room.duration_minutes,
        memberCount: room.member_count,
        initialCash: room.initial_cash,
        startedAt: new Date().toISOString()
      }
    };

    wsServer.broadcastToRoom(bullPenId, message);
    logger.log(`[RoomStateEvents] Broadcasted room_started for room ${bullPenId}`);
  } catch (err) {
    logger.error('[RoomStateEvents] Failed to broadcast room_started:', err);
  }
}

/**
 * Broadcast room ended event
 */
function broadcastRoomEnded(wsServer, bullPenId, room) {
  try {
    const message = {
      type: 'room_ended',
      data: {
        bullPenId,
        endTime: room.end_time,
        finalMemberCount: room.member_count,
        endedAt: new Date().toISOString()
      }
    };

    wsServer.broadcastToRoom(bullPenId, message);
    logger.log(`[RoomStateEvents] Broadcasted room_ended for room ${bullPenId}`);
  } catch (err) {
    logger.error('[RoomStateEvents] Failed to broadcast room_ended:', err);
  }
}

/**
 * Broadcast member joined event
 */
function broadcastMemberJoined(wsServer, bullPenId, userId, memberCount) {
  try {
    const message = {
      type: 'member_joined',
      data: {
        bullPenId,
        userId,
        memberCount,
        joinedAt: new Date().toISOString()
      }
    };

    wsServer.broadcastToRoom(bullPenId, message);
    logger.log(`[RoomStateEvents] Broadcasted member_joined for user ${userId} in room ${bullPenId}`);
  } catch (err) {
    logger.error('[RoomStateEvents] Failed to broadcast member_joined:', err);
  }
}

/**
 * Broadcast member left event
 */
function broadcastMemberLeft(wsServer, bullPenId, userId, memberCount) {
  try {
    const message = {
      type: 'member_left',
      data: {
        bullPenId,
        userId,
        memberCount,
        leftAt: new Date().toISOString()
      }
    };

    wsServer.broadcastToRoom(bullPenId, message);
    logger.log(`[RoomStateEvents] Broadcasted member_left for user ${userId} in room ${bullPenId}`);
  } catch (err) {
    logger.error('[RoomStateEvents] Failed to broadcast member_left:', err);
  }
}

module.exports = {
  broadcastRoomStateChanged,
  broadcastRoomStarted,
  broadcastRoomEnded,
  broadcastMemberJoined,
  broadcastMemberLeft
};

