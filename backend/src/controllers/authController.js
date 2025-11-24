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
    isDemo: !!dbUser.is_demo
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
    console.error('Google token verification failed:', err);
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
    // Try to find existing user by google_id or email
    const [rows] = await db.execute(
      'SELECT id, email, name, auth_provider, is_demo, profile_picture FROM users WHERE google_id = ? OR email = ? LIMIT 1',
      [googleId, email]
    );

    let dbUser;

    if (rows.length > 0) {
      dbUser = rows[0];

      // Update user with latest Google data
      await db.execute(
        'UPDATE users SET google_id = ?, name = ?, profile_picture = ?, auth_provider = ?, last_login = NOW() WHERE id = ?',
        [googleId, name, picture, 'google', dbUser.id]
      );
    } else {
      // Create new user
      const [result] = await db.execute(
        'INSERT INTO users (email, name, auth_provider, google_id, profile_picture, is_demo, last_login) VALUES (?, ?, ?, ?, ?, FALSE, NOW())',
        [email, name, 'google', googleId, picture]
      );

      dbUser = {
        id: result.insertId,
        email,
        name,
        auth_provider: 'google',
        is_demo: 0,
        profile_picture: picture
      };
    }

    const tokenPayload = {
      id: dbUser.id,
      email: dbUser.email,
      authProvider: 'google',
      isDemo: !!dbUser.is_demo
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET || 'changeme-in-env', {
      expiresIn: '7d'
    });

    return res.json({
      user: buildUserResponse(dbUser),
      token
    });
  } catch (err) {
    console.error('Database error during Google auth:', err);
    return internalError(res);
  }
}

module.exports = {
  googleAuth
};

