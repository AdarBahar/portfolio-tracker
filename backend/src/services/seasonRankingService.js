/**
 * Season Ranking Service
 * Handles season-level aggregation, normalization, and scoring
 */

const db = require('../db');
const rankingService = require('./rankingService');

class SeasonRankingService {
  /**
   * Aggregate season stats for all users in a season
   * @param {number} seasonId - Season ID
   * @returns {Promise<object>} {success, aggregatedCount, message}
   */
  async aggregateSeasonStats(seasonId) {
    try {
      // Get all users who participated in rooms in this season
      const query = `
        SELECT 
          bpm.user_id,
          SUM(COALESCE(ls.pnl_abs, 0)) as total_pnl_abs,
          SUM(COALESCE(ls.pnl_pct, 0)) / COUNT(DISTINCT bp.id) as avg_pnl_pct,
          SUM(COALESCE(ue.stars_delta, 0)) as total_stars,
          SUM(COALESCE(bp.initial_capital, 0)) as total_initial_equity,
          MAX(COALESCE(ls.portfolio_value, 0)) as max_portfolio_value
        FROM bull_pen_memberships bpm
        JOIN bull_pens bp ON bpm.bull_pen_id = bp.id
        LEFT JOIN leaderboard_snapshots ls ON bpm.user_id = ls.user_id AND ls.bull_pen_id = bp.id
        LEFT JOIN user_star_events ue ON bpm.user_id = ue.user_id AND ue.season_id = ? AND ue.deleted_at IS NULL
        WHERE bp.season_id = ? AND bpm.status IN ('active', 'completed')
        GROUP BY bpm.user_id
      `;

      const stats = await db.query(query, [seasonId, seasonId]);

      // Insert or update season_user_stats
      for (const stat of stats) {
        const pnlPct = stat.avg_pnl_pct || 0;
        const pnlAbs = stat.total_pnl_abs || 0;

        await db.query(
          `INSERT INTO season_user_stats 
           (user_id, season_id, total_initial_equity, total_portfolio_value, pnl_abs, pnl_pct, stars)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           total_initial_equity = VALUES(total_initial_equity),
           total_portfolio_value = VALUES(total_portfolio_value),
           pnl_abs = VALUES(pnl_abs),
           pnl_pct = VALUES(pnl_pct),
           stars = VALUES(stars),
           updated_at = NOW()`,
          [
            stat.user_id,
            seasonId,
            stat.total_initial_equity,
            stat.max_portfolio_value,
            pnlAbs,
            pnlPct,
            stat.total_stars
          ]
        );
      }

      return { success: true, aggregatedCount: stats.length, message: `Aggregated stats for ${stats.length} users` };
    } catch (error) {
      console.error('Error aggregating season stats:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Normalize season metrics and compute scores
   * @param {number} seasonId - Season ID
   * @returns {Promise<object>} {success, scoredCount, message}
   */
  async normalizeSeasonMetrics(seasonId) {
    try {
      // Get all season stats
      const stats = await db.query(
        `SELECT user_id, pnl_pct, pnl_abs, stars FROM season_user_stats WHERE season_id = ?`,
        [seasonId]
      );

      if (stats.length === 0) {
        return { success: true, scoredCount: 0, message: 'No users in season' };
      }

      // Find min/max for normalization
      const returns = stats.map(s => s.pnl_pct);
      const pnls = stats.map(s => s.pnl_abs);
      const starsList = stats.map(s => s.stars);

      const minReturn = Math.min(...returns);
      const maxReturn = Math.max(...returns);
      const minPnl = Math.min(...pnls);
      const maxPnl = Math.max(...pnls);
      const minStars = Math.min(...starsList);
      const maxStars = Math.max(...starsList);

      // Compute scores
      const weights = rankingService.getDefaultWeights();
      for (const stat of stats) {
        const normReturn = rankingService.normalizeMetric(stat.pnl_pct, minReturn, maxReturn);
        const normPnl = rankingService.normalizeMetric(stat.pnl_abs, minPnl, maxPnl);
        const normStars = rankingService.normalizeMetric(stat.stars, minStars, maxStars);
        const score = rankingService.computeCompositeScore(normReturn, normPnl, normStars, weights);

        await db.query(
          `UPDATE season_user_stats SET score = ? WHERE user_id = ? AND season_id = ?`,
          [score, stat.user_id, seasonId]
        );
      }

      return { success: true, scoredCount: stats.length, message: `Computed scores for ${stats.length} users` };
    } catch (error) {
      console.error('Error normalizing season metrics:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get season leaderboard with rankings
   * @param {number} seasonId - Season ID
   * @param {number} limit - Max results
   * @param {number} offset - Pagination offset
   * @returns {Promise<array>} Leaderboard entries with ranks
   */
  async getSeasonLeaderboard(seasonId, limit = 100, offset = 0) {
    try {
      const query = `
        SELECT 
          ROW_NUMBER() OVER (ORDER BY score DESC) as rank,
          user_id,
          total_initial_equity,
          total_portfolio_value,
          pnl_abs,
          pnl_pct,
          stars,
          score,
          updated_at
        FROM season_user_stats
        WHERE season_id = ?
        ORDER BY score DESC
        LIMIT ? OFFSET ?
      `;

      return await db.query(query, [seasonId, limit, offset]);
    } catch (error) {
      console.error('Error getting season leaderboard:', error);
      return [];
    }
  }

  /**
   * Update season_user_stats (wrapper for aggregation + normalization)
   * @param {number} seasonId - Season ID
   * @returns {Promise<object>} {success, message}
   */
  async updateSeasonUserStats(seasonId) {
    try {
      const aggResult = await this.aggregateSeasonStats(seasonId);
      if (!aggResult.success) return aggResult;

      const normResult = await this.normalizeSeasonMetrics(seasonId);
      return normResult;
    } catch (error) {
      console.error('Error updating season user stats:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Compute season scores (alias for normalizeSeasonMetrics)
   * @param {number} seasonId - Season ID
   * @returns {Promise<object>} {success, scoredCount, message}
   */
  async computeSeasonScores(seasonId) {
    return this.normalizeSeasonMetrics(seasonId);
  }
}

module.exports = new SeasonRankingService();

