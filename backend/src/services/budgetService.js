const db = require('../db');
const logger = require('../utils/logger');
const { badRequest, internalError } = require('../utils/apiError');

/**
 * Budget Service
 * Handles all budget operations with transactional consistency and idempotency
 */

/**
 * Round monetary amount to 2 decimal places (round half up)
 */
function roundMoney(amount) {
  return Math.round(amount * 100) / 100;
}

/**
 * Get current budget for a user
 */
async function getCurrentBudget(userId) {
  try {
    const [rows] = await db.execute(
      `SELECT id, user_id, available_balance, locked_balance, currency, status, created_at, updated_at
       FROM user_budgets WHERE user_id = ? AND deleted_at IS NULL`,
      [userId]
    );
    return rows[0] || null;
  } catch (err) {
    logger.error('Error fetching budget:', err);
    throw err;
  }
}

/**
 * Get budget logs for a user with pagination
 */
async function getBudgetLogs(userId, limit = 50, offset = 0, filters = {}) {
  try {
    let query = `SELECT id, user_id, direction, operation_type, amount, currency, 
                        balance_before, balance_after, bull_pen_id, season_id, 
                        counterparty_user_id, moved_from, moved_to, correlation_id, 
                        idempotency_key, meta, created_at
                 FROM budget_logs 
                 WHERE user_id = ? AND deleted_at IS NULL`;
    const params = [userId];

    if (filters.operation_type) {
      query += ` AND operation_type = ?`;
      params.push(filters.operation_type);
    }

    if (filters.bull_pen_id) {
      query += ` AND bull_pen_id = ?`;
      params.push(filters.bull_pen_id);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.execute(query, params);
    return rows;
  } catch (err) {
    logger.error('Error fetching budget logs:', err);
    throw err;
  }
}

/**
 * Credit user budget (internal operation)
 * Idempotent: if idempotency_key exists, returns existing result
 */
async function creditBudget(userId, amount, operationData) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check for idempotency
    if (operationData.idempotency_key) {
      const [existing] = await connection.execute(
        `SELECT id, balance_before, balance_after FROM budget_logs 
         WHERE idempotency_key = ? AND deleted_at IS NULL`,
        [operationData.idempotency_key]
      );
      if (existing.length > 0) {
        await connection.commit();
        return {
          log_id: existing[0].id,
          balance_before: existing[0].balance_before,
          balance_after: existing[0].balance_after,
          idempotent: true
        };
      }
    }

    // Lock user budget
    const [budgets] = await connection.execute(
      `SELECT id, available_balance, locked_balance, status FROM user_budgets 
       WHERE user_id = ? AND deleted_at IS NULL FOR UPDATE`,
      [userId]
    );

    if (!budgets.length) {
      await connection.rollback();
      return { error: 'BUDGET_NOT_FOUND', status: 404 };
    }

    const budget = budgets[0];
    if (budget.status !== 'active') {
      await connection.rollback();
      return { error: 'BUDGET_FROZEN', status: 400 };
    }

    const roundedAmount = roundMoney(amount);
    const balanceBefore = roundMoney(budget.available_balance);
    const balanceAfter = roundMoney(balanceBefore + roundedAmount);

    // Update budget
    await connection.execute(
      `UPDATE user_budgets SET available_balance = ?, updated_at = NOW() 
       WHERE id = ?`,
      [balanceAfter, budget.id]
    );

    // Insert log
    const [logResult] = await connection.execute(
      `INSERT INTO budget_logs 
       (user_id, direction, operation_type, amount, currency, balance_before, balance_after,
        bull_pen_id, season_id, moved_from, moved_to, correlation_id, idempotency_key, meta)
       VALUES (?, 'IN', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        operationData.operation_type,
        roundedAmount,
        operationData.currency || 'VUSD',
        balanceBefore,
        balanceAfter,
        operationData.bull_pen_id || null,
        operationData.season_id || null,
        operationData.moved_from || null,
        operationData.moved_to || null,
        operationData.correlation_id || null,
        operationData.idempotency_key || null,
        operationData.meta ? JSON.stringify(operationData.meta) : null
      ]
    );

    await connection.commit();
    return {
      log_id: logResult.insertId,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      idempotent: false
    };
  } catch (err) {
    await connection.rollback();
    logger.error('Error crediting budget:', err);
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Debit user budget (internal operation)
 * Idempotent: if idempotency_key exists, returns existing result
 */
async function debitBudget(userId, amount, operationData) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check for idempotency
    if (operationData.idempotency_key) {
      const [existing] = await connection.execute(
        `SELECT id, balance_before, balance_after FROM budget_logs
         WHERE idempotency_key = ? AND deleted_at IS NULL`,
        [operationData.idempotency_key]
      );
      if (existing.length > 0) {
        await connection.commit();
        return {
          log_id: existing[0].id,
          balance_before: existing[0].balance_before,
          balance_after: existing[0].balance_after,
          idempotent: true
        };
      }
    }

    // Lock user budget
    const [budgets] = await connection.execute(
      `SELECT id, available_balance, locked_balance, status FROM user_budgets
       WHERE user_id = ? AND deleted_at IS NULL FOR UPDATE`,
      [userId]
    );

    if (!budgets.length) {
      await connection.rollback();
      return { error: 'BUDGET_NOT_FOUND', status: 404 };
    }

    const budget = budgets[0];
    if (budget.status !== 'active') {
      await connection.rollback();
      return { error: 'BUDGET_FROZEN', status: 400 };
    }

    const roundedAmount = roundMoney(amount);
    const balanceBefore = roundMoney(budget.available_balance);

    if (balanceBefore < roundedAmount) {
      await connection.rollback();
      return { error: 'INSUFFICIENT_FUNDS', status: 400 };
    }

    const balanceAfter = roundMoney(balanceBefore - roundedAmount);

    // Update budget
    await connection.execute(
      `UPDATE user_budgets SET available_balance = ?, updated_at = NOW()
       WHERE id = ?`,
      [balanceAfter, budget.id]
    );

    // Insert log
    const [logResult] = await connection.execute(
      `INSERT INTO budget_logs
       (user_id, direction, operation_type, amount, currency, balance_before, balance_after,
        bull_pen_id, season_id, moved_from, moved_to, correlation_id, idempotency_key, meta)
       VALUES (?, 'OUT', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        operationData.operation_type,
        roundedAmount,
        operationData.currency || 'VUSD',
        balanceBefore,
        balanceAfter,
        operationData.bull_pen_id || null,
        operationData.season_id || null,
        operationData.moved_from || null,
        operationData.moved_to || null,
        operationData.correlation_id || null,
        operationData.idempotency_key || null,
        operationData.meta ? JSON.stringify(operationData.meta) : null
      ]
    );

    await connection.commit();
    return {
      log_id: logResult.insertId,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      idempotent: false
    };
  } catch (err) {
    await connection.rollback();
    logger.error('Error debiting budget:', err);
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Lock user budget funds (move from available to locked)
 * Idempotent: if idempotency_key exists, returns existing result
 */
async function lockBudget(userId, amount, operationData) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check for idempotency
    if (operationData.idempotency_key) {
      const [existing] = await connection.execute(
        `SELECT id, balance_before, balance_after FROM budget_logs
         WHERE idempotency_key = ? AND deleted_at IS NULL`,
        [operationData.idempotency_key]
      );
      if (existing.length > 0) {
        await connection.commit();
        return {
          log_id: existing[0].id,
          balance_before: existing[0].balance_before,
          balance_after: existing[0].balance_after,
          idempotent: true
        };
      }
    }

    // Lock user budget
    const [budgets] = await connection.execute(
      `SELECT id, available_balance, locked_balance, status FROM user_budgets
       WHERE user_id = ? AND deleted_at IS NULL FOR UPDATE`,
      [userId]
    );

    if (!budgets.length) {
      await connection.rollback();
      return { error: 'BUDGET_NOT_FOUND', status: 404 };
    }

    const budget = budgets[0];
    if (budget.status !== 'active') {
      await connection.rollback();
      return { error: 'BUDGET_FROZEN', status: 400 };
    }

    const roundedAmount = roundMoney(amount);
    const availableBefore = roundMoney(budget.available_balance);

    if (availableBefore < roundedAmount) {
      await connection.rollback();
      return { error: 'INSUFFICIENT_FUNDS', status: 400 };
    }

    const availableAfter = roundMoney(availableBefore - roundedAmount);
    const lockedAfter = roundMoney(budget.locked_balance + roundedAmount);

    // Update budget
    await connection.execute(
      `UPDATE user_budgets SET available_balance = ?, locked_balance = ?, updated_at = NOW()
       WHERE id = ?`,
      [availableAfter, lockedAfter, budget.id]
    );

    // Insert log - record the available balance change
    const [logResult] = await connection.execute(
      `INSERT INTO budget_logs
       (user_id, direction, operation_type, amount, currency, balance_before, balance_after,
        bull_pen_id, season_id, moved_from, moved_to, correlation_id, idempotency_key, meta)
       VALUES (?, 'LOCK', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        operationData.operation_type,
        roundedAmount,
        operationData.currency || 'VUSD',
        availableBefore,
        availableAfter,
        operationData.bull_pen_id || null,
        operationData.season_id || null,
        'available',
        'locked',
        operationData.correlation_id || null,
        operationData.idempotency_key || null,
        operationData.meta ? JSON.stringify(operationData.meta) : null
      ]
    );

    await connection.commit();
    return {
      log_id: logResult.insertId,
      balance_before: availableBefore,
      balance_after: availableAfter,
      locked_balance: lockedAfter,
      idempotent: false
    };
  } catch (err) {
    await connection.rollback();
    logger.error('Error locking budget:', err);
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Unlock user budget funds (move from locked back to available)
 * Idempotent: if idempotency_key exists, returns existing result
 */
async function unlockBudget(userId, amount, operationData) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check for idempotency
    if (operationData.idempotency_key) {
      const [existing] = await connection.execute(
        `SELECT id, balance_before, balance_after FROM budget_logs
         WHERE idempotency_key = ? AND deleted_at IS NULL`,
        [operationData.idempotency_key]
      );
      if (existing.length > 0) {
        await connection.commit();
        return {
          log_id: existing[0].id,
          balance_before: existing[0].balance_before,
          balance_after: existing[0].balance_after,
          idempotent: true
        };
      }
    }

    // Lock user budget
    const [budgets] = await connection.execute(
      `SELECT id, available_balance, locked_balance, status FROM user_budgets
       WHERE user_id = ? AND deleted_at IS NULL FOR UPDATE`,
      [userId]
    );

    if (!budgets.length) {
      await connection.rollback();
      return { error: 'BUDGET_NOT_FOUND', status: 404 };
    }

    const budget = budgets[0];
    if (budget.status !== 'active') {
      await connection.rollback();
      return { error: 'BUDGET_FROZEN', status: 400 };
    }

    const roundedAmount = roundMoney(amount);
    const lockedBefore = roundMoney(budget.locked_balance);

    if (lockedBefore < roundedAmount) {
      await connection.rollback();
      return { error: 'INSUFFICIENT_LOCKED_FUNDS', status: 400 };
    }

    const lockedAfter = roundMoney(lockedBefore - roundedAmount);
    const availableAfter = roundMoney(budget.available_balance + roundedAmount);

    // Update budget
    await connection.execute(
      `UPDATE user_budgets SET available_balance = ?, locked_balance = ?, updated_at = NOW()
       WHERE id = ?`,
      [availableAfter, lockedAfter, budget.id]
    );

    // Insert log - record the locked balance change
    const [logResult] = await connection.execute(
      `INSERT INTO budget_logs
       (user_id, direction, operation_type, amount, currency, balance_before, balance_after,
        bull_pen_id, season_id, moved_from, moved_to, correlation_id, idempotency_key, meta)
       VALUES (?, 'UNLOCK', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        operationData.operation_type,
        roundedAmount,
        operationData.currency || 'VUSD',
        lockedBefore,
        lockedAfter,
        operationData.bull_pen_id || null,
        operationData.season_id || null,
        'locked',
        'available',
        operationData.correlation_id || null,
        operationData.idempotency_key || null,
        operationData.meta ? JSON.stringify(operationData.meta) : null
      ]
    );

    await connection.commit();
    return {
      log_id: logResult.insertId,
      balance_before: lockedBefore,
      balance_after: lockedAfter,
      available_balance: availableAfter,
      idempotent: false
    };
  } catch (err) {
    await connection.rollback();
    logger.error('Error unlocking budget:', err);
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Transfer budget from one user to another (atomic operation)
 * Idempotent: if idempotency_key exists, returns existing result
 */
async function transferBudget(fromUserId, toUserId, amount, operationData) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check for idempotency
    if (operationData.idempotency_key) {
      const [existing] = await connection.execute(
        `SELECT id, correlation_id FROM budget_logs
         WHERE idempotency_key = ? AND deleted_at IS NULL LIMIT 1`,
        [operationData.idempotency_key]
      );
      if (existing.length > 0) {
        // Return the correlation_id from the existing transfer
        const [logs] = await connection.execute(
          `SELECT id, user_id, direction, balance_before, balance_after
           FROM budget_logs
           WHERE correlation_id = ? AND deleted_at IS NULL
           ORDER BY created_at ASC`,
          [existing[0].correlation_id]
        );
        await connection.commit();
        return {
          from_log_id: logs[0]?.id,
          to_log_id: logs[1]?.id,
          from_balance_before: logs[0]?.balance_before,
          from_balance_after: logs[0]?.balance_after,
          to_balance_before: logs[1]?.balance_before,
          to_balance_after: logs[1]?.balance_after,
          correlation_id: existing[0].correlation_id,
          idempotent: true
        };
      }
    }

    // Lock both budgets in deterministic order (ascending user_id)
    const [user1Id, user2Id] = fromUserId < toUserId
      ? [fromUserId, toUserId]
      : [toUserId, fromUserId];

    const [budgets1] = await connection.execute(
      `SELECT id, user_id, available_balance, locked_balance, status FROM user_budgets
       WHERE user_id = ? AND deleted_at IS NULL FOR UPDATE`,
      [user1Id]
    );

    const [budgets2] = await connection.execute(
      `SELECT id, user_id, available_balance, locked_balance, status FROM user_budgets
       WHERE user_id = ? AND deleted_at IS NULL FOR UPDATE`,
      [user2Id]
    );

    if (!budgets1.length || !budgets2.length) {
      await connection.rollback();
      return { error: 'BUDGET_NOT_FOUND', status: 404 };
    }

    const fromBudget = budgets1.find(b => b.user_id === fromUserId) || budgets1[0];
    const toBudget = budgets2.find(b => b.user_id === toUserId) || budgets2[0];

    if (fromBudget.status !== 'active' || toBudget.status !== 'active') {
      await connection.rollback();
      return { error: 'BUDGET_FROZEN', status: 400 };
    }

    const roundedAmount = roundMoney(amount);
    const fromBalanceBefore = roundMoney(fromBudget.available_balance);

    if (fromBalanceBefore < roundedAmount) {
      await connection.rollback();
      return { error: 'INSUFFICIENT_FUNDS', status: 400 };
    }

    const fromBalanceAfter = roundMoney(fromBalanceBefore - roundedAmount);
    const toBalanceBefore = roundMoney(toBudget.available_balance);
    const toBalanceAfter = roundMoney(toBalanceBefore + roundedAmount);

    // Generate correlation_id for this transfer
    const correlationId = operationData.correlation_id || `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Update both budgets
    await connection.execute(
      `UPDATE user_budgets SET available_balance = ?, updated_at = NOW() WHERE id = ?`,
      [fromBalanceAfter, fromBudget.id]
    );

    await connection.execute(
      `UPDATE user_budgets SET available_balance = ?, updated_at = NOW() WHERE id = ?`,
      [toBalanceAfter, toBudget.id]
    );

    // Insert OUT log for from_user
    const [fromLogResult] = await connection.execute(
      `INSERT INTO budget_logs
       (user_id, direction, operation_type, amount, currency, balance_before, balance_after,
        counterparty_user_id, correlation_id, idempotency_key, meta)
       VALUES (?, 'OUT', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fromUserId,
        operationData.operation_type_out || 'TRANSFER_OUT',
        roundedAmount,
        operationData.currency || 'VUSD',
        fromBalanceBefore,
        fromBalanceAfter,
        toUserId,
        correlationId,
        operationData.idempotency_key || null,
        operationData.meta ? JSON.stringify(operationData.meta) : null
      ]
    );

    // Insert IN log for to_user
    const [toLogResult] = await connection.execute(
      `INSERT INTO budget_logs
       (user_id, direction, operation_type, amount, currency, balance_before, balance_after,
        counterparty_user_id, correlation_id, idempotency_key, meta)
       VALUES (?, 'IN', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        toUserId,
        operationData.operation_type_in || 'TRANSFER_IN',
        roundedAmount,
        operationData.currency || 'VUSD',
        toBalanceBefore,
        toBalanceAfter,
        fromUserId,
        correlationId,
        operationData.idempotency_key || null,
        operationData.meta ? JSON.stringify(operationData.meta) : null
      ]
    );

    await connection.commit();
    return {
      from_log_id: fromLogResult.insertId,
      to_log_id: toLogResult.insertId,
      from_balance_before: fromBalanceBefore,
      from_balance_after: fromBalanceAfter,
      to_balance_before: toBalanceBefore,
      to_balance_after: toBalanceAfter,
      correlation_id: correlationId,
      idempotent: false
    };
  } catch (err) {
    await connection.rollback();
    logger.error('Error transferring budget:', err);
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Adjust user budget (admin operation)
 * Can credit or debit based on direction parameter
 * Idempotent: if idempotency_key exists, returns existing result
 */
async function adjustBudget(userId, amount, direction, operationData) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Validate direction
    if (!['IN', 'OUT'].includes(direction)) {
      await connection.rollback();
      return { error: 'Invalid direction. Must be IN or OUT', status: 400 };
    }

    // Check for idempotency
    if (operationData.idempotency_key) {
      const [existing] = await connection.execute(
        `SELECT id, balance_before, balance_after FROM budget_logs
         WHERE idempotency_key = ? AND deleted_at IS NULL`,
        [operationData.idempotency_key]
      );
      if (existing.length > 0) {
        await connection.commit();
        return {
          log_id: existing[0].id,
          balance_before: existing[0].balance_before,
          balance_after: existing[0].balance_after,
          idempotent: true
        };
      }
    }

    // Lock user budget
    const [budgets] = await connection.execute(
      `SELECT id, available_balance, locked_balance, status FROM user_budgets
       WHERE user_id = ? AND deleted_at IS NULL FOR UPDATE`,
      [userId]
    );

    if (!budgets.length) {
      await connection.rollback();
      return { error: 'BUDGET_NOT_FOUND', status: 404 };
    }

    const budget = budgets[0];
    if (budget.status !== 'active') {
      await connection.rollback();
      return { error: 'BUDGET_FROZEN', status: 400 };
    }

    const roundedAmount = roundMoney(amount);
    const balanceBefore = roundMoney(budget.available_balance);
    let balanceAfter;

    // Calculate new balance based on direction
    if (direction === 'IN') {
      balanceAfter = roundMoney(balanceBefore + roundedAmount);
    } else {
      // direction === 'OUT'
      if (balanceBefore < roundedAmount) {
        await connection.rollback();
        return { error: 'INSUFFICIENT_FUNDS', status: 400 };
      }
      balanceAfter = roundMoney(balanceBefore - roundedAmount);
    }

    // Update budget
    await connection.execute(
      `UPDATE user_budgets SET available_balance = ?, updated_at = NOW()
       WHERE id = ?`,
      [balanceAfter, budget.id]
    );

    // Insert log
    const [logResult] = await connection.execute(
      `INSERT INTO budget_logs
       (user_id, direction, operation_type, amount, currency, balance_before, balance_after,
        correlation_id, idempotency_key, meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        direction,
        operationData.operation_type || 'ADJUSTMENT',
        roundedAmount,
        operationData.currency || 'VUSD',
        balanceBefore,
        balanceAfter,
        operationData.correlation_id || null,
        operationData.idempotency_key || null,
        operationData.meta ? JSON.stringify(operationData.meta) : null
      ]
    );

    await connection.commit();
    return {
      log_id: logResult.insertId,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      idempotent: false
    };
  } catch (err) {
    await connection.rollback();
    logger.error('Error adjusting budget:', err);
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  getCurrentBudget,
  getBudgetLogs,
  creditBudget,
  debitBudget,
  lockBudget,
  unlockBudget,
  transferBudget,
  adjustBudget,
  roundMoney
};

