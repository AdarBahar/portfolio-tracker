/**
 * Settlement Routes
 * Internal service-to-service endpoints for room settlement
 */

const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlementController');
const { requireInternalService } = require('../utils/internalServiceMiddleware');

/**
 * POST /internal/v1/settlement/rooms/:id
 * Manually trigger settlement for a room
 * Requires: Internal Service Token
 */
router.post(
  '/rooms/:id',
  requireInternalService,
  settlementController.settleRoom
);

module.exports = router;

