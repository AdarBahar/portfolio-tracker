-- ============================================================================
-- Migration: Create user_audit_log Table
-- Date: 2025-11-25
-- Description:
--   Create user_audit_log table to track all user-related events for
--   security monitoring, compliance, and debugging purposes.
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_audit_log (
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
-- Migration Complete
-- ============================================================================

-- To verify the migration:
-- SHOW CREATE TABLE user_audit_log;
-- SELECT COUNT(*) FROM user_audit_log;

-- Example: Insert a test audit log entry
-- INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address)
-- VALUES (1, 'login', 'authentication', 'User logged in successfully', '127.0.0.1');

