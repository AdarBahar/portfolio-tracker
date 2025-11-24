const db = require('../db');
const { sendError, internalError, badRequest } = require('../utils/apiError');
const { fetchPriceFromAPI } = require('./marketDataController');
const logger = require('../utils/logger');

class OrderError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function getBullPenForOrder(bullPenId, userId, connection) {
  const [rows] = await (connection || db).execute('SELECT * FROM bull_pens WHERE id = ?', [bullPenId]);
  const bullPen = rows[0];
  if (!bullPen) {
    throw new OrderError(404, 'Bull pen not found');
  }
  const allowedStates = ['draft', 'scheduled', 'active'];
  if (!allowedStates.includes(bullPen.state)) {
    throw new OrderError(400, 'Orders can only be placed in active bull pens');
  }
  return bullPen;
}

async function getActiveMembership(bullPenId, userId, connection) {
  const [rows] = await (connection || db).execute(
    'SELECT * FROM bull_pen_memberships WHERE bull_pen_id = ? AND user_id = ? AND status = "active"',
    [bullPenId, userId]
  );
  const membership = rows[0];
  if (!membership) {
    throw new OrderError(403, 'User is not an active member of this bull pen');
  }
  return membership;
}

async function getLatestPrice(symbol, connection) {
  // Check market_data table for cached price (less than 15 minutes old)
  const [rows] = await (connection || db).execute(
    'SELECT current_price FROM market_data WHERE symbol = ? AND last_updated > DATE_SUB(NOW(), INTERVAL 15 MINUTE)',
    [symbol]
  );

  if (rows.length > 0) {
    return Number(rows[0].current_price);
  }

  // Fetch from API and cache
  const apiData = await fetchPriceFromAPI(symbol);

  await (connection || db).execute(
    `INSERT INTO market_data (symbol, current_price, company_name, change_percent, last_updated)
     VALUES (?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       current_price = VALUES(current_price),
       company_name = VALUES(company_name),
       change_percent = VALUES(change_percent),
       last_updated = NOW()`,
    [symbol, apiData.price, apiData.companyName, apiData.changePercent]
  );

  return apiData.price;
}

async function placeOrder(req, res) {
  const userId = req.user && req.user.id;
  const bullPenId = parseInt(req.params.id, 10);
  const { symbol, side, type, qty, limitPrice } = req.body || {};

  if (!bullPenId || !symbol || !side || !type || !qty) {
    return badRequest(res, 'Missing required fields: bullPenId, symbol, side, type, qty');
  }

  if (!['buy', 'sell'].includes(side)) {
    return badRequest(res, 'Invalid side. Expected "buy" or "sell"');
  }

  if (!['market', 'limit'].includes(type)) {
    return badRequest(res, 'Invalid type. Expected "market" or "limit"');
  }

  const numericQty = Number(qty);
  if (!Number.isFinite(numericQty) || numericQty <= 0) {
    return badRequest(res, 'qty must be a positive number');
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const bullPen = await getBullPenForOrder(bullPenId, userId, connection);
    const membership = await getActiveMembership(bullPenId, userId, connection);

    const price = await getLatestPrice(symbol, connection);
    const effectivePrice = type === 'limit' && limitPrice ? Number(limitPrice) : price;

    if (!Number.isFinite(effectivePrice) || effectivePrice <= 0) {
      throw new Error('Invalid effective price');
    }

    let status = 'new';
    let rejectionReason = null;

    if (side === 'buy') {
      const cost = numericQty * effectivePrice;
      if (cost > Number(membership.cash)) {
        status = 'rejected';
        rejectionReason = 'INSUFFICIENT_CASH';
      }
    } else if (side === 'sell') {
      const [positionRows] = await connection.execute(
        'SELECT * FROM bull_pen_positions WHERE bull_pen_id = ? AND user_id = ? AND symbol = ? FOR UPDATE',
        [bullPenId, userId, symbol]
      );
      const position = positionRows[0];
      if (!position || Number(position.qty) < numericQty) {
        status = 'rejected';
        rejectionReason = 'INSUFFICIENT_SHARES';
      }
    }

    const [orderResult] = await connection.execute(
      `INSERT INTO bull_pen_orders
        (bull_pen_id, user_id, symbol, side, type, qty, filled_qty, limit_price, avg_fill_price, status, rejection_reason)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, NULL, ?, ?)` ,
      [bullPenId, userId, symbol, side, type, numericQty, limitPrice || null, status, rejectionReason]
    );

    const orderId = orderResult.insertId;

    if (status === 'rejected') {
      await connection.commit();
      return res.status(200).json({
        orderId,
        status,
        fillPrice: null,
        newCash: Number(membership.cash),
        newPosition: null,
        rejectionReason,
      });
    }

    let newCash = Number(membership.cash);
    let newPosition = null;

    if (side === 'buy') {
      const cost = numericQty * effectivePrice;
      newCash -= cost;

      const [positionRows] = await connection.execute(
        'SELECT * FROM bull_pen_positions WHERE bull_pen_id = ? AND user_id = ? AND symbol = ? FOR UPDATE',
        [bullPenId, userId, symbol]
      );
      const position = positionRows[0];

      if (!position) {
        const [insertPos] = await connection.execute(
          'INSERT INTO bull_pen_positions (bull_pen_id, user_id, symbol, qty, avg_cost) VALUES (?, ?, ?, ?, ?)',
          [bullPenId, userId, symbol, numericQty, effectivePrice]
        );
        newPosition = {
          id: insertPos.insertId,
          bullPenId,
          userId,
          symbol,
          qty: numericQty,
          avgCost: effectivePrice,
        };
      } else {
        const existingQty = Number(position.qty);
        const existingCost = Number(position.avg_cost) * existingQty;
        const totalQty = existingQty + numericQty;
        const totalCost = existingCost + cost;
        const newAvgCost = totalCost / totalQty;

        await connection.execute(
          'UPDATE bull_pen_positions SET qty = ?, avg_cost = ? WHERE id = ?',
          [totalQty, newAvgCost, position.id]
        );

        newPosition = {
          id: position.id,
          bullPenId,
          userId,
          symbol,
          qty: totalQty,
          avgCost: newAvgCost,
        };
      }
    } else if (side === 'sell') {
      const proceeds = numericQty * effectivePrice;
      newCash += proceeds;

      const [positionRows] = await connection.execute(
        'SELECT * FROM bull_pen_positions WHERE bull_pen_id = ? AND user_id = ? AND symbol = ? FOR UPDATE',
        [bullPenId, userId, symbol]
      );
      const position = positionRows[0];

      const existingQty = Number(position.qty);
      const remainingQty = existingQty - numericQty;

      if (remainingQty <= 0) {
        await connection.execute('DELETE FROM bull_pen_positions WHERE id = ?', [position.id]);
        newPosition = null;
      } else {
        await connection.execute(
          'UPDATE bull_pen_positions SET qty = ? WHERE id = ?',
          [remainingQty, position.id]
        );
        newPosition = {
          id: position.id,
          bullPenId,
          userId,
          symbol,
          qty: remainingQty,
          avgCost: Number(position.avg_cost),
        };
      }
    }

    await connection.execute(
      'UPDATE bull_pen_memberships SET cash = ? WHERE id = ?',
      [newCash, membership.id]
    );

    await connection.execute(
      'UPDATE bull_pen_orders SET status = "filled", filled_qty = ?, avg_fill_price = ?, filled_at = NOW() WHERE id = ?',
      [numericQty, effectivePrice, orderId]
    );

    await connection.commit();

    return res.status(200).json({
      orderId,
      status: 'filled',
      fillPrice: effectivePrice,
      newCash,
      newPosition,
    });
  } catch (err) {
    logger.error('Error placing bull pen order:', err);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        logger.error('Rollback failed in placeOrder:', rollbackErr);
      }
    }
    if (err instanceof OrderError) {
      return sendError(res, err.status, err.message);
    }
    return internalError(res, 'Failed to place order');
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function listOrders(req, res) {
  const userId = req.user && req.user.id;
  const bullPenId = parseInt(req.params.id, 10);
  const { mine } = req.query || {};

  if (!bullPenId) {
    return badRequest(res, 'Missing bull pen id');
  }

  try {
    const [rows] = await db.execute(
      mine === 'true'
        ? 'SELECT * FROM bull_pen_orders WHERE bull_pen_id = ? AND user_id = ? ORDER BY placed_at DESC, id DESC'
        : 'SELECT * FROM bull_pen_orders WHERE bull_pen_id = ? ORDER BY placed_at DESC, id DESC',
      mine === 'true' ? [bullPenId, userId] : [bullPenId]
    );

    return res.json({ orders: rows });
  } catch (err) {
    logger.error('Error listing bull pen orders:', err);
    return internalError(res, 'Failed to list orders');
  }
}

async function listPositions(req, res) {
  const userId = req.user && req.user.id;
  const bullPenId = parseInt(req.params.id, 10);
  const { mine } = req.query || {};

  if (!bullPenId) {
    return badRequest(res, 'Missing bull pen id');
  }

  try {
    const [rows] = await db.execute(
      mine === 'true'
        ? 'SELECT * FROM bull_pen_positions WHERE bull_pen_id = ? AND user_id = ? ORDER BY symbol ASC'
        : 'SELECT * FROM bull_pen_positions WHERE bull_pen_id = ? ORDER BY user_id ASC, symbol ASC',
      mine === 'true' ? [bullPenId, userId] : [bullPenId]
    );

    return res.json({ positions: rows });
  } catch (err) {
    logger.error('Error listing bull pen positions:', err);
    return internalError(res, 'Failed to list positions');
  }
}

module.exports = {
  placeOrder,
  listOrders,
  listPositions,
};

