/**
 * Achievement Rules Controller
 * Manages achievement rules (admin only)
 */

const db = require('../db');
const { badRequest, notFound, internalError } = require('../utils/apiError');
const logger = require('../utils/logger');
const auditLog = require('../utils/auditLog');

/**
 * List all achievement rules
 * GET /api/admin/achievement-rules
 */
async function listAchievementRules(req, res) {
  try {
    const [rules] = await db.execute(
      `SELECT 
        id, code, name, description, category, source, stars_reward, 
        is_repeatable, max_times, scope_type, is_active, ui_badge_code,
        created_at, updated_at
      FROM achievement_rules
      WHERE deleted_at IS NULL
      ORDER BY category, code`
    );

    return res.json({ rules });
  } catch (err) {
    logger.error('[AchievementRules] Error listing rules:', err);
    return internalError(res, 'Failed to list achievement rules');
  }
}

/**
 * Get a specific achievement rule
 * GET /api/admin/achievement-rules/:id
 */
async function getAchievementRule(req, res) {
  const ruleId = parseInt(req.params.id, 10);

  if (!ruleId) {
    return badRequest(res, 'Missing rule ID');
  }

  try {
    const [rules] = await db.execute(
      `SELECT * FROM achievement_rules WHERE id = ? AND deleted_at IS NULL`,
      [ruleId]
    );

    if (rules.length === 0) {
      return notFound(res, 'Achievement rule not found');
    }

    return res.json({ rule: rules[0] });
  } catch (err) {
    logger.error('[AchievementRules] Error fetching rule:', err);
    return internalError(res, 'Failed to fetch achievement rule');
  }
}

/**
 * Create a new achievement rule
 * POST /api/admin/achievement-rules
 */
async function createAchievementRule(req, res) {
  const adminId = req.user && req.user.id;
  const { code, name, description, category, source, stars_reward, is_repeatable, max_times, scope_type, ui_badge_code } = req.body;

  if (!code || !name || !category || !source || stars_reward === undefined || scope_type === undefined) {
    return badRequest(res, 'Missing required fields');
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO achievement_rules 
       (code, name, description, category, source, stars_reward, is_repeatable, max_times, scope_type, is_active, ui_badge_code, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, NOW(), NOW())`,
      [code, name, description || null, category, source, stars_reward, is_repeatable ? 1 : 0, max_times || null, scope_type, ui_badge_code || null]
    );

    await auditLog.log({
      userId: adminId,
      eventType: 'achievement_rule_created',
      eventCategory: 'admin',
      description: `Created achievement rule: ${code}`,
      newValues: { ruleId: result.insertId, code, name, category }
    });

    return res.status(201).json({
      success: true,
      message: 'Achievement rule created',
      ruleId: result.insertId,
    });
  } catch (err) {
    logger.error('[AchievementRules] Error creating rule:', err);
    return internalError(res, 'Failed to create achievement rule');
  }
}

/**
 * Update an achievement rule
 * PATCH /api/admin/achievement-rules/:id
 */
async function updateAchievementRule(req, res) {
  const ruleId = parseInt(req.params.id, 10);
  const adminId = req.user && req.user.id;
  const { name, description, stars_reward, is_repeatable, max_times, is_active, ui_badge_code } = req.body;

  if (!ruleId) {
    return badRequest(res, 'Missing rule ID');
  }

  try {
    // Verify rule exists
    const [rules] = await db.execute(
      `SELECT code FROM achievement_rules WHERE id = ? AND deleted_at IS NULL`,
      [ruleId]
    );

    if (rules.length === 0) {
      return notFound(res, 'Achievement rule not found');
    }

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (stars_reward !== undefined) { updates.push('stars_reward = ?'); values.push(stars_reward); }
    if (is_repeatable !== undefined) { updates.push('is_repeatable = ?'); values.push(is_repeatable ? 1 : 0); }
    if (max_times !== undefined) { updates.push('max_times = ?'); values.push(max_times); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }
    if (ui_badge_code !== undefined) { updates.push('ui_badge_code = ?'); values.push(ui_badge_code); }

    if (updates.length === 0) {
      return badRequest(res, 'No fields to update');
    }

    updates.push('updated_at = NOW()');
    values.push(ruleId);

    await db.execute(
      `UPDATE achievement_rules SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    await auditLog.log({
      userId: adminId,
      eventType: 'achievement_rule_updated',
      eventCategory: 'admin',
      description: `Updated achievement rule: ${rules[0].code}`,
      newValues: { ruleId, updatedFields: Object.keys(req.body) }
    });

    return res.json({ success: true, message: 'Achievement rule updated' });
  } catch (err) {
    logger.error('[AchievementRules] Error updating rule:', err);
    return internalError(res, 'Failed to update achievement rule');
  }
}

module.exports = {
  listAchievementRules,
  getAchievementRule,
  createAchievementRule,
  updateAchievementRule,
};

