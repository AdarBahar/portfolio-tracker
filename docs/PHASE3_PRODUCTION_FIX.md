# Phase 3 Production Deployment Fix

## Problem

After deploying Phase 3 (market data, leaderboards, background jobs), the production server returned 500 errors on all endpoints including Swagger.

## Root Cause

The background jobs were starting **immediately when the app module loaded**, before the server was fully initialized. The jobs attempted to query database tables that don't exist in production yet (`market_data`, `leaderboard_snapshots`), causing uncaught errors that crashed or destabilized the server.

## Solution

**Changed job startup behavior:**

1. **Removed job startup from `app.js`** - Jobs no longer start at module load time
2. **Added conditional job startup in `server.js`** - Jobs only start AFTER the server is listening
3. **Added DB table checks** - Server verifies required tables exist before starting jobs
4. **Graceful degradation** - Server continues without jobs if tables are missing (with clear warning logs)

## Files Changed

### `backend/src/app.js`
- **Removed**: `startJobs()` call at module load time
- **Reason**: Jobs should start after server initialization, not during module loading

### `backend/src/server.js`
- **Added**: Conditional job startup after server.listen()
- **Added**: DB table existence checks before starting jobs
- **Added**: Error handling with clear warning messages

## Production Deployment Steps

### Option 1: Deploy Without Background Jobs (Recommended for immediate fix)

1. **Deploy the fixed code** (current state)
   - Server will start successfully
   - Background jobs will be skipped with warning
   - All API endpoints will work normally
   - Manual room state management required

2. **Verify server is healthy**
   ```bash
   curl https://www.bahar.co.il/fantasybroker-api/api/health
   ```

3. **Check Swagger UI**
   ```
   https://www.bahar.co.il/fantasybroker-api/api-docs
   ```

### Option 2: Full Phase 3 Deployment (Requires DB migration)

1. **Run schema migrations on production database**
   - Execute the new table definitions from `schema.mysql.sql`:
     - `market_data` table (lines 257-272)
     - `leaderboard_snapshots` table (lines 280-297)

2. **Deploy the fixed code**

3. **Verify background jobs started**
   - Check server logs for:
     ```
     [Server] Background jobs started successfully
     [Jobs] Starting background jobs...
     [Jobs] Scheduled room state manager (every minute)
     [Jobs] Scheduled leaderboard updater (every 5 minutes)
     ```

## What Works Now (Without DB Migration)

✅ All existing API endpoints (holdings, dividends, transactions, auth)  
✅ Bull pen CRUD operations  
✅ Membership management (join, approve, leave)  
✅ Order placement (uses fallback stub pricing)  
✅ Position tracking  
✅ Swagger UI  

## What Requires DB Migration

❌ Market data caching (orders will use stub pricing)  
❌ Leaderboard endpoints (will return 500 if called)  
❌ Automatic room state transitions (manual PATCH required)  
❌ Periodic leaderboard snapshots  

## Recommended Next Steps

1. **Immediate**: Deploy the fix to restore service (Option 1)
2. **Soon**: Run DB migrations during maintenance window (Option 2)
3. **Future**: Add health check endpoint that reports job status

## Testing the Fix Locally

```bash
# Start server (will skip jobs due to missing tables)
cd backend
node src/server.js

# Expected output:
# Portfolio Tracker backend listening on port 4000
# [Server] Skipping background jobs - DB tables not ready: ...
# [Server] Server will continue without background jobs. Run schema migrations to enable jobs.

# Test health endpoint
curl http://localhost:4000/api/health

# Test Swagger
open http://localhost:4000/api-docs
```

## SQL Migration Script (For Option 2)

```sql
-- Run this on production database to enable Phase 3 features

-- Market data table
CREATE TABLE IF NOT EXISTS market_data (
    symbol VARCHAR(32) PRIMARY KEY,
    current_price DECIMAL(18, 6) NOT NULL,
    company_name VARCHAR(255),
    change_percent DECIMAL(10, 4),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cached stock price data for order execution and portfolio valuation';

CREATE INDEX idx_market_data_updated ON market_data(last_updated);

-- Leaderboard snapshots table
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bull_pen_id INT NOT NULL,
    user_id INT NOT NULL,
    snapshot_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rank INT,
    portfolio_value DECIMAL(18, 2) NOT NULL,
    pnl_abs DECIMAL(18, 2) NOT NULL,
    pnl_pct DECIMAL(10, 4) NOT NULL,
    last_trade_at TIMESTAMP NULL,
    
    CONSTRAINT fk_leaderboard_bull_pen FOREIGN KEY (bull_pen_id) REFERENCES bull_pens(id) ON DELETE CASCADE,
    CONSTRAINT fk_leaderboard_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Periodic snapshots of player rankings and performance metrics';

CREATE INDEX idx_leaderboard_room_snapshot ON leaderboard_snapshots(bull_pen_id, snapshot_at DESC);
CREATE INDEX idx_leaderboard_user ON leaderboard_snapshots(user_id, snapshot_at DESC);
```

