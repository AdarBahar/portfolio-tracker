/**
 * Reconciliation Job
 * Verifies settlement integrity and audit trail consistency
 */

const db = require('../db');
const logger = require('../utils/logger');

/**
 * Reconciliation job - runs periodically to verify data integrity
 */
async function reconciliationJob() {
  logger.log('[Reconciliation] Starting reconciliation job');

  try {
    const results = {
      timestamp: new Date(),
      checks: {},
      issues: []
    };

    // Check 1: Verify settled rooms have correct payouts
    results.checks.settlement_integrity = await checkSettlementIntegrity();
    if (results.checks.settlement_integrity.issues.length > 0) {
      results.issues.push(...results.checks.settlement_integrity.issues);
    }

    // Check 2: Verify rake was collected for settled rooms
    results.checks.rake_collection = await checkRakeCollection();
    if (results.checks.rake_collection.issues.length > 0) {
      results.issues.push(...results.checks.rake_collection.issues);
    }

    // Check 3: Verify budget logs match room events
    results.checks.budget_logs = await checkBudgetLogs();
    if (results.checks.budget_logs.issues.length > 0) {
      results.issues.push(...results.checks.budget_logs.issues);
    }

    // Check 4: Verify bonus redemptions
    results.checks.bonus_redemptions = await checkBonusRedemptions();
    if (results.checks.bonus_redemptions.issues.length > 0) {
      results.issues.push(...results.checks.bonus_redemptions.issues);
    }

    // Log results
    if (results.issues.length === 0) {
      logger.log('[Reconciliation] ✓ All checks passed');
    } else {
      logger.warn(`[Reconciliation] ⚠ Found ${results.issues.length} issues:`, results.issues);
    }

    return results;

  } catch (err) {
    logger.error('[Reconciliation] Error during reconciliation:', err);
    throw err;
  }
}

/**
 * Check settlement integrity
 */
async function checkSettlementIntegrity() {
  const issues = [];

  try {
    // Find settled rooms without settlement logs
    const [settledRooms] = await db.execute(
      `SELECT bp.id, bp.name FROM bull_pens bp
       WHERE bp.settlement_status = 'completed'
       AND NOT EXISTS (
         SELECT 1 FROM budget_logs bl
         WHERE bl.correlation_id LIKE CONCAT('room-', bp.id, '-settlement-%')
       )
       LIMIT 10`
    );

    if (settledRooms.length > 0) {
      issues.push({
        type: 'MISSING_SETTLEMENT_LOGS',
        count: settledRooms.length,
        rooms: settledRooms.map(r => r.id)
      });
    }

    return { issues, checked: settledRooms.length };

  } catch (err) {
    logger.error('[Reconciliation] Error checking settlement integrity:', err);
    return { issues: [{ type: 'CHECK_ERROR', error: err.message }], checked: 0 };
  }
}

/**
 * Check rake collection
 */
async function checkRakeCollection() {
  const issues = [];

  try {
    // Find settled rooms without rake collection
    const [settledRooms] = await db.execute(
      `SELECT bp.id FROM bull_pens bp
       WHERE bp.settlement_status = 'completed'
       AND NOT EXISTS (
         SELECT 1 FROM rake_collection rc
         WHERE rc.bull_pen_id = bp.id
       )
       LIMIT 10`
    );

    if (settledRooms.length > 0) {
      issues.push({
        type: 'MISSING_RAKE_COLLECTION',
        count: settledRooms.length,
        rooms: settledRooms.map(r => f.id)
      });
    }

    return { issues, checked: settledRooms.length };

  } catch (err) {
    logger.error('[Reconciliation] Error checking rake collection:', err);
    return { issues: [{ type: 'CHECK_ERROR', error: err.message }], checked: 0 };
  }
}

/**
 * Check budget logs consistency
 */
async function checkBudgetLogs() {
  const issues = [];

  try {
    // Find budget logs with missing correlation IDs
    const [missingCorrelation] = await db.execute(
      `SELECT COUNT(*) as count FROM budget_logs
       WHERE operation_type IN ('ROOM_SETTLEMENT_WIN', 'ROOM_SETTLEMENT_LOSS', 'ROOM_SETTLEMENT_BREAKEVEN')
       AND correlation_id IS NULL
       LIMIT 10`
    );

    if (missingCorrelation[0].count > 0) {
      issues.push({
        type: 'MISSING_CORRELATION_ID',
        count: missingCorrelation[0].count
      });
    }

    // Find budget logs with invalid amounts
    const [invalidAmounts] = await db.execute(
      `SELECT COUNT(*) as count FROM budget_logs
       WHERE amount <= 0
       LIMIT 10`
    );

    if (invalidAmounts[0].count > 0) {
      issues.push({
        type: 'INVALID_AMOUNT',
        count: invalidAmounts[0].count
      });
    }

    return { issues, checked: missingCorrelation[0].count + invalidAmounts[0].count };

  } catch (err) {
    logger.error('[Reconciliation] Error checking budget logs:', err);
    return { issues: [{ type: 'CHECK_ERROR', error: err.message }], checked: 0 };
  }
}

/**
 * Check bonus redemptions
 */
async function checkBonusRedemptions() {
  const issues = [];

  try {
    // Find bonus redemptions without budget logs
    const [missingLogs] = await db.execute(
      `SELECT COUNT(*) as count FROM bonus_redemptions br
       WHERE NOT EXISTS (
         SELECT 1 FROM budget_logs bl
         WHERE bl.correlation_id = br.correlation_id
       )
       LIMIT 10`
    );

    if (missingLogs[0].count > 0) {
      issues.push({
        type: 'MISSING_BONUS_BUDGET_LOG',
        count: missingLogs[0].count
      });
    }

    return { issues, checked: missingLogs[0].count };

  } catch (err) {
    logger.error('[Reconciliation] Error checking bonus redemptions:', err);
    return { issues: [{ type: 'CHECK_ERROR', error: err.message }], checked: 0 };
  }
}

module.exports = {
  reconciliationJob,
  checkSettlementIntegrity,
  checkRakeCollection,
  checkBudgetLogs,
  checkBonusRedemptions
};

