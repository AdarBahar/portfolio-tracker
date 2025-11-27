-- ============================================================================
-- Fake Audit Logs for User 4 (adarb@bahar.co.il)
-- Generates realistic audit trail for past 2 weeks
-- Includes: Registration, budget assignment, room joins, trades, rank changes
-- ============================================================================

-- Clean existing audit logs for user 4
DELETE FROM user_audit_log WHERE user_id = 4;

-- ============================================================================
-- WEEK 1: Account Setup and Initial Activity
-- ============================================================================

-- Day 1: Account Registration (14 days ago)
INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ACCOUNT_CREATED', 'authentication', 'User account created via demo auth', '192.168.1.100', DATE_SUB(NOW(), INTERVAL 14 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'LOGIN', 'authentication', 'First login to platform', '192.168.1.100', DATE_SUB(NOW(), INTERVAL 14 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'PROFILE_CREATED', 'profile', 'User profile initialized with name: Adar Bahar', '192.168.1.100', DATE_SUB(NOW(), INTERVAL 14 DAY));

-- Day 1: Initial Budget Assignment
INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'BUDGET_ASSIGNED', 'budget', 'Initial budget of 5000 VUSD assigned to account', '192.168.1.100', DATE_SUB(NOW(), INTERVAL 14 DAY));

-- Day 2: First Room Join (13 days ago)
INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ROOM_JOINED', 'transaction', 'Joined trading room: Tech Stock Showdown (Room ID: 1)', '192.168.1.101', DATE_SUB(NOW(), INTERVAL 13 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'BUDGET_LOCKED', 'budget', 'Buy-in of 500 VUSD locked for room participation', '192.168.1.101', DATE_SUB(NOW(), INTERVAL 13 DAY));

-- Day 3: Trading Activity in Room 1 (12 days ago)
INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ORDER_PLACED', 'transaction', 'Placed BUY order: 10 shares of AAPL at market price', '192.168.1.102', DATE_SUB(NOW(), INTERVAL 12 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ORDER_FILLED', 'transaction', 'Order filled: 10 shares of AAPL @ $150.25 = $1502.50', '192.168.1.102', DATE_SUB(NOW(), INTERVAL 12 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'RANK_CHANGED', 'transaction', 'Leaderboard rank updated: 3rd → 2nd place in Tech Stock Showdown', '192.168.1.102', DATE_SUB(NOW(), INTERVAL 12 DAY));

-- Day 4: More Trading (11 days ago)
INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ORDER_PLACED', 'transaction', 'Placed BUY order: 5 shares of MSFT at market price', '192.168.1.103', DATE_SUB(NOW(), INTERVAL 11 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ORDER_FILLED', 'transaction', 'Order filled: 5 shares of MSFT @ $380.50 = $1902.50', '192.168.1.103', DATE_SUB(NOW(), INTERVAL 11 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'RANK_CHANGED', 'transaction', 'Leaderboard rank updated: 2nd → 1st place in Tech Stock Showdown', '192.168.1.103', DATE_SUB(NOW(), INTERVAL 11 DAY));

-- Day 5: Room 1 Completed - User Won (10 days ago)
INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ROOM_COMPLETED', 'transaction', 'Trading room completed: Tech Stock Showdown', '192.168.1.104', DATE_SUB(NOW(), INTERVAL 10 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'SETTLEMENT_PROCESSED', 'budget', 'Room settlement: Won 750 VUSD (1st place prize)', '192.168.1.104', DATE_SUB(NOW(), INTERVAL 10 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'BUDGET_UNLOCKED', 'budget', 'Buy-in of 500 VUSD returned + 750 VUSD winnings = 1250 VUSD credited', '192.168.1.104', DATE_SUB(NOW(), INTERVAL 10 DAY));

-- ============================================================================
-- WEEK 2: Continued Activity
-- ============================================================================

-- Day 6: Join Second Room (9 days ago)
INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ROOM_JOINED', 'transaction', 'Joined trading room: Market Movers Challenge (Room ID: 2)', '192.168.1.105', DATE_SUB(NOW(), INTERVAL 9 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'BUDGET_LOCKED', 'budget', 'Buy-in of 500 VUSD locked for room participation', '192.168.1.105', DATE_SUB(NOW(), INTERVAL 9 DAY));

-- Day 7: Trading in Room 2 (8 days ago)
INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ORDER_PLACED', 'transaction', 'Placed BUY order: 8 shares of GOOGL at market price', '192.168.1.106', DATE_SUB(NOW(), INTERVAL 8 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ORDER_FILLED', 'transaction', 'Order filled: 8 shares of GOOGL @ $140.75 = $1126.00', '192.168.1.106', DATE_SUB(NOW(), INTERVAL 8 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'RANK_CHANGED', 'transaction', 'Leaderboard rank updated: 5th → 4th place in Market Movers Challenge', '192.168.1.106', DATE_SUB(NOW(), INTERVAL 8 DAY));

-- Day 8: Sell Order (7 days ago)
INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ORDER_PLACED', 'transaction', 'Placed SELL order: 5 shares of GOOGL at market price', '192.168.1.107', DATE_SUB(NOW(), INTERVAL 7 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ORDER_FILLED', 'transaction', 'Order filled: 5 shares of GOOGL @ $142.00 = $710.00', '192.168.1.107', DATE_SUB(NOW(), INTERVAL 7 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'RANK_CHANGED', 'transaction', 'Leaderboard rank updated: 4th → 3rd place in Market Movers Challenge', '192.168.1.107', DATE_SUB(NOW(), INTERVAL 7 DAY));

-- Day 9: Join Third Room (6 days ago)
INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ROOM_JOINED', 'transaction', 'Joined trading room: Growth Stocks Battle (Room ID: 3)', '192.168.1.108', DATE_SUB(NOW(), INTERVAL 6 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'BUDGET_LOCKED', 'budget', 'Buy-in of 500 VUSD locked for room participation', '192.168.1.108', DATE_SUB(NOW(), INTERVAL 6 DAY));

-- Day 10: Room 2 Completed - User Lost (5 days ago)
INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ROOM_COMPLETED', 'transaction', 'Trading room completed: Market Movers Challenge', '192.168.1.109', DATE_SUB(NOW(), INTERVAL 5 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'SETTLEMENT_PROCESSED', 'budget', 'Room settlement: Lost 250 VUSD (3rd place, no prize)', '192.168.1.109', DATE_SUB(NOW(), INTERVAL 5 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'BUDGET_UNLOCKED', 'budget', 'Buy-in of 500 VUSD returned, net loss of 250 VUSD deducted', '192.168.1.109', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Day 11: Active Trading in Room 3 (4 days ago)
INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ORDER_PLACED', 'transaction', 'Placed BUY order: 15 shares of TSLA at market price', '192.168.1.110', DATE_SUB(NOW(), INTERVAL 4 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ORDER_FILLED', 'transaction', 'Order filled: 15 shares of TSLA @ $245.30 = $3679.50', '192.168.1.110', DATE_SUB(NOW(), INTERVAL 4 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'RANK_CHANGED', 'transaction', 'Leaderboard rank updated: 6th → 2nd place in Growth Stocks Battle', '192.168.1.110', DATE_SUB(NOW(), INTERVAL 4 DAY));

-- Day 12: More Trading (3 days ago)
INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ORDER_PLACED', 'transaction', 'Placed BUY order: 20 shares of NVDA at market price', '192.168.1.111', DATE_SUB(NOW(), INTERVAL 3 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ORDER_FILLED', 'transaction', 'Order filled: 20 shares of NVDA @ $875.50 = $17510.00', '192.168.1.111', DATE_SUB(NOW(), INTERVAL 3 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'RANK_CHANGED', 'transaction', 'Leaderboard rank updated: 2nd → 1st place in Growth Stocks Battle', '192.168.1.111', DATE_SUB(NOW(), INTERVAL 3 DAY));

-- Day 13: Partial Sell (2 days ago)
INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ORDER_PLACED', 'transaction', 'Placed SELL order: 10 shares of TSLA at market price', '192.168.1.112', DATE_SUB(NOW(), INTERVAL 2 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'ORDER_FILLED', 'transaction', 'Order filled: 10 shares of TSLA @ $248.75 = $2487.50', '192.168.1.112', DATE_SUB(NOW(), INTERVAL 2 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'RANK_CHANGED', 'transaction', 'Leaderboard rank updated: 1st → 2nd place in Growth Stocks Battle', '192.168.1.112', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Day 14: Recent Activity (1 day ago)
INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'LOGIN', 'authentication', 'User logged in to platform', '192.168.1.113', DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO user_audit_log (user_id, event_type, event_category, description, ip_address, created_at)
VALUES (4, 'PORTFOLIO_VIEWED', 'profile', 'User viewed portfolio overview', '192.168.1.113', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- User 4 (adarb@bahar.co.il) audit log now contains:
-- - 1 account creation event
-- - 2 login events
-- - 1 profile creation event
-- - 1 initial budget assignment
-- - 3 room join events
-- - 3 room completion events (1 win, 1 loss, 1 active)
-- - 12 order placement and fill events
-- - 8 rank change events
-- - 1 settlement processed events
-- - 1 portfolio view event
-- Total: 33 audit log entries spanning 14 days
-- ============================================================================

