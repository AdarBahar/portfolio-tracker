-- ============================================================================
-- Rollback: Remove Soft Delete, Status Columns, and Audit Logging
-- Date: 2025-11-25
-- Description: Rollback script for add-soft-delete-status-audit.sql
-- WARNING: This will permanently delete audit log data!
-- ============================================================================

-- ============================================================================
-- PART 1: Drop Indexes
-- ============================================================================

-- Drop soft delete indexes
DROP INDEX IF EXISTS idx_users_deleted_at ON users;
DROP INDEX IF EXISTS idx_holdings_deleted_at ON holdings;
DROP INDEX IF EXISTS idx_dividends_deleted_at ON dividends;
DROP INDEX IF EXISTS idx_transactions_deleted_at ON transactions;
DROP INDEX IF EXISTS idx_bull_pens_deleted_at ON bull_pens;
DROP INDEX IF EXISTS idx_bull_pen_memberships_deleted_at ON bull_pen_memberships;
DROP INDEX IF EXISTS idx_bull_pen_positions_deleted_at ON bull_pen_positions;
DROP INDEX IF EXISTS idx_bull_pen_orders_deleted_at ON bull_pen_orders;
DROP INDEX IF EXISTS idx_leaderboard_snapshots_deleted_at ON leaderboard_snapshots;

-- Drop status indexes
DROP INDEX IF EXISTS idx_users_status ON users;
DROP INDEX IF EXISTS idx_holdings_status ON holdings;

-- ============================================================================
-- PART 2: Drop User Audit Log Table
-- ============================================================================

DROP TABLE IF EXISTS user_audit_log;

-- ============================================================================
-- PART 3: Remove Status Columns
-- ============================================================================

-- Remove status from holdings
ALTER TABLE holdings 
DROP CONSTRAINT IF EXISTS chk_holding_status,
DROP COLUMN IF EXISTS status;

-- Remove status from users
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS chk_user_status,
DROP COLUMN IF EXISTS status;

-- ============================================================================
-- PART 4: Remove Soft Delete Columns
-- ============================================================================

-- Remove deleted_at from all tables
ALTER TABLE leaderboard_snapshots DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE bull_pen_orders DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE bull_pen_positions DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE bull_pen_memberships DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE bull_pens DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE transactions DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE dividends DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE holdings DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;

-- ============================================================================
-- Rollback Complete
-- ============================================================================

