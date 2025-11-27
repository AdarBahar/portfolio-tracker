-- ============================================================================
-- Production Fix: Add deleted_at Column to Portfolio Tables
-- Database: baharc5_fantasyBroker
-- ============================================================================
-- The controllers expect a deleted_at column for soft deletes
-- This script adds the missing column to existing tables

-- ============================================================================
-- Add deleted_at to holdings table
-- ============================================================================

ALTER TABLE holdings 
ADD COLUMN deleted_at DATETIME NULL COMMENT 'Soft delete timestamp' 
AFTER updated_at;

-- ============================================================================
-- Add deleted_at to dividends table
-- ============================================================================

ALTER TABLE dividends 
ADD COLUMN deleted_at DATETIME NULL COMMENT 'Soft delete timestamp' 
AFTER created_at;

-- ============================================================================
-- Add deleted_at to transactions table
-- ============================================================================

ALTER TABLE transactions 
ADD COLUMN deleted_at DATETIME NULL COMMENT 'Soft delete timestamp' 
AFTER created_at;

-- ============================================================================
-- Verification
-- ============================================================================

DESCRIBE holdings;
DESCRIBE dividends;
DESCRIBE transactions;

-- Verify deleted_at column exists in all three tables
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'baharc5_fantasyBroker'
AND TABLE_NAME IN ('holdings', 'dividends', 'transactions')
AND COLUMN_NAME = 'deleted_at'
ORDER BY TABLE_NAME;

