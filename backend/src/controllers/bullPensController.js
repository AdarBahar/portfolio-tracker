const db = require('../db');
const { badRequest, forbidden, internalError, notFound } = require('../utils/apiError');
const logger = require('../utils/logger');

// Helper: build Bull Pen response object
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

async function createBullPen(req, res) {
  const userId = req.user && req.user.id;
  const {
    name,
    description,
    startTime,
    durationSec,
    maxPlayers = 10,
    startingCash,
    allowFractional = false,
    approvalRequired = false,
    inviteCode,
  } = req.body || {};

  if (!name || !durationSec || !startingCash) {
    return badRequest(res, 'Missing required fields: name, durationSec, startingCash');
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO bull_pens
        (host_user_id, name, description, state, start_time, duration_sec, max_players, starting_cash, allow_fractional, approval_required, invite_code)
       VALUES (?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        description || null,
        startTime || null,
        durationSec,
        maxPlayers,
        startingCash,
        allowFractional ? 1 : 0,
        approvalRequired ? 1 : 0,
        inviteCode || null,
      ]
    );

    const bullPenId = result.insertId;

    // Create host membership with full starting cash and active status
    await connection.execute(
      `INSERT INTO bull_pen_memberships
        (bull_pen_id, user_id, role, status, cash)
       VALUES (?, ?, 'host', 'active', ?)`,
      [bullPenId, userId, startingCash]
    );

    const [rows] = await connection.execute(
      'SELECT * FROM bull_pens WHERE id = ?',
      [bullPenId]
    );

    await connection.commit();

    return res.status(201).json({ bullPen: mapBullPenRow(rows[0]) });
  } catch (err) {
    logger.error('Error creating bull pen:', err);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        logger.error('Rollback failed for createBullPen:', rollbackErr);
      }
    }
    return internalError(res, 'Failed to create bull pen');
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function listBullPens(req, res) {
  const userId = req.user && req.user.id;
  const { state, hostOnly } = req.query || {};

  try {
    const params = [];
    let where = '1=1';

    if (state) {
      where += ' AND state = ?';
      params.push(state);
    } else {
      // By default, hide draft rooms not owned by the user
      where += ' AND (state <> "draft" OR host_user_id = ?)';
      params.push(userId);
    }

    if (hostOnly === 'true') {
      where += ' AND host_user_id = ?';
      params.push(userId);
    }

    const [rows] = await db.execute(
      `SELECT * FROM bull_pens
       WHERE ${where}
       ORDER BY start_time IS NULL, start_time DESC, id DESC`,
      params
    );

    return res.json({ bullPens: rows.map(mapBullPenRow) });
  } catch (err) {
    logger.error('Error listing bull pens:', err);
    return internalError(res, 'Failed to list bull pens');
  }
}

async function getBullPen(req, res) {
  const bullPenId = req.params.id;

  try {
    const [rows] = await db.execute('SELECT * FROM bull_pens WHERE id = ?', [bullPenId]);
    if (!rows.length) {
      return notFound(res, 'Bull pen not found');
    }

    return res.json({ bullPen: mapBullPenRow(rows[0]) });
  } catch (err) {
    logger.error('Error fetching bull pen:', err);
    return internalError(res, 'Failed to fetch bull pen');
  }
}

async function updateBullPen(req, res) {
  const userId = req.user && req.user.id;
  const bullPenId = req.params.id;
  const {
    name,
    description,
    state,
    startTime,
    durationSec,
    maxPlayers,
    startingCash,
    allowFractional,
    approvalRequired,
  } = req.body || {};

  if (!bullPenId) {
    return badRequest(res, 'Missing bull pen id');
  }

  try {
    const [existingRows] = await db.execute(
      'SELECT * FROM bull_pens WHERE id = ?',
      [bullPenId]
    );

    const existing = existingRows[0];
    if (!existing) {
      return notFound(res, 'Bull pen not found');
    }

    if (existing.host_user_id !== userId) {
      return forbidden(res, 'Only the host can update this bull pen');
    }

    if (!['draft', 'scheduled'].includes(existing.state)) {
      return badRequest(res, 'Only draft or scheduled bull pens can be updated');
    }

    // Validate state transition if state is being updated
    if (state !== undefined) {
      const validStates = ['draft', 'scheduled', 'active', 'completed', 'archived'];
      if (!validStates.includes(state)) {
        return badRequest(res, `Invalid state. Must be one of: ${validStates.join(', ')}`);
      }
    }

    const [result] = await db.execute(
      `UPDATE bull_pens
       SET name = ?,
           description = ?,
           state = ?,
           start_time = ?,
           duration_sec = ?,
           max_players = ?,
           starting_cash = ?,
           allow_fractional = ?,
           approval_required = ?
       WHERE id = ?`,
      [
        name || existing.name,
        description !== undefined ? description : existing.description,
        state || existing.state,
        startTime || existing.start_time,
        durationSec || existing.duration_sec,
        maxPlayers || existing.max_players,
        startingCash || existing.starting_cash,
        allowFractional !== undefined ? (allowFractional ? 1 : 0) : existing.allow_fractional,
        approvalRequired !== undefined ? (approvalRequired ? 1 : 0) : existing.approval_required,
        bullPenId,
      ]
    );

    if (result.affectedRows === 0) {
      return internalError(res, 'Failed to update bull pen');
    }

    const [rows] = await db.execute('SELECT * FROM bull_pens WHERE id = ?', [bullPenId]);

    return res.json({ bullPen: mapBullPenRow(rows[0]) });
  } catch (err) {
    logger.error('Error updating bull pen:', err);
    return internalError(res, 'Failed to update bull pen');
  }
}

async function deleteBullPen(req, res) {
  const userId = req.user && req.user.id;
  const bullPenId = req.params.id;

  if (!bullPenId) {
    return badRequest(res, 'Missing bull pen id');
  }

  try {
    const [existingRows] = await db.execute(
      'SELECT * FROM bull_pens WHERE id = ?',
      [bullPenId]
    );

    const existing = existingRows[0];
    if (!existing) {
      return notFound(res, 'Bull pen not found');
    }

    if (existing.host_user_id !== userId) {
      return forbidden(res, 'Only the host can delete this bull pen');
    }

    // Delete the bull pen (cascade will delete memberships, positions, orders, leaderboard)
    const [result] = await db.execute(
      'DELETE FROM bull_pens WHERE id = ?',
      [bullPenId]
    );

    if (result.affectedRows === 0) {
      return internalError(res, 'Failed to delete bull pen');
    }

    return res.status(204).send();
  } catch (err) {
    logger.error('Error deleting bull pen:', err);
    return internalError(res, 'Failed to delete bull pen');
  }
}

module.exports = {
  createBullPen,
  listBullPens,
  getBullPen,
  updateBullPen,
  deleteBullPen,
};

