const express = require('express');
const {
  getHoldings,
  createHolding,
  updateHolding,
  deleteHolding,
} = require('../controllers/holdingsController');

const router = express.Router();

// GET /api/holdings - list current user's holdings
router.get('/', getHoldings);

// POST /api/holdings - create a new holding for current user
router.post('/', createHolding);

// PUT /api/holdings/:id - update an existing holding for current user
router.put('/:id', updateHolding);

// DELETE /api/holdings/:id - delete an existing holding for current user
router.delete('/:id', deleteHolding);

module.exports = router;

