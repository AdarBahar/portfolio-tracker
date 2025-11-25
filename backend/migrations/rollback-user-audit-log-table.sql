-- ============================================================================
-- Rollback Migration: Drop user_audit_log Table
-- Date: 2025-11-25
-- Description:
--   Drop the user_audit_log table if needed
--   WARNING: This will delete all audit log data!
-- ============================================================================

-- Drop the user_audit_log table
DROP TABLE IF EXISTS user_audit_log;

-- ============================================================================
-- Rollback Complete
-- ============================================================================

-- To verify the rollback:
-- SHOW TABLES LIKE 'user_audit_log';
-- (Should return empty result)

