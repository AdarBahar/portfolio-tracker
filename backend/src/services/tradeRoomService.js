/**
 * Trade Room Service
 * Comprehensive service for Trade Room (Bull Pen) management
 * Handles room lifecycle, member management, and business logic
 */

const db = require('../db');
const budgetService = require('./budgetService');
const { v4: uuid } = require('uuid');
const logger = require('../utils/logger');

/**
 * Validate room state transition
 * @param {string} currentState - Current room state
 * @param {string} newState - Desired new state
 * @returns {boolean} True if transition is valid
 */
function isValidStateTransition(currentState, newState) {
  const validTransitions = {
    'draft': ['scheduled', 'cancelled'],
    'scheduled': ['active', 'cancelled'],
    'active': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': []
  };
  
  return validTransitions[currentState]?.includes(newState) || false;
}

/**
 * Get room state
 * @param {number} bullPenId - Room ID
 * @returns {Promise<{state: string, startTime: Date, durationSec: number}>}
 */
async function getRoomState(bullPenId) {
  const [rows] = await db.execute(
    'SELECT state, start_time, duration_sec FROM bull_pens WHERE id = ? AND deleted_at IS NULL',
    [bullPenId]
  );
  
  if (!rows.length) {
    throw new Error('ROOM_NOT_FOUND');
  }
  
  return rows[0];
}

/**
 * Determine if room should be active based on start time and duration
 * @param {Date} startTime - Room start time
 * @param {number} durationSec - Room duration in seconds
 * @returns {string} 'active', 'scheduled', or 'completed'
 */
function calculateRoomStatus(startTime, durationSec) {
  if (!startTime) return 'scheduled';
  
  const now = Date.now();
  const startMs = new Date(startTime).getTime();
  const endMs = startMs + (durationSec * 1000);
  
  if (now < startMs) return 'scheduled';
  if (now < endMs) return 'active';
  return 'completed';
}

/**
 * Update room state if needed based on time
 * @param {number} bullPenId - Room ID
 * @returns {Promise<{updated: boolean, newState: string}>}
 */
async function updateRoomStateIfNeeded(bullPenId) {
  const roomState = await getRoomState(bullPenId);
  const calculatedStatus = calculateRoomStatus(roomState.start_time, roomState.duration_sec);
  
  if (roomState.state !== calculatedStatus && isValidStateTransition(roomState.state, calculatedStatus)) {
    await db.execute(
      'UPDATE bull_pens SET state = ? WHERE id = ?',
      [calculatedStatus, bullPenId]
    );
    
    logger.info(`Room ${bullPenId} state updated: ${roomState.state} -> ${calculatedStatus}`);
    return { updated: true, newState: calculatedStatus };
  }
  
  return { updated: false, newState: roomState.state };
}

/**
 * Get room with member count
 * @param {number} bullPenId - Room ID
 * @returns {Promise<object>} Room object with member count
 */
async function getRoomWithMemberCount(bullPenId) {
  const [rooms] = await db.execute(
    `SELECT bp.*, COUNT(bpm.id) as member_count
     FROM bull_pens bp
     LEFT JOIN bull_pen_memberships bpm ON bp.id = bpm.bull_pen_id AND bpm.deleted_at IS NULL
     WHERE bp.id = ? AND bp.deleted_at IS NULL
     GROUP BY bp.id`,
    [bullPenId]
  );
  
  if (!rooms.length) {
    throw new Error('ROOM_NOT_FOUND');
  }
  
  return rooms[0];
}

/**
 * Check if user can join room
 * @param {number} bullPenId - Room ID
 * @param {number} userId - User ID
 * @returns {Promise<{canJoin: boolean, reason?: string}>}
 */
async function canUserJoinRoom(bullPenId, userId) {
  const room = await getRoomWithMemberCount(bullPenId);
  
  // Check if room is full
  if (room.member_count >= room.max_players) {
    return { canJoin: false, reason: 'ROOM_FULL' };
  }
  
  // Check if user is already a member
  const [existing] = await db.execute(
    'SELECT id FROM bull_pen_memberships WHERE bull_pen_id = ? AND user_id = ? AND deleted_at IS NULL',
    [bullPenId, userId]
  );
  
  if (existing.length > 0) {
    return { canJoin: false, reason: 'ALREADY_MEMBER' };
  }
  
  // Check if room is in joinable state
  if (!['draft', 'scheduled'].includes(room.state)) {
    return { canJoin: false, reason: 'ROOM_NOT_JOINABLE' };
  }
  
  return { canJoin: true };
}

/**
 * Transition room to a new state
 * @param {number} bullPenId - Room ID
 * @param {string} newState - New state
 * @returns {Promise<{success: boolean, oldState: string, newState: string, error?: string}>}
 */
async function transitionRoomState(bullPenId, newState) {
  const roomState = await getRoomState(bullPenId);

  if (!isValidStateTransition(roomState.state, newState)) {
    return {
      success: false,
      oldState: roomState.state,
      newState: newState,
      error: `Invalid state transition from ${roomState.state} to ${newState}`,
    };
  }

  await db.execute(
    'UPDATE bull_pens SET state = ? WHERE id = ?',
    [newState, bullPenId]
  );

  logger.info(`Room ${bullPenId} transitioned: ${roomState.state} -> ${newState}`);

  return {
    success: true,
    oldState: roomState.state,
    newState: newState,
  };
}

/**
 * Check if room can be started (transition to active)
 * @param {number} bullPenId - Room ID
 * @returns {Promise<{canStart: boolean, reason?: string}>}
 */
async function canStartRoom(bullPenId) {
  const room = await getRoomWithMemberCount(bullPenId);

  if (room.state !== 'scheduled') {
    return { canStart: false, reason: 'ROOM_NOT_SCHEDULED' };
  }

  if (room.member_count < 2) {
    return { canStart: false, reason: 'INSUFFICIENT_MEMBERS' };
  }

  return { canStart: true };
}

/**
 * Check if room can be completed
 * @param {number} bullPenId - Room ID
 * @returns {Promise<{canComplete: boolean, reason?: string}>}
 */
async function canCompleteRoom(bullPenId) {
  const roomState = await getRoomState(bullPenId);

  if (roomState.state !== 'active') {
    return { canComplete: false, reason: 'ROOM_NOT_ACTIVE' };
  }

  const calculatedStatus = calculateRoomStatus(roomState.start_time, roomState.duration_sec);

  if (calculatedStatus !== 'completed') {
    return { canComplete: false, reason: 'ROOM_TIME_NOT_EXPIRED' };
  }

  return { canComplete: true };
}

module.exports = {
  isValidStateTransition,
  getRoomState,
  calculateRoomStatus,
  updateRoomStateIfNeeded,
  getRoomWithMemberCount,
  canUserJoinRoom,
  transitionRoomState,
  canStartRoom,
  canCompleteRoom,
};

