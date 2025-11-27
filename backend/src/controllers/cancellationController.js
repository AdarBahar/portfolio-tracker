/**
 * Cancellation Controller
 * Handles room cancellation and member removal endpoints
 */

const cancellationService = require('../services/cancellationService');
const logger = require('../utils/logger');

/**
 * Cancel a room and refund all members
 * POST /internal/v1/cancellation/rooms/:id
 * Requires: Internal Service Token
 */
async function cancelRoom(req, res) {
  try {
    const { id: bullPenId } = req.params;

    if (!bullPenId) {
      return res.status(400).json({ error: 'MISSING_ROOM_ID' });
    }

    logger.log(`[Cancellation] Room cancellation triggered for room ${bullPenId}`);

    const result = await cancellationService.cancelRoom(bullPenId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
        message: `Cancellation failed: ${result.error}`
      });
    }

    return res.status(200).json({
      success: true,
      room_id: bullPenId,
      refunded_count: result.refunded_count,
      message: `Room ${bullPenId} cancelled. ${result.refunded_count} members refunded.`
    });

  } catch (err) {
    logger.error('[Cancellation] Error in cancelRoom:', err);
    return res.status(500).json({
      error: 'CANCELLATION_ERROR',
      message: err.message
    });
  }
}

/**
 * Kick a member from a room
 * POST /internal/v1/cancellation/rooms/:id/members/:userId
 * Requires: Internal Service Token
 */
async function kickMember(req, res) {
  try {
    const { id: bullPenId, userId } = req.params;

    if (!bullPenId || !userId) {
      return res.status(400).json({ error: 'MISSING_PARAMETERS' });
    }

    logger.log(`[Cancellation] Member kick triggered for user ${userId} in room ${bullPenId}`);

    const result = await cancellationService.kickMember(bullPenId, userId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
        message: `Kick failed: ${result.error}`
      });
    }

    return res.status(200).json({
      success: true,
      room_id: bullPenId,
      user_id: userId,
      refunded: result.refunded,
      message: `User ${userId} kicked from room ${bullPenId}. Refunded: ${result.refunded}`
    });

  } catch (err) {
    logger.error('[Cancellation] Error in kickMember:', err);
    return res.status(500).json({
      error: 'KICK_ERROR',
      message: err.message
    });
  }
}

module.exports = {
  cancelRoom,
  kickMember
};

