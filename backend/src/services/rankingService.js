/**
 * Ranking Service
 * Handles normalization, composite scoring, and tie-breaking for room-level rankings
 */

const db = require('../db');
const achievementsService = require('./achievementsService');

class RankingService {
  /**
   * Normalize a metric to [0, 1] range
   * @param {number} value - Value to normalize
   * @param {number} min - Minimum value in cohort
   * @param {number} max - Maximum value in cohort
   * @returns {number} Normalized value [0, 1]
   */
  normalizeMetric(value, min, max) {
    if (max === min) {
      return 0.5; // Default when all values are equal
    }
    return (value - min) / (max - min);
  }

  /**
   * Compute composite score from normalized metrics
   * @param {number} normReturn - Normalized return percentage
   * @param {number} normPnl - Normalized P&L
   * @param {number} normStars - Normalized stars
   * @param {object} weights - {w_return, w_pnl, w_stars}
   * @returns {number} Composite score
   */
  computeCompositeScore(normReturn, normPnl, normStars, weights = {}) {
    const { w_return = 0.5, w_pnl = 0.2, w_stars = 0.3 } = weights;
    return w_return * normReturn + w_pnl * normPnl + w_stars * normStars;
  }

  /**
   * Get default weights for composite scoring
   * @returns {object} Default weights
   */
  getDefaultWeights() {
    return {
      w_return: 0.5,  // Performance efficiency
      w_pnl: 0.2,     // Absolute profit/size
      w_stars: 0.3    // Engagement/achievements
    };
  }

  /**
   * Calculate room scores for all members
   * @param {number} bullPenId - Room ID
   * @returns {Promise<array>} Array of {userId, score, normReturn, normPnl, normStars}
   */
  async calculateRoomScores(bullPenId) {
    try {
      // Get all members with their metrics
      const query = `
        SELECT 
          bpm.user_id,
          COALESCE(ls.pnl_pct, 0) as pnl_pct,
          COALESCE(ls.pnl_abs, 0) as pnl_abs,
          COALESCE(ue.total_stars, 0) as room_stars
        FROM bull_pen_memberships bpm
        LEFT JOIN leaderboard_snapshots ls ON bpm.user_id = ls.user_id AND ls.bull_pen_id = ?
        LEFT JOIN (
          SELECT user_id, SUM(stars_delta) as total_stars
          FROM user_star_events
          WHERE bull_pen_id = ? AND deleted_at IS NULL
          GROUP BY user_id
        ) ue ON bpm.user_id = ue.user_id
        WHERE bpm.bull_pen_id = ? AND bpm.status IN ('active', 'completed')
      `;

      const members = await db.query(query, [bullPenId, bullPenId, bullPenId]);

      if (members.length === 0) return [];

      // Find min/max for normalization
      const returns = members.map(m => m.pnl_pct);
      const pnls = members.map(m => m.pnl_abs);
      const stars = members.map(m => m.room_stars);

      const minReturn = Math.min(...returns);
      const maxReturn = Math.max(...returns);
      const minPnl = Math.min(...pnls);
      const maxPnl = Math.max(...pnls);
      const minStars = Math.min(...stars);
      const maxStars = Math.max(...stars);

      // Normalize and compute scores
      const weights = this.getDefaultWeights();
      const scores = members.map(member => {
        const normReturn = this.normalizeMetric(member.pnl_pct, minReturn, maxReturn);
        const normPnl = this.normalizeMetric(member.pnl_abs, minPnl, maxPnl);
        const normStars = this.normalizeMetric(member.room_stars, minStars, maxStars);
        const score = this.computeCompositeScore(normReturn, normPnl, normStars, weights);

        return {
          userId: member.user_id,
          score,
          normReturn,
          normPnl,
          normStars,
          pnlPct: member.pnl_pct,
          pnlAbs: member.pnl_abs,
          roomStars: member.room_stars
        };
      });

      return scores;
    } catch (error) {
      console.error('Error calculating room scores:', error);
      return [];
    }
  }

  /**
   * Apply tie-breakers to leaderboard
   * @param {array} leaderboard - Array of {userId, score, ...}
   * @returns {array} Sorted leaderboard with ranks
   */
  applyTieBreakers(leaderboard) {
    // Sort by: score DESC → pnlPct DESC → pnlAbs DESC → roomStars DESC → tradeCount DESC → accountAge ASC
    const sorted = leaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.pnlPct !== a.pnlPct) return b.pnlPct - a.pnlPct;
      if (b.pnlAbs !== a.pnlAbs) return b.pnlAbs - a.pnlAbs;
      if (b.roomStars !== a.roomStars) return b.roomStars - a.roomStars;
      if (b.tradeCount !== a.tradeCount) return b.tradeCount - a.tradeCount;
      return a.accountAge - b.accountAge; // Earlier account = lower age = higher rank
    });

    // Assign ranks
    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }
}

module.exports = new RankingService();

