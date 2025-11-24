const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/authRoutes');
const holdingsRoutes = require('./routes/holdingsRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const dividendsRoutes = require('./routes/dividendsRoutes');
const transactionsRoutes = require('./routes/transactionsRoutes');
const bullPensRoutes = require('./routes/bullPensRoutes');
const bullPenMembershipsRoutes = require('./routes/bullPenMembershipsRoutes');
const bullPenOrdersRoutes = require('./routes/bullPenOrdersRoutes');
const myBullPensRoutes = require('./routes/myBullPensRoutes');
const marketDataRoutes = require('./routes/marketDataRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const openapi = require('../openapi.json');
const db = require('./db');
const { internalError } = require('./utils/apiError');
const { authenticateToken } = require('./utils/authMiddleware');

// Optional base path for when the app is mounted under a sub-path
// e.g. API_BASE_PATH=/fantasybroker-api on production
const BASE_PATH = process.env.API_BASE_PATH || '';

const app = express();

app.use(cors());
app.use(express.json());

// Health check (includes DB connectivity check)
app.get(`${BASE_PATH}/api/health`, async (req, res) => {
  try {
    // Simple lightweight query to verify DB connectivity
    await db.execute('SELECT 1');

    return res.json({ status: 'ok', db: 'ok' });
  } catch (err) {
    console.error('Health check DB connectivity failed:', err);
    return internalError(res, 'Database connection failed');
  }
});

// OpenAPI (Swagger) JSON
app.get(`${BASE_PATH}/api/openapi.json`, (req, res) => {
  res.json(openapi);
});

// Swagger UI
app.use(`${BASE_PATH}/api/docs`, swaggerUi.serve, swaggerUi.setup(openapi));

// Auth routes
app.use(`${BASE_PATH}/api/auth`, authRoutes);

// Authenticated portfolio routes
app.use(`${BASE_PATH}/api/holdings`, authenticateToken, holdingsRoutes);
app.use(`${BASE_PATH}/api/portfolio`, authenticateToken, portfolioRoutes);
app.use(`${BASE_PATH}/api/dividends`, authenticateToken, dividendsRoutes);
app.use(`${BASE_PATH}/api/transactions`, authenticateToken, transactionsRoutes);
app.use(`${BASE_PATH}/api/bull-pens`, authenticateToken, bullPensRoutes);
app.use(`${BASE_PATH}/api/bull-pens`, authenticateToken, bullPenMembershipsRoutes);
app.use(`${BASE_PATH}/api/bull-pens`, authenticateToken, bullPenOrdersRoutes);
app.use(`${BASE_PATH}/api/bull-pens`, authenticateToken, leaderboardRoutes);
app.use(`${BASE_PATH}/api/my`, authenticateToken, myBullPensRoutes);
app.use(`${BASE_PATH}/api/market-data`, marketDataRoutes);

// Global error handler (basic)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  return internalError(res);
});

module.exports = app;

