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
 * Formats Error objects to include timestamps on all stack trace lines
 */
function error(...args) {
  const timestamp = `[${getTimestamp()}]`;

  // Separate error objects from other arguments
  const errors = [];
  const nonErrors = [];

  args.forEach(arg => {
    if (arg instanceof Error) {
      errors.push(arg);
    } else {
      nonErrors.push(arg);
    }
  });

  // Print non-error arguments first with timestamp
  if (nonErrors.length > 0) {
    console.error(timestamp, ...nonErrors);
  }

  // Print each error with timestamps on all stack lines
  errors.forEach(err => {
    const stack = err.stack || err.toString();
    const lines = stack.split('\n');
    lines.forEach(line => {
      console.error(`${timestamp} ${line}`);
    });
  });

  // If no arguments at all, just print timestamp
  if (args.length === 0) {
    console.error(timestamp);
  }
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

