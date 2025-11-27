/**
 * Bonus Routes
 * User and admin endpoints for bonuses and promotions
 */

const express = require('express');
const router = express.Router();
const bonusController = require('../controllers/bonusController');

/**
 * POST /api/v1/bonus/redeem
 * Redeem a promotion code
 * Requires: Authentication
 */
router.post('/redeem', bonusController.redeemPromotion);

/**
 * GET /api/v1/bonus/my-bonuses
 * Get user's redeemed bonuses
 * Requires: Authentication
 */
router.get('/my-bonuses', bonusController.getMyBonuses);

module.exports = router;

