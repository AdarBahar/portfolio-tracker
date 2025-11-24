const db = require('../db');
const { badRequest, internalError, notFound } = require('../utils/apiError');
const logger = require('../utils/logger');

async function getHoldings(req, res) {
  try {
    const userId = req.user && req.user.id;
    const [rows] = await db.execute(
      'SELECT id, ticker, name, shares, purchase_price AS purchasePrice, purchase_date AS purchaseDate, sector, asset_class AS assetClass, created_at AS createdAt, updated_at AS updatedAt FROM holdings WHERE user_id = ? ORDER BY ticker',
      [userId]
    );
    return res.json({ holdings: rows });
  } catch (err) {
    logger.error('Error fetching holdings:', err);
    return internalError(res, 'Failed to fetch holdings');
  }
}

async function createHolding(req, res) {
  const userId = req.user && req.user.id;
  const {
    ticker,
    name,
    shares,
    purchasePrice,
    purchaseDate,
    sector,
    assetClass,
  } = req.body || {};

  if (!ticker || !name || !shares || !purchasePrice || !purchaseDate) {
    return badRequest(res, 'Missing required fields: ticker, name, shares, purchasePrice, purchaseDate');
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO holdings (user_id, ticker, name, shares, purchase_price, purchase_date, sector, asset_class) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        ticker,
        name,
        shares,
        purchasePrice,
        purchaseDate,
        sector || null,
        assetClass || null,
      ]
    );

    const [rows] = await db.execute(
      'SELECT id, ticker, name, shares, purchase_price AS purchasePrice, purchase_date AS purchaseDate, sector, asset_class AS assetClass, created_at AS createdAt, updated_at AS updatedAt FROM holdings WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({ holding: rows[0] });
  } catch (err) {
    logger.error('Error creating holding:', err);
    return internalError(res, 'Failed to create holding');
  }
}

async function updateHolding(req, res) {
  const userId = req.user && req.user.id;
  const holdingId = req.params.id;
  const {
    ticker,
    name,
    shares,
    purchasePrice,
    purchaseDate,
    sector,
    assetClass,
  } = req.body || {};

  if (!holdingId) {
    return badRequest(res, 'Missing holding id');
  }

  if (!ticker || !name || !shares || !purchasePrice || !purchaseDate) {
    return badRequest(res, 'Missing required fields: ticker, name, shares, purchasePrice, purchaseDate');
  }

  try {
    const [result] = await db.execute(
      'UPDATE holdings SET ticker = ?, name = ?, shares = ?, purchase_price = ?, purchase_date = ?, sector = ?, asset_class = ? WHERE id = ? AND user_id = ?',
      [
        ticker,
        name,
        shares,
        purchasePrice,
        purchaseDate,
        sector || null,
        assetClass || null,
        holdingId,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return notFound(res, 'Holding not found');
    }

    const [rows] = await db.execute(
      'SELECT id, ticker, name, shares, purchase_price AS purchasePrice, purchase_date AS purchaseDate, sector, asset_class AS assetClass, created_at AS createdAt, updated_at AS updatedAt FROM holdings WHERE id = ? AND user_id = ?',
      [holdingId, userId]
    );

    return res.json({ holding: rows[0] });
  } catch (err) {
    logger.error('Error updating holding:', err);
    return internalError(res, 'Failed to update holding');
  }
}

async function deleteHolding(req, res) {
  const userId = req.user && req.user.id;
  const holdingId = req.params.id;

  if (!holdingId) {
    return badRequest(res, 'Missing holding id');
  }

  try {
    const [result] = await db.execute(
      'DELETE FROM holdings WHERE id = ? AND user_id = ?',
      [holdingId, userId]
    );

    if (result.affectedRows === 0) {
      return notFound(res, 'Holding not found');
    }

    return res.status(204).send();
  } catch (err) {
    logger.error('Error deleting holding:', err);
    return internalError(res, 'Failed to delete holding');
  }
}

module.exports = {
  getHoldings,
  createHolding,
  updateHolding,
  deleteHolding,
};

