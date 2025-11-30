const express = require('express');
const { getUserProfile } = require('../controllers/userController');

const router = express.Router();

/**
 * GET /api/users/profile
 * Get authenticated user's profile and stats
 * Requires: Authentication
 */
router.get('/profile', getUserProfile);

module.exports = router;

