const db = require('../db');
const { badRequest, forbidden, internalError, notFound } = require('../utils/apiError');
const logger = require('../utils/logger');
const auditLog = require('../utils/auditLog');
const budgetService = require('../services/budgetService');
const achievementsService = require('../services/achievementsService');
const ruleEvaluator = require('../services/ruleEvaluator');
const { v4: uuid } = require('uuid');

function mapMembershipRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    bullPenId: row.bull_pen_id,
    userId: row.user_id,
    role: row.role,
    status: row.status,
    cash: row.cash,
    joinedAt: row.joined_at,
  };
}

function mapBullPenRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    state: row.state,
    startTime: row.start_time,
    durationSec: row.duration_sec,
    maxPlayers: row.max_players,
    startingCash: row.starting_cash,
    allowFractional: !!row.allow_fractional,
    approvalRequired: !!row.approval_required,
    inviteCode: row.invite_code,
    hostUserId: row.host_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function joinBullPen(req, res) {
  const userId = req.user && req.user.id;
  const bullPenId = req.params.id;

  if (!bullPenId) {
    return badRequest(res, 'Missing bull pen id');
  }

  try {
    const [[bullPen]] = await db.execute('SELECT * FROM bull_pens WHERE id = ?', [bullPenId]);
    if (!bullPen) {
      return notFound(res, 'Bull pen not found');
    }

    if (!['draft', 'scheduled', 'active'].includes(bullPen.state)) {
      return badRequest(res, 'Cannot join a completed or archived bull pen');
    }

    // Check if already a member
    const [[existingMembership]] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE bull_pen_id = ? AND user_id = ?',
      [bullPenId, userId]
    );

    if (existingMembership) {
      return badRequest(res, 'User is already a member of this bull pen');
    }

    // Debit user's budget for room buy-in
    const correlationId = `room-${bullPenId}-join-${uuid()}`;
    const idempotencyKey = `join-${userId}-${bullPenId}-${Date.now()}`;

    const debitResult = await budgetService.debitBudget(userId, bullPen.starting_cash, {
      operation_type: 'ROOM_BUY_IN',
      bull_pen_id: bullPenId,
      correlation_id: correlationId,
      idempotency_key: idempotencyKey
    });

    if (debitResult.error) {
      logger.warn(`Budget debit failed for user ${userId} joining room ${bullPenId}:`, debitResult.error);
      return res.status(debitResult.status || 400).json({ error: debitResult.error });
    }

    const status = bullPen.approval_required ? 'pending' : 'active';

    const [result] = await db.execute(
      `INSERT INTO bull_pen_memberships (bull_pen_id, user_id, role, status, cash)
       VALUES (?, ?, 'player', ?, ?)`,
      [bullPenId, userId, status, bullPen.starting_cash]
    );

    const [[membership]] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE id = ?',
      [result.insertId]
    );

    // Log bull pen join
    await auditLog.log({
      userId,
      eventType: 'bull_pen_joined',
      eventCategory: 'bull_pen',
      description: `Joined bull pen "${bullPen.name}" (status: ${status}, buy-in: ${bullPen.starting_cash})`,
      req,
      newValues: {
        bullPenId,
        bullPenName: bullPen.name,
        status,
        role: 'player',
        budgetLogId: debitResult.log_id,
        correlationId
      }
    });

    // Award first_room_join achievement if this is user's first room
    try {
      const isFirstRoom = await ruleEvaluator.evaluateFirstRoomJoin(userId);
      if (isFirstRoom) {
        const starResult = await achievementsService.awardStars(
          userId,
          'first_room_join',
          10,
          { bullPenId: null, seasonId: null, source: 'achievement' }
        );
        if (starResult.success) {
          logger.log(`[Achievement] User ${userId} awarded 10 stars for first_room_join`);
        }
      }
    } catch (err) {
      // Log error but don't fail the join operation
      logger.warn(`[Achievement] Error awarding first_room_join stars for user ${userId}:`, err);
    }

    return res.status(201).json({
      membership: mapMembershipRow(membership),
      budgetLogId: debitResult.log_id,
      correlationId
    });
  } catch (err) {
    logger.error('Error joining bull pen:', err);
    return internalError(res, 'Failed to join bull pen');
  }
}

async function listBullPenMembers(req, res) {
  const bullPenId = req.params.id;

  try {
    const [members] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE bull_pen_id = ? AND deleted_at IS NULL ORDER BY joined_at ASC',
      [bullPenId]
    );

    return res.json({ members: members.map(mapMembershipRow) });
  } catch (err) {
    logger.error('Error listing bull pen members:', err);
    return internalError(res, 'Failed to list bull pen members');
  }
}

async function approveMembership(req, res) {
  const userId = req.user && req.user.id;
  const bullPenId = req.params.id;
  const membershipId = req.params.membershipId;

  try {
    const [[bullPen]] = await db.execute('SELECT * FROM bull_pens WHERE id = ? AND deleted_at IS NULL', [bullPenId]);
    if (!bullPen) {
      return notFound(res, 'Bull pen not found');
    }

    if (bullPen.host_user_id !== userId) {
      return forbidden(res, 'Only the host can approve memberships');
    }

    const [[membership]] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE id = ? AND bull_pen_id = ? AND deleted_at IS NULL',
      [membershipId, bullPenId]
    );

    if (!membership) {
      return notFound(res, 'Membership not found');
    }

    if (membership.status !== 'pending') {
      return badRequest(res, 'Only pending memberships can be approved');
    }

    await db.execute(
      'UPDATE bull_pen_memberships SET status = "active" WHERE id = ? AND deleted_at IS NULL',
      [membershipId]
    );

    const [[updated]] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE id = ?',
      [membershipId]
    );

    // Get target user info for logging
    const [[targetUser]] = await db.execute(
      'SELECT email FROM users WHERE id = ?',
      [membership.user_id]
    );

    // Log membership approval (for target user)
    await auditLog.log({
      userId: membership.user_id,
      eventType: 'bull_pen_membership_approved',
      eventCategory: 'bull_pen',
      description: `Membership approved for bull pen "${bullPen.name}"`,
      req,
      previousValues: { status: 'pending' },
      newValues: { status: 'active', bullPenId, bullPenName: bullPen.name }
    });

    // Log membership approval (for host)
    await auditLog.log({
      userId,
      eventType: 'bull_pen_membership_approved',
      eventCategory: 'bull_pen',
      description: `Approved ${targetUser?.email || 'user'} for bull pen "${bullPen.name}"`,
      req,
      newValues: { targetUserId: membership.user_id, targetUserEmail: targetUser?.email, bullPenId, bullPenName: bullPen.name }
    });

    return res.json({ membership: mapMembershipRow(updated) });
  } catch (err) {
    logger.error('Error approving membership:', err);
    return internalError(res, 'Failed to approve membership');
  }
}

async function rejectMembership(req, res) {
  const userId = req.user && req.user.id;
  const bullPenId = req.params.id;
  const membershipId = req.params.membershipId;

  try {
    const [[bullPen]] = await db.execute('SELECT * FROM bull_pens WHERE id = ? AND deleted_at IS NULL', [bullPenId]);
    if (!bullPen) {
      return notFound(res, 'Bull pen not found');
    }

    if (bullPen.host_user_id !== userId) {
      return forbidden(res, 'Only the host can reject memberships');
    }

    const [[membership]] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE id = ? AND bull_pen_id = ? AND deleted_at IS NULL',
      [membershipId, bullPenId]
    );

    if (!membership) {
      return notFound(res, 'Membership not found');
    }

    if (membership.status !== 'pending') {
      return badRequest(res, 'Only pending memberships can be rejected');
    }

    await db.execute(
      'UPDATE bull_pen_memberships SET status = "kicked" WHERE id = ? AND deleted_at IS NULL',
      [membershipId]
    );

    const [[updated]] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE id = ?',
      [membershipId]
    );

    // Get target user info for logging
    const [[targetUser]] = await db.execute(
      'SELECT email FROM users WHERE id = ?',
      [membership.user_id]
    );

    // Log membership rejection (for target user)
    await auditLog.log({
      userId: membership.user_id,
      eventType: 'bull_pen_membership_rejected',
      eventCategory: 'bull_pen',
      description: `Membership rejected for bull pen "${bullPen.name}"`,
      req,
      previousValues: { status: 'pending' },
      newValues: { status: 'kicked', bullPenId, bullPenName: bullPen.name }
    });

    // Log membership rejection (for host)
    await auditLog.log({
      userId,
      eventType: 'bull_pen_membership_rejected',
      eventCategory: 'bull_pen',
      description: `Rejected ${targetUser?.email || 'user'} for bull pen "${bullPen.name}"`,
      req,
      newValues: { targetUserId: membership.user_id, targetUserEmail: targetUser?.email, bullPenId, bullPenName: bullPen.name }
    });

    return res.json({ membership: mapMembershipRow(updated) });
  } catch (err) {
    logger.error('Error rejecting membership:', err);
    return internalError(res, 'Failed to reject membership');
  }
}

async function leaveBullPen(req, res) {
  const userId = req.user && req.user.id;
  const bullPenId = req.params.id;

  try {
    const [[membership]] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE bull_pen_id = ? AND user_id = ? AND deleted_at IS NULL',
      [bullPenId, userId]
    );

    if (!membership) {
      return notFound(res, 'Membership not found');
    }

    if (membership.role === 'host') {
      return badRequest(res, 'Host cannot leave their own bull pen');
    }

    // Get bull pen info for logging
    const [[bullPen]] = await db.execute(
      'SELECT name, starting_cash FROM bull_pens WHERE id = ?',
      [bullPenId]
    );

    // Refund user's budget for room buy-in (only if room hasn't started settlement)
    const correlationId = `room-${bullPenId}-leave-${uuid()}`;
    const idempotencyKey = `leave-${userId}-${bullPenId}-${Date.now()}`;

    const creditResult = await budgetService.creditBudget(userId, bullPen.starting_cash, {
      operation_type: 'ROOM_LEAVE_REFUND',
      bull_pen_id: bullPenId,
      correlation_id: correlationId,
      idempotency_key: idempotencyKey
    });

    if (creditResult.error) {
      logger.warn(`Budget credit failed for user ${userId} leaving room ${bullPenId}:`, creditResult.error);
      // Don't fail the leave operation if budget credit fails - log it but continue
    }

    await db.execute(
      'UPDATE bull_pen_memberships SET status = "left" WHERE id = ? AND deleted_at IS NULL',
      [membership.id]
    );

    const [[updated]] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE id = ? AND deleted_at IS NULL',
      [membership.id]
    );

    // Log bull pen leave
    await auditLog.log({
      userId,
      eventType: 'bull_pen_left',
      eventCategory: 'bull_pen',
      description: `Left bull pen "${bullPen?.name || 'Unknown'}" (refund: ${bullPen.starting_cash})`,
      req,
      previousValues: { status: membership.status },
      newValues: {
        status: 'left',
        bullPenId,
        bullPenName: bullPen?.name,
        budgetLogId: creditResult.log_id,
        correlationId
      }
    });

    return res.json({
      membership: mapMembershipRow(updated),
      budgetLogId: creditResult.log_id,
      correlationId
    });
  } catch (err) {
    logger.error('Error leaving bull pen:', err);
    return internalError(res, 'Failed to leave bull pen');
  }
}

async function listMyBullPens(req, res) {
  const userId = req.user && req.user.id;

  try {
    const [rows] = await db.execute(
      `SELECT bp.*
       FROM bull_pens bp
       JOIN bull_pen_memberships m ON m.bull_pen_id = bp.id
       WHERE m.user_id = ? AND bp.deleted_at IS NULL AND m.deleted_at IS NULL
       ORDER BY bp.start_time IS NULL, bp.start_time DESC, bp.id DESC`,
      [userId]
    );

    return res.json({ bullPens: rows.map(mapBullPenRow) });
  } catch (err) {
    logger.error('Error listing my bull pens:', err);
    return internalError(res, 'Failed to list my bull pens');
  }
}

module.exports = {
  joinBullPen,
  listBullPenMembers,
  approveMembership,
  rejectMembership,
  leaveBullPen,
  listMyBullPens,
};

