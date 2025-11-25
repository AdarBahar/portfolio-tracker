-- ============================================================================
-- Rollback: Remove is_admin Column from Users Table
-- Date: 2025-11-25
-- Description: Rollback script for add-is-admin-column.sql
-- WARNING: This will remove all admin privilege data!
-- ============================================================================

-- Drop index
DROP INDEX IF EXISTS idx_users_is_admin ON users;

-- Remove is_admin column
ALTER TABLE users DROP COLUMN IF EXISTS is_admin;

-- ============================================================================
-- Rollback Complete
-- ============================================================================

