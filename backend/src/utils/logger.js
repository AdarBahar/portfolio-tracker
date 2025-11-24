/**
 * Logger Utility
 * Adds timestamps to console output for Passenger logs
 */

/**
 * Format timestamp in ISO 8601 format with local timezone
 * Example: 2025-11-24T15:30:45.123+02:00
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString();
}

/**
 * Log with timestamp
 */
function log(...args) {
  console.log(`[${getTimestamp()}]`, ...args);
}

/**
 * Info log with timestamp
 */
function info(...args) {
  console.info(`[${getTimestamp()}]`, ...args);
}

/**
 * Warn log with timestamp
 */
function warn(...args) {
  console.warn(`[${getTimestamp()}]`, ...args);
}

/**
 * Error log with timestamp
 */
function error(...args) {
  console.error(`[${getTimestamp()}]`, ...args);
}

/**
 * Debug log with timestamp (only in development)
 */
function debug(...args) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[${getTimestamp()}]`, ...args);
  }
}

module.exports = {
  log,
  info,
  warn,
  error,
  debug,
  getTimestamp,
};

