-- ============================================================================
-- Portfolio Tracker Database Schema
-- Supports: Google OAuth, Email/Password Auth, Demo Mode
-- Database: MySQL/MariaDB
-- ============================================================================

-- Drop existing tables (if recreating)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS dividends;
DROP TABLE IF EXISTS holdings;
DROP TABLE IF EXISTS users;

-- ============================================================================
-- USERS TABLE
-- Supports multiple authentication methods: Google OAuth, Email/Password, Demo
-- ============================================================================

CREATE TABLE users (
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
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_auth_provider CHECK (auth_provider IN ('email', 'google', 'demo')),
    CONSTRAINT chk_valid_auth CHECK (
        (auth_provider = 'email' AND password_hash IS NOT NULL) OR
        (auth_provider = 'google' AND google_id IS NOT NULL) OR
        (auth_provider = 'demo' AND is_demo = TRUE)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User accounts supporting Google OAuth, email/password, and demo authentication';

-- ============================================================================
-- HOLDINGS TABLE
-- Stores user's stock holdings (per-user data)
-- ============================================================================

CREATE TABLE holdings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    shares DECIMAL(10, 4) NOT NULL,
    purchase_price DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    sector VARCHAR(50),
    asset_class VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_holdings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_holdings_shares CHECK (shares > 0),
    CONSTRAINT chk_holdings_price CHECK (purchase_price > 0),
    UNIQUE KEY unique_user_ticker (user_id, ticker)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User stock holdings with purchase information';

-- ============================================================================
-- DIVIDENDS TABLE
-- Stores dividend payment records (per-user data)
-- ============================================================================

CREATE TABLE dividends (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    shares DECIMAL(10, 4) NOT NULL,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_dividends_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_dividends_amount CHECK (amount > 0),
    CONSTRAINT chk_dividends_shares CHECK (shares > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Dividend payment records per user';

-- ============================================================================
-- TRANSACTIONS TABLE
-- Stores transaction history: buy, sell, dividend (per-user data)
-- ============================================================================

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(20) NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    shares DECIMAL(10, 4) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    fees DECIMAL(10, 2) DEFAULT 0,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_transactions_type CHECK (type IN ('buy', 'sell', 'dividend')),
    CONSTRAINT chk_transactions_shares CHECK (shares > 0),
    CONSTRAINT chk_transactions_price CHECK (price >= 0),
    CONSTRAINT chk_transactions_fees CHECK (fees >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Transaction history (buy/sell/dividend) per user';

-- ============================================================================
-- INDEXES
-- Optimize queries for user lookups and data filtering
-- ============================================================================

-- User authentication lookups
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_auth_provider ON users(auth_provider);
CREATE INDEX idx_users_email ON users(email);

-- Per-user data queries
CREATE INDEX idx_holdings_user_id ON holdings(user_id);
CREATE INDEX idx_holdings_ticker ON holdings(ticker);
CREATE INDEX idx_dividends_user_id ON dividends(user_id);
CREATE INDEX idx_dividends_ticker ON dividends(ticker);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_ticker ON transactions(ticker);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- Uncomment to insert test data
-- ============================================================================

-- Test user with email/password
-- INSERT INTO users (email, name, auth_provider, password_hash) 
-- VALUES ('test@example.com', 'Test User', 'email', '$2b$10$abcdefghijklmnopqrstuvwxyz');

-- Test user with Google OAuth
-- INSERT INTO users (email, name, auth_provider, google_id, profile_picture)
-- VALUES ('google@example.com', 'Google User', 'google', 'google_123456', 'https://example.com/avatar.jpg');

-- Demo user
-- INSERT INTO users (email, name, auth_provider, is_demo)
-- VALUES ('demo@demo.local', 'Demo User', 'demo', TRUE);

