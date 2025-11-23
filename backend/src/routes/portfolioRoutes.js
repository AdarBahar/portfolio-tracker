const express = require('express');
const { getPortfolioAll } = require('../controllers/portfolioController');

const router = express.Router();

// GET /api/portfolio/all - full portfolio data for current user
router.get('/all', getPortfolioAll);

module.exports = router;

