const db = require('../db');
const { internalError, notFound } = require('../utils/apiError');
const logger = require('../utils/logger');
const auditLog = require('../utils/auditLog');

/**
 * List all users (admin only)
 * GET /api/admin/users
 */
async function listUsers(req, res) {
  try {
    const [rows] = await db.execute(
      `SELECT 
        id, 
        email, 
        name, 
        auth_provider AS authProvider,
        is_demo AS isDemo,
        is_admin AS isAdmin,
        status,
        created_at AS createdAt,
        last_login AS lastLogin
      FROM users 
      WHERE deleted_at IS NULL 
      ORDER BY created_at DESC`
    );

    return res.json({ users: rows });
  } catch (err) {
    logger.error('[Admin] Error fetching users:', err);
    return internalError(res, 'Failed to fetch users');
  }
}

/**
 * Get audit logs for a specific user (admin only)
 * GET /api/admin/users/:id/logs
 */
async function getUserLogs(req, res) {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  try {
    // First, verify the user exists
    const [userRows] = await db.execute(
      'SELECT id, email, name FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId]
    );

    if (userRows.length === 0) {
      return notFound(res, 'User not found');
    }

    // Fetch audit logs for this user
    const [logs] = await db.execute(
      `SELECT 
        id,
        user_id AS userId,
        event_type AS eventType,
        event_category AS eventCategory,
        description,
        ip_address AS ipAddress,
        user_agent AS userAgent,
        previous_values AS previousValues,
        new_values AS newValues,
        created_at AS createdAt
      FROM user_audit_log 
      WHERE user_id = ? 
      ORDER BY created_at DESC
      LIMIT 1000`,
      [userId]
    );

    // Parse JSON fields
    const parsedLogs = logs.map(log => ({
      ...log,
      previousValues: log.previousValues ? JSON.parse(log.previousValues) : null,
      newValues: log.newValues ? JSON.parse(log.newValues) : null,
    }));

    return res.json({
      user: userRows[0],
      logs: parsedLogs,
      total: parsedLogs.length
    });
  } catch (err) {
    logger.error('[Admin] Error fetching user logs:', err);
    return internalError(res, 'Failed to fetch user logs');
  }
}

/**
 * Update user admin status (admin only)
 * PATCH /api/admin/users/:id/admin
 */
async function updateUserAdminStatus(req, res) {
  const userId = req.params.id;
  const { isAdmin } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  if (typeof isAdmin !== 'boolean') {
    return res.status(400).json({ error: 'isAdmin must be a boolean' });
  }

  // Prevent admins from removing their own admin status
  if (req.user.id === parseInt(userId) && !isAdmin) {
    return res.status(403).json({ error: 'Cannot remove your own admin privileges' });
  }

  try {
    // Get target user info before update
    const [targetUserRows] = await db.execute(
      'SELECT id, email, name, is_admin FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId]
    );

    if (targetUserRows.length === 0) {
      return notFound(res, 'User not found');
    }

    const targetUser = targetUserRows[0];
    const previousIsAdmin = !!targetUser.is_admin;

    // Update admin status
    const [result] = await db.execute(
      'UPDATE users SET is_admin = ? WHERE id = ? AND deleted_at IS NULL',
      [isAdmin, userId]
    );

    if (result.affectedRows === 0) {
      return notFound(res, 'User not found');
    }

    logger.log(`[Admin] User ${req.user.id} (${req.user.email}) ${isAdmin ? 'granted' : 'revoked'} admin privileges for user ${userId}`);

    // Log admin privilege change for the target user
    await auditLog.log({
      userId: parseInt(userId),
      eventType: isAdmin ? 'admin_privilege_granted' : 'admin_privilege_revoked',
      eventCategory: 'admin',
      description: `Admin privileges ${isAdmin ? 'granted' : 'revoked'} by ${req.user.email}`,
      req,
      previousValues: {
        is_admin: previousIsAdmin,
        changed_by: req.user.email
      },
      newValues: {
        is_admin: isAdmin,
        changed_by: req.user.email
      }
    });

    // Also log the action for the admin who made the change
    await auditLog.log({
      userId: req.user.id,
      eventType: isAdmin ? 'admin_privilege_granted' : 'admin_privilege_revoked',
      eventCategory: 'admin',
      description: `${isAdmin ? 'Granted' : 'Revoked'} admin privileges for user ${targetUser.email}`,
      req,
      newValues: {
        target_user_id: parseInt(userId),
        target_user_email: targetUser.email,
        is_admin: isAdmin
      }
    });

    return res.json({
      success: true,
      message: `Admin privileges ${isAdmin ? 'granted' : 'revoked'}`
    });
  } catch (err) {
    logger.error('[Admin] Error updating user admin status:', err);
    return internalError(res, 'Failed to update admin status');
  }
}

/**
 * Get detailed user info including budget and trading rooms (admin only)
 * GET /api/admin/users/:id/detail
 */
async function getUserDetail(req, res) {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  try {
    // Get user info
    const [userRows] = await db.execute(
      `SELECT
        id,
        email,
        name,
        auth_provider AS authProvider,
        is_demo AS isDemo,
        is_admin AS isAdmin,
        status,
        created_at AS createdAt,
        last_login AS lastLogin
      FROM users
      WHERE id = ? AND deleted_at IS NULL`,
      [userId]
    );

    if (userRows.length === 0) {
      return notFound(res, 'User not found');
    }

    const user = userRows[0];

    // Get user's budget
    const [budgetRows] = await db.execute(
      `SELECT
        id,
        user_id AS userId,
        available_balance AS availableBalance,
        locked_balance AS lockedBalance,
        currency,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM user_budgets
      WHERE user_id = ? AND deleted_at IS NULL`,
      [userId]
    );

    const budget = budgetRows.length > 0 ? budgetRows[0] : null;

    // Get last 10 budget transactions
    const [budgetLogs] = await db.execute(
      `SELECT
        id,
        user_id AS userId,
        direction,
        operation_type AS operationType,
        amount,
        currency,
        balance_before AS balanceBefore,
        balance_after AS balanceAfter,
        bull_pen_id AS bullPenId,
        season_id AS seasonId,
        correlation_id AS correlationId,
        created_at AS createdAt
      FROM budget_logs
      WHERE user_id = ? AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 10`,
      [userId]
    );

    // Get trading rooms user is part of
    const [tradingRooms] = await db.execute(
      `SELECT
        bp.id,
        bp.name,
        bp.state,
        bp.starting_cash AS startingCash,
        bp.host_user_id AS hostUserId,
        bp.start_time AS startTime,
        bp.duration_sec AS durationSec,
        bpm.role,
        bpm.status,
        bpm.cash,
        bpm.joined_at AS joinedAt
      FROM bull_pens bp
      JOIN bull_pen_memberships bpm ON bp.id = bpm.bull_pen_id
      WHERE bpm.user_id = ? AND bp.deleted_at IS NULL AND bpm.deleted_at IS NULL
      ORDER BY bp.start_time DESC, bp.id DESC`,
      [userId]
    );

    // Get user's standing in each trading room (if room is active or completed)
    const standings = [];
    for (const room of tradingRooms) {
      if (['active', 'completed'].includes(room.state)) {
        const [leaderboard] = await db.execute(
          `SELECT
            rank,
            portfolio_value AS portfolioValue,
            pnl_abs AS pnlAbs,
            pnl_pct AS pnlPct
          FROM leaderboard_snapshots
          WHERE bull_pen_id = ? AND user_id = ?
          ORDER BY snapshot_at DESC
          LIMIT 1`,
          [room.id, userId]
        );

        if (leaderboard.length > 0) {
          standings.push({
            bullPenId: room.id,
            bullPenName: room.name,
            ...leaderboard[0]
          });
        }
      }
    }

    return res.json({
      user,
      budget,
      budgetLogs,
      tradingRooms,
      standings
    });
  } catch (err) {
    logger.error('[Admin] Error fetching user detail:', err);
    return internalError(res, 'Failed to fetch user detail');
  }
}

module.exports = {
  listUsers,
  getUserLogs,
  updateUserAdminStatus,
  getUserDetail,
};

