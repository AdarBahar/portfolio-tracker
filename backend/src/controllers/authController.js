const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db');
const { badRequest, unauthorized, internalError } = require('../utils/apiError');
const logger = require('../utils/logger');

const { GOOGLE_CLIENT_ID, JWT_SECRET } = process.env;

if (!GOOGLE_CLIENT_ID) {
  logger.warn('GOOGLE_CLIENT_ID is not set. Google auth will not work correctly.');
}

if (!JWT_SECRET) {
  logger.warn('JWT_SECRET is not set. Tokens cannot be signed securely.');
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID
  });

  return ticket.getPayload();
}

function buildUserResponse(dbUser) {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    profilePicture: dbUser.profile_picture || null,
    authProvider: dbUser.auth_provider,
    isDemo: !!dbUser.is_demo,
    isAdmin: !!dbUser.is_admin
  };
}

async function googleAuth(req, res) {
  const { credential } = req.body || {};

  if (!credential) {
    return badRequest(res, 'Missing Google credential');
  }

  let payload;
  try {
    payload = await verifyGoogleToken(credential);
  } catch (err) {
    logger.error('Google token verification failed:', err);
    return unauthorized(res, 'Invalid or expired Google token');
  }

  const googleId = payload.sub;
  const email = payload.email;
  const name = payload.name || email;
  const picture = payload.picture || null;

  if (!email) {
    return badRequest(res, 'Google token did not contain an email');
  }

  try {
    // Try to find existing user by google_id or email (exclude soft deleted)
    const [rows] = await db.execute(
      'SELECT id, email, name, auth_provider, is_demo, is_admin, profile_picture, status FROM users WHERE (google_id = ? OR email = ?) AND deleted_at IS NULL LIMIT 1',
      [googleId, email]
    );

    let dbUser;

    if (rows.length > 0) {
      dbUser = rows[0];

      // Check user status
      if (dbUser.status !== 'active') {
        logger.warn(`Login attempt for non-active user: ${email}, status: ${dbUser.status}`);
        return unauthorized(res, `Account is ${dbUser.status}. Please contact support.`);
      }

      // Update user with latest Google data
      await db.execute(
        'UPDATE users SET google_id = ?, name = ?, profile_picture = ?, auth_provider = ?, last_login = NOW() WHERE id = ?',
        [googleId, name, picture, 'google', dbUser.id]
      );
    } else {
      // Create new user with active status
      const [result] = await db.execute(
        'INSERT INTO users (email, name, auth_provider, google_id, profile_picture, is_demo, status, last_login) VALUES (?, ?, ?, ?, ?, FALSE, "active", NOW())',
        [email, name, 'google', googleId, picture]
      );

      dbUser = {
        id: result.insertId,
        email,
        name,
        auth_provider: 'google',
        is_demo: 0,
        is_admin: 0,
        profile_picture: picture,
        status: 'active'
      };
    }

    const tokenPayload = {
      id: dbUser.id,
      email: dbUser.email,
      authProvider: 'google',
      isDemo: !!dbUser.is_demo,
      isAdmin: !!dbUser.is_admin
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET || 'changeme-in-env', {
      expiresIn: '7d'
    });

    return res.json({
      user: buildUserResponse(dbUser),
      token
    });
  } catch (err) {
    logger.error('Database error during Google auth:', err);
    return internalError(res);
  }
}

module.exports = {
  googleAuth
};

