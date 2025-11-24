const db = require('../db');
const { badRequest, forbidden, internalError, notFound } = require('../utils/apiError');
const logger = require('../utils/logger');

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

    return res.status(201).json({ membership: mapMembershipRow(membership) });
  } catch (err) {
    logger.error('Error joining bull pen:', err);
    return internalError(res, 'Failed to join bull pen');
  }
}

async function listBullPenMembers(req, res) {
  const bullPenId = req.params.id;

  try {
    const [members] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE bull_pen_id = ? ORDER BY joined_at ASC',
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
    const [[bullPen]] = await db.execute('SELECT * FROM bull_pens WHERE id = ?', [bullPenId]);
    if (!bullPen) {
      return notFound(res, 'Bull pen not found');
    }

    if (bullPen.host_user_id !== userId) {
      return forbidden(res, 'Only the host can approve memberships');
    }

    const [[membership]] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE id = ? AND bull_pen_id = ?',
      [membershipId, bullPenId]
    );

    if (!membership) {
      return notFound(res, 'Membership not found');
    }

    if (membership.status !== 'pending') {
      return badRequest(res, 'Only pending memberships can be approved');
    }

    await db.execute(
      'UPDATE bull_pen_memberships SET status = "active" WHERE id = ?',
      [membershipId]
    );

    const [[updated]] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE id = ?',
      [membershipId]
    );

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
    const [[bullPen]] = await db.execute('SELECT * FROM bull_pens WHERE id = ?', [bullPenId]);
    if (!bullPen) {
      return notFound(res, 'Bull pen not found');
    }

    if (bullPen.host_user_id !== userId) {
      return forbidden(res, 'Only the host can reject memberships');
    }

    const [[membership]] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE id = ? AND bull_pen_id = ?',
      [membershipId, bullPenId]
    );

    if (!membership) {
      return notFound(res, 'Membership not found');
    }

    if (membership.status !== 'pending') {
      return badRequest(res, 'Only pending memberships can be rejected');
    }

    await db.execute(
      'UPDATE bull_pen_memberships SET status = "kicked" WHERE id = ?',
      [membershipId]
    );

    const [[updated]] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE id = ?',
      [membershipId]
    );

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
      'SELECT * FROM bull_pen_memberships WHERE bull_pen_id = ? AND user_id = ?',
      [bullPenId, userId]
    );

    if (!membership) {
      return notFound(res, 'Membership not found');
    }

    if (membership.role === 'host') {
      return badRequest(res, 'Host cannot leave their own bull pen');
    }

    await db.execute(
      'UPDATE bull_pen_memberships SET status = "left" WHERE id = ?',
      [membership.id]
    );

    const [[updated]] = await db.execute(
      'SELECT * FROM bull_pen_memberships WHERE id = ?',
      [membership.id]
    );

    return res.json({ membership: mapMembershipRow(updated) });
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
       WHERE m.user_id = ?
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

