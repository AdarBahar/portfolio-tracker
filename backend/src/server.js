require('dotenv').config();

const app = require('./app');
const db = require('./db');

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Portfolio Tracker backend listening on port ${PORT}`);

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
    console.log('[Server] Background jobs started successfully');
  } catch (err) {
    console.warn('[Server] Skipping background jobs - DB tables not ready:', err.message);
    console.warn('[Server] Server will continue without background jobs. Run schema migrations to enable jobs.');
  }
});
