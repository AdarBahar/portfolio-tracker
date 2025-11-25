-- ============================================================================
-- Migration: Add is_admin Column to Users Table
-- Date: 2025-11-25
-- Description:
--   Add is_admin BOOLEAN column to users table to support admin privileges
--   Admins can:
--   - Access admin pages
--   - Assign/remove admin privileges from other users
-- ============================================================================

-- Add is_admin column to users table
ALTER TABLE users 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE 
COMMENT 'TRUE for admin users with elevated privileges';

-- Create index for admin lookups (optional, for performance)
CREATE INDEX idx_users_is_admin ON users(is_admin);

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- To verify the migration:
-- SELECT id, email, name, is_admin FROM users;

-- To make a user an admin:
-- UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';

