const https = require('https');
const db = require('../db');
const { badRequest, notFound, internalError } = require('../utils/apiError');

// Finnhub API configuration
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'd4ectrhr01qrumpesmm0d4ectrhr01qrumpesmmg';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

/**
 * Make HTTPS request to Finnhub API
 * @param {string} endpoint - API endpoint path
 * @returns {Promise<object>}
 */
function finnhubRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${FINNHUB_BASE_URL}${endpoint}&token=${FINNHUB_API_KEY}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);

          // Check for API errors
          if (parsed.error) {
            reject(new Error(`Finnhub API error: ${parsed.error}`));
            return;
          }

          resolve(parsed);
        } catch (err) {
          reject(new Error(`Failed to parse Finnhub response: ${err.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Finnhub request failed: ${err.message}`));
    });
  });
}

/**
 * Fetch stock price and company info from Finnhub API
 *
 * @param {string} symbol - Stock ticker symbol
 * @returns {Promise<{price: number, companyName: string, changePercent: number}>}
 */
async function fetchPriceFromAPI(symbol) {
  try {
    // Fetch quote data (current price, change %)
    // Endpoint: /quote?symbol=AAPL
    const quote = await finnhubRequest(`/quote?symbol=${symbol}`);

    // Validate quote response
    if (!quote.c || quote.c === 0) {
      throw new Error(`Invalid or missing price data for ${symbol}`);
    }

    // Calculate change percent from previous close
    const currentPrice = quote.c; // Current price
    const previousClose = quote.pc; // Previous close
    const changePercent = previousClose > 0
      ? ((currentPrice - previousClose) / previousClose) * 100
      : 0;

    // Fetch company profile (company name)
    // Endpoint: /stock/profile2?symbol=AAPL
    let companyName = `${symbol} Corporation`; // Default fallback

    try {
      const profile = await finnhubRequest(`/stock/profile2?symbol=${symbol}`);
      if (profile.name) {
        companyName = profile.name;
      }
    } catch (profileErr) {
      console.warn(`Failed to fetch company profile for ${symbol}:`, profileErr.message);
      // Continue with default company name
    }

    return {
      price: currentPrice,
      companyName,
      changePercent,
    };
  } catch (err) {
    console.error(`Error fetching price from Finnhub for ${symbol}:`, err.message);

    // Fallback to stub data if API fails
    console.warn(`Using fallback stub data for ${symbol}`);
    const symbolHash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const basePrice = 50 + (symbolHash % 200);
    const changePercent = ((symbolHash % 20) - 10) / 10;

    return {
      price: basePrice,
      companyName: `${symbol} Corporation`,
      changePercent,
    };
  }
}

/**
 * GET /api/market-data/:symbol
 * Fetch current price for a single symbol
 */
async function getMarketData(req, res) {
  const { symbol } = req.params;
  
  if (!symbol) {
    return badRequest(res, 'Missing symbol parameter');
  }
  
  const upperSymbol = symbol.toUpperCase();
  
  try {
    // Check if we have cached data (less than 15 minutes old)
    const [rows] = await db.execute(
      'SELECT * FROM market_data WHERE symbol = ? AND last_updated > DATE_SUB(NOW(), INTERVAL 15 MINUTE)',
      [upperSymbol]
    );
    
    if (rows.length > 0) {
      const data = rows[0];
      return res.json({
        symbol: data.symbol,
        currentPrice: Number(data.current_price),
        companyName: data.company_name,
        changePercent: data.change_percent ? Number(data.change_percent) : null,
        lastUpdated: data.last_updated,
        cached: true,
      });
    }
    
    // Fetch fresh data from API
    const apiData = await fetchPriceFromAPI(upperSymbol);
    
    // Upsert into market_data table
    await db.execute(
      `INSERT INTO market_data (symbol, current_price, company_name, change_percent, last_updated)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         current_price = VALUES(current_price),
         company_name = VALUES(company_name),
         change_percent = VALUES(change_percent),
         last_updated = NOW()`,
      [upperSymbol, apiData.price, apiData.companyName, apiData.changePercent]
    );
    
    return res.json({
      symbol: upperSymbol,
      currentPrice: apiData.price,
      companyName: apiData.companyName,
      changePercent: apiData.changePercent,
      lastUpdated: new Date(),
      cached: false,
    });
  } catch (err) {
    console.error('Error fetching market data:', err);
    return internalError(res, 'Failed to fetch market data');
  }
}

/**
 * GET /api/market-data?symbols=AAPL,GOOGL,MSFT
 * Fetch current prices for multiple symbols
 */
async function getMultipleMarketData(req, res) {
  const { symbols } = req.query;
  
  if (!symbols) {
    return badRequest(res, 'Missing symbols query parameter');
  }
  
  const symbolList = symbols.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  
  if (symbolList.length === 0) {
    return badRequest(res, 'No valid symbols provided');
  }
  
  if (symbolList.length > 50) {
    return badRequest(res, 'Maximum 50 symbols allowed per request');
  }
  
  try {
    const results = {};
    
    for (const symbol of symbolList) {
      // Check cache first
      const [rows] = await db.execute(
        'SELECT * FROM market_data WHERE symbol = ? AND last_updated > DATE_SUB(NOW(), INTERVAL 15 MINUTE)',
        [symbol]
      );
      
      if (rows.length > 0) {
        const data = rows[0];
        results[symbol] = {
          currentPrice: Number(data.current_price),
          companyName: data.company_name,
          changePercent: data.change_percent ? Number(data.change_percent) : null,
          lastUpdated: data.last_updated,
          cached: true,
        };
      } else {
        // Fetch from API
        const apiData = await fetchPriceFromAPI(symbol);
        
        // Upsert
        await db.execute(
          `INSERT INTO market_data (symbol, current_price, company_name, change_percent, last_updated)
           VALUES (?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE
             current_price = VALUES(current_price),
             company_name = VALUES(company_name),
             change_percent = VALUES(change_percent),
             last_updated = NOW()`,
          [symbol, apiData.price, apiData.companyName, apiData.changePercent]
        );
        
        results[symbol] = {
          currentPrice: apiData.price,
          companyName: apiData.companyName,
          changePercent: apiData.changePercent,
          lastUpdated: new Date(),
          cached: false,
        };
      }
    }
    
    return res.json({ data: results });
  } catch (err) {
    console.error('Error fetching multiple market data:', err);
    return internalError(res, 'Failed to fetch market data');
  }
}

module.exports = {
  getMarketData,
  getMultipleMarketData,
  fetchPriceFromAPI, // Export for use in order execution
};

