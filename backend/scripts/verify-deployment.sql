-- Stars System Deployment Verification Script
-- Run this after deployment to verify all components are working

-- ============================================
-- 1. VERIFY TABLES EXIST
-- ============================================
SELECT 'TABLE VERIFICATION' as check_type;
SELECT TABLE_NAME, TABLE_ROWS 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'portfolio_tracker' 
AND TABLE_NAME IN ('user_star_events', 'achievement_rules', 'season_user_stats', 'leaderboard_snapshots', 'bull_pens')
ORDER BY TABLE_NAME;

-- ============================================
-- 2. VERIFY COLUMNS ADDED
-- ============================================
SELECT 'COLUMN VERIFICATION' as check_type;

-- Check leaderboard_snapshots columns
SELECT COLUMN_NAME, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'portfolio_tracker' 
AND TABLE_NAME = 'leaderboard_snapshots'
AND COLUMN_NAME IN ('stars', 'score')
ORDER BY COLUMN_NAME;

-- Check bull_pens columns
SELECT COLUMN_NAME, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'portfolio_tracker' 
AND TABLE_NAME = 'bull_pens'
AND COLUMN_NAME = 'season_id'
ORDER BY COLUMN_NAME;

-- ============================================
-- 3. VERIFY ACHIEVEMENT RULES LOADED
-- ============================================
SELECT 'ACHIEVEMENT RULES VERIFICATION' as check_type;
SELECT COUNT(*) as total_rules FROM achievement_rules;
SELECT code, name, stars_reward, category 
FROM achievement_rules 
ORDER BY code;

-- ============================================
-- 4. VERIFY CONSTRAINTS
-- ============================================
SELECT 'CONSTRAINT VERIFICATION' as check_type;

-- Check unique constraint on user_star_events
SELECT CONSTRAINT_NAME, TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'portfolio_tracker' 
AND TABLE_NAME = 'user_star_events'
AND CONSTRAINT_TYPE = 'UNIQUE';

-- ============================================
-- 5. VERIFY INDEXES
-- ============================================
SELECT 'INDEX VERIFICATION' as check_type;
SELECT INDEX_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'portfolio_tracker' 
AND TABLE_NAME IN ('user_star_events', 'achievement_rules', 'season_user_stats')
ORDER BY TABLE_NAME, INDEX_NAME;

-- ============================================
-- 6. VERIFY DATA INTEGRITY
-- ============================================
SELECT 'DATA INTEGRITY VERIFICATION' as check_type;

-- Check for any NULL values in critical columns
SELECT 'user_star_events' as table_name, COUNT(*) as null_count 
FROM user_star_events 
WHERE user_id IS NULL OR reason_code IS NULL OR stars_delta IS NULL;

SELECT 'achievement_rules' as table_name, COUNT(*) as null_count 
FROM achievement_rules 
WHERE code IS NULL OR name IS NULL OR stars_reward IS NULL;

-- ============================================
-- 7. VERIFY SAMPLE DATA
-- ============================================
SELECT 'SAMPLE DATA VERIFICATION' as check_type;

-- Show first 5 achievement rules
SELECT * FROM achievement_rules LIMIT 5;

-- Show first 5 star events (if any)
SELECT * FROM user_star_events LIMIT 5;

-- Show first 5 season stats (if any)
SELECT * FROM season_user_stats LIMIT 5;

-- ============================================
-- 8. FINAL STATUS
-- ============================================
SELECT 'DEPLOYMENT VERIFICATION COMPLETE' as status;
SELECT NOW() as verification_timestamp;

