const db = require('../db');
const { internalError, notFound, badRequest } = require('../utils/apiError');
const logger = require('../utils/logger');

/**
 * GET /api/users/profile
 * Get authenticated user's profile and stats
 */
async function getUserProfile(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return badRequest(res, 'User not authenticated');
    }

    // Get user profile
    const [userRows] = await db.execute(
      `SELECT 
        id,
        name,
        email,
        picture,
        username,
        tier,
        lifetime_stars AS lifetimeStars,
        net_profit AS netProfit,
        created_at AS createdAt
      FROM users 
      WHERE id = ? AND deleted_at IS NULL`,
      [userId]
    );

    if (userRows.length === 0) {
      return notFound(res, 'User not found');
    }

    const user = userRows[0];

    // Get user's room participation stats
    const [roomStatsRows] = await db.execute(
      `SELECT
        COUNT(DISTINCT bp.id) as totalRoomsPlayed,
        SUM(CASE WHEN ls.rank = 1 THEN 1 ELSE 0 END) as totalWins,
        COALESCE(SUM(ls.stars), 0) as totalStars
      FROM bull_pen_memberships bpm
      JOIN bull_pens bp ON bpm.bull_pen_id = bp.id
      LEFT JOIN leaderboard_snapshots ls ON bp.id = ls.bull_pen_id AND bpm.user_id = ls.user_id
      WHERE bpm.user_id = ? AND bpm.deleted_at IS NULL AND bp.deleted_at IS NULL`,
      [userId]
    );

    const roomStats = roomStatsRows[0] || {
      totalRoomsPlayed: 0,
      totalWins: 0,
      totalStars: 0
    };

    // Get latest leaderboard rank from most recent room
    const [rankRows] = await db.execute(
      `SELECT ls.rank
      FROM leaderboard_snapshots ls
      WHERE ls.user_id = ?
      ORDER BY ls.snapshot_at DESC
      LIMIT 1`,
      [userId]
    );

    const globalRank = rankRows.length > 0 ? rankRows[0].rank : null;

    // Calculate win rate
    const winRate = roomStats.totalRoomsPlayed > 0
      ? Math.round((roomStats.totalWins / roomStats.totalRoomsPlayed) * 100)
      : 0;

    const stats = {
      globalRank,
      winRate,
      totalRoomsPlayed: parseInt(roomStats.totalRoomsPlayed) || 0,
      totalWins: parseInt(roomStats.totalWins) || 0,
      winStreak: 0 // TODO: Calculate from recent wins
    };

    // Check if user is new (no rooms played)
    const isNewUser = stats.totalRoomsPlayed === 0;

    return res.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        username: user.username,
        tier: user.tier,
        lifetimeStars: user.lifetimeStars || 0,
        netProfit: parseFloat(user.netProfit) || 0,
        isNewUser,
        createdAt: user.createdAt
      },
      stats: {
        globalRank: stats.globalRank,
        winRate: stats.winRate || 0,
        totalRoomsPlayed: stats.totalRoomsPlayed || 0,
        totalWins: stats.totalWins || 0,
        winStreak: stats.winStreak || 0
      }
    });
  } catch (err) {
    logger.error('[User] Error fetching profile:', err);
    return internalError(res, 'Failed to fetch user profile');
  }
}

module.exports = {
  getUserProfile,
};

