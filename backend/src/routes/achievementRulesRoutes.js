const express = require('express');
const {
  listAchievementRules,
  getAchievementRule,
  createAchievementRule,
  updateAchievementRule,
} = require('../controllers/achievementRulesController');

const router = express.Router();

// GET /api/admin/achievement-rules - List all rules
router.get('/', listAchievementRules);

// GET /api/admin/achievement-rules/:id - Get specific rule
router.get('/:id', getAchievementRule);

// POST /api/admin/achievement-rules - Create new rule
router.post('/', createAchievementRule);

// PATCH /api/admin/achievement-rules/:id - Update rule
router.patch('/:id', updateAchievementRule);

module.exports = router;

