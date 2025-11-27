-- ============================================================================
-- Production Fix: Create Missing Portfolio Tables
-- Database: baharc5_fantasyBroker
-- ============================================================================
-- These tables are required for the portfolio endpoints to work:
-- - GET /api/portfolio/all
-- - GET /api/holdings
-- - GET /api/transactions
-- - GET /api/dividends

-- ============================================================================
-- HOLDINGS TABLE
-- Stores user's stock holdings (per-user data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS holdings (
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

CREATE TABLE IF NOT EXISTS dividends (
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

CREATE TABLE IF NOT EXISTS transactions (
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

-- ============================================================================
-- Verification
-- ============================================================================

SELECT 'Holdings table' as table_name, COUNT(*) as row_count FROM holdings
UNION ALL
SELECT 'Dividends table', COUNT(*) FROM dividends
UNION ALL
SELECT 'Transactions table', COUNT(*) FROM transactions;

SHOW TABLES LIKE 'holdings';
SHOW TABLES LIKE 'dividends';
SHOW TABLES LIKE 'transactions';

