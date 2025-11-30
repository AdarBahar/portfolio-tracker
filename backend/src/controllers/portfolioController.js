const db = require('../db');
const { internalError } = require('../utils/apiError');
const logger = require('../utils/logger');

async function getPortfolioAll(req, res) {
  try {
    const userId = req.user && req.user.id;

    const [holdingsResult, dividendsResult, transactionsResult] = await Promise.all([
      db.execute(
        'SELECT id, ticker, name, shares, purchase_price, purchase_date, sector, asset_class, created_at, updated_at FROM holdings WHERE user_id = ? AND deleted_at IS NULL ORDER BY ticker',
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

    // Fetch current prices for all holdings
    const tickers = holdings.map(h => h.ticker);
    let priceMap = {};

    if (tickers.length > 0) {
      const placeholders = tickers.map(() => '?').join(',');
      const [priceRows] = await db.execute(
        `SELECT symbol, current_price FROM market_data WHERE symbol IN (${placeholders})`,
        tickers
      );

      priceRows.forEach(row => {
        priceMap[row.symbol] = Number(row.current_price);
      });
    }

    // Add current_price to each holding
    const holdingsWithPrices = holdings.map(holding => ({
      ...holding,
      current_price: priceMap[holding.ticker] || 0
    }));

    return res.json({ holdings: holdingsWithPrices, dividends, transactions });
  } catch (err) {
    logger.error('Error fetching full portfolio:', err);
    return internalError(res, 'Failed to fetch portfolio data');
  }
}

module.exports = {
  getPortfolioAll,
};

