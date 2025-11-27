const { forbidden } = require('./apiError');
const logger = require('./logger');

/**
 * Middleware to authenticate internal service-to-service requests
 * Uses INTERNAL_SERVICE_TOKEN environment variable
 * 
 * Usage:
 *   const { requireInternalService } = require('./utils/internalServiceMiddleware');
 *   app.use('/internal/v1/budget', requireInternalService, budgetRoutes);
 */

const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'change-me-in-env';

function requireInternalService(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (!token || scheme.toLowerCase() !== 'bearer') {
    logger.warn('[Internal] Missing or invalid Authorization header');
    return forbidden(res, 'Missing or invalid Authorization header');
  }

  if (token !== INTERNAL_SERVICE_TOKEN) {
    logger.warn('[Internal] Invalid service token');
    return forbidden(res, 'Invalid service token');
  }

  // Mark request as internal service
  req.isInternalService = true;
  return next();
}

module.exports = {
  requireInternalService
};

