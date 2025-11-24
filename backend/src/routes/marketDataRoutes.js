const express = require('express');
const { getMarketData, getMultipleMarketData, searchSymbols } = require('../controllers/marketDataController');

const router = express.Router();

// GET /api/market-data/search?q=AAPL (symbol search)
router.get('/search', searchSymbols);

// GET /api/market-data?symbols=AAPL,GOOGL (multiple symbols)
// GET /api/market-data/:symbol (single symbol)
router.get('/', (req, res, next) => {
  if (req.query.symbols) {
    return getMultipleMarketData(req, res, next);
  }
  return res.status(400).json({ error: 'Missing symbols query parameter or use /api/market-data/:symbol' });
});

router.get('/:symbol', getMarketData);

module.exports = router;

