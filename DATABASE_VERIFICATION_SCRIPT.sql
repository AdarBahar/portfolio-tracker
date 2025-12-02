-- ============================================================================
-- Database Verification Script
-- Purpose: Verify Trade Room database structure after migration
-- Date: December 2, 2025
-- ============================================================================

-- ============================================================================
-- SECTION 1: VERIFY TRADE ROOM TABLES EXIST
-- ============================================================================

SELECT '=== TRADE ROOM TABLES ===' AS section;

SELECT TABLE_NAME, TABLE_TYPE, TABLE_ROWS 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN (
  'bull_pens', 
  'bull_pen_memberships', 
  'bull_pen_positions', 
  'bull_pen_orders', 
  'leaderboard_snapshots', 
  'market_data'
)
ORDER BY TABLE_NAME;

-- ============================================================================
-- SECTION 2: VERIFY VIEWS WERE CREATED
-- ============================================================================

SELECT '=== VIEWS CREATED ===' AS section;

SELECT TABLE_NAME, TABLE_TYPE
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_TYPE = 'VIEW'
AND TABLE_NAME IN (
  'active_trade_rooms',
  'user_trade_room_positions',
  'trade_room_leaderboard'
)
ORDER BY TABLE_NAME;

-- ============================================================================
-- SECTION 3: VERIFY COLUMNS IN BULL_PEN_POSITIONS
-- ============================================================================

SELECT '=== BULL_PEN_POSITIONS COLUMNS ===' AS section;

DESCRIBE bull_pen_positions;

-- ============================================================================
-- SECTION 4: VERIFY COLUMNS IN BULL_PEN_ORDERS
-- ============================================================================

SELECT '=== BULL_PEN_ORDERS COLUMNS ===' AS section;

DESCRIBE bull_pen_orders;

-- ============================================================================
-- SECTION 5: VERIFY COLUMNS IN LEADERBOARD_SNAPSHOTS
-- ============================================================================

SELECT '=== LEADERBOARD_SNAPSHOTS COLUMNS ===' AS section;

DESCRIBE leaderboard_snapshots;

-- ============================================================================
-- SECTION 6: VERIFY INDEXES
-- ============================================================================

SELECT '=== INDEXES ON TRADE ROOM TABLES ===' AS section;

SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN (
  'bull_pens',
  'bull_pen_memberships',
  'bull_pen_positions',
  'bull_pen_orders',
  'leaderboard_snapshots',
  'market_data'
)
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ============================================================================
-- SECTION 7: VERIFY FOREIGN KEYS
-- ============================================================================

SELECT '=== FOREIGN KEYS ===' AS section;

SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
AND REFERENCED_TABLE_NAME IS NOT NULL
AND TABLE_NAME IN (
  'bull_pens',
  'bull_pen_memberships',
  'bull_pen_positions',
  'bull_pen_orders',
  'leaderboard_snapshots'
)
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- ============================================================================
-- SECTION 8: TEST VIEWS
-- ============================================================================

SELECT '=== TESTING VIEWS ===' AS section;

-- Test active_trade_rooms view
SELECT 'active_trade_rooms' AS view_name, COUNT(*) AS row_count FROM active_trade_rooms;

-- Test user_trade_room_positions view
SELECT 'user_trade_room_positions' AS view_name, COUNT(*) AS row_count FROM user_trade_room_positions;

-- Test trade_room_leaderboard view
SELECT 'trade_room_leaderboard' AS view_name, COUNT(*) AS row_count FROM trade_room_leaderboard;

-- ============================================================================
-- SECTION 9: VERIFY BULL_PENS COLUMNS
-- ============================================================================

SELECT '=== BULL_PENS COLUMNS ===' AS section;

DESCRIBE bull_pens;

-- ============================================================================
-- SECTION 10: SUMMARY
-- ============================================================================

SELECT '=== MIGRATION VERIFICATION COMPLETE ===' AS section;

SELECT 
  (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('bull_pens', 'bull_pen_memberships', 'bull_pen_positions', 'bull_pen_orders', 'leaderboard_snapshots', 'market_data')) AS tables_found,
  (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'VIEW' AND TABLE_NAME IN ('active_trade_rooms', 'user_trade_room_positions', 'trade_room_leaderboard')) AS views_found;


