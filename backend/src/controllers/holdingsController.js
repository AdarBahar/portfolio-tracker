const db = require('../db');
const { badRequest, internalError, notFound } = require('../utils/apiError');
const logger = require('../utils/logger');
const auditLog = require('../utils/auditLog');

async function getHoldings(req, res) {
  try {
    const userId = req.user && req.user.id;
    const [rows] = await db.execute(
      `SELECT
        h.id, h.ticker, h.name, h.shares, h.purchase_price, h.purchase_date, h.sector, h.asset_class, h.created_at, h.updated_at,
        COALESCE(m.current_price, 0) AS current_price
      FROM holdings h
      LEFT JOIN market_data m ON h.ticker = m.symbol
      WHERE h.user_id = ? AND h.deleted_at IS NULL
      ORDER BY h.ticker`,
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
      'INSERT INTO holdings (user_id, ticker, name, shares, purchase_price, purchase_date, sector, asset_class, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "active")',
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
      'SELECT id, ticker, name, shares, purchase_price AS purchasePrice, purchase_date AS purchaseDate, sector, asset_class AS assetClass, created_at AS createdAt, updated_at AS updatedAt FROM holdings WHERE id = ? AND deleted_at IS NULL',
      [result.insertId]
    );

    // Log holding creation
    await auditLog.log({
      userId,
      eventType: 'holding_created',
      eventCategory: 'data',
      description: `Created holding for ${ticker}`,
      req,
      newValues: { ticker, name, shares, purchasePrice, purchaseDate, sector, assetClass }
    });

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
    // Fetch old values before update
    const [oldRows] = await db.execute(
      'SELECT ticker, name, shares, purchase_price AS purchasePrice, purchase_date AS purchaseDate, sector, asset_class AS assetClass FROM holdings WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [holdingId, userId]
    );

    if (oldRows.length === 0) {
      return notFound(res, 'Holding not found');
    }

    const oldHolding = oldRows[0];

    const [result] = await db.execute(
      'UPDATE holdings SET ticker = ?, name = ?, shares = ?, purchase_price = ?, purchase_date = ?, sector = ?, asset_class = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
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
      'SELECT id, ticker, name, shares, purchase_price AS purchasePrice, purchase_date AS purchaseDate, sector, asset_class AS assetClass, created_at AS createdAt, updated_at AS updatedAt FROM holdings WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [holdingId, userId]
    );

    // Log holding update
    await auditLog.log({
      userId,
      eventType: 'holding_updated',
      eventCategory: 'data',
      description: `Updated holding for ${ticker}`,
      req,
      previousValues: oldHolding,
      newValues: { ticker, name, shares, purchasePrice, purchaseDate, sector, assetClass }
    });

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
    // Fetch holding info before deletion
    const [oldRows] = await db.execute(
      'SELECT ticker, name, shares FROM holdings WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [holdingId, userId]
    );

    if (oldRows.length === 0) {
      return notFound(res, 'Holding not found');
    }

    const oldHolding = oldRows[0];

    // Soft delete: set deleted_at timestamp
    const [result] = await db.execute(
      'UPDATE holdings SET deleted_at = NOW() WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [holdingId, userId]
    );

    if (result.affectedRows === 0) {
      return notFound(res, 'Holding not found');
    }

    // Log holding deletion
    await auditLog.log({
      userId,
      eventType: 'holding_deleted',
      eventCategory: 'data',
      description: `Deleted holding for ${oldHolding.ticker}`,
      req,
      previousValues: oldHolding
    });

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

