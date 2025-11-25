const db = require('../db');
const logger = require('./logger');

/**
 * Audit Log Utility
 * Centralized utility for writing user audit logs to the database
 * 
 * Usage:
 *   const auditLog = require('../utils/auditLog');
 *   
 *   await auditLog.log({
 *     userId: req.user.id,
 *     eventType: 'login_success',
 *     eventCategory: 'authentication',
 *     description: 'User logged in successfully',
 *     ipAddress: req.ip,
 *     userAgent: req.headers['user-agent'],
 *     newValues: { provider: 'google' }
 *   });
 */

/**
 * Extract IP address from Express request
 * Handles proxies and load balancers (X-Forwarded-For, X-Real-IP)
 * 
 * @param {Object} req - Express request object
 * @returns {string} IP address (IPv4 or IPv6)
 */
function extractIpAddress(req) {
  // Check X-Forwarded-For header (proxy/load balancer)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
    // Take the first one (original client IP)
    return forwardedFor.split(',')[0].trim();
  }

  // Check X-Real-IP header (nginx proxy)
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp.trim();
  }

  // Fall back to req.ip (Express default)
  // Note: req.ip may be ::1 for localhost IPv6
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

/**
 * Extract user agent from Express request
 * 
 * @param {Object} req - Express request object
 * @returns {string} User agent string
 */
function extractUserAgent(req) {
  return req.headers['user-agent'] || 'unknown';
}

/**
 * Write an audit log entry to the database
 * 
 * @param {Object} options - Audit log options
 * @param {number} options.userId - User ID (required)
 * @param {string} options.eventType - Event type (required, e.g., 'login_success', 'admin_privilege_granted')
 * @param {string} options.eventCategory - Event category (required, e.g., 'authentication', 'admin', 'profile')
 * @param {string} options.description - Human-readable description (optional)
 * @param {string} options.ipAddress - IP address (optional, will be extracted from req if not provided)
 * @param {string} options.userAgent - User agent (optional, will be extracted from req if not provided)
 * @param {Object} options.previousValues - Previous values before change (optional, will be JSON stringified)
 * @param {Object} options.newValues - New values after change (optional, will be JSON stringified)
 * @param {Object} options.req - Express request object (optional, used to extract IP and user agent if not provided)
 * @returns {Promise<void>}
 */
async function log(options) {
  const {
    userId,
    eventType,
    eventCategory,
    description = null,
    ipAddress = null,
    userAgent = null,
    previousValues = null,
    newValues = null,
    req = null
  } = options;

  // Validate required fields
  if (!userId) {
    logger.error('[AuditLog] Missing required field: userId');
    return; // Don't throw - graceful degradation
  }

  if (!eventType) {
    logger.error('[AuditLog] Missing required field: eventType');
    return;
  }

  if (!eventCategory) {
    logger.error('[AuditLog] Missing required field: eventCategory');
    return;
  }

  // Extract IP and user agent from request if not provided
  const finalIpAddress = ipAddress || (req ? extractIpAddress(req) : null);
  const finalUserAgent = userAgent || (req ? extractUserAgent(req) : null);

  // Stringify JSON fields
  const previousValuesJson = previousValues ? JSON.stringify(previousValues) : null;
  const newValuesJson = newValues ? JSON.stringify(newValues) : null;

  try {
    await db.execute(
      `INSERT INTO user_audit_log 
        (user_id, event_type, event_category, description, ip_address, user_agent, previous_values, new_values) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        eventType,
        eventCategory,
        description,
        finalIpAddress,
        finalUserAgent,
        previousValuesJson,
        newValuesJson
      ]
    );

    logger.log(`[AuditLog] Logged event: ${eventType} for user ${userId}`);
  } catch (err) {
    // Log error but don't throw - audit logging should never crash the app
    logger.error('[AuditLog] Failed to write audit log:', err);
  }
}

module.exports = {
  log,
  extractIpAddress,
  extractUserAgent
};

