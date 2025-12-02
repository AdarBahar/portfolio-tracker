/**
 * Payout Service
 * Handles payout calculations and distribution for Trade Room settlements
 */

const logger = require('../utils/logger');

/**
 * Calculate payout distribution for a room settlement
 * Supports multiple payout models: winner-take-all, proportional, tiered
 * @param {array} leaderboard - Sorted leaderboard entries
 * @param {number} totalPool - Total pool after rake
 * @param {string} model - Payout model: 'winner-take-all', 'proportional', 'tiered'
 * @returns {array} Array of {userId, rank, payout}
 */
function calculatePayouts(leaderboard, totalPool, model = 'winner-take-all') {
  const payouts = [];
  
  if (model === 'winner-take-all') {
    // Winner gets entire pool
    for (let i = 0; i < leaderboard.length; i++) {
      const entry = leaderboard[i];
      const payout = i === 0 ? totalPool : 0;
      payouts.push({
        userId: entry.user_id,
        rank: entry.rank,
        payout,
      });
    }
  } else if (model === 'proportional') {
    // Payout proportional to P&L
    const totalPnL = leaderboard.reduce((sum, e) => sum + Math.max(0, Number(e.pnl_abs)), 0);
    
    for (const entry of leaderboard) {
      const pnlAbs = Math.max(0, Number(entry.pnl_abs));
      const payout = totalPnL > 0 ? (pnlAbs / totalPnL) * totalPool : 0;
      
      payouts.push({
        userId: entry.user_id,
        rank: entry.rank,
        payout: Math.round(payout * 100) / 100,
      });
    }
  } else if (model === 'tiered') {
    // Tiered payout: top 3 get percentages, rest get refund
    const tierPercentages = {
      1: 0.50, // 50%
      2: 0.30, // 30%
      3: 0.20, // 20%
    };
    
    const refundPool = totalPool * 0.10; // 10% for refunds
    const tierPool = totalPool * 0.90; // 90% for tiers
    
    for (let i = 0; i < leaderboard.length; i++) {
      const entry = leaderboard[i];
      const rank = entry.rank;
      
      let payout = 0;
      
      if (rank <= 3 && tierPercentages[rank]) {
        payout = tierPool * tierPercentages[rank];
      } else {
        // Distribute refund pool equally among remaining players
        const remainingPlayers = Math.max(1, leaderboard.length - 3);
        payout = refundPool / remainingPlayers;
      }
      
      payouts.push({
        userId: entry.user_id,
        rank: rank,
        payout: Math.round(payout * 100) / 100,
      });
    }
  }
  
  return payouts;
}

/**
 * Validate payout distribution
 * @param {array} payouts - Array of payout objects
 * @param {number} totalPool - Expected total pool
 * @param {number} tolerance - Tolerance for rounding errors (default 0.01)
 * @returns {{valid: boolean, totalPayout: number, error?: string}}
 */
function validatePayouts(payouts, totalPool, tolerance = 0.01) {
  const totalPayout = payouts.reduce((sum, p) => sum + p.payout, 0);
  const difference = Math.abs(totalPayout - totalPool);
  
  if (difference > tolerance) {
    return {
      valid: false,
      totalPayout,
      error: `Payout total ${totalPayout} does not match pool ${totalPool} (diff: ${difference})`,
    };
  }
  
  return { valid: true, totalPayout };
}

/**
 * Adjust payouts to match exact pool total (handle rounding)
 * @param {array} payouts - Array of payout objects
 * @param {number} totalPool - Expected total pool
 * @returns {array} Adjusted payouts
 */
function adjustPayoutsForRounding(payouts, totalPool) {
  if (payouts.length === 0) return payouts;
  
  const totalPayout = payouts.reduce((sum, p) => sum + p.payout, 0);
  const difference = totalPool - totalPayout;
  
  if (Math.abs(difference) < 0.01) {
    return payouts; // No adjustment needed
  }
  
  // Add difference to first place winner
  const adjusted = [...payouts];
  adjusted[0].payout += difference;
  
  logger.info(`Adjusted payouts for rounding: added ${difference} to rank 1`);
  
  return adjusted;
}

/**
 * Get payout summary statistics
 * @param {array} payouts - Array of payout objects
 * @returns {object} Summary statistics
 */
function getPayoutSummary(payouts) {
  const totalPayout = payouts.reduce((sum, p) => sum + p.payout, 0);
  const maxPayout = Math.max(...payouts.map(p => p.payout));
  const minPayout = Math.min(...payouts.map(p => p.payout));
  const avgPayout = totalPayout / payouts.length;
  
  const winnersCount = payouts.filter(p => p.payout > 0).length;
  const losersCount = payouts.filter(p => p.payout === 0).length;
  
  return {
    totalPayout: Math.round(totalPayout * 100) / 100,
    maxPayout: Math.round(maxPayout * 100) / 100,
    minPayout: Math.round(minPayout * 100) / 100,
    avgPayout: Math.round(avgPayout * 100) / 100,
    winnersCount,
    losersCount,
    playerCount: payouts.length,
  };
}

module.exports = {
  calculatePayouts,
  validatePayouts,
  adjustPayoutsForRounding,
  getPayoutSummary,
};

