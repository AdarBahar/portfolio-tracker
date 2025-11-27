/**
 * Admin Promotion Routes
 * Admin endpoints for promotion management
 */

const express = require('express');
const router = express.Router();
const bonusController = require('../controllers/bonusController');

/**
 * POST /api/admin/promotions
 * Create a new promotion
 * Requires: Admin authentication
 */
router.post('/', bonusController.createPromotion);

/**
 * GET /api/admin/promotions
 * Get all promotions
 * Requires: Admin authentication
 */
router.get('/', bonusController.getPromotions);

module.exports = router;

