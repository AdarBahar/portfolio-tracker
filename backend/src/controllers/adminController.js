const db = require('../db');
const { internalError, notFound } = require('../utils/apiError');
const logger = require('../utils/logger');

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
    const [result] = await db.execute(
      'UPDATE users SET is_admin = ? WHERE id = ? AND deleted_at IS NULL',
      [isAdmin, userId]
    );

    if (result.affectedRows === 0) {
      return notFound(res, 'User not found');
    }

    logger.log(`[Admin] User ${req.user.id} (${req.user.email}) ${isAdmin ? 'granted' : 'revoked'} admin privileges for user ${userId}`);

    return res.json({ 
      success: true, 
      message: `Admin privileges ${isAdmin ? 'granted' : 'revoked'}` 
    });
  } catch (err) {
    logger.error('[Admin] Error updating user admin status:', err);
    return internalError(res, 'Failed to update admin status');
  }
}

module.exports = {
  listUsers,
  getUserLogs,
  updateUserAdminStatus,
};

