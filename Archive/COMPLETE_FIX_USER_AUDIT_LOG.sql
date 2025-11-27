-- ============================================================================
-- COMPLETE FIX: Drop and Recreate user_audit_log Table
-- Date: 2025-11-25
-- Description:
--   The table was created with missing columns.
--   This drops and recreates it with ALL required columns.
-- ============================================================================

-- Drop the incomplete table
DROP TABLE IF EXISTS user_audit_log;

-- Create the COMPLETE table with ALL columns the backend expects
CREATE TABLE user_audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_type VARCHAR(100) NOT NULL COMMENT 'Type of event (e.g., login, logout, profile_update)',
    event_category VARCHAR(50) NOT NULL COMMENT 'Category: authentication, profile, admin, security, etc.',
    description TEXT COMMENT 'Human-readable description of the event',
    ip_address VARCHAR(45) COMMENT 'IP address of the user (supports IPv6)',
    user_agent TEXT COMMENT 'User agent string from the request',
    previous_values JSON COMMENT 'Previous values before the change (for updates)',
    new_values JSON COMMENT 'New values after the change (for updates)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'When the event occurred',
    
    -- Indexes for performance
    INDEX idx_user_audit_log_user_id (user_id),
    INDEX idx_user_audit_log_event_type (event_type),
    INDEX idx_user_audit_log_event_category (event_category),
    INDEX idx_user_audit_log_created_at (created_at),
    
    -- Foreign key constraint
    CONSTRAINT fk_user_audit_log_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit log for tracking all user-related events';

-- ============================================================================
-- Verification
-- ============================================================================

-- Show the table structure
SHOW CREATE TABLE user_audit_log;

-- Show all columns
SHOW COLUMNS FROM user_audit_log;

-- Verify table is empty
SELECT COUNT(*) FROM user_audit_log;

-- ============================================================================
-- Expected Columns (in order):
-- 1. id - INT AUTO_INCREMENT PRIMARY KEY
-- 2. user_id - INT NOT NULL
-- 3. event_type - VARCHAR(100) NOT NULL
-- 4. event_category - VARCHAR(50) NOT NULL
-- 5. description - TEXT
-- 6. ip_address - VARCHAR(45)
-- 7. user_agent - TEXT
-- 8. previous_values - JSON
-- 9. new_values - JSON
-- 10. created_at - DATETIME DEFAULT CURRENT_TIMESTAMP
-- ============================================================================

