const express = require('express');
const {
  listUsers,
  getUserLogs,
  updateUserAdminStatus,
  getUserDetail,
} = require('../controllers/adminController');

const router = express.Router();

// GET /api/admin/users - List all users
router.get('/users', listUsers);

// GET /api/admin/users/:id/detail - Get user detail with budget and trading rooms
router.get('/users/:id/detail', getUserDetail);

// GET /api/admin/users/:id/logs - Get user's audit logs
router.get('/users/:id/logs', getUserLogs);

// PATCH /api/admin/users/:id/admin - Update user admin status
router.patch('/users/:id/admin', updateUserAdminStatus);

module.exports = router;

