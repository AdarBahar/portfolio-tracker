const express = require('express');
const { listMyBullPens } = require('../controllers/bullPenMembershipsController');

const router = express.Router();

// /api/my/bull-pens
router.get('/bull-pens', listMyBullPens);

module.exports = router;

