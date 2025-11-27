-- ============================================================================
-- Production Fix: Add Missing Columns to Portfolio Tables
-- Database: baharc5_fantasyBroker
-- ============================================================================
-- The controllers expect these columns for proper functionality

-- ============================================================================
-- Add status to holdings table
-- ============================================================================

ALTER TABLE holdings
ADD COLUMN `status` VARCHAR(20) DEFAULT 'active' COMMENT 'Holding status (active, closed, etc.)'
AFTER asset_class;

-- ============================================================================
-- Verification
-- ============================================================================

DESCRIBE holdings;
DESCRIBE dividends;
DESCRIBE transactions;

-- Verify all required columns exist
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'baharc5_fantasyBroker'
AND TABLE_NAME IN ('holdings', 'dividends', 'transactions')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

