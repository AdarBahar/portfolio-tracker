-- ============================================================================
-- Fake Data Loading Script for Portfolio Tracker
-- Loads test data for user ID 4 (adarb@bahar.co.il)
-- Includes: Budget with transactions, Trading room memberships, Leaderboard data
-- ============================================================================

-- Ensure user 4 exists (if not, create it)
-- Using demo auth provider to avoid password_hash requirement
INSERT IGNORE INTO users (id, email, name, auth_provider, is_demo, is_admin, created_at, last_login)
VALUES (4, 'adarb@bahar.co.il', 'Adar Bahar', 'demo', 1, 0, NOW(), NOW());

-- ============================================================================
-- BUDGET DATA FOR USER 4
-- ============================================================================

-- Create budget for user 4 with $5,000 available balance
INSERT INTO user_budgets (user_id, available_balance, locked_balance, currency, status, created_at, updated_at)
VALUES (4, 5000.00, 0.00, 'VUSD', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE available_balance = 5000.00, locked_balance = 0.00;

-- Add budget transaction logs (simulating various operations)
INSERT INTO budget_logs (user_id, direction, operation_type, amount, currency, balance_before, balance_after, correlation_id, created_at)
VALUES
  (4, 'IN', 'INITIAL_CREDIT', 5000.00, 'VUSD', 0.00, 5000.00, 'init-user4-001', DATE_SUB(NOW(), INTERVAL 30 DAY)),
  (4, 'OUT', 'ROOM_BUY_IN', 500.00, 'VUSD', 5000.00, 4500.00, 'room-1-join-uuid1', DATE_SUB(NOW(), INTERVAL 25 DAY)),
  (4, 'IN', 'ROOM_SETTLEMENT_WIN', 750.00, 'VUSD', 4500.00, 5250.00, 'room-1-settlement-uuid1', DATE_SUB(NOW(), INTERVAL 24 DAY)),
  (4, 'OUT', 'ROOM_BUY_IN', 500.00, 'VUSD', 5250.00, 4750.00, 'room-2-join-uuid2', DATE_SUB(NOW(), INTERVAL 20 DAY)),
  (4, 'IN', 'ROOM_SETTLEMENT_LOSS', 250.00, 'VUSD', 4750.00, 5000.00, 'room-2-settlement-uuid2', DATE_SUB(NOW(), INTERVAL 19 DAY)),
  (4, 'OUT', 'ROOM_BUY_IN', 500.00, 'VUSD', 5000.00, 4500.00, 'room-3-join-uuid3', DATE_SUB(NOW(), INTERVAL 15 DAY)),
  (4, 'LOCK', 'ROOM_BUY_IN_LOCK', 500.00, 'VUSD', 4500.00, 4500.00, 'room-3-lock-uuid3', DATE_SUB(NOW(), INTERVAL 14 DAY)),
  (4, 'IN', 'TRANSFER_IN', 100.00, 'VUSD', 4500.00, 4600.00, 'transfer-uuid-001', DATE_SUB(NOW(), INTERVAL 10 DAY)),
  (4, 'OUT', 'TRANSFER_OUT', 50.00, 'VUSD', 4600.00, 4550.00, 'transfer-uuid-002', DATE_SUB(NOW(), INTERVAL 8 DAY)),
  (4, 'IN', 'ADJUSTMENT_CREDIT', 200.00, 'VUSD', 4550.00, 4750.00, 'admin-adjust-001', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- ============================================================================
-- TRADING ROOM DATA
-- Create 3 trading rooms for user 4 to join
-- ============================================================================

-- Room 1: Completed room (user won)
INSERT INTO bull_pens (host_user_id, name, description, state, start_time, duration_sec, max_players, starting_cash, allow_fractional, approval_required, created_at, updated_at)
VALUES (1, 'Tech Stock Showdown', 'Compete trading tech stocks', 'completed', DATE_SUB(NOW(), INTERVAL 25 DAY), 86400, 10, 500.00, 1, 0, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 24 DAY));

-- Room 2: Completed room (user lost)
INSERT INTO bull_pens (host_user_id, name, description, state, start_time, duration_sec, max_players, starting_cash, allow_fractional, approval_required, created_at, updated_at)
VALUES (2, 'Blue Chip Battle', 'Conservative dividend stocks', 'completed', DATE_SUB(NOW(), INTERVAL 20 DAY), 86400, 8, 500.00, 0, 0, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 19 DAY));

-- Room 3: Active room (ongoing)
INSERT INTO bull_pens (host_user_id, name, description, state, start_time, duration_sec, max_players, starting_cash, allow_fractional, approval_required, created_at, updated_at)
VALUES (3, 'Growth Stock Challenge', 'High-growth tech and biotech', 'active', DATE_SUB(NOW(), INTERVAL 14 DAY), 604800, 12, 500.00, 1, 0, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW());

-- ============================================================================
-- BULL PEN MEMBERSHIPS FOR USER 4
-- ============================================================================

-- User 4 joins Room 1 (completed, won)
INSERT INTO bull_pen_memberships (bull_pen_id, user_id, role, status, cash, joined_at)
VALUES (1, 4, 'player', 'active', 500.00, DATE_SUB(NOW(), INTERVAL 25 DAY));

-- User 4 joins Room 2 (completed, lost)
INSERT INTO bull_pen_memberships (bull_pen_id, user_id, role, status, cash, joined_at)
VALUES (2, 4, 'player', 'active', 500.00, DATE_SUB(NOW(), INTERVAL 20 DAY));

-- User 4 joins Room 3 (active)
INSERT INTO bull_pen_memberships (bull_pen_id, user_id, role, status, cash, joined_at)
VALUES (3, 4, 'player', 'active', 500.00, DATE_SUB(NOW(), INTERVAL 14 DAY));

-- ============================================================================
-- LEADERBOARD SNAPSHOTS FOR USER 4
-- ============================================================================

-- Room 1 final leaderboard (user 4 ranked 1st, won)
INSERT INTO leaderboard_snapshots (bull_pen_id, user_id, snapshot_at, rank, portfolio_value, pnl_abs, pnl_pct)
VALUES (1, 4, DATE_SUB(NOW(), INTERVAL 24 DAY), 1, 1250.00, 750.00, 150.00);

-- Room 2 final leaderboard (user 4 ranked 3rd, lost)
INSERT INTO leaderboard_snapshots (bull_pen_id, user_id, snapshot_at, rank, portfolio_value, pnl_abs, pnl_pct)
VALUES (2, 4, DATE_SUB(NOW(), INTERVAL 19 DAY), 3, 750.00, 250.00, 50.00);

-- Room 3 current leaderboard (user 4 ranked 2nd, ongoing)
INSERT INTO leaderboard_snapshots (bull_pen_id, user_id, snapshot_at, rank, portfolio_value, pnl_abs, pnl_pct)
VALUES (3, 4, NOW(), 2, 1100.00, 600.00, 120.00);

-- ============================================================================
-- BULL PEN POSITIONS FOR USER 4 IN ACTIVE ROOM
-- ============================================================================

-- User 4's positions in Room 3 (active)
INSERT INTO bull_pen_positions (bull_pen_id, user_id, symbol, qty, avg_cost, created_at, updated_at)
VALUES
  (3, 4, 'AAPL', 10.5, 150.00, DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
  (3, 4, 'MSFT', 5.0, 300.00, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
  (3, 4, 'GOOGL', 2.5, 140.00, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW());

-- ============================================================================
-- BULL PEN ORDERS FOR USER 4
-- ============================================================================

-- Orders in Room 3 (active)
INSERT INTO bull_pen_orders (bull_pen_id, user_id, symbol, side, type, qty, filled_qty, limit_price, avg_fill_price, status, placed_at)
VALUES
  (3, 4, 'AAPL', 'buy', 'market', 10.5, 10.5, NULL, 150.00, 'filled', DATE_SUB(NOW(), INTERVAL 14 DAY)),
  (3, 4, 'MSFT', 'buy', 'limit', 5.0, 5.0, 300.00, 300.00, 'filled', DATE_SUB(NOW(), INTERVAL 12 DAY)),
  (3, 4, 'GOOGL', 'buy', 'market', 2.5, 2.5, NULL, 140.00, 'filled', DATE_SUB(NOW(), INTERVAL 10 DAY));

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- User 4 (adarb@bahar.co.il) now has:
-- - Budget: $4,750.00 available, $0.00 locked
-- - 10 budget transaction logs showing various operations
-- - Membership in 3 trading rooms (1 completed win, 1 completed loss, 1 active)
-- - Leaderboard standings in all 3 rooms
-- - Stock positions in the active room (AAPL, MSFT, GOOGL)
-- - Order history in the active room
-- ============================================================================

