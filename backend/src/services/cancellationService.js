/**
 * Cancellation Service
 * Handles room cancellation and member removal refunds
 */

const db = require('../db');
const budgetService = require('./budgetService');
const { v4: uuid } = require('uuid');
const logger = require('../utils/logger');

/**
 * Cancel a room and refund all members
 * Only allowed if room is in draft or scheduled state
 * @param {number} bullPenId - Room ID
 * @returns {Promise<{success: boolean, refunded_count: number, error?: string}>}
 */
async function cancelRoom(bullPenId) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get room info
    const [rooms] = await connection.execute(
      `SELECT id, state, starting_cash FROM bull_pens WHERE id = ? FOR UPDATE`,
      [bullPenId]
    );

    if (!rooms.length) {
      await connection.rollback();
      return { success: false, error: 'ROOM_NOT_FOUND', refunded_count: 0 };
    }

    const room = rooms[0];
    
    // Only allow cancellation if room hasn't started
    if (!['draft', 'scheduled'].includes(room.state)) {
      await connection.rollback();
      return { success: false, error: 'ROOM_ALREADY_STARTED', refunded_count: 0 };
    }

    // Get all active members
    const [members] = await connection.execute(
      `SELECT user_id FROM bull_pen_memberships 
       WHERE bull_pen_id = ? AND status IN ('pending', 'active')`,
      [bullPenId]
    );

    const cancellationId = `room-${bullPenId}-cancellation-${uuid()}`;
    let refundedCount = 0;

    // Refund each member
    for (const member of members) {
      const userId = member.user_id;
      const idempotencyKey = `cancellation-${userId}-${bullPenId}`;

      const result = await budgetService.creditBudget(userId, room.starting_cash, {
        operation_type: 'ROOM_CANCELLATION_REFUND',
        bull_pen_id: bullPenId,
        correlation_id: cancellationId,
        idempotency_key: idempotencyKey
      });

      if (result.error) {
        logger.warn(`Cancellation refund failed for user ${userId} in room ${bullPenId}:`, result.error);
        // Continue with other members even if one fails
      } else {
        refundedCount++;
      }
    }

    // Mark all memberships as cancelled
    await connection.execute(
      `UPDATE bull_pen_memberships SET status = 'cancelled' WHERE bull_pen_id = ?`,
      [bullPenId]
    );

    // Mark room as cancelled
    await connection.execute(
      `UPDATE bull_pens SET state = 'cancelled' WHERE id = ?`,
      [bullPenId]
    );

    await connection.commit();
    logger.log(`[Cancellation] Room ${bullPenId} cancelled. ${refundedCount} members refunded.`);
    return { success: true, refunded_count: refundedCount };

  } catch (err) {
    await connection.rollback();
    logger.error(`[Cancellation] Error cancelling room ${bullPenId}:`, err);
    return { success: false, error: err.message, refunded_count: 0 };
  } finally {
    connection.release();
  }
}

/**
 * Kick a member from a room and refund if room hasn't started
 * @param {number} bullPenId - Room ID
 * @param {number} userId - User ID to kick
 * @returns {Promise<{success: boolean, refunded: boolean, error?: string}>}
 */
async function kickMember(bullPenId, userId) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get room info
    const [rooms] = await connection.execute(
      `SELECT id, state, starting_cash FROM bull_pens WHERE id = ? FOR UPDATE`,
      [bullPenId]
    );

    if (!rooms.length) {
      await connection.rollback();
      return { success: false, refunded: false, error: 'ROOM_NOT_FOUND' };
    }

    const room = rooms[0];

    // Get membership
    const [memberships] = await connection.execute(
      `SELECT id, status FROM bull_pen_memberships 
       WHERE bull_pen_id = ? AND user_id = ? FOR UPDATE`,
      [bullPenId, userId]
    );

    if (!memberships.length) {
      await connection.rollback();
      return { success: false, refunded: false, error: 'MEMBER_NOT_FOUND' };
    }

    const membership = memberships[0];
    let refunded = false;

    // Refund if room hasn't started
    if (['draft', 'scheduled'].includes(room.state)) {
      const idempotencyKey = `kick-${userId}-${bullPenId}`;
      const kickId = `room-${bullPenId}-kick-${uuid()}`;

      const result = await budgetService.creditBudget(userId, room.starting_cash, {
        operation_type: 'ROOM_MEMBER_KICK_REFUND',
        bull_pen_id: bullPenId,
        correlation_id: kickId,
        idempotency_key: idempotencyKey
      });

      if (!result.error) {
        refunded = true;
      }
    }

    // Mark membership as kicked
    await connection.execute(
      `UPDATE bull_pen_memberships SET status = 'kicked' WHERE id = ?`,
      [membership.id]
    );

    await connection.commit();
    logger.log(`[Cancellation] User ${userId} kicked from room ${bullPenId}. Refunded: ${refunded}`);
    return { success: true, refunded };

  } catch (err) {
    await connection.rollback();
    logger.error(`[Cancellation] Error kicking user ${userId} from room ${bullPenId}:`, err);
    return { success: false, refunded: false, error: err.message };
  } finally {
    connection.release();
  }
}

module.exports = {
  cancelRoom,
  kickMember
};

