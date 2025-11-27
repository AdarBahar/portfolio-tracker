/**
 * Settlement Controller
 * Handles room settlement endpoints
 */

const settlementService = require('../services/settlementService');
const logger = require('../utils/logger');

/**
 * Manually trigger settlement for a room
 * POST /internal/v1/settlement/rooms/:id
 * Requires: Internal Service Token
 */
async function settleRoom(req, res) {
  try {
    const { id: bullPenId } = req.params;

    if (!bullPenId) {
      return res.status(400).json({ error: 'MISSING_ROOM_ID' });
    }

    logger.log(`[Settlement] Manual settlement triggered for room ${bullPenId}`);

    const result = await settlementService.settleRoom(bullPenId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
        message: `Settlement failed: ${result.error}`
      });
    }

    return res.status(200).json({
      success: true,
      room_id: bullPenId,
      settled_count: result.settled_count,
      message: `Room ${bullPenId} settled successfully. ${result.settled_count} users processed.`
    });

  } catch (err) {
    logger.error('[Settlement] Error in settleRoom:', err);
    return res.status(500).json({
      error: 'SETTLEMENT_ERROR',
      message: err.message
    });
  }
}

module.exports = {
  settleRoom
};

