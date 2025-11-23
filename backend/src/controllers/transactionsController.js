const db = require('../db');
const { badRequest, internalError, notFound } = require('../utils/apiError');

const VALID_TYPES = new Set(['buy', 'sell', 'dividend']);

async function getTransactions(req, res) {
  try {
    const userId = req.user && req.user.id;
    const [rows] = await db.execute(
      'SELECT id, type, ticker, shares, price, fees, date, created_at AS createdAt FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC',
      [userId]
    );

    return res.json({ transactions: rows });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    return internalError(res, 'Failed to fetch transactions');
  }
}

async function createTransaction(req, res) {
  const userId = req.user && req.user.id;
  const {
    type,
    ticker,
    shares,
    price,
    fees = 0,
    date,
  } = req.body || {};

  if (!type || !VALID_TYPES.has(type)) {
    return badRequest(res, 'Invalid or missing type. Expected one of: buy, sell, dividend');
  }

  if (!ticker || !shares || (!price && price !== 0) || !date) {
    return badRequest(res, 'Missing required fields: ticker, shares, price, date');
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO transactions (user_id, type, ticker, shares, price, fees, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        type,
        ticker,
        shares,
        price,
        fees,
        date,
      ]
    );

    const [rows] = await db.execute(
      'SELECT id, type, ticker, shares, price, fees, date, created_at AS createdAt FROM transactions WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({ transaction: rows[0] });
  } catch (err) {
    console.error('Error creating transaction:', err);
    return internalError(res, 'Failed to create transaction');
  }
}

async function updateTransaction(req, res) {
  const userId = req.user && req.user.id;
  const transactionId = req.params.id;
  const {
    type,
    ticker,
    shares,
    price,
    fees = 0,
    date,
  } = req.body || {};

  if (!transactionId) {
    return badRequest(res, 'Missing transaction id');
  }

  if (!type || !VALID_TYPES.has(type)) {
    return badRequest(res, 'Invalid or missing type. Expected one of: buy, sell, dividend');
  }

  if (!ticker || !shares || (!price && price !== 0) || !date) {
    return badRequest(res, 'Missing required fields: ticker, shares, price, date');
  }

  try {
    const [result] = await db.execute(
      'UPDATE transactions SET type = ?, ticker = ?, shares = ?, price = ?, fees = ?, date = ? WHERE id = ? AND user_id = ?',
      [
        type,
        ticker,
        shares,
        price,
        fees,
        date,
        transactionId,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return notFound(res, 'Transaction not found');
    }

    const [rows] = await db.execute(
      'SELECT id, type, ticker, shares, price, fees, date, created_at AS createdAt FROM transactions WHERE id = ? AND user_id = ?',
      [transactionId, userId]
    );

    return res.json({ transaction: rows[0] });
  } catch (err) {
    console.error('Error updating transaction:', err);
    return internalError(res, 'Failed to update transaction');
  }
}

async function deleteTransaction(req, res) {
  const userId = req.user && req.user.id;
  const transactionId = req.params.id;

  if (!transactionId) {
    return badRequest(res, 'Missing transaction id');
  }

  try {
    const [result] = await db.execute(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [transactionId, userId]
    );

    if (result.affectedRows === 0) {
      return notFound(res, 'Transaction not found');
    }

    return res.status(204).send();
  } catch (err) {
    console.error('Error deleting transaction:', err);
    return internalError(res, 'Failed to delete transaction');
  }
}

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};

