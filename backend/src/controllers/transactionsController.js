const db = require('../db');
const { badRequest, internalError, notFound } = require('../utils/apiError');
const logger = require('../utils/logger');
const auditLog = require('../utils/auditLog');

const VALID_TYPES = new Set(['buy', 'sell', 'dividend']);

async function getTransactions(req, res) {
  try {
    const userId = req.user && req.user.id;
    const [rows] = await db.execute(
      'SELECT id, type, ticker, shares, price, fees, date, created_at AS createdAt FROM transactions WHERE user_id = ? AND deleted_at IS NULL ORDER BY date DESC, id DESC',
      [userId]
    );

    return res.json({ transactions: rows });
  } catch (err) {
    logger.error('Error fetching transactions:', err);
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
      'SELECT id, type, ticker, shares, price, fees, date, created_at AS createdAt FROM transactions WHERE id = ? AND deleted_at IS NULL',
      [result.insertId]
    );

    // Log transaction creation
    await auditLog.log({
      userId,
      eventType: 'transaction_created',
      eventCategory: 'data',
      description: `Created ${type} transaction for ${ticker}`,
      req,
      newValues: { type, ticker, shares, price, fees, date }
    });

    return res.status(201).json({ transaction: rows[0] });
  } catch (err) {
    logger.error('Error creating transaction:', err);
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
    // Fetch old values before update
    const [oldRows] = await db.execute(
      'SELECT type, ticker, shares, price, fees, date FROM transactions WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [transactionId, userId]
    );

    if (oldRows.length === 0) {
      return notFound(res, 'Transaction not found');
    }

    const oldTransaction = oldRows[0];

    const [result] = await db.execute(
      'UPDATE transactions SET type = ?, ticker = ?, shares = ?, price = ?, fees = ?, date = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
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
      'SELECT id, type, ticker, shares, price, fees, date, created_at AS createdAt FROM transactions WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [transactionId, userId]
    );

    // Log transaction update
    await auditLog.log({
      userId,
      eventType: 'transaction_updated',
      eventCategory: 'data',
      description: `Updated ${type} transaction for ${ticker}`,
      req,
      previousValues: oldTransaction,
      newValues: { type, ticker, shares, price, fees, date }
    });

    return res.json({ transaction: rows[0] });
  } catch (err) {
    logger.error('Error updating transaction:', err);
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
    // Fetch transaction info before deletion
    const [oldRows] = await db.execute(
      'SELECT type, ticker, shares, price, fees, date FROM transactions WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [transactionId, userId]
    );

    if (oldRows.length === 0) {
      return notFound(res, 'Transaction not found');
    }

    const oldTransaction = oldRows[0];

    // Soft delete: set deleted_at timestamp
    const [result] = await db.execute(
      'UPDATE transactions SET deleted_at = NOW() WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [transactionId, userId]
    );

    if (result.affectedRows === 0) {
      return notFound(res, 'Transaction not found');
    }

    // Log transaction deletion
    await auditLog.log({
      userId,
      eventType: 'transaction_deleted',
      eventCategory: 'data',
      description: `Deleted ${oldTransaction.type} transaction for ${oldTransaction.ticker}`,
      req,
      previousValues: oldTransaction
    });

    return res.status(204).send();
  } catch (err) {
    logger.error('Error deleting transaction:', err);
    return internalError(res, 'Failed to delete transaction');
  }
}

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};

