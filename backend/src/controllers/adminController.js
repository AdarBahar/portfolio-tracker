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
        auth_provider,
        is_demo,
        is_admin,
        status,
        created_at,
        last_login
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
        user_id,
        event_type,
        event_category,
        description,
        ip_address,
        user_agent,
        previous_values,
        new_values,
        created_at
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
        auth_provider,
        is_demo,
        is_admin,
        status,
        created_at,
        last_login
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
        user_id,
        available_balance,
        locked_balance,
        currency,
        status,
        created_at,
        updated_at
      FROM user_budgets
      WHERE user_id = ? AND deleted_at IS NULL`,
      [userId]
    );

    const budget = budgetRows.length > 0 ? budgetRows[0] : null;

    // Get last 10 budget transactions
    const [budgetLogs] = await db.execute(
      `SELECT
        id,
        user_id,
        direction,
        operation_type,
        amount,
        currency,
        balance_before,
        balance_after,
        bull_pen_id,
        season_id,
        correlation_id,
        created_at
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
        bp.starting_cash,
        bp.host_user_id,
        bp.start_time,
        bp.duration_sec,
        bpm.role,
        bpm.status,
        bpm.cash,
        bpm.joined_at
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
            portfolio_value,
            pnl_abs,
            pnl_pct
          FROM leaderboard_snapshots
          WHERE bull_pen_id = ? AND user_id = ?
          ORDER BY snapshot_at DESC
          LIMIT 1`,
          [room.id, userId]
        );

        if (leaderboard.length > 0) {
          standings.push({
            bull_pen_id: room.id,
            bull_pen_name: room.name,
            ...leaderboard[0]
          });
        }
      }
    }

    // Get user's total stars (lifetime)
    const [starsResult] = await db.execute(
      `SELECT COALESCE(SUM(stars_delta), 0) as total_stars
       FROM user_star_events
       WHERE user_id = ? AND deleted_at IS NULL`,
      [userId]
    );
    const totalStars = starsResult[0]?.total_stars || 0;

    return res.json({
      user,
      budget,
      budget_logs: budgetLogs,
      trading_rooms: tradingRooms,
      standings,
      total_stars: totalStars
    });
  } catch (err) {
    logger.error('[Admin] Error fetching user detail:', err);
    return internalError(res, 'Failed to fetch user detail');
  }
}

/**
 * Grant stars to a user (admin only)
 * POST /api/admin/users/:id/grant-stars
 */
async function grantStars(req, res) {
  const userId = parseInt(req.params.id, 10);
  const { stars, reason } = req.body;
  const adminId = req.user && req.user.id;

  if (!userId || !stars || stars <= 0) {
    return res.status(400).json({ error: 'Missing or invalid userId or stars' });
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    return res.status(400).json({ error: 'Missing or invalid reason' });
  }

  try {
    // Verify user exists
    const [userRows] = await db.execute(
      'SELECT id, email, name FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId]
    );

    if (userRows.length === 0) {
      return notFound(res, 'User not found');
    }

    const user = userRows[0];

    // Award stars using achievementsService
    // Use a unique reason code for each admin grant to allow multiple grants
    const achievementsService = require('../services/achievementsService');
    const uniqueReasonCode = `admin_grant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await achievementsService.awardStars(
      userId,
      uniqueReasonCode,
      stars,
      { bullPenId: null, seasonId: null, source: 'admin_grant', meta: { reason, grantedBy: adminId } }
    );

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    // Log admin action
    await auditLog.log({
      userId: adminId,
      eventType: 'admin_grant_stars',
      eventCategory: 'admin',
      description: `Granted ${stars} stars to user ${user.email} (${user.name}). Reason: ${reason}`,
      newValues: { targetUserId: userId, starsGranted: stars, reason }
    });

    return res.json({
      success: true,
      message: `Granted ${stars} stars to user ${user.email}`,
      starId: result.starId,
      totalStars: result.totalStars,
    });
  } catch (err) {
    logger.error('[Admin] Error granting stars:', err);
    return internalError(res, 'Failed to grant stars');
  }
}

/**
 * Remove stars from a user (admin only)
 * POST /api/admin/users/:id/remove-stars
 */
async function removeStars(req, res) {
  const userId = parseInt(req.params.id, 10);
  const { stars, reason } = req.body;
  const adminId = req.user && req.user.id;

  if (!userId || !stars || stars <= 0) {
    return res.status(400).json({ error: 'Missing or invalid userId or stars' });
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    return res.status(400).json({ error: 'Missing or invalid reason' });
  }

  try {
    // Verify user exists
    const [userRows] = await db.execute(
      'SELECT id, email, name FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId]
    );

    if (userRows.length === 0) {
      return notFound(res, 'User not found');
    }

    const user = userRows[0];

    // Remove stars using achievementsService
    const achievementsService = require('../services/achievementsService');
    const result = await achievementsService.removeStars(
      userId,
      'admin_remove',
      stars,
      { bullPenId: null, seasonId: null, source: 'admin_remove', meta: { reason, removedBy: adminId } }
    );

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    // Log admin action
    await auditLog.log({
      userId: adminId,
      eventType: 'admin_remove_stars',
      eventCategory: 'admin',
      description: `Removed ${stars} stars from user ${user.email} (${user.name}). Reason: ${reason}`,
      newValues: { targetUserId: userId, starsRemoved: stars, reason }
    });

    return res.json({
      success: true,
      message: `Removed ${stars} stars from user ${user.email}`,
      totalStars: result.totalStars,
    });
  } catch (err) {
    logger.error('[Admin] Error removing stars:', err);
    return internalError(res, 'Failed to remove stars');
  }
}

/**
 * Adjust user budget (add or remove money) - admin only
 * POST /api/admin/users/:id/adjust-budget
 */
async function adjustBudget(req, res) {
  const userId = parseInt(req.params.id, 10);
  const { amount, direction, reason } = req.body;
  const adminId = req.user && req.user.id;
  const adminName = (req.user && req.user.name) || 'Unknown Admin';

  if (!userId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Missing or invalid userId or amount' });
  }

  if (!direction || !['IN', 'OUT'].includes(direction)) {
    return res.status(400).json({ error: 'Direction must be IN or OUT' });
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    return res.status(400).json({ error: 'Missing or invalid reason' });
  }

  try {
    // Verify user exists
    const [userRows] = await db.execute(
      'SELECT id, email, name FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId]
    );

    if (userRows.length === 0) {
      return notFound(res, 'User not found');
    }

    const user = userRows[0];

    // Get current budget, or create one if it doesn't exist
    let [budgetRows] = await db.execute(
      'SELECT available_balance FROM user_budgets WHERE user_id = ? AND deleted_at IS NULL',
      [userId]
    );

    let balanceBefore = 0;

    if (budgetRows.length === 0) {
      // Create budget record if it doesn't exist
      await db.execute(
        'INSERT INTO user_budgets (user_id, available_balance, locked_balance, currency, status) VALUES (?, ?, ?, ?, ?)',
        [userId, 0, 0, 'VUSD', 'active']
      );
      balanceBefore = 0;
    } else {
      balanceBefore = budgetRows[0].available_balance;
    }

    // Check if debit would result in negative balance
    if (direction === 'OUT' && balanceBefore < amount) {
      return res.status(400).json({
        error: 'INSUFFICIENT_FUNDS',
        message: `User has insufficient balance. Available: ${balanceBefore}, Requested: ${amount}`
      });
    }

    // Update budget
    const newBalance = direction === 'IN' ? balanceBefore + amount : balanceBefore - amount;
    const [updateResult] = await db.execute(
      'UPDATE user_budgets SET available_balance = ? WHERE user_id = ? AND deleted_at IS NULL',
      [newBalance, userId]
    );

    if (updateResult.affectedRows === 0) {
      return notFound(res, 'Failed to update budget');
    }

    // Log the budget transaction
    const operationType = direction === 'IN' ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT';
    const [logResult] = await db.execute(
      `INSERT INTO budget_logs (
        user_id, direction, operation_type, amount, currency,
        balance_before, balance_after, correlation_id, meta, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        direction,
        operationType,
        amount,
        'VUSD',
        balanceBefore,
        newBalance,
        `admin-${adminId}-${Date.now()}`,
        JSON.stringify({ reason, admin_id: adminId, admin_name: adminName })
      ]
    );

    // Log admin action in audit log
    await auditLog.log({
      userId: adminId,
      eventType: 'admin_adjust_budget',
      eventCategory: 'admin',
      description: `Admin: ${adminName} ${direction === 'IN' ? 'added' : 'removed'} $${amount} ${direction === 'IN' ? 'to' : 'from'} ${user.name} account. Reason: ${reason}`,
      newValues: {
        targetUserId: userId,
        targetUserName: user.name,
        amount,
        direction,
        reason,
        balanceBefore,
        balanceAfter: newBalance
      }
    });

    // Also log for the target user
    await auditLog.log({
      userId: userId,
      eventType: 'budget_adjusted_by_admin',
      eventCategory: 'admin',
      description: `Admin: ${adminName} ${direction === 'IN' ? 'added' : 'removed'} $${amount} ${direction === 'IN' ? 'to' : 'from'} your account. Reason: ${reason}`,
      newValues: {
        amount,
        direction,
        reason,
        balanceBefore,
        balanceAfter: newBalance
      }
    });

    return res.json({
      success: true,
      message: `${direction === 'IN' ? 'Added' : 'Removed'} $${amount} ${direction === 'IN' ? 'to' : 'from'} user ${user.email}`,
      user_id: userId,
      amount,
      direction,
      balance_before: balanceBefore,
      balance_after: newBalance,
      log_id: logResult.insertId
    });
  } catch (err) {
    logger.error('[Admin] Error adjusting budget:', err);
    return internalError(res, 'Failed to adjust budget');
  }
}

module.exports = {
  listUsers,
  getUserLogs,
  updateUserAdminStatus,
  getUserDetail,
  grantStars,
  removeStars,
  adjustBudget,
};

