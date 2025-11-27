const budgetService = require('../services/budgetService');
const { badRequest, internalError } = require('../utils/apiError');
const logger = require('../utils/logger');

/**
 * POST /internal/v1/budget/credit
 * Credit user budget (internal operation)
 */
async function creditBudget(req, res) {
  try {
    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey) {
      return badRequest(res, 'Missing Idempotency-Key header');
    }

    const {
      user_id,
      amount,
      currency,
      operation_type,
      bull_pen_id,
      season_id,
      moved_from,
      moved_to,
      correlation_id,
      meta
    } = req.body || {};

    if (!user_id || !amount || !operation_type) {
      return badRequest(res, 'Missing required fields: user_id, amount, operation_type');
    }

    if (amount <= 0) {
      return badRequest(res, 'Amount must be positive');
    }

    const result = await budgetService.creditBudget(user_id, amount, {
      currency,
      operation_type,
      bull_pen_id,
      season_id,
      moved_from,
      moved_to,
      correlation_id,
      idempotency_key: idempotencyKey,
      meta
    });

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
      user_id,
      balance_before: result.balance_before,
      balance_after: result.balance_after,
      log_id: result.log_id,
      idempotent: result.idempotent
    });
  } catch (err) {
    logger.error('Error crediting budget:', err);
    return internalError(res, 'Failed to credit budget');
  }
}

/**
 * POST /internal/v1/budget/debit
 * Debit user budget (internal operation)
 */
async function debitBudget(req, res) {
  try {
    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey) {
      return badRequest(res, 'Missing Idempotency-Key header');
    }

    const {
      user_id,
      amount,
      currency,
      operation_type,
      bull_pen_id,
      season_id,
      moved_from,
      moved_to,
      correlation_id,
      meta
    } = req.body || {};

    if (!user_id || !amount || !operation_type) {
      return badRequest(res, 'Missing required fields: user_id, amount, operation_type');
    }

    if (amount <= 0) {
      return badRequest(res, 'Amount must be positive');
    }

    const result = await budgetService.debitBudget(user_id, amount, {
      currency,
      operation_type,
      bull_pen_id,
      season_id,
      moved_from,
      moved_to,
      correlation_id,
      idempotency_key: idempotencyKey,
      meta
    });

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
      user_id,
      balance_before: result.balance_before,
      balance_after: result.balance_after,
      log_id: result.log_id,
      idempotent: result.idempotent
    });
  } catch (err) {
    logger.error('Error debiting budget:', err);
    return internalError(res, 'Failed to debit budget');
  }
}

/**
 * POST /internal/v1/budget/lock
 * Lock user budget funds (move from available to locked)
 */
async function lockBudget(req, res) {
  try {
    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey) {
      return badRequest(res, 'Missing Idempotency-Key header');
    }

    const {
      user_id,
      amount,
      currency,
      operation_type,
      bull_pen_id,
      season_id,
      correlation_id,
      meta
    } = req.body || {};

    if (!user_id || !amount || !operation_type) {
      return badRequest(res, 'Missing required fields: user_id, amount, operation_type');
    }

    if (amount <= 0) {
      return badRequest(res, 'Amount must be positive');
    }

    const result = await budgetService.lockBudget(user_id, amount, {
      currency,
      operation_type,
      bull_pen_id,
      season_id,
      correlation_id,
      idempotency_key: idempotencyKey,
      meta
    });

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
      user_id,
      balance_before: result.balance_before,
      balance_after: result.balance_after,
      locked_balance: result.locked_balance,
      log_id: result.log_id,
      idempotent: result.idempotent
    });
  } catch (err) {
    logger.error('Error locking budget:', err);
    return internalError(res, 'Failed to lock budget');
  }
}

/**
 * POST /internal/v1/budget/unlock
 * Unlock user budget funds (move from locked back to available)
 */
async function unlockBudget(req, res) {
  try {
    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey) {
      return badRequest(res, 'Missing Idempotency-Key header');
    }

    const {
      user_id,
      amount,
      currency,
      operation_type,
      bull_pen_id,
      season_id,
      correlation_id,
      meta
    } = req.body || {};

    if (!user_id || !amount || !operation_type) {
      return badRequest(res, 'Missing required fields: user_id, amount, operation_type');
    }

    if (amount <= 0) {
      return badRequest(res, 'Amount must be positive');
    }

    const result = await budgetService.unlockBudget(user_id, amount, {
      currency,
      operation_type,
      bull_pen_id,
      season_id,
      correlation_id,
      idempotency_key: idempotencyKey,
      meta
    });

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
      user_id,
      balance_before: result.balance_before,
      balance_after: result.balance_after,
      available_balance: result.available_balance,
      log_id: result.log_id,
      idempotent: result.idempotent
    });
  } catch (err) {
    logger.error('Error unlocking budget:', err);
    return internalError(res, 'Failed to unlock budget');
  }
}

/**
 * POST /internal/v1/budget/transfer
 * Transfer budget from one user to another (atomic operation)
 */
async function transferBudget(req, res) {
  try {
    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey) {
      return badRequest(res, 'Missing Idempotency-Key header');
    }

    const {
      from_user_id,
      to_user_id,
      amount,
      currency,
      operation_type_out,
      operation_type_in,
      correlation_id,
      meta
    } = req.body || {};

    if (!from_user_id || !to_user_id || !amount) {
      return badRequest(res, 'Missing required fields: from_user_id, to_user_id, amount');
    }

    if (from_user_id === to_user_id) {
      return badRequest(res, 'Cannot transfer to the same user');
    }

    if (amount <= 0) {
      return badRequest(res, 'Amount must be positive');
    }

    const result = await budgetService.transferBudget(from_user_id, to_user_id, amount, {
      currency,
      operation_type_out,
      operation_type_in,
      correlation_id,
      idempotency_key: idempotencyKey,
      meta
    });

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
      from_user_id,
      to_user_id,
      amount,
      from_balance_before: result.from_balance_before,
      from_balance_after: result.from_balance_after,
      to_balance_before: result.to_balance_before,
      to_balance_after: result.to_balance_after,
      from_log_id: result.from_log_id,
      to_log_id: result.to_log_id,
      correlation_id: result.correlation_id,
      idempotent: result.idempotent
    });
  } catch (err) {
    logger.error('Error transferring budget:', err);
    return internalError(res, 'Failed to transfer budget');
  }
}

/**
 * POST /internal/v1/budget/adjust
 * Admin adjustment of user budget (credit or debit)
 */
async function adjustBudget(req, res) {
  try {
    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey) {
      return badRequest(res, 'Missing Idempotency-Key header');
    }

    const {
      user_id,
      amount,
      currency,
      direction,
      operation_type,
      created_by,
      correlation_id,
      meta
    } = req.body || {};

    if (!user_id || !amount || !direction) {
      return badRequest(res, 'Missing required fields: user_id, amount, direction');
    }

    if (amount <= 0) {
      return badRequest(res, 'Amount must be positive');
    }

    // Ensure created_by is set (should come from authenticated admin user)
    const adminId = created_by || (req.user ? `user:${req.user.id}` : 'unknown');

    // Add admin info to meta
    const adjustMeta = {
      ...meta,
      created_by: adminId,
      adjusted_at: new Date().toISOString()
    };

    const result = await budgetService.adjustBudget(user_id, amount, direction, {
      currency,
      operation_type: operation_type || 'ADJUSTMENT',
      correlation_id,
      idempotency_key: idempotencyKey,
      meta: adjustMeta
    });

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
      user_id,
      amount,
      direction,
      balance_before: result.balance_before,
      balance_after: result.balance_after,
      log_id: result.log_id,
      idempotent: result.idempotent
    });
  } catch (err) {
    logger.error('Error adjusting budget:', err);
    return internalError(res, 'Failed to adjust budget');
  }
}

module.exports = {
  creditBudget,
  debitBudget,
  lockBudget,
  unlockBudget,
  transferBudget,
  adjustBudget
};

