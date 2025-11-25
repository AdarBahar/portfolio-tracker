-- ============================================================================
-- Migration: Add Soft Delete, Status Columns, and Audit Logging
-- Date: 2025-11-25
-- Description:
--   1. Add deleted_at column to all tables (soft delete)
--   2. Add status column to users table
--   3. Add status column to holdings table
--   4. Create user_audit_log table for tracking all user-related events
-- ============================================================================

-- ============================================================================
-- PART 1: Add Soft Delete (deleted_at) to All Tables
-- ============================================================================

-- Users table
ALTER TABLE users 
ADD COLUMN deleted_at DATETIME NULL COMMENT 'Soft delete timestamp';

-- Holdings table
ALTER TABLE holdings 
ADD COLUMN deleted_at DATETIME NULL COMMENT 'Soft delete timestamp';

-- Dividends table
ALTER TABLE dividends 
ADD COLUMN deleted_at DATETIME NULL COMMENT 'Soft delete timestamp';

-- Transactions table
ALTER TABLE transactions 
ADD COLUMN deleted_at DATETIME NULL COMMENT 'Soft delete timestamp';

-- Bull Pens table
ALTER TABLE bull_pens 
ADD COLUMN deleted_at DATETIME NULL COMMENT 'Soft delete timestamp';

-- Bull Pen Memberships table
ALTER TABLE bull_pen_memberships 
ADD COLUMN deleted_at DATETIME NULL COMMENT 'Soft delete timestamp';

-- Bull Pen Positions table
ALTER TABLE bull_pen_positions 
ADD COLUMN deleted_at DATETIME NULL COMMENT 'Soft delete timestamp';

-- Bull Pen Orders table
ALTER TABLE bull_pen_orders 
ADD COLUMN deleted_at DATETIME NULL COMMENT 'Soft delete timestamp';

-- Leaderboard Snapshots table
ALTER TABLE leaderboard_snapshots 
ADD COLUMN deleted_at DATETIME NULL COMMENT 'Soft delete timestamp';

-- Market Data table (optional - usually not soft deleted)
-- ALTER TABLE market_data 
-- ADD COLUMN deleted_at DATETIME NULL COMMENT 'Soft delete timestamp';

-- ============================================================================
-- PART 2: Add Status Column to Users Table
-- ============================================================================

ALTER TABLE users 
ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'active' 
COMMENT 'User account status',
ADD CONSTRAINT chk_user_status CHECK (
    status IN (
        'active',              -- User can log in and use the product
        'inactive',            -- User exists but not allowed to log in
        'archived',            -- Permanently disabled, hidden from most views
        'pending_verification',-- Awaiting email or phone verification
        'invited',             -- Invitation sent, signup not completed
        'suspended',           -- Policy violations or temporary blocks
        'deleted'              -- Soft delete, retain for logs/audits
    )
);

-- ============================================================================
-- PART 3: Add Status Column to Holdings Table
-- ============================================================================

ALTER TABLE holdings 
ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'active' 
COMMENT 'Holding status',
ADD CONSTRAINT chk_holding_status CHECK (
    status IN (
        'active',              -- Currently held position
        'pending_settlement',  -- Trade executed but not settled (T+2)
        'locked',              -- Temporarily locked (transfer, legal hold)
        'archived'             -- Historical record, no longer active
    )
);

-- ============================================================================
-- PART 4: Create User Audit Log Table
-- ============================================================================

CREATE TABLE user_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    previous_value JSON NULL COMMENT 'Value before the change',
    new_value JSON NULL COMMENT 'Value after the change',
    reason TEXT NULL COMMENT 'Optional explanation for the change',
    triggered_by_type ENUM('user', 'admin', 'system', 'maintenance_script') NOT NULL DEFAULT 'system',
    triggered_by_id INT NULL COMMENT 'User ID who triggered the event, NULL for system',
    ip_address VARCHAR(45) NULL COMMENT 'IPv4 or IPv6 address',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_audit_triggered_by FOREIGN KEY (triggered_by_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for fast queries
    INDEX idx_audit_user_id (user_id),
    INDEX idx_audit_event_type (event_type),
    INDEX idx_audit_created_at (created_at),
    INDEX idx_audit_user_event_time (user_id, event_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Immutable audit log for all user-related events and status changes';

-- ============================================================================
-- PART 5: Add Indexes for Soft Delete Queries
-- ============================================================================

-- Add indexes on deleted_at for efficient filtering
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_holdings_deleted_at ON holdings(deleted_at);
CREATE INDEX idx_dividends_deleted_at ON dividends(deleted_at);
CREATE INDEX idx_transactions_deleted_at ON transactions(deleted_at);
CREATE INDEX idx_bull_pens_deleted_at ON bull_pens(deleted_at);
CREATE INDEX idx_bull_pen_memberships_deleted_at ON bull_pen_memberships(deleted_at);
CREATE INDEX idx_bull_pen_positions_deleted_at ON bull_pen_positions(deleted_at);
CREATE INDEX idx_bull_pen_orders_deleted_at ON bull_pen_orders(deleted_at);
CREATE INDEX idx_leaderboard_snapshots_deleted_at ON leaderboard_snapshots(deleted_at);

-- Add index on user status for filtering
CREATE INDEX idx_users_status ON users(status);

-- Add index on holding status for filtering
CREATE INDEX idx_holdings_status ON holdings(status);

-- ============================================================================
-- PART 6: Set Default Status for Existing Users
-- ============================================================================

-- Set all existing users to 'active' status
UPDATE users SET status = 'active' WHERE status IS NULL OR status = '';

-- Set all existing holdings to 'active' status
UPDATE holdings SET status = 'active' WHERE status IS NULL OR status = '';

-- ============================================================================
-- Migration Complete
-- ============================================================================

