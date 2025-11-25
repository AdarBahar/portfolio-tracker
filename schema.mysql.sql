-- ============================================================================
-- Portfolio Tracker Database Schema
-- Supports: Google OAuth, Email/Password Auth, Demo Mode
-- Database: MySQL/MariaDB
-- ============================================================================

-- Drop existing tables (if recreating)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS dividends;
DROP TABLE IF EXISTS holdings;
DROP TABLE IF EXISTS user_audit_log;
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
    is_admin BOOLEAN DEFAULT FALSE COMMENT 'TRUE for admin users with elevated privileges',
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
-- USER AUDIT LOG TABLE
-- Tracks all user-related events for security monitoring and compliance
-- ============================================================================

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


-- =========================================================================
-- BULL_PENS TABLE
-- Trade Room (Bull Pen) sessions
-- =========================================================================

CREATE TABLE bull_pens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    host_user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    state VARCHAR(20) NOT NULL DEFAULT 'draft',
    start_time DATETIME,
    duration_sec INT NOT NULL,
    max_players INT NOT NULL DEFAULT 10,
    starting_cash DECIMAL(18, 2) NOT NULL,
    allow_fractional BOOLEAN NOT NULL DEFAULT FALSE,
    approval_required BOOLEAN NOT NULL DEFAULT FALSE,
    invite_code VARCHAR(16) UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT fk_bull_pens_host_user FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_bull_pens_state CHECK (state IN ('draft', 'scheduled', 'active', 'completed', 'archived')),
    CONSTRAINT chk_bull_pens_duration CHECK (duration_sec > 0),
    CONSTRAINT chk_bull_pens_max_players CHECK (max_players > 0),
    CONSTRAINT chk_bull_pens_starting_cash CHECK (starting_cash > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Trade Room (Bull Pen) sessions';

-- =========================================================================
-- BULL_PEN_MEMBERSHIPS TABLE
-- Participant memberships in Bull Pen sessions
-- =========================================================================

CREATE TABLE bull_pen_memberships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bull_pen_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'player',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    cash DECIMAL(18, 2) NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT fk_bull_pen_memberships_bull_pen FOREIGN KEY (bull_pen_id) REFERENCES bull_pens(id) ON DELETE CASCADE,
    CONSTRAINT fk_bull_pen_memberships_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_bull_pen_memberships_role CHECK (role IN ('host', 'player')),
    CONSTRAINT chk_bull_pen_memberships_status CHECK (status IN ('pending', 'active', 'kicked', 'left')),
    CONSTRAINT chk_bull_pen_memberships_cash CHECK (cash >= 0),
    UNIQUE KEY uniq_bull_pen_member (bull_pen_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Memberships of users in Bull Pen trade rooms';

-- =========================================================================
-- BULL_PEN_POSITIONS TABLE
-- Per-user symbol positions within a Bull Pen
-- =========================================================================

CREATE TABLE bull_pen_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bull_pen_id INT NOT NULL,
    user_id INT NOT NULL,
    symbol VARCHAR(32) NOT NULL,
    qty DECIMAL(18, 8) NOT NULL,
    avg_cost DECIMAL(18, 6) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT fk_bull_pen_positions_bull_pen FOREIGN KEY (bull_pen_id) REFERENCES bull_pens(id) ON DELETE CASCADE,
    CONSTRAINT fk_bull_pen_positions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_bull_pen_positions_qty CHECK (qty >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Per-user symbol positions within Bull Pen sessions';

-- =========================================================================
-- BULL_PEN_ORDERS TABLE
-- Orders placed within a Bull Pen session
-- =========================================================================

CREATE TABLE bull_pen_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bull_pen_id INT NOT NULL,
    user_id INT NOT NULL,
    symbol VARCHAR(32) NOT NULL,
    side ENUM('buy', 'sell') NOT NULL,
    type ENUM('market', 'limit') NOT NULL,
    qty DECIMAL(18, 8) NOT NULL,
    filled_qty DECIMAL(18, 8) NOT NULL DEFAULT 0,
    limit_price DECIMAL(18, 6) NULL,
    avg_fill_price DECIMAL(18, 6) NULL,
    status ENUM('new', 'partially_filled', 'filled', 'cancelled', 'rejected') NOT NULL DEFAULT 'new',
    rejection_reason TEXT NULL,
    placed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    filled_at DATETIME NULL,
    server_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    feed_ts DATETIME NULL,

    -- Constraints
    CONSTRAINT fk_bull_pen_orders_bull_pen FOREIGN KEY (bull_pen_id) REFERENCES bull_pens(id) ON DELETE CASCADE,
    CONSTRAINT fk_bull_pen_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_bull_pen_orders_qty CHECK (qty > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Orders placed by users within Bull Pen sessions';


-- =========================================================================
-- INDEXES
-- Optimize queries for user lookups and data filtering
-- =========================================================================

-- User authentication lookups
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_auth_provider ON users(auth_provider);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_admin ON users(is_admin);

-- Per-user data queries
CREATE INDEX idx_holdings_user_id ON holdings(user_id);
CREATE INDEX idx_holdings_ticker ON holdings(ticker);
CREATE INDEX idx_dividends_user_id ON dividends(user_id);
CREATE INDEX idx_dividends_ticker ON dividends(ticker);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_ticker ON transactions(ticker);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_bull_pens_state_start_time ON bull_pens(state, start_time);
CREATE INDEX idx_bull_pens_host_user_id ON bull_pens(host_user_id);
CREATE INDEX idx_bull_pen_memberships_bull_pen_id_status ON bull_pen_memberships(bull_pen_id, status);
CREATE INDEX idx_bull_pen_memberships_user_id ON bull_pen_memberships(user_id);
CREATE INDEX idx_bull_pen_positions_room_user_symbol ON bull_pen_positions(bull_pen_id, user_id, symbol);
CREATE INDEX idx_bull_pen_orders_room_user ON bull_pen_orders(bull_pen_id, user_id, placed_at);
CREATE INDEX idx_bull_pen_orders_room_symbol ON bull_pen_orders(bull_pen_id, symbol, placed_at);


-- =========================================================================
-- MARKET DATA TABLE
-- Cached stock price information for order execution and portfolio valuation
-- =========================================================================

CREATE TABLE market_data (
    symbol VARCHAR(32) PRIMARY KEY,
    current_price DECIMAL(18, 6) NOT NULL,
    company_name VARCHAR(255),
    change_percent DECIMAL(10, 4),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cached stock price data for order execution and portfolio valuation';

CREATE INDEX idx_market_data_updated ON market_data(last_updated);


-- =========================================================================
-- LEADERBOARD SNAPSHOTS TABLE
-- Periodic rankings of player performance in bull pens
-- =========================================================================

CREATE TABLE leaderboard_snapshots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bull_pen_id INT NOT NULL,
    user_id INT NOT NULL,
    snapshot_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rank INT,
    portfolio_value DECIMAL(18, 2) NOT NULL,
    pnl_abs DECIMAL(18, 2) NOT NULL,
    pnl_pct DECIMAL(10, 4) NOT NULL,
    last_trade_at TIMESTAMP NULL,

    -- Constraints
    CONSTRAINT fk_leaderboard_bull_pen FOREIGN KEY (bull_pen_id) REFERENCES bull_pens(id) ON DELETE CASCADE,
    CONSTRAINT fk_leaderboard_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Periodic snapshots of player rankings and performance metrics';

CREATE INDEX idx_leaderboard_room_snapshot ON leaderboard_snapshots(bull_pen_id, snapshot_at DESC);
CREATE INDEX idx_leaderboard_user ON leaderboard_snapshots(user_id, snapshot_at DESC);


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

