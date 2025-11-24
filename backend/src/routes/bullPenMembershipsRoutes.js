const express = require('express');
const {
  joinBullPen,
  listBullPenMembers,
  approveMembership,
  rejectMembership,
  leaveBullPen,
} = require('../controllers/bullPenMembershipsController');

const router = express.Router();

// /api/bull-pens/:id/join
router.post('/:id/join', joinBullPen);

// /api/bull-pens/:id/members
router.get('/:id/members', listBullPenMembers);

// /api/bull-pens/:id/members/:membershipId/approve
router.post('/:id/members/:membershipId/approve', approveMembership);

// /api/bull-pens/:id/members/:membershipId/reject
router.post('/:id/members/:membershipId/reject', rejectMembership);

// /api/bull-pens/:id/leave
router.post('/:id/leave', leaveBullPen);

module.exports = router;

