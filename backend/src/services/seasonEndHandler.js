/**
 * Season End Event Handler
 * Handles season.ended events and awards seasonal achievements
 */

const db = require('../db');
const seasonRankingService = require('./seasonRankingService');
const achievementsService = require('./achievementsService');
const logger = require('../utils/logger');

/**
 * Handle season end event
 * Aggregates season stats, computes scores, and awards seasonal achievements
 * @param {number} seasonId - Season ID
 * @returns {Promise<object>} {success, message}
 */
async function handleSeasonEnd(seasonId) {
  try {
    logger.log(`[SeasonEnd] Processing season ${seasonId} end event...`);

    // Step 1: Aggregate season stats
    const aggResult = await seasonRankingService.aggregateSeasonStats(seasonId);
    if (!aggResult.success) {
      logger.error(`[SeasonEnd] Failed to aggregate stats for season ${seasonId}:`, aggResult.message);
      return { success: false, message: aggResult.message };
    }
    logger.log(`[SeasonEnd] Aggregated stats for ${aggResult.aggregatedCount} users`);

    // Step 2: Compute season scores
    const scoreResult = await seasonRankingService.computeSeasonScores(seasonId);
    if (!scoreResult.success) {
      logger.error(`[SeasonEnd] Failed to compute scores for season ${seasonId}:`, scoreResult.message);
      return { success: false, message: scoreResult.message };
    }
    logger.log(`[SeasonEnd] Computed scores for ${scoreResult.scoredCount} users`);

    // Step 3: Get season leaderboard and award seasonal achievements
    const leaderboard = await seasonRankingService.getSeasonLeaderboard(seasonId, 1000, 0);
    if (!leaderboard || leaderboard.length === 0) {
      logger.warn(`[SeasonEnd] No users in season ${seasonId} leaderboard`);
      return { success: true, message: 'No users to award achievements' };
    }

    // Calculate top 10% and top 100 thresholds
    const totalUsers = leaderboard.length;
    const top10PercentCount = Math.ceil(totalUsers * 0.1);
    const top100Count = Math.min(100, totalUsers);

    let awardedCount = 0;

    // Award season_top_10_percent achievement
    for (let i = 0; i < top10PercentCount && i < leaderboard.length; i++) {
      const user = leaderboard[i];
      try {
        const result = await achievementsService.awardStars(
          user.user_id,
          'season_top_10_percent',
          200,
          { bullPenId: null, seasonId, source: 'achievement' }
        );
        if (result.success) {
          awardedCount++;
          logger.log(`[SeasonEnd] User ${user.user_id} awarded 200 stars for season_top_10_percent (rank ${user.rank})`);
        }
      } catch (err) {
        logger.warn(`[SeasonEnd] Error awarding season_top_10_percent to user ${user.user_id}:`, err);
      }
    }

    // Award season_top_100 achievement
    for (let i = 0; i < top100Count && i < leaderboard.length; i++) {
      const user = leaderboard[i];
      try {
        const result = await achievementsService.awardStars(
          user.user_id,
          'season_top_100',
          300,
          { bullPenId: null, seasonId, source: 'achievement' }
        );
        if (result.success) {
          awardedCount++;
          logger.log(`[SeasonEnd] User ${user.user_id} awarded 300 stars for season_top_100 (rank ${user.rank})`);
        }
      } catch (err) {
        logger.warn(`[SeasonEnd] Error awarding season_top_100 to user ${user.user_id}:`, err);
      }
    }

    logger.log(`[SeasonEnd] Season ${seasonId} processing complete. Awarded ${awardedCount} achievements.`);
    return { success: true, message: `Processed season ${seasonId}. Awarded ${awardedCount} achievements.` };
  } catch (error) {
    logger.error(`[SeasonEnd] Error handling season end for season ${seasonId}:`, error);
    return { success: false, message: error.message };
  }
}

module.exports = {
  handleSeasonEnd,
};

