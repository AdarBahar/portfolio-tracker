const { forbidden } = require('./apiError');
const logger = require('./logger');

/**
 * Middleware to require admin privileges
 * Must be used after authenticateToken middleware
 * 
 * Usage:
 *   const { authenticateToken } = require('./utils/authMiddleware');
 *   const { requireAdmin } = require('./utils/adminMiddleware');
 *   
 *   app.get('/api/admin/users', authenticateToken, requireAdmin, getUsersList);
 */
function requireAdmin(req, res, next) {
  // Check if user is authenticated (should be set by authenticateToken middleware)
  if (!req.user) {
    logger.warn('[Admin] Unauthenticated request to admin endpoint');
    return forbidden(res, 'Authentication required');
  }

  // Check if user has admin privileges
  if (!req.user.isAdmin) {
    logger.warn(`[Admin] Non-admin user ${req.user.id} (${req.user.email}) attempted to access admin endpoint`);
    return forbidden(res, 'Admin privileges required');
  }

  // User is authenticated and is an admin
  logger.log(`[Admin] Admin user ${req.user.id} (${req.user.email}) accessing admin endpoint`);
  next();
}

/**
 * Middleware to optionally check admin status
 * Adds isAdmin flag to request but doesn't block non-admins
 * Useful for endpoints that have different behavior for admins
 * 
 * Usage:
 *   const { authenticateToken } = require('./utils/authMiddleware');
 *   const { checkAdmin } = require('./utils/adminMiddleware');
 *   
 *   app.get('/api/users/profile', authenticateToken, checkAdmin, getProfile);
 *   
 *   // In controller:
 *   if (req.isAdmin) {
 *     // Show additional admin-only fields
 *   }
 */
function checkAdmin(req, res, next) {
  // Set isAdmin flag based on user data
  req.isAdmin = !!(req.user && req.user.isAdmin);
  next();
}

module.exports = {
  requireAdmin,
  checkAdmin,
};

