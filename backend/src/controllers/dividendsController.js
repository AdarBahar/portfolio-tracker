const db = require('../db');
const { badRequest, internalError, notFound } = require('../utils/apiError');
const logger = require('../utils/logger');
const auditLog = require('../utils/auditLog');

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

    // Log dividend creation
    await auditLog.log({
      userId,
      eventType: 'dividend_created',
      eventCategory: 'data',
      description: `Created dividend for ${ticker}`,
      req,
      newValues: { ticker, amount, shares, date }
    });

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
    // Fetch old values before update
    const [oldRows] = await db.execute(
      'SELECT ticker, amount, shares, date FROM dividends WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [dividendId, userId]
    );

    if (oldRows.length === 0) {
      return notFound(res, 'Dividend not found');
    }

    const oldDividend = oldRows[0];

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

    // Log dividend update
    await auditLog.log({
      userId,
      eventType: 'dividend_updated',
      eventCategory: 'data',
      description: `Updated dividend for ${ticker}`,
      req,
      previousValues: oldDividend,
      newValues: { ticker, amount, shares, date }
    });

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
    // Fetch dividend info before deletion
    const [oldRows] = await db.execute(
      'SELECT ticker, amount, shares, date FROM dividends WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [dividendId, userId]
    );

    if (oldRows.length === 0) {
      return notFound(res, 'Dividend not found');
    }

    const oldDividend = oldRows[0];

    // Soft delete: set deleted_at timestamp
    const [result] = await db.execute(
      'UPDATE dividends SET deleted_at = NOW() WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [dividendId, userId]
    );

    if (result.affectedRows === 0) {
      return notFound(res, 'Dividend not found');
    }

    // Log dividend deletion
    await auditLog.log({
      userId,
      eventType: 'dividend_deleted',
      eventCategory: 'data',
      description: `Deleted dividend for ${oldDividend.ticker}`,
      req,
      previousValues: oldDividend
    });

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

