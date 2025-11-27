const budgetService = require('../services/budgetService');
const { badRequest, notFound, internalError } = require('../utils/apiError');
const logger = require('../utils/logger');

/**
 * GET /api/v1/budget
 * Get current budget for authenticated user
 */
async function getCurrentBudget(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return badRequest(res, 'User not authenticated');
    }

    const budget = await budgetService.getCurrentBudget(userId);
    if (!budget) {
      return notFound(res, 'Budget not found for user');
    }

    return res.json({
      user_id: budget.user_id,
      available_balance: parseFloat(budget.available_balance),
      locked_balance: parseFloat(budget.locked_balance),
      currency: budget.currency,
      status: budget.status,
      created_at: budget.created_at,
      updated_at: budget.updated_at
    });
  } catch (err) {
    logger.error('Error fetching current budget:', err);
    return internalError(res, 'Failed to fetch budget');
  }
}

/**
 * GET /api/v1/budget/logs
 * Get paginated budget history for authenticated user
 */
async function getBudgetLogs(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return badRequest(res, 'User not authenticated');
    }

    const limit = Math.min(parseInt(req.query.limit) || 50, 500);
    const offset = parseInt(req.query.offset) || 0;
    const filters = {};

    if (req.query.operation_type) {
      filters.operation_type = req.query.operation_type;
    }
    if (req.query.bull_pen_id) {
      filters.bull_pen_id = parseInt(req.query.bull_pen_id);
    }

    const logs = await budgetService.getBudgetLogs(userId, limit, offset, filters);

    return res.json({
      logs: logs.map(log => ({
        id: log.id,
        user_id: log.user_id,
        direction: log.direction,
        operation_type: log.operation_type,
        amount: parseFloat(log.amount),
        currency: log.currency,
        balance_before: parseFloat(log.balance_before),
        balance_after: parseFloat(log.balance_after),
        bull_pen_id: log.bull_pen_id,
        season_id: log.season_id,
        counterparty_user_id: log.counterparty_user_id,
        moved_from: log.moved_from,
        moved_to: log.moved_to,
        correlation_id: log.correlation_id,
        created_at: log.created_at,
        meta: log.meta ? JSON.parse(log.meta) : null
      })),
      pagination: {
        limit,
        offset,
        total_returned: logs.length
      }
    });
  } catch (err) {
    logger.error('Error fetching budget logs:', err);
    return internalError(res, 'Failed to fetch budget logs');
  }
}

module.exports = {
  getCurrentBudget,
  getBudgetLogs
};

