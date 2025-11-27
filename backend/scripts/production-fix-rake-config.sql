-- ============================================================================
-- FIX RAKE_CONFIG TABLE - Add missing columns
-- This script adds the 'name' and 'description' columns if they don't exist
-- ============================================================================

-- Check current structure
DESCRIBE rake_config;

-- Add 'name' column if it doesn't exist
ALTER TABLE rake_config ADD COLUMN IF NOT EXISTS name VARCHAR(100) NOT NULL UNIQUE AFTER id;

-- Add 'description' column if it doesn't exist
ALTER TABLE rake_config ADD COLUMN IF NOT EXISTS description TEXT AFTER name;

-- Verify the structure
DESCRIBE rake_config;

-- Now try to insert the default rake configuration
INSERT INTO rake_config (name, description, fee_type, fee_value, min_pool, max_pool, is_active)
VALUES 
  ('Default Rake Config', 'Default 5% percentage fee for all rooms', 'percentage', 5.00, 100.00, NULL, TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Verify the insert
SELECT * FROM rake_config;

