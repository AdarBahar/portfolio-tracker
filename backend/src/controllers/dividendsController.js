const db = require('../db');
const { badRequest, internalError, notFound } = require('../utils/apiError');
const logger = require('../utils/logger');

async function getDividends(req, res) {
  try {
    const userId = req.user && req.user.id;
    const [rows] = await db.execute(
      'SELECT id, ticker, amount, shares, date, created_at AS createdAt FROM dividends WHERE user_id = ? AND deleted_at IS NULL ORDER BY date DESC, id DESC',
      [userId]
    );

    return res.json({ dividends: rows });
  } catch (err) {
    logger.error('Error fetching dividends:', err);
    return internalError(res, 'Failed to fetch dividends');
  }
}

async function createDividend(req, res) {
  const userId = req.user && req.user.id;
  const {
    ticker,
    amount,
    shares,
    date,
  } = req.body || {};

  if (!ticker || !amount || !shares || !date) {
    return badRequest(res, 'Missing required fields: ticker, amount, shares, date');
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO dividends (user_id, ticker, amount, shares, date) VALUES (?, ?, ?, ?, ?)',
      [
        userId,
        ticker,
        amount,
        shares,
        date,
      ]
    );

    const [rows] = await db.execute(
      'SELECT id, ticker, amount, shares, date, created_at AS createdAt FROM dividends WHERE id = ? AND deleted_at IS NULL',
      [result.insertId]
    );

    return res.status(201).json({ dividend: rows[0] });
  } catch (err) {
    logger.error('Error creating dividend:', err);
    return internalError(res, 'Failed to create dividend');
  }
}

async function updateDividend(req, res) {
  const userId = req.user && req.user.id;
  const dividendId = req.params.id;
  const {
    ticker,
    amount,
    shares,
    date,
  } = req.body || {};

  if (!dividendId) {
    return badRequest(res, 'Missing dividend id');
  }

  if (!ticker || !amount || !shares || !date) {
    return badRequest(res, 'Missing required fields: ticker, amount, shares, date');
  }

  try {
    const [result] = await db.execute(
      'UPDATE dividends SET ticker = ?, amount = ?, shares = ?, date = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [
        ticker,
        amount,
        shares,
        date,
        dividendId,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return notFound(res, 'Dividend not found');
    }

    const [rows] = await db.execute(
      'SELECT id, ticker, amount, shares, date, created_at AS createdAt FROM dividends WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [dividendId, userId]
    );

    return res.json({ dividend: rows[0] });
  } catch (err) {
    logger.error('Error updating dividend:', err);
    return internalError(res, 'Failed to update dividend');
  }
}

async function deleteDividend(req, res) {
  const userId = req.user && req.user.id;
  const dividendId = req.params.id;

  if (!dividendId) {
    return badRequest(res, 'Missing dividend id');
  }

  try {
    // Soft delete: set deleted_at timestamp
    const [result] = await db.execute(
      'UPDATE dividends SET deleted_at = NOW() WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [dividendId, userId]
    );

    if (result.affectedRows === 0) {
      return notFound(res, 'Dividend not found');
    }

    return res.status(204).send();
  } catch (err) {
    logger.error('Error deleting dividend:', err);
    return internalError(res, 'Failed to delete dividend');
  }
}

module.exports = {
  getDividends,
  createDividend,
  updateDividend,
  deleteDividend,
};

