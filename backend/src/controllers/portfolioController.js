const db = require('../db');
const { internalError } = require('../utils/apiError');
const logger = require('../utils/logger');

async function getPortfolioAll(req, res) {
  try {
    const userId = req.user && req.user.id;

    const [holdingsResult, dividendsResult, transactionsResult] = await Promise.all([
      db.execute(
        `SELECT
          h.id, h.ticker, h.name, h.shares, h.purchase_price, h.purchase_date, h.sector, h.asset_class, h.created_at, h.updated_at,
          COALESCE(m.current_price, 0) AS current_price
        FROM holdings h
        LEFT JOIN market_data m ON h.ticker = m.symbol
        WHERE h.user_id = ? AND h.deleted_at IS NULL
        ORDER BY h.ticker`,
        [userId]
      ),
      db.execute(
        'SELECT id, ticker, amount, shares, date, created_at FROM dividends WHERE user_id = ? AND deleted_at IS NULL ORDER BY date DESC',
        [userId]
      ),
      db.execute(
        'SELECT id, type, ticker, shares, price, fees, date, created_at FROM transactions WHERE user_id = ? AND deleted_at IS NULL ORDER BY date DESC, id DESC',
        [userId]
      ),
    ]);

    const [holdings] = holdingsResult;
    const [dividends] = dividendsResult;
    const [transactions] = transactionsResult;

    return res.json({ holdings, dividends, transactions });
  } catch (err) {
    logger.error('Error fetching full portfolio:', err);
    return internalError(res, 'Failed to fetch portfolio data');
  }
}

module.exports = {
  getPortfolioAll,
};

