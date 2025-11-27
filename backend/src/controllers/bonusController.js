/**
 * Bonus Controller
 * Handles bonus and promotion endpoints
 */

const bonusService = require('../services/bonusService');
const db = require('../db');
const logger = require('../utils/logger');

/**
 * Redeem a promotion code
 * POST /api/v1/bonus/redeem
 */
async function redeemPromotion(req, res) {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'MISSING_CODE' });
    }

    const result = await bonusService.redeemPromotion(userId, code);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
        message: `Redemption failed: ${result.error}`
      });
    }

    return res.status(200).json({
      success: true,
      amount: result.amount,
      message: `Bonus of ${result.amount} VUSD credited to your account`
    });

  } catch (err) {
    logger.error('[Bonus] Error in redeemPromotion:', err);
    return res.status(500).json({
      error: 'REDEMPTION_ERROR',
      message: err.message
    });
  }
}

/**
 * Get user's redeemed bonuses
 * GET /api/v1/bonus/my-bonuses
 */
async function getMyBonuses(req, res) {
  try {
    const userId = req.user.id;
    const bonuses = await bonusService.getUserBonuses(userId);

    return res.status(200).json({
      bonuses,
      total_redeemed: bonuses.reduce((sum, b) => sum + parseFloat(b.amount), 0)
    });

  } catch (err) {
    logger.error('[Bonus] Error in getMyBonuses:', err);
    return res.status(500).json({
      error: 'FETCH_ERROR',
      message: err.message
    });
  }
}

/**
 * Admin: Create promotion
 * POST /api/admin/promotions
 */
async function createPromotion(req, res) {
  try {
    const { code, name, description, bonus_type, bonus_amount, max_uses, min_account_age_days, start_date, end_date } = req.body;

    if (!code || !name || !bonus_type || !bonus_amount || !start_date || !end_date) {
      return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    const [result] = await db.execute(
      `INSERT INTO promotions (code, name, description, bonus_type, bonus_amount, max_uses, min_account_age_days, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, name, description || null, bonus_type, bonus_amount, max_uses || null, min_account_age_days || 0, start_date, end_date]
    );

    logger.log(`[Bonus] Promotion created: ${code} (ID: ${result.insertId})`);

    return res.status(201).json({
      id: result.insertId,
      code,
      name,
      bonus_type,
      bonus_amount,
      message: 'Promotion created successfully'
    });

  } catch (err) {
    logger.error('[Bonus] Error in createPromotion:', err);
    return res.status(500).json({
      error: 'CREATE_ERROR',
      message: err.message
    });
  }
}

/**
 * Admin: Get all promotions
 * GET /api/admin/promotions
 */
async function getPromotions(req, res) {
  try {
    const [promotions] = await db.execute(
      `SELECT * FROM promotions ORDER BY created_at DESC`
    );

    return res.status(200).json(promotions);

  } catch (err) {
    logger.error('[Bonus] Error in getPromotions:', err);
    return res.status(500).json({
      error: 'FETCH_ERROR',
      message: err.message
    });
  }
}

module.exports = {
  redeemPromotion,
  getMyBonuses,
  createPromotion,
  getPromotions
};

