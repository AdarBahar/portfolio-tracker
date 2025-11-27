/**
 * Rake Controller
 * Admin endpoints for rake configuration and statistics
 */

const db = require('../db');
const rakeService = require('../services/rakeService');
const logger = require('../utils/logger');

/**
 * Get active rake configuration
 * GET /api/admin/rake/config
 */
async function getConfig(req, res) {
  try {
    const config = await rakeService.getActiveRakeConfig();

    if (!config) {
      return res.status(404).json({ error: 'NO_ACTIVE_CONFIG' });
    }

    return res.status(200).json(config);
  } catch (err) {
    logger.error('[Rake] Error in getConfig:', err);
    return res.status(500).json({ error: 'CONFIG_ERROR', message: err.message });
  }
}

/**
 * Create or update rake configuration
 * POST /api/admin/rake/config
 */
async function setConfig(req, res) {
  try {
    const { name, description, fee_type, fee_value, min_pool, max_pool } = req.body;

    if (!name || !fee_type || fee_value === undefined) {
      return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    if (!['percentage', 'fixed', 'tiered'].includes(fee_type)) {
      return res.status(400).json({ error: 'INVALID_FEE_TYPE' });
    }

    // Deactivate all existing configs
    await db.execute(`UPDATE rake_config SET is_active = FALSE`);

    // Create new config
    const [result] = await db.execute(
      `INSERT INTO rake_config (name, description, fee_type, fee_value, min_pool, max_pool, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [name, description || null, fee_type, fee_value, min_pool || null, max_pool || null]
    );

    logger.log(`[Rake] New config created: ${name} (ID: ${result.insertId})`);

    return res.status(201).json({
      id: result.insertId,
      name,
      description,
      fee_type,
      fee_value,
      min_pool,
      max_pool,
      is_active: true
    });

  } catch (err) {
    logger.error('[Rake] Error in setConfig:', err);
    return res.status(500).json({ error: 'CONFIG_ERROR', message: err.message });
  }
}

/**
 * Get rake statistics
 * GET /api/admin/rake/stats
 */
async function getStats(req, res) {
  try {
    const { start_date, end_date, bull_pen_id } = req.query;

    const stats = await rakeService.getRakeStats({
      start_date,
      end_date,
      bull_pen_id
    });

    return res.status(200).json(stats);
  } catch (err) {
    logger.error('[Rake] Error in getStats:', err);
    return res.status(500).json({ error: 'STATS_ERROR', message: err.message });
  }
}

/**
 * Get rake collection history
 * GET /api/admin/rake/history
 */
async function getHistory(req, res) {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const [collections] = await db.execute(
      `SELECT rc.*, rc_config.name as config_name, bp.name as room_name
       FROM rake_collection rc
       JOIN rake_config rc_config ON rc.rake_config_id = rc_config.id
       JOIN bull_pens bp ON rc.bull_pen_id = bp.id
       ORDER BY rc.collected_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    return res.status(200).json(collections);
  } catch (err) {
    logger.error('[Rake] Error in getHistory:', err);
    return res.status(500).json({ error: 'HISTORY_ERROR', message: err.message });
  }
}

module.exports = {
  getConfig,
  setConfig,
  getStats,
  getHistory
};

