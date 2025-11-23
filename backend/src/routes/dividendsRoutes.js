const express = require('express');
const {
  getDividends,
  createDividend,
  updateDividend,
  deleteDividend,
} = require('../controllers/dividendsController');

const router = express.Router();

// GET /api/dividends - list current user's dividends
router.get('/', getDividends);

// POST /api/dividends - create a new dividend for current user
router.post('/', createDividend);

// PUT /api/dividends/:id - update an existing dividend for current user
router.put('/:id', updateDividend);

// DELETE /api/dividends/:id - delete an existing dividend for current user
router.delete('/:id', deleteDividend);

module.exports = router;

