const jwt = require('jsonwebtoken');
const { unauthorized } = require('./apiError');
const logger = require('./logger');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-in-env';

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (!token || scheme.toLowerCase() !== 'bearer') {
    return unauthorized(res, 'Missing or invalid Authorization header');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    logger.error('JWT verification failed:', err.message || err);
    return unauthorized(res, 'Invalid or expired token');
  }
}

module.exports = {
  authenticateToken,
};

