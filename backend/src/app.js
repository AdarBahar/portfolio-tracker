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
const adminRoutes = require('./routes/adminRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const internalBudgetRoutes = require('./routes/internalBudgetRoutes');
const settlementRoutes = require('./routes/settlementRoutes');
const cancellationRoutes = require('./routes/cancellationRoutes');
const rakeRoutes = require('./routes/rakeRoutes');
const bonusRoutes = require('./routes/bonusRoutes');
const adminPromotionRoutes = require('./routes/adminPromotionRoutes');
const achievementRulesRoutes = require('./routes/achievementRulesRoutes');
const userRoutes = require('./routes/userRoutes');
const openapi = require('../openapi.json');
const db = require('./db');
const { internalError } = require('./utils/apiError');
const { authenticateToken } = require('./utils/authMiddleware');
const { requireAdmin } = require('./utils/adminMiddleware');
const { requireInternalService } = require('./utils/internalServiceMiddleware');
const logger = require('./utils/logger');

// Optional base path for when the app is mounted under a sub-path
// e.g. API_BASE_PATH=/fantasybroker-api on production
const BASE_PATH = process.env.API_BASE_PATH || '';

const app = express();

app.use(cors());
app.use(express.json());

// Health check (includes DB connectivity check and market data mode)
app.get(`${BASE_PATH}/api/health`, async (req, res) => {
  try {
    // Simple lightweight query to verify DB connectivity
    await db.execute('SELECT 1');

    return res.json({
      status: 'ok',
      db: 'ok',
      marketDataMode: process.env.MARKET_DATA_MODE || 'production'
    });
  } catch (err) {
    logger.error('Health check DB connectivity failed:', err);
    return internalError(res, 'Database connection failed');
  }
});

// WebSocket Diagnostics endpoint
app.get(`${BASE_PATH}/api/ws-diagnostics`, (req, res) => {
  return res.json({
    status: 'ok',
    websocket: {
      enabled: true,
      path: `${BASE_PATH}/ws`,
      expectedPath: '/fantasybroker-api/ws',
      apiBasePath: BASE_PATH,
      port: process.env.PORT || 4000,
      phusionPassenger: true,
      httpServerAttached: true,
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'production',
      apiBasePath: process.env.API_BASE_PATH || 'NOT SET',
      port: process.env.PORT || 4000,
    },
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid,
    },
    timestamp: new Date().toISOString(),
  });
});

// OpenAPI (Swagger) JSON
app.get(`${BASE_PATH}/api/openapi.json`, (req, res) => {
  res.json(openapi);
});

// Swagger UI
app.use(`${BASE_PATH}/api/docs`, swaggerUi.serve, swaggerUi.setup(openapi));

// Auth routes
app.use(`${BASE_PATH}/api/auth`, authRoutes);

// Admin routes (require authentication + admin privileges)
app.use(`${BASE_PATH}/api/admin`, authenticateToken, requireAdmin, adminRoutes);
app.use(`${BASE_PATH}/api/admin/rake`, authenticateToken, requireAdmin, rakeRoutes);
app.use(`${BASE_PATH}/api/admin/promotions`, authenticateToken, requireAdmin, adminPromotionRoutes);
app.use(`${BASE_PATH}/api/admin/achievement-rules`, authenticateToken, requireAdmin, achievementRulesRoutes);

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

// User routes (authenticated)
app.use(`${BASE_PATH}/api/users`, authenticateToken, userRoutes);

// Budget routes (public, authenticated)
app.use(`${BASE_PATH}/api/v1/budget`, authenticateToken, budgetRoutes);

// Bonus routes (public, authenticated)
app.use(`${BASE_PATH}/api/v1/bonus`, authenticateToken, bonusRoutes);

// Internal budget routes (service-to-service)
app.use(`${BASE_PATH}/internal/v1/budget`, requireInternalService, internalBudgetRoutes);

// Internal settlement routes (service-to-service)
app.use(`${BASE_PATH}/internal/v1/settlement`, requireInternalService, settlementRoutes);

// Internal cancellation routes (service-to-service)
app.use(`${BASE_PATH}/internal/v1/cancellation`, requireInternalService, cancellationRoutes);

// Catch-all route for WebSocket upgrade requests
// This allows the WebSocket server to handle upgrade requests
// The WebSocket server is attached to the HTTP server and will intercept
// requests with Upgrade: websocket header before Express processes them
app.all(`${BASE_PATH}/ws`, (req, res) => {
  // This route should never be reached if WebSocket is properly attached
  // If we get here, it means the WebSocket upgrade failed
  logger.warn('[Express] WebSocket upgrade request reached Express instead of WebSocket server');
  res.status(400).json({ error: 'WebSocket upgrade failed' });
});

// Global error handler (basic)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err);
  return internalError(res);
});

module.exports = app;

