-- ============================================================================
-- Load Initial Achievement Rules
-- Idempotent script - safe to run multiple times
-- ============================================================================

-- Delete existing rules (for idempotency)
DELETE FROM achievement_rules WHERE code IN (
    'first_room_join',
    'room_first_place',
    'three_straight_wins',
    'rooms_played_milestone_10',
    'rooms_played_milestone_50',
    'rooms_played_milestone_100',
    'season_top_10_percent',
    'season_top_100',
    'activity_streak_1',
    'activity_streak_7',
    'activity_streak_30',
    'admin_grant'
);

-- ============================================================================
-- 1. GAMEPLAY ACHIEVEMENTS
-- ============================================================================

-- First time joining a trading room
INSERT INTO achievement_rules (code, name, description, category, source, stars_reward, is_repeatable, max_times, scope_type, is_active, conditions_json, ui_badge_code)
VALUES (
    'first_room_join',
    'First Room Join',
    'Join a trading room for the first time',
    'engagement',
    'achievement',
    10,
    0,
    1,
    'lifetime',
    1,
    JSON_OBJECT('description', 'Join your first trading room'),
    'badge_first_room'
);

-- Room first place
INSERT INTO achievement_rules (code, name, description, category, source, stars_reward, is_repeatable, max_times, scope_type, is_active, conditions_json, ui_badge_code)
VALUES (
    'room_first_place',
    'Room First Place',
    'Finish in 1st place in a trading room',
    'performance',
    'achievement',
    100,
    1,
    NULL,
    'room',
    1,
    JSON_OBJECT('required_rank', 1),
    'badge_first_place'
);

-- 3 straight wins
INSERT INTO achievement_rules (code, name, description, category, source, stars_reward, is_repeatable, max_times, scope_type, is_active, conditions_json, ui_badge_code)
VALUES (
    'three_straight_wins',
    '3 Straight Wins',
    'Win 3 consecutive rooms',
    'performance',
    'achievement',
    40,
    1,
    NULL,
    'room',
    1,
    JSON_OBJECT('required_consecutive_wins', 3, 'min_rooms_size', 1),
    'badge_streak_3'
);

-- ============================================================================
-- 2. ENGAGEMENT ACHIEVEMENTS
-- ============================================================================

-- 10 rooms played
INSERT INTO achievement_rules (code, name, description, category, source, stars_reward, is_repeatable, max_times, scope_type, is_active, conditions_json, ui_badge_code)
VALUES (
    'rooms_played_milestone_10',
    '10 Rooms Played',
    'Join 10 trading rooms',
    'engagement',
    'achievement',
    20,
    0,
    1,
    'lifetime',
    1,
    JSON_OBJECT('required_rooms', 10),
    'badge_rooms_10'
);

-- 50 rooms played
INSERT INTO achievement_rules (code, name, description, category, source, stars_reward, is_repeatable, max_times, scope_type, is_active, conditions_json, ui_badge_code)
VALUES (
    'rooms_played_milestone_50',
    '50 Rooms Played',
    'Join 50 trading rooms',
    'engagement',
    'achievement',
    60,
    0,
    1,
    'lifetime',
    1,
    JSON_OBJECT('required_rooms', 50),
    'badge_rooms_50'
);

-- 100 rooms played
INSERT INTO achievement_rules (code, name, description, category, source, stars_reward, is_repeatable, max_times, scope_type, is_active, conditions_json, ui_badge_code)
VALUES (
    'rooms_played_milestone_100',
    '100 Rooms Played',
    'Join 100 trading rooms',
    'engagement',
    'achievement',
    150,
    0,
    1,
    'lifetime',
    1,
    JSON_OBJECT('required_rooms', 100),
    'badge_rooms_100'
);

-- ============================================================================
-- 3. SEASONAL ACHIEVEMENTS
-- ============================================================================

-- Season top 10%
INSERT INTO achievement_rules (code, name, description, category, source, stars_reward, is_repeatable, max_times, scope_type, is_active, conditions_json, ui_badge_code)
VALUES (
    'season_top_10_percent',
    'Season Top 10%',
    'Finish in top 10% of season rankings',
    'seasonal',
    'achievement',
    200,
    1,
    NULL,
    'season',
    1,
    JSON_OBJECT('percentile_threshold', 10),
    'badge_season_top10'
);

-- Season top 100
INSERT INTO achievement_rules (code, name, description, category, source, stars_reward, is_repeatable, max_times, scope_type, is_active, conditions_json, ui_badge_code)
VALUES (
    'season_top_100',
    'Season Top 100',
    'Finish in top 100 users of a season',
    'seasonal',
    'achievement',
    300,
    1,
    NULL,
    'season',
    1,
    JSON_OBJECT('rank_threshold', 100),
    'badge_season_top100'
);

-- ============================================================================
-- 4. ACTIVITY STREAK ACHIEVEMENTS
-- ============================================================================

-- 1 day activity streak
INSERT INTO achievement_rules (code, name, description, category, source, stars_reward, is_repeatable, max_times, scope_type, is_active, conditions_json, ui_badge_code)
VALUES (
    'activity_streak_1',
    '1 Day Activity Streak',
    'Log in or trade for 1 consecutive day',
    'engagement',
    'achievement',
    5,
    1,
    NULL,
    'lifetime',
    1,
    JSON_OBJECT('consecutive_days', 1),
    'badge_streak_1day'
);

-- 7 day activity streak
INSERT INTO achievement_rules (code, name, description, category, source, stars_reward, is_repeatable, max_times, scope_type, is_active, conditions_json, ui_badge_code)
VALUES (
    'activity_streak_7',
    '7 Day Activity Streak',
    'Log in or trade for 7 consecutive days',
    'engagement',
    'achievement',
    25,
    1,
    NULL,
    'lifetime',
    1,
    JSON_OBJECT('consecutive_days', 7),
    'badge_streak_7day'
);

-- 30 day activity streak
INSERT INTO achievement_rules (code, name, description, category, source, stars_reward, is_repeatable, max_times, scope_type, is_active, conditions_json, ui_badge_code)
VALUES (
    'activity_streak_30',
    '30 Day Activity Streak',
    'Log in or trade for 30 consecutive days',
    'engagement',
    'achievement',
    100,
    1,
    NULL,
    'lifetime',
    1,
    JSON_OBJECT('consecutive_days', 30),
    'badge_streak_30day'
);

-- ============================================================================
-- 5. ADMIN & SPECIAL GRANTS
-- ============================================================================

-- Admin grant (template for manual grants)
INSERT INTO achievement_rules (code, name, description, category, source, stars_reward, is_repeatable, max_times, scope_type, is_active, conditions_json, ui_badge_code)
VALUES (
    'admin_grant',
    'Admin Grant',
    'Manual star grant by administrator',
    'admin',
    'admin',
    0,
    1,
    NULL,
    'lifetime',
    1,
    JSON_OBJECT('description', 'Manual admin grant - stars_reward overridden per grant'),
    'badge_admin_grant'
);

-- ============================================================================
-- Load complete
-- ============================================================================

