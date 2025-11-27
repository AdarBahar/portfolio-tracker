const express = require('express');
const {
  creditBudget,
  debitBudget,
  lockBudget,
  unlockBudget,
  transferBudget,
  adjustBudget
} = require('../controllers/internalBudgetController');

const router = express.Router();

/**
 * POST /internal/v1/budget/credit
 * Credit user budget
 * 
 * Headers:
 *   - Idempotency-Key (required)
 *   - Authorization: Bearer <INTERNAL_SERVICE_TOKEN>
 * 
 * Body:
 *   - user_id (required)
 *   - amount (required, positive)
 *   - currency (optional, default 'VUSD')
 *   - operation_type (required)
 *   - bull_pen_id (optional)
 *   - season_id (optional)
 *   - moved_from (optional)
 *   - moved_to (optional)
 *   - correlation_id (optional)
 *   - meta (optional, JSON object)
 */
router.post('/credit', creditBudget);

/**
 * POST /internal/v1/budget/debit
 * Debit user budget
 *
 * Headers:
 *   - Idempotency-Key (required)
 *   - Authorization: Bearer <INTERNAL_SERVICE_TOKEN>
 *
 * Body:
 *   - user_id (required)
 *   - amount (required, positive)
 *   - currency (optional, default 'VUSD')
 *   - operation_type (required)
 *   - bull_pen_id (optional)
 *   - season_id (optional)
 *   - moved_from (optional)
 *   - moved_to (optional)
 *   - correlation_id (optional)
 *   - meta (optional, JSON object)
 */
router.post('/debit', debitBudget);

/**
 * POST /internal/v1/budget/lock
 * Lock user budget funds (move from available to locked)
 *
 * Headers:
 *   - Idempotency-Key (required)
 *   - Authorization: Bearer <INTERNAL_SERVICE_TOKEN>
 *
 * Body:
 *   - user_id (required)
 *   - amount (required, positive)
 *   - currency (optional, default 'VUSD')
 *   - operation_type (required, e.g., 'ROOM_BUY_IN_LOCK')
 *   - bull_pen_id (optional)
 *   - season_id (optional)
 *   - correlation_id (optional)
 *   - meta (optional, JSON object)
 */
router.post('/lock', lockBudget);

/**
 * POST /internal/v1/budget/unlock
 * Unlock user budget funds (move from locked back to available)
 *
 * Headers:
 *   - Idempotency-Key (required)
 *   - Authorization: Bearer <INTERNAL_SERVICE_TOKEN>
 *
 * Body:
 *   - user_id (required)
 *   - amount (required, positive)
 *   - currency (optional, default 'VUSD')
 *   - operation_type (required, e.g., 'ROOM_BUY_IN_UNLOCK')
 *   - bull_pen_id (optional)
 *   - season_id (optional)
 *   - correlation_id (optional)
 *   - meta (optional, JSON object)
 */
router.post('/unlock', unlockBudget);

/**
 * POST /internal/v1/budget/transfer
 * Transfer budget from one user to another (atomic operation)
 *
 * Headers:
 *   - Idempotency-Key (required)
 *   - Authorization: Bearer <INTERNAL_SERVICE_TOKEN>
 *
 * Body:
 *   - from_user_id (required)
 *   - to_user_id (required)
 *   - amount (required, positive)
 *   - currency (optional, default 'VUSD')
 *   - operation_type_out (optional, default 'TRANSFER_OUT')
 *   - operation_type_in (optional, default 'TRANSFER_IN')
 *   - correlation_id (optional)
 *   - meta (optional, JSON object)
 *
 * Response includes:
 *   - from_log_id, to_log_id
 *   - from_balance_before, from_balance_after
 *   - to_balance_before, to_balance_after
 *   - correlation_id (for traceability)
 */
router.post('/transfer', transferBudget);

/**
 * POST /internal/v1/budget/adjust
 * Admin adjustment of user budget (credit or debit)
 *
 * Headers:
 *   - Idempotency-Key (required)
 *   - Authorization: Bearer <INTERNAL_SERVICE_TOKEN>
 *
 * Body:
 *   - user_id (required)
 *   - amount (required, positive)
 *   - direction (required, 'IN' or 'OUT')
 *   - currency (optional, default 'VUSD')
 *   - operation_type (optional, default 'ADJUSTMENT')
 *   - created_by (optional, admin identifier)
 *   - correlation_id (optional)
 *   - meta (optional, JSON object with ticket_id, reason, etc.)
 *
 * Response includes:
 *   - balance_before, balance_after
 *   - log_id
 */
router.post('/adjust', adjustBudget);

module.exports = router;

