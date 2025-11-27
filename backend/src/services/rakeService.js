/**
 * Rake Service
 * Handles house fee calculation and collection
 */

const db = require('../db');
const logger = require('../utils/logger');

/**
 * Get active rake configuration
 * @returns {Promise<Object|null>}
 */
async function getActiveRakeConfig() {
  try {
    const [configs] = await db.execute(
      `SELECT * FROM rake_config WHERE is_active = TRUE LIMIT 1`
    );
    return configs.length ? configs[0] : null;
  } catch (err) {
    logger.error('[Rake] Error fetching active config:', err);
    return null;
  }
}

/**
 * Calculate rake amount based on pool size and config
 * @param {number} poolSize - Total pool size
 * @param {Object} config - Rake configuration
 * @returns {number} Rake amount
 */
function calculateRake(poolSize, config) {
  if (!config) return 0;

  const { fee_type, fee_value, min_pool, max_pool } = config;

  // Check pool size constraints
  if (min_pool && poolSize < min_pool) return 0;
  if (max_pool && poolSize > max_pool) return 0;

  let rake = 0;

  if (fee_type === 'percentage') {
    // Percentage-based rake
    rake = (poolSize * fee_value) / 100;
  } else if (fee_type === 'fixed') {
    // Fixed amount rake
    rake = fee_value;
  } else if (fee_type === 'tiered') {
    // Tiered rake (fee_value is base, scales with pool)
    rake = (poolSize * fee_value) / 100;
  }

  // Round to 2 decimal places
  return Math.round(rake * 100) / 100;
}

/**
 * Collect rake from a room settlement
 * @param {number} bullPenId - Room ID
 * @param {number} poolSize - Total pool size before rake
 * @returns {Promise<{success: boolean, rake_amount: number, config_id?: number, error?: string}>}
 */
async function collectRake(bullPenId, poolSize) {
  try {
    const config = await getActiveRakeConfig();

    if (!config) {
      logger.log(`[Rake] No active rake config for room ${bullPenId}`);
      return { success: true, rake_amount: 0 };
    }

    const rakeAmount = calculateRake(poolSize, config);

    if (rakeAmount <= 0) {
      logger.log(`[Rake] No rake collected for room ${bullPenId} (pool: ${poolSize})`);
      return { success: true, rake_amount: 0, config_id: config.id };
    }

    // Record rake collection
    await db.execute(
      `INSERT INTO rake_collection (bull_pen_id, rake_config_id, amount, pool_size)
       VALUES (?, ?, ?, ?)`,
      [bullPenId, config.id, rakeAmount, poolSize]
    );

    logger.log(`[Rake] Collected ${rakeAmount} from room ${bullPenId} (pool: ${poolSize})`);
    return { success: true, rake_amount: rakeAmount, config_id: config.id };

  } catch (err) {
    logger.error(`[Rake] Error collecting rake for room ${bullPenId}:`, err);
    return { success: false, rake_amount: 0, error: err.message };
  }
}

/**
 * Get rake statistics
 * @param {Object} filters - Optional filters {start_date, end_date, bull_pen_id}
 * @returns {Promise<{total_collected: number, count: number, average: number}>}
 */
async function getRakeStats(filters = {}) {
  try {
    let query = `SELECT SUM(amount) as total, COUNT(*) as count FROM rake_collection WHERE 1=1`;
    const params = [];

    if (filters.start_date) {
      query += ` AND collected_at >= ?`;
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ` AND collected_at <= ?`;
      params.push(filters.end_date);
    }

    if (filters.bull_pen_id) {
      query += ` AND bull_pen_id = ?`;
      params.push(filters.bull_pen_id);
    }

    const [results] = await db.execute(query, params);
    const row = results[0];

    return {
      total_collected: row.total || 0,
      count: row.count || 0,
      average: row.count > 0 ? (row.total / row.count) : 0
    };
  } catch (err) {
    logger.error('[Rake] Error fetching rake stats:', err);
    return { total_collected: 0, count: 0, average: 0 };
  }
}

module.exports = {
  getActiveRakeConfig,
  calculateRake,
  collectRake,
  getRakeStats
};

