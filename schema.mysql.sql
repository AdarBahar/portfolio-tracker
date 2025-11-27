-- ============================================================================
-- Portfolio Tracker Database Schema
-- Supports: Google OAuth, Email/Password Auth, Demo Mode
-- Database: MySQL/MariaDB
-- ============================================================================

-- Drop existing tables (if recreating)
-- Note: Order matters due to foreign key constraints
DROP TABLE IF EXISTS bonus_redemptions;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS rake_collection;
DROP TABLE IF EXISTS rake_config;
DROP TABLE IF EXISTS budget_logs;
DROP TABLE IF EXISTS season_user_stats;
DROP TABLE IF EXISTS user_star_events;
DROP TABLE IF EXISTS achievement_rules;
DROP TABLE IF EXISTS leaderboard_snapshots;
DROP TABLE IF EXISTS bull_pen_orders;
DROP TABLE IF EXISTS bull_pen_positions;
DROP TABLE IF EXISTS bull_pen_memberships;
DROP TABLE IF EXISTS bull_pens;
DROP TABLE IF EXISTS market_data;
DROP TABLE IF EXISTS user_budgets;
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
-- USER BUDGETS TABLE
-- Tracks current virtual money per user (global wallet)
-- ============================================================================

CREATE TABLE user_budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    available_balance DECIMAL(18, 2) NOT NULL DEFAULT 0,
    locked_balance DECIMAL(18, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'VUSD',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,

    -- Constraints
    CONSTRAINT fk_user_budgets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_user_budgets_available_nonnegative CHECK (available_balance >= 0),
    CONSTRAINT chk_user_budgets_locked_nonnegative CHECK (locked_balance >= 0),
    CONSTRAINT chk_user_budgets_status CHECK (status IN ('active', 'frozen', 'closed')),
    UNIQUE KEY uniq_user_budgets_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Current global virtual budget per user';

-- ============================================================================
-- BULL_PENS TABLE
-- Trade Room (Bull Pen) sessions
-- ============================================================================

CREATE TABLE bull_pens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    host_user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    state VARCHAR(20) NOT NULL DEFAULT 'draft',
    settlement_status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending, completed, failed',
    start_time DATETIME,
    duration_sec INT NOT NULL,
    max_players INT NOT NULL DEFAULT 10,
    starting_cash DECIMAL(18, 2) NOT NULL,
    allow_fractional BOOLEAN NOT NULL DEFAULT FALSE,
    approval_required BOOLEAN NOT NULL DEFAULT FALSE,
    invite_code VARCHAR(16) UNIQUE,
    season_id INT NULL COMMENT 'Season this room belongs to (for future use)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT fk_bull_pens_host_user FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_bull_pens_state CHECK (state IN ('draft', 'scheduled', 'active', 'completed', 'cancelled', 'archived')),
    CONSTRAINT chk_bull_pens_settlement_status CHECK (settlement_status IN ('pending', 'completed', 'failed')),
    CONSTRAINT chk_bull_pens_duration CHECK (duration_sec > 0),
    CONSTRAINT chk_bull_pens_max_players CHECK (max_players > 0),
    CONSTRAINT chk_bull_pens_starting_cash CHECK (starting_cash > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Trade Room (Bull Pen) sessions';

-- ============================================================================
-- BUDGET LOGS TABLE
-- Immutable ledger of all budget changes
-- ============================================================================

CREATE TABLE budget_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    direction VARCHAR(10) NOT NULL,
    operation_type VARCHAR(50) NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'VUSD',
    balance_before DECIMAL(18, 2) NOT NULL,
    balance_after DECIMAL(18, 2) NOT NULL,
    bull_pen_id INT NULL,
    season_id INT NULL,
    counterparty_user_id INT NULL,
    moved_from VARCHAR(20) NULL,
    moved_to VARCHAR(20) NULL,
    correlation_id VARCHAR(64) NULL,
    idempotency_key VARCHAR(64) NULL,
    created_by VARCHAR(50) NOT NULL DEFAULT 'system',
    meta JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,

    -- Constraints
    CONSTRAINT fk_budget_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_budget_logs_bull_pen FOREIGN KEY (bull_pen_id) REFERENCES bull_pens(id) ON DELETE CASCADE,
    CONSTRAINT fk_budget_logs_counterparty_user FOREIGN KEY (counterparty_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_budget_logs_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_budget_logs_direction CHECK (direction IN ('IN', 'OUT', 'LOCK', 'UNLOCK')),
    CONSTRAINT chk_budget_logs_moved_from CHECK (moved_from IN ('system', 'user', 'house', 'room_pot') OR moved_from IS NULL),
    CONSTRAINT chk_budget_logs_moved_to CHECK (moved_to IN ('system', 'user', 'house', 'room_pot') OR moved_to IS NULL),
    UNIQUE KEY uniq_budget_logs_idempotency_key (idempotency_key)
    -- NOTE: season_id references a future seasons(id) table; foreign key will be added when the seasons table is introduced.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Immutable ledger of all user budget changes';

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
    `status` VARCHAR(20) DEFAULT 'active' COMMENT 'Holding status (active, closed, etc.)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL COMMENT 'Soft delete timestamp',

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
    deleted_at DATETIME NULL COMMENT 'Soft delete timestamp',

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
    deleted_at DATETIME NULL COMMENT 'Soft delete timestamp',

    -- Constraints
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_transactions_type CHECK (type IN ('buy', 'sell', 'dividend')),
    CONSTRAINT chk_transactions_shares CHECK (shares > 0),
    CONSTRAINT chk_transactions_price CHECK (price >= 0),
    CONSTRAINT chk_transactions_fees CHECK (fees >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Transaction history (buy/sell/dividend) per user';



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
    CONSTRAINT chk_bull_pen_memberships_status CHECK (status IN ('pending', 'active', 'kicked', 'left', 'cancelled')),
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

-- Budget tables
CREATE INDEX idx_user_budgets_user_id ON user_budgets(user_id);
CREATE INDEX idx_user_budgets_status ON user_budgets(status);
CREATE INDEX idx_user_budgets_deleted_at ON user_budgets(deleted_at);
CREATE INDEX idx_budget_logs_user_created_at ON budget_logs(user_id, created_at);
CREATE INDEX idx_budget_logs_operation_type ON budget_logs(operation_type);
CREATE INDEX idx_budget_logs_bull_pen_id ON budget_logs(bull_pen_id);
CREATE INDEX idx_budget_logs_season_id ON budget_logs(season_id);
CREATE INDEX idx_budget_logs_deleted_at ON budget_logs(deleted_at);

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
    `rank` INT,
    portfolio_value DECIMAL(18, 2) NOT NULL,
    pnl_abs DECIMAL(18, 2) NOT NULL,
    pnl_pct DECIMAL(10, 4) NOT NULL,
    last_trade_at TIMESTAMP NULL,
    stars INT DEFAULT 0 COMMENT 'Stars earned in this room',
    score DECIMAL(10, 4) DEFAULT 0 COMMENT 'Composite ranking score',

    -- Constraints
    CONSTRAINT fk_leaderboard_bull_pen FOREIGN KEY (bull_pen_id) REFERENCES bull_pens(id) ON DELETE CASCADE,
    CONSTRAINT fk_leaderboard_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Periodic snapshots of player rankings and performance metrics';

CREATE INDEX idx_leaderboard_room_snapshot ON leaderboard_snapshots(bull_pen_id, snapshot_at DESC);
CREATE INDEX idx_leaderboard_user ON leaderboard_snapshots(user_id, snapshot_at DESC);


-- ============================================================================
-- RAKE/HOUSE FEE CONFIGURATION TABLE
-- Configurable fee structure for room settlements
-- ============================================================================

CREATE TABLE rake_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    fee_type VARCHAR(20) NOT NULL COMMENT 'percentage, fixed, tiered',
    fee_value DECIMAL(10, 4) NOT NULL COMMENT 'For percentage: 0-100, for fixed: amount',
    min_pool DECIMAL(18, 2) DEFAULT 0 COMMENT 'Minimum pool size to apply fee',
    max_pool DECIMAL(18, 2) DEFAULT NULL COMMENT 'Maximum pool size to apply fee',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_rake_fee_type CHECK (fee_type IN ('percentage', 'fixed', 'tiered')),
    CONSTRAINT chk_rake_fee_value CHECK (fee_value >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configurable rake/house fee structure';

-- ============================================================================
-- RAKE COLLECTION TABLE
-- Tracks collected fees from room settlements
-- ============================================================================

CREATE TABLE rake_collection (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bull_pen_id INT NOT NULL,
    rake_config_id INT NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VUSD',
    pool_size DECIMAL(18, 2) NOT NULL COMMENT 'Total pool before rake',
    collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT fk_rake_collection_bull_pen FOREIGN KEY (bull_pen_id) REFERENCES bull_pens(id) ON DELETE CASCADE,
    CONSTRAINT fk_rake_collection_config FOREIGN KEY (rake_config_id) REFERENCES rake_config(id),
    CONSTRAINT chk_rake_amount_positive CHECK (amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Collected rake/house fees from room settlements';

CREATE INDEX idx_rake_collection_bull_pen ON rake_collection(bull_pen_id);
CREATE INDEX idx_rake_collection_collected_at ON rake_collection(collected_at);

-- ============================================================================
-- BONUS & PROMOTION SYSTEM TABLES
-- Configurable promotional credits and bonuses
-- ============================================================================

CREATE TABLE promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    bonus_type VARCHAR(20) NOT NULL COMMENT 'signup, referral, seasonal, custom',
    bonus_amount DECIMAL(18, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VUSD',
    max_uses INT DEFAULT NULL COMMENT 'NULL = unlimited',
    current_uses INT DEFAULT 0,
    min_account_age_days INT DEFAULT 0 COMMENT 'Minimum days since account creation',
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_promotion_type CHECK (bonus_type IN ('signup', 'referral', 'seasonal', 'custom')),
    CONSTRAINT chk_promotion_amount CHECK (bonus_amount > 0),
    CONSTRAINT chk_promotion_dates CHECK (start_date < end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Promotional bonus configurations';

CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_active ON promotions(is_active);

-- ============================================================================
-- BONUS REDEMPTION TABLE
-- Tracks which users have redeemed which bonuses
-- ============================================================================

CREATE TABLE bonus_redemptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    promotion_id INT NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VUSD',
    idempotency_key VARCHAR(255) UNIQUE COMMENT 'Prevent duplicate redemptions',
    correlation_id VARCHAR(255) COMMENT 'Link to budget operation',
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT fk_bonus_redemptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bonus_redemptions_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    CONSTRAINT chk_bonus_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks bonus redemptions by users';

CREATE INDEX idx_bonus_redemptions_user ON bonus_redemptions(user_id);
CREATE INDEX idx_bonus_redemptions_promotion ON bonus_redemptions(promotion_id);
CREATE INDEX idx_bonus_redemptions_idempotency ON bonus_redemptions(idempotency_key);

-- ============================================================================
-- STARS SYSTEM TABLES
-- Gamification system for tracking user achievements and rankings
-- ============================================================================

-- ============================================================================
-- ACHIEVEMENT RULES TABLE
-- Defines configurable achievement rules for star awards
-- ============================================================================

CREATE TABLE achievement_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique identifier for the rule',
    name VARCHAR(150) NOT NULL COMMENT 'Display name of the achievement',
    description TEXT COMMENT 'Detailed description of the achievement',
    category VARCHAR(50) NOT NULL COMMENT 'Category: performance, engagement, seasonal, admin',
    source VARCHAR(50) NOT NULL DEFAULT 'achievement' COMMENT 'Source: achievement, admin, system',
    stars_reward INT NOT NULL COMMENT 'Number of stars awarded',
    is_repeatable TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Can be awarded multiple times',
    max_times INT COMMENT 'Maximum times if repeatable (NULL = unlimited)',
    scope_type VARCHAR(30) NOT NULL COMMENT 'Scope: room, lifetime, season',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether the rule is active',
    conditions_json JSON COMMENT 'JSON object with rule conditions',
    ui_badge_code VARCHAR(100) COMMENT 'Badge code for UI display',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME COMMENT 'Soft delete timestamp',

    -- Indexes
    INDEX idx_active_rules (is_active, deleted_at),
    INDEX idx_category (category),
    INDEX idx_scope_type (scope_type),
    UNIQUE KEY code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configurable achievement rules for star awards';

-- ============================================================================
-- USER STAR EVENTS TABLE
-- Append-only log of star awards (stars never decrease)
-- ============================================================================

CREATE TABLE user_star_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'User who earned the stars',
    bull_pen_id INT COMMENT 'Trading room where stars were earned (nullable)',
    season_id INT COMMENT 'Season ID for seasonal achievements (nullable)',
    source VARCHAR(50) NOT NULL COMMENT 'Source: achievement, admin, system',
    reason_code VARCHAR(100) NOT NULL COMMENT 'Achievement code or reason',
    stars_delta INT NOT NULL COMMENT 'Number of stars awarded (always positive)',
    meta JSON COMMENT 'Additional metadata (e.g., rank, P&L)',
    deleted_at DATETIME COMMENT 'Soft delete timestamp',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for performance
    INDEX idx_user_stars (user_id),
    INDEX idx_room_stars (bull_pen_id),
    INDEX idx_season_stars (season_id),
    INDEX idx_reason_code (reason_code),
    INDEX idx_created_at (created_at),
    INDEX idx_user_reason (user_id, reason_code),

    -- Foreign key constraints
    CONSTRAINT fk_user_star_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_star_events_room FOREIGN KEY (bull_pen_id) REFERENCES bull_pens(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Append-only log of star awards (stars never decrease)';

-- ============================================================================
-- SEASON USER STATS TABLE
-- Aggregated stats per user per season for leaderboard ranking
-- ============================================================================

CREATE TABLE season_user_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'User ID',
    season_id INT NOT NULL COMMENT 'Season ID',
    total_initial_equity DECIMAL(15, 2) NOT NULL COMMENT 'Total starting capital',
    total_portfolio_value DECIMAL(15, 2) NOT NULL COMMENT 'Current portfolio value',
    pnl_abs DECIMAL(15, 2) NOT NULL COMMENT 'Absolute P&L',
    pnl_pct DECIMAL(10, 4) NOT NULL COMMENT 'Percentage P&L',
    stars INT DEFAULT 0 COMMENT 'Total stars earned in season',
    score DECIMAL(10, 4) DEFAULT 0 COMMENT 'Composite ranking score',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE KEY uniq_user_season (user_id, season_id),
    CONSTRAINT fk_season_user_stats_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Indexes
    INDEX idx_season_score (season_id, score),
    INDEX idx_user_season (user_id, season_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Aggregated stats per user per season for leaderboard ranking';

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

