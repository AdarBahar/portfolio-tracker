const express = require('express');
const { googleAuth } = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/google
router.post('/google', googleAuth);

module.exports = router;

