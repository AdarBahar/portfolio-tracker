const express = require('express');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionsController');

const router = express.Router();

// GET /api/transactions - list current user's transactions
router.get('/', getTransactions);

// POST /api/transactions - create a new transaction for current user
router.post('/', createTransaction);

// PUT /api/transactions/:id - update an existing transaction for current user
router.put('/:id', updateTransaction);

// DELETE /api/transactions/:id - delete an existing transaction for current user
router.delete('/:id', deleteTransaction);

module.exports = router;

