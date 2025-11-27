/**
 * Rake Routes
 * Admin endpoints for rake configuration and statistics
 */

const express = require('express');
const router = express.Router();
const rakeController = require('../controllers/rakeController');

/**
 * GET /api/admin/rake/config
 * Get active rake configuration
 */
router.get('/config', rakeController.getConfig);

/**
 * POST /api/admin/rake/config
 * Create or update rake configuration
 */
router.post('/config', rakeController.setConfig);

/**
 * GET /api/admin/rake/stats
 * Get rake statistics
 */
router.get('/stats', rakeController.getStats);

/**
 * GET /api/admin/rake/history
 * Get rake collection history
 */
router.get('/history', rakeController.getHistory);

module.exports = router;

