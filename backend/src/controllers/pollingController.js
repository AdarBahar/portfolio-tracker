/**
 * Polling Controller
 * Provides endpoints for clients to poll for updates when WebSocket is not available
 * Used as fallback in hybrid connection mode
 */

const db = require('../db');
const logger = require('../utils/logger');
const { badRequest, notFound, internalError } = require('../utils/apiError');

/**
 * Store for tracking room updates
 * In production, this should be replaced with Redis or similar
 */
const roomUpdates = new Map();

/**
 * Add an update to the room's update queue
 * Called by WebSocket event handlers
 */
function addRoomUpdate(bullPenId, eventType, data) {
  if (!roomUpdates.has(bullPenId)) {
    roomUpdates.set(bullPenId, []);
  }

  const updates = roomUpdates.get(bullPenId);
  updates.push({
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
  });

  // Keep only last 100 updates per room to prevent memory bloat
  if (updates.length > 100) {
    updates.shift();
  }
}

/**
 * GET /api/bull-pens/:id/updates
 * Get updates for a room since a specific timestamp
 * Query params:
 *   - since: ISO timestamp to get updates after (optional)
 */
async function getRoomUpdates(req, res) {
  const bullPenId = req.params.id;
  const userId = req.user && req.user.id;
  const sinceTimestamp = req.query.since;

  try {
    // Verify user is a member of this room
    const [membership] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE bull_pen_id = ? AND user_id = ? AND deleted_at IS NULL',
      [bullPenId, userId]
    );

    if (!membership.length) {
      return notFound(res, 'You are not a member of this room');
    }

    // Get updates for this room
    const updates = roomUpdates.get(bullPenId) || [];

    // Filter updates by timestamp if provided
    let filteredUpdates = updates;
    if (sinceTimestamp) {
      const sinceDate = new Date(sinceTimestamp);
      filteredUpdates = updates.filter(update => {
        const updateDate = new Date(update.timestamp);
        return updateDate > sinceDate;
      });
    }

    logger.log(`[Polling] Returning ${filteredUpdates.length} updates for room ${bullPenId}`);

    return res.json(filteredUpdates);
  } catch (err) {
    logger.error('Error fetching room updates:', err);
    return internalError(res, 'Failed to fetch room updates');
  }
}

/**
 * Clear old updates periodically
 * Should be called by a background job
 */
function clearOldUpdates() {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  roomUpdates.forEach((updates, bullPenId) => {
    const filtered = updates.filter(update => {
      const updateDate = new Date(update.timestamp);
      return updateDate > fiveMinutesAgo;
    });

    if (filtered.length === 0) {
      roomUpdates.delete(bullPenId);
    } else {
      roomUpdates.set(bullPenId, filtered);
    }
  });

  logger.log('[Polling] Cleared old updates');
}

// Run cleanup every 5 minutes
setInterval(clearOldUpdates, 5 * 60 * 1000);

module.exports = {
  getRoomUpdates,
  addRoomUpdate,
  clearOldUpdates,
};

