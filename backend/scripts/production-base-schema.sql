-- ============================================================================
-- PRODUCTION BASE SCHEMA - USERS AND AUDIT LOG TABLES
-- This creates the essential tables needed for authentication
-- ============================================================================

-- ============================================================================
-- USERS TABLE
-- Supports multiple authentication methods: Google OAuth, Email/Password, Demo
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),

    -- Authentication fields
    auth_provider VARCHAR(20) NOT NULL DEFAULT 'email',
    password_hash VARCHAR(255) DEFAULT NULL COMMENT 'NULL for OAuth users',
    google_id VARCHAR(255) UNIQUE DEFAULT NULL COMMENT 'Google user ID (sub claim)',
    profile_picture VARCHAR(500) DEFAULT NULL COMMENT 'URL to profile picture',

    -- OAuth tokens (optional, for future API calls)
    google_access_token TEXT,
    google_refresh_token TEXT,
    google_token_expiry DATETIME,

    -- Metadata
    is_demo BOOLEAN DEFAULT FALSE COMMENT 'TRUE for demo/guest users',
    is_admin BOOLEAN DEFAULT FALSE COMMENT 'TRUE for admin users with elevated privileges',
    status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT 'active, suspended, deleted',
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,

    -- Constraints
    CONSTRAINT chk_auth_provider CHECK (auth_provider IN ('email', 'google', 'demo')),
    CONSTRAINT chk_user_status CHECK (status IN ('active', 'suspended', 'deleted')),
    CONSTRAINT chk_valid_auth CHECK (
        (auth_provider = 'email' AND password_hash IS NOT NULL) OR
        (auth_provider = 'google' AND google_id IS NOT NULL) OR
        (auth_provider = 'demo' AND is_demo = TRUE)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User accounts supporting Google OAuth, email/password, and demo authentication';

-- ============================================================================
-- USER AUDIT LOG TABLE
-- Tracks all user-related events for security monitoring and compliance
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
-- VERIFICATION
-- ============================================================================

SELECT 'Base schema tables created successfully' AS status;
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema=DATABASE() AND table_name IN ('users', 'user_audit_log');

