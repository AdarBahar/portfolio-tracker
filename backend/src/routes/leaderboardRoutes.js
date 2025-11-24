const express = require('express');
const { getLeaderboard } = require('../controllers/leaderboardController');

const router = express.Router();

// GET /api/bull-pens/:id/leaderboard
router.get('/:id/leaderboard', getLeaderboard);

module.exports = router;

