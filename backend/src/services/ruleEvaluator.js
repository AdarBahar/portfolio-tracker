/**
 * Rule Evaluator Service
 * Evaluates achievement rules and determines if conditions are met
 */

const db = require('../db');

class RuleEvaluator {
  /**
   * Evaluate if user qualifies for first room join achievement
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if user has no other room memberships
   */
  async evaluateFirstRoomJoin(userId) {
    try {
      const query = `
        SELECT COUNT(*) as room_count
        FROM bull_pen_memberships
        WHERE user_id = ? AND status IN ('active', 'completed')
      `;
      const results = await db.query(query, [userId]);
      // True if this is the first room (count should be 1 after join)
      return results[0]?.room_count === 1;
    } catch (error) {
      console.error('Error evaluating first room join:', error);
      return false;
    }
  }

  /**
   * Evaluate if user qualifies for room first place achievement
   * @param {number} userId - User ID
   * @param {number} bullPenId - Room ID
   * @param {number} rank - User's rank in the room
   * @returns {Promise<boolean>} True if rank is 1
   */
  async evaluateRoomFirstPlace(userId, bullPenId, rank) {
    return rank === 1;
  }

  /**
   * Evaluate if user qualifies for 3 straight wins achievement
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if user has 3 consecutive wins
   */
  async evaluateThreeStraightWins(userId) {
    try {
      const query = `
        SELECT COUNT(*) as win_count
        FROM leaderboard_snapshots
        WHERE user_id = ?
          AND rank = 1
          AND snapshot_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY snapshot_at DESC
        LIMIT 3
      `;
      const results = await db.query(query, [userId]);
      return results[0]?.win_count >= 3;
    } catch (error) {
      console.error('Error evaluating three straight wins:', error);
      return false;
    }
  }

  /**
   * Evaluate if user qualifies for rooms played milestone
   * @param {number} userId - User ID
   * @param {number} requiredRooms - Number of rooms required
   * @returns {Promise<boolean>} True if user has played required rooms
   */
  async evaluateRoomsPlayedMilestone(userId, requiredRooms) {
    try {
      const query = `
        SELECT COUNT(DISTINCT bull_pen_id) as room_count
        FROM bull_pen_memberships
        WHERE user_id = ? AND status IN ('active', 'completed')
      `;
      const results = await db.query(query, [userId]);
      return results[0]?.room_count >= requiredRooms;
    } catch (error) {
      console.error('Error evaluating rooms played milestone:', error);
      return false;
    }
  }

  /**
   * Evaluate if user qualifies for season top percentile achievement
   * @param {number} userId - User ID
   * @param {number} seasonId - Season ID
   * @param {number} percentile - Percentile threshold (e.g., 10 for top 10%)
   * @returns {Promise<boolean>} True if user is in top percentile
   */
  async evaluateSeasonTopPercentile(userId, seasonId, percentile) {
    try {
      // Get user's rank in season
      const userRankQuery = `
        SELECT ROW_NUMBER() OVER (ORDER BY score DESC) as rank
        FROM season_user_stats
        WHERE season_id = ?
      `;
      const userRankResults = await db.query(userRankQuery, [seasonId]);
      const userRank = userRankResults.find(r => r.user_id === userId)?.rank;

      if (!userRank) return false;

      // Get total users in season
      const totalQuery = `
        SELECT COUNT(*) as total_users
        FROM season_user_stats
        WHERE season_id = ?
      `;
      const totalResults = await db.query(totalQuery, [seasonId]);
      const totalUsers = totalResults[0]?.total_users || 0;

      // Calculate percentile threshold
      const threshold = Math.ceil((percentile / 100) * totalUsers);
      return userRank <= threshold;
    } catch (error) {
      console.error('Error evaluating season top percentile:', error);
      return false;
    }
  }

  /**
   * Evaluate if user qualifies for activity streak achievement
   * @param {number} userId - User ID
   * @param {number} consecutiveDays - Number of consecutive days required
   * @returns {Promise<boolean>} True if user has activity streak
   */
  async evaluateActivityStreak(userId, consecutiveDays) {
    try {
      const query = `
        SELECT COUNT(DISTINCT DATE(created_at)) as activity_days
        FROM user_audit_log
        WHERE user_id = ?
          AND event_type IN ('login', 'trade_executed')
          AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      `;
      const results = await db.query(query, [userId, consecutiveDays]);
      return results[0]?.activity_days >= consecutiveDays;
    } catch (error) {
      console.error('Error evaluating activity streak:', error);
      return false;
    }
  }

  /**
   * Evaluate if user qualifies for campaign achievement
   * @param {number} userId - User ID
   * @param {string} campaignCode - Campaign code
   * @param {string} requiredAction - Required action
   * @returns {Promise<boolean>} True if user completed campaign action
   */
  async evaluateCampaignAction(userId, campaignCode, requiredAction) {
    try {
      const query = `
        SELECT COUNT(*) as action_count
        FROM user_audit_log
        WHERE user_id = ?
          AND event_type = 'campaign_action'
          AND JSON_EXTRACT(meta, '$.campaign_code') = ?
          AND JSON_EXTRACT(meta, '$.action') = ?
      `;
      const results = await db.query(query, [userId, campaignCode, requiredAction]);
      return results[0]?.action_count > 0;
    } catch (error) {
      console.error('Error evaluating campaign action:', error);
      return false;
    }
  }

  /**
   * Create evaluation context from domain event
   * @param {object} event - Domain event {type, userId, bullPenId, seasonId, ...}
   * @returns {object} Context object for rule evaluation
   */
  createRuleContext(event) {
    return {
      eventType: event.type,
      userId: event.userId,
      bullPenId: event.bullPenId || null,
      seasonId: event.seasonId || null,
      rank: event.rank || null,
      pnl: event.pnl || null,
      pnlPct: event.pnlPct || null,
      timestamp: new Date(),
      ...event
    };
  }
}

module.exports = new RuleEvaluator();

