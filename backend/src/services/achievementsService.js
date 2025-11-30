/**
 * Achievements Service
 * Handles star awards, idempotency checks, and achievement evaluation
 */

const db = require('../db');
const auditLog = require('../utils/auditLog');

class AchievementsService {
  /**
   * Award stars to a user
   * @param {number} userId - User ID
   * @param {string} reasonCode - Achievement reason code
   * @param {number} starsDelta - Number of stars to award
   * @param {object} context - Context object {bullPenId, seasonId, source, meta}
   * @returns {Promise<object>} Result {success, starId, totalStars, message}
   */
  async awardStars(userId, reasonCode, starsDelta, context = {}) {
    try {
      const { bullPenId = null, seasonId = null, source = 'achievement', meta = {} } = context;

      // Validate inputs
      if (!userId || !reasonCode || !starsDelta || starsDelta <= 0) {
        return { success: false, message: 'Invalid parameters' };
      }

      // Check idempotency
      const existing = await this.checkIdempotency(userId, reasonCode, bullPenId, seasonId);
      if (existing) {
        return { success: false, message: 'Stars already awarded for this achievement', starId: existing.id };
      }

      // Insert star event
      const result = await db.execute(
        `INSERT INTO user_star_events
         (user_id, bull_pen_id, season_id, source, reason_code, stars_delta, meta, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [userId, bullPenId, seasonId, source, reasonCode, starsDelta, JSON.stringify(meta)]
      );
      const [insertResult] = result;

      const starId = insertResult.insertId;

      // Get total stars for user
      const totalStars = await this.getAggregatedStars(userId, 'lifetime');

      // Log to audit trail
      await auditLog.log(userId, 'star_awarded', 'achievement', {
        description: `Earned ${starsDelta} stars for ${reasonCode}`,
        new_values: { stars_awarded: starsDelta, reason_code: reasonCode, total_lifetime_stars: totalStars }
      });

      return { success: true, starId, totalStars, message: `Awarded ${starsDelta} stars` };
    } catch (error) {
      console.error('Error awarding stars:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Check if stars have already been awarded for this achievement
   * @param {number} userId - User ID
   * @param {string} reasonCode - Achievement reason code
   * @param {number} bullPenId - Room ID (nullable)
   * @param {number} seasonId - Season ID (nullable)
   * @returns {Promise<object|null>} Existing star event or null
   */
  async checkIdempotency(userId, reasonCode, bullPenId = null, seasonId = null) {
    try {
      const query = `
        SELECT id, stars_delta, created_at
        FROM user_star_events
        WHERE user_id = ?
          AND reason_code = ?
          AND COALESCE(bull_pen_id, 0) = COALESCE(?, 0)
          AND COALESCE(season_id, 0) = COALESCE(?, 0)
          AND deleted_at IS NULL
        LIMIT 1
      `;
      const results = await db.query(query, [userId, reasonCode, bullPenId, seasonId]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error checking idempotency:', error);
      return null;
    }
  }

  /**
   * Get aggregated stars for a user in a specific scope
   * @param {number} userId - User ID
   * @param {string} scope - 'lifetime', 'room', or 'season'
   * @param {number} bullPenId - Room ID (required if scope='room')
   * @param {number} seasonId - Season ID (required if scope='season')
   * @returns {Promise<number>} Total stars
   */
  async getAggregatedStars(userId, scope = 'lifetime', bullPenId = null, seasonId = null) {
    try {
      let query = `
        SELECT COALESCE(SUM(stars_delta), 0) as total_stars
        FROM user_star_events
        WHERE user_id = ? AND deleted_at IS NULL
      `;
      const params = [userId];

      if (scope === 'room' && bullPenId) {
        query += ` AND bull_pen_id = ?`;
        params.push(bullPenId);
      } else if (scope === 'season' && seasonId) {
        query += ` AND season_id = ?`;
        params.push(seasonId);
      }
      // For 'lifetime', no additional filters

      const results = await db.query(query, params);
      return results[0]?.total_stars || 0;
    } catch (error) {
      console.error('Error getting aggregated stars:', error);
      return 0;
    }
  }

  /**
   * Get star events for a user
   * @param {number} userId - User ID
   * @param {object} filters - {bullPenId, seasonId, reasonCode, limit, offset}
   * @returns {Promise<array>} Star events
   */
  async getStarEvents(userId, filters = {}) {
    try {
      const { bullPenId = null, seasonId = null, reasonCode = null, limit = 50, offset = 0 } = filters;

      let query = `
        SELECT id, user_id, bull_pen_id, season_id, source, reason_code, 
               stars_delta, meta, created_at
        FROM user_star_events
        WHERE user_id = ? AND deleted_at IS NULL
      `;
      const params = [userId];

      if (bullPenId) {
        query += ` AND bull_pen_id = ?`;
        params.push(bullPenId);
      }
      if (seasonId) {
        query += ` AND season_id = ?`;
        params.push(seasonId);
      }
      if (reasonCode) {
        query += ` AND reason_code = ?`;
        params.push(reasonCode);
      }

      query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      return await db.query(query, params);
    } catch (error) {
      console.error('Error getting star events:', error);
      return [];
    }
  }
}

module.exports = new AchievementsService();

