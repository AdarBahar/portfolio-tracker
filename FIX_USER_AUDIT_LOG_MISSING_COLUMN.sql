-- ============================================================================
-- Fix: Add missing event_category column to user_audit_log table
-- Date: 2025-11-25
-- Description:
--   The table was created without the event_category column
--   This adds it to match the backend code expectations
-- ============================================================================

-- Add the missing event_category column
ALTER TABLE user_audit_log 
ADD COLUMN event_category VARCHAR(50) NOT NULL DEFAULT 'general' 
COMMENT 'Category: authentication, profile, admin, security, etc.'
AFTER event_type;

-- Add index for the new column
CREATE INDEX idx_user_audit_log_event_category ON user_audit_log(event_category);

-- ============================================================================
-- Fix Complete
-- ============================================================================

-- To verify:
-- SHOW COLUMNS FROM user_audit_log;
-- Should show event_category column after event_type

