/**
 * Polling Routes
 * Endpoints for clients to poll for updates when WebSocket is not available
 */

const express = require('express');
const { getRoomUpdates } = require('../controllers/pollingController');

const router = express.Router();

/**
 * GET /api/bull-pens/:id/updates
 * Get updates for a room since a specific timestamp
 * Query params:
 *   - since: ISO timestamp to get updates after (optional)
 */
router.get('/:id/updates', getRoomUpdates);

module.exports = router;

