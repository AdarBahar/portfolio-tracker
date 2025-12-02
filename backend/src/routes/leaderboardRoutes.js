const express = require('express');
const {
  getLeaderboard,
  createSnapshot,
  getLatestSnapshot,
  getSnapshotHistory
} = require('../controllers/leaderboardController');

const router = express.Router();

// GET /api/bull-pens/:id/leaderboard - Get current leaderboard
router.get('/:id/leaderboard', getLeaderboard);

// POST /api/bull-pens/:id/leaderboard/snapshot - Create snapshot
router.post('/:id/leaderboard/snapshot', createSnapshot);

// GET /api/bull-pens/:id/leaderboard/snapshot - Get latest snapshot
router.get('/:id/leaderboard/snapshot', getLatestSnapshot);

// GET /api/bull-pens/:id/leaderboard/history - Get snapshot history
router.get('/:id/leaderboard/history', getSnapshotHistory);

module.exports = router;

