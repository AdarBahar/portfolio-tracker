/**
 * Cancellation Routes
 * Internal service-to-service endpoints for room cancellation and member removal
 */

const express = require('express');
const router = express.Router();
const cancellationController = require('../controllers/cancellationController');
const { requireInternalService } = require('../utils/internalServiceMiddleware');

/**
 * POST /internal/v1/cancellation/rooms/:id
 * Cancel a room and refund all members
 * Requires: Internal Service Token
 */
router.post(
  '/rooms/:id',
  requireInternalService,
  cancellationController.cancelRoom
);

/**
 * POST /internal/v1/cancellation/rooms/:id/members/:userId
 * Kick a member from a room
 * Requires: Internal Service Token
 */
router.post(
  '/rooms/:id/members/:userId',
  requireInternalService,
  cancellationController.kickMember
);

module.exports = router;

