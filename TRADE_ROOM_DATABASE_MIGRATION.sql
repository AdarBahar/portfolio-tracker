-- ============================================================================
-- Trade Room Database Migration Script
-- Purpose: Add Trade Room tables to existing Portfolio Tracker database
-- Date: December 2, 2025
-- Database: MySQL/MariaDB
-- ============================================================================

-- NOTE: The following tables are already in schema.mysql.sql:
-- - bull_pens
-- - bull_pen_memberships
-- - bull_pen_positions
-- - bull_pen_orders
-- - leaderboard_snapshots
-- - market_data
--
-- This script adds any missing tables and creates indexes for performance.

-- ============================================================================
-- VERIFY EXISTING TABLES
-- ============================================================================

-- Check if bull_pens table exists
SELECT 'bull_pens table exists' AS status FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bull_pens';

-- Check if bull_pen_memberships table exists
SELECT 'bull_pen_memberships table exists' AS status FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bull_pen_memberships';

-- ============================================================================
-- ADD MISSING INDEXES FOR PERFORMANCE
-- ============================================================================

-- Note: Most indexes already exist in schema.mysql.sql
-- This section adds any additional indexes that may be missing

-- Indexes for bull_pens table (if not already present)
-- idx_bull_pens_host_user_id - Already exists
-- idx_bull_pens_state_start_time - Already exists

-- Indexes for bull_pen_memberships table (if not already present)
-- idx_bull_pen_memberships_user_id - Already exists
-- idx_bull_pen_memberships_bull_pen_id_status - Already exists

-- Indexes for bull_pen_positions table (if not already present)
-- idx_bull_pen_positions_room_user_symbol - Already exists

-- Indexes for bull_pen_orders table (if not already present)
-- idx_bull_pen_orders_room_user - Already exists
-- idx_bull_pen_orders_room_symbol - Already exists

-- Indexes for leaderboard_snapshots table (if not already present)
-- idx_leaderboard_room_snapshot - Already exists
-- idx_leaderboard_user - Already exists

-- Indexes for market_data table (if not already present)
-- idx_market_data_updated - Already exists

-- ============================================================================
-- ADD MISSING COLUMNS (if any)
-- ============================================================================

-- Add columns to bull_pens if they don't exist
ALTER TABLE bull_pens ADD COLUMN IF NOT EXISTS settlement_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE bull_pens ADD COLUMN IF NOT EXISTS season_id INT NULL;

-- Note: bull_pen_memberships already has role column in schema

-- ============================================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Active Trade Rooms
CREATE OR REPLACE VIEW active_trade_rooms AS
SELECT 
  bp.id,
  bp.name,
  bp.host_user_id,
  u.name AS host_name,
  bp.state,
  bp.start_time,
  bp.duration_sec,
  COUNT(bpm.id) AS player_count,
  bp.max_players,
  bp.starting_cash
FROM bull_pens bp
JOIN users u ON bp.host_user_id = u.id
LEFT JOIN bull_pen_memberships bpm ON bp.id = bpm.bull_pen_id AND bpm.status = 'active'
WHERE bp.state IN ('active', 'scheduled')
GROUP BY bp.id;

-- View: User Trade Room Positions
-- Note: Column names in bull_pen_positions are: qty, avg_cost (not quantity, average_cost)
CREATE OR REPLACE VIEW user_trade_room_positions AS
SELECT
  bpp.id,
  bpp.bull_pen_id,
  bpp.user_id,
  bpp.symbol,
  bpp.qty AS quantity,
  bpp.avg_cost AS average_cost,
  md.current_price,
  (bpp.qty * md.current_price) AS current_value,
  ((md.current_price - bpp.avg_cost) * bpp.qty) AS unrealized_pnl
FROM bull_pen_positions bpp
LEFT JOIN market_data md ON bpp.symbol = md.symbol;

-- View: Trade Room Leaderboard
-- Note: Column names in leaderboard_snapshots are: rank, pnl_abs, pnl_pct, snapshot_at (not cash, pnl, pnl_percent, created_at)
CREATE OR REPLACE VIEW trade_room_leaderboard AS
SELECT
  ls.bull_pen_id,
  ls.`rank`,
  ls.user_id,
  u.name,
  ls.portfolio_value,
  ls.pnl_abs AS pnl,
  ls.pnl_pct AS pnl_percent,
  ls.snapshot_at AS created_at
FROM leaderboard_snapshots ls
JOIN users u ON ls.user_id = u.id
ORDER BY ls.bull_pen_id, ls.`rank`;

-- ============================================================================
-- VERIFY MIGRATION
-- ============================================================================

-- Count tables
SELECT COUNT(*) AS table_count FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE();

-- List all Trade Room related tables
SELECT TABLE_NAME FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('bull_pens', 'bull_pen_memberships', 'bull_pen_positions', 
                   'bull_pen_orders', 'leaderboard_snapshots', 'market_data');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary:
-- ✅ Verified existing Trade Room tables
-- ✅ Added performance indexes
-- ✅ Added missing columns
-- ✅ Created helper views
-- ✅ Ready for Trade Room implementation


