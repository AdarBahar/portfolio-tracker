require('dotenv').config();

const http = require('http');
const app = require('./app');
const db = require('./db');
const logger = require('./utils/logger');
const WebSocketServer = require('./websocket/server');
const wsIntegration = require('./websocket/integration');

const PORT = process.env.PORT || 4000;

// Create HTTP server that will be shared by Express and WebSocket
// This is required for Phusion Passenger compatibility
const server = http.createServer(app);

// Start REST API server
server.listen(PORT, async () => {
  logger.log(`Portfolio Tracker backend listening on port ${PORT}`);

  // Start WebSocket server on the same HTTP server
  // This avoids Phusion Passenger's "listen() called more than once" error
  try {
    const wsServer = new WebSocketServer(null, server);
    wsServer.start();
    wsIntegration.initializeIntegration(wsServer);
    logger.log(`[Server] WebSocket server started on same HTTP server`);
  } catch (err) {
    logger.error('[Server] Failed to start WebSocket server:', err);
  }

  // Start background jobs only if DB is available and tables exist
  try {
    // Check if bull_pens table exists (basic health check)
    await db.execute('SELECT 1 FROM bull_pens LIMIT 1');

    // Check if new Phase 3 tables exist
    await db.execute('SELECT 1 FROM market_data LIMIT 1');
    await db.execute('SELECT 1 FROM leaderboard_snapshots LIMIT 1');

    // All tables exist, start background jobs
    const { startJobs } = require('./jobs');
    startJobs();
    logger.log('[Server] Background jobs started successfully');
  } catch (err) {
    logger.warn('[Server] Skipping background jobs - DB tables not ready:', err.message);
    logger.warn('[Server] Server will continue without background jobs. Run schema migrations to enable jobs.');
  }
});
