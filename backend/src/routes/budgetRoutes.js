const express = require('express');
const {
  getCurrentBudget,
  getBudgetLogs
} = require('../controllers/budgetController');

const router = express.Router();

/**
 * GET /api/v1/budget
 * Get current budget for authenticated user
 */
router.get('/', getCurrentBudget);

/**
 * GET /api/v1/budget/logs
 * Get paginated budget history for authenticated user
 * Query params:
 *   - limit: max results (default 50, max 500)
 *   - offset: pagination offset (default 0)
 *   - operation_type: filter by operation type (optional)
 *   - bull_pen_id: filter by bull pen id (optional)
 */
router.get('/logs', getBudgetLogs);

module.exports = router;

