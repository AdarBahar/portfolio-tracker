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

// Initialize WebSocket server on the HTTP server
// This must be done BEFORE listen() is called
try {
  const wsServer = new WebSocketServer(null, server);
  wsServer.start();
  wsIntegration.initializeIntegration(wsServer);
  logger.log(`[Server] WebSocket server initialized on same HTTP server`);
} catch (err) {
  logger.error('[Server] Failed to initialize WebSocket server:', err);
}

// Start background jobs initialization (async, doesn't block server startup)
(async () => {
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
})();

// Start REST API server
// In Phusion Passenger, this listen() call is intercepted and managed by Passenger
// In standalone mode, this starts the server on the specified port
server.listen(PORT, () => {
  logger.log(`Portfolio Tracker backend listening on port ${PORT}`);
});

// Export server for Phusion Passenger
module.exports = server;
