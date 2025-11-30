-- ============================================================================
-- CREATE MARKET_DATA TABLE
-- Cached stock price information for order execution and portfolio valuation
-- ============================================================================

CREATE TABLE IF NOT EXISTS market_data (
    symbol VARCHAR(32) PRIMARY KEY,
    current_price DECIMAL(18, 6) NOT NULL,
    company_name VARCHAR(255),
    change_percent DECIMAL(10, 4),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cached stock price data for order execution and portfolio valuation';

CREATE INDEX IF NOT EXISTS idx_market_data_updated ON market_data(last_updated);

-- Verify table was created
SELECT 'market_data table created successfully' AS status;
SHOW TABLES LIKE 'market_data';

