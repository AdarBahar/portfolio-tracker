/**
 * Bonus Service
 * Handles promotional bonuses and redemptions
 */

const db = require('../db');
const budgetService = require('./budgetService');
const { v4: uuid } = require('uuid');
const logger = require('../utils/logger');

/**
 * Get active promotion by code
 * @param {string} code - Promotion code
 * @returns {Promise<Object|null>}
 */
async function getPromotionByCode(code) {
  try {
    const [promotions] = await db.execute(
      `SELECT * FROM promotions 
       WHERE code = ? AND is_active = TRUE 
       AND start_date <= NOW() AND end_date >= NOW()
       LIMIT 1`,
      [code]
    );
    return promotions.length ? promotions[0] : null;
  } catch (err) {
    logger.error('[Bonus] Error fetching promotion:', err);
    return null;
  }
}

/**
 * Redeem a promotion for a user
 * @param {number} userId - User ID
 * @param {string} code - Promotion code
 * @returns {Promise<{success: boolean, amount?: number, error?: string}>}
 */
async function redeemPromotion(userId, code) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get promotion
    const [promotions] = await connection.execute(
      `SELECT * FROM promotions 
       WHERE code = ? AND is_active = TRUE 
       AND start_date <= NOW() AND end_date >= NOW()
       FOR UPDATE`,
      [code]
    );

    if (!promotions.length) {
      await connection.rollback();
      return { success: false, error: 'PROMOTION_NOT_FOUND' };
    }

    const promotion = promotions[0];

    // Check max uses
    if (promotion.max_uses && promotion.current_uses >= promotion.max_uses) {
      await connection.rollback();
      return { success: false, error: 'PROMOTION_EXHAUSTED' };
    }

    // Check if user already redeemed
    const [existing] = await connection.execute(
      `SELECT id FROM bonus_redemptions 
       WHERE user_id = ? AND promotion_id = ?`,
      [userId, promotion.id]
    );

    if (existing.length) {
      await connection.rollback();
      return { success: false, error: 'ALREADY_REDEEMED' };
    }

    // Check account age
    if (promotion.min_account_age_days > 0) {
      const [users] = await connection.execute(
        `SELECT DATEDIFF(NOW(), created_at) as age_days FROM users WHERE id = ?`,
        [userId]
      );

      if (users.length && users[0].age_days < promotion.min_account_age_days) {
        await connection.rollback();
        return { success: false, error: 'ACCOUNT_TOO_NEW' };
      }
    }

    // Create redemption record
    const idempotencyKey = `bonus-${userId}-${promotion.id}`;
    const correlationId = `promotion-${promotion.id}-redemption-${uuid()}`;

    const [redemption] = await connection.execute(
      `INSERT INTO bonus_redemptions (user_id, promotion_id, amount, idempotency_key, correlation_id)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, promotion.id, promotion.bonus_amount, idempotencyKey, correlationId]
    );

    // Credit user budget
    const creditResult = await budgetService.creditBudget(userId, promotion.bonus_amount, {
      operation_type: 'BONUS_REDEMPTION',
      promotion_id: promotion.id,
      correlation_id: correlationId,
      idempotency_key: idempotencyKey
    });

    if (creditResult.error) {
      await connection.rollback();
      return { success: false, error: creditResult.error };
    }

    // Increment promotion usage
    await connection.execute(
      `UPDATE promotions SET current_uses = current_uses + 1 WHERE id = ?`,
      [promotion.id]
    );

    await connection.commit();
    logger.log(`[Bonus] User ${userId} redeemed promotion ${code} for ${promotion.bonus_amount}`);
    return { success: true, amount: promotion.bonus_amount };

  } catch (err) {
    await connection.rollback();
    logger.error(`[Bonus] Error redeeming promotion for user ${userId}:`, err);
    return { success: false, error: err.message };
  } finally {
    connection.release();
  }
}

/**
 * Get user's redeemed bonuses
 * @param {number} userId - User ID
 * @returns {Promise<Array>}
 */
async function getUserBonuses(userId) {
  try {
    const [bonuses] = await db.execute(
      `SELECT br.*, p.code, p.name, p.bonus_type 
       FROM bonus_redemptions br
       JOIN promotions p ON br.promotion_id = p.id
       WHERE br.user_id = ?
       ORDER BY br.redeemed_at DESC`,
      [userId]
    );
    return bonuses;
  } catch (err) {
    logger.error('[Bonus] Error fetching user bonuses:', err);
    return [];
  }
}

module.exports = {
  getPromotionByCode,
  redeemPromotion,
  getUserBonuses
};

