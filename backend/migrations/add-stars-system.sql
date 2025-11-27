-- ============================================================================
-- Stars System Migration
-- Adds support for achievements, star events, and season-level ranking
-- ============================================================================

-- ============================================================================
-- 1. USER_STAR_EVENTS TABLE (Append-only log of star earnings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_star_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bull_pen_id INT NULL COMMENT 'Room context (NULL for lifetime achievements)',
    season_id INT NULL COMMENT 'Season context (NULL for non-seasonal achievements)',
    source VARCHAR(50) NOT NULL COMMENT 'Source: achievement, prize, quest, admin_grant, campaign',
    reason_code VARCHAR(100) NOT NULL COMMENT 'Machine-readable identifier (e.g., three_straight_wins)',
    stars_delta INT NOT NULL COMMENT 'Number of stars earned (always positive)',
    meta JSON NULL COMMENT 'Additional context (rank, payout, thresholds, etc.)',
    deleted_at DATETIME NULL COMMENT 'Soft delete timestamp',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_user_stars (user_id),
    INDEX idx_room_stars (bull_pen_id),
    INDEX idx_season_stars (season_id),
    INDEX idx_reason_code (reason_code),
    INDEX idx_created_at (created_at),
    
    -- Unique constraint for idempotency (using COALESCE for NULL handling)
    UNIQUE KEY uniq_star_event (user_id, reason_code, COALESCE(bull_pen_id, 0), COALESCE(season_id, 0)),
    
    -- Foreign key constraints
    CONSTRAINT fk_star_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_star_events_room FOREIGN KEY (bull_pen_id) REFERENCES bull_pens(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Append-only log of all star awards and achievements';

-- ============================================================================
-- 2. ACHIEVEMENT_RULES TABLE (Configurable achievement rules)
-- ============================================================================

CREATE TABLE IF NOT EXISTS achievement_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL COMMENT 'Machine-readable identifier (e.g., three_straight_wins)',
    name VARCHAR(150) NOT NULL COMMENT 'Human-readable name (e.g., "3 Straight Wins")',
    description TEXT COMMENT 'Description shown in UI or admin panel',
    category VARCHAR(50) NOT NULL COMMENT 'Category: performance, engagement, seasonal, admin, campaign',
    source VARCHAR(50) NOT NULL COMMENT 'Logical issuer: achievement, prize, quest, campaign, admin',
    stars_reward INT NOT NULL COMMENT 'Number of stars granted when rule fires',
    is_repeatable TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0=one-time, 1=can be earned multiple times',
    max_times INT NULL COMMENT 'Max times user can earn (NULL=unlimited if repeatable)',
    scope_type VARCHAR(30) NOT NULL COMMENT 'Scope: room, season, lifetime, campaign',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Soft toggle for rule activation',
    conditions_json JSON NULL COMMENT 'JSON config describing rule conditions (thresholds, streak count, etc.)',
    ui_badge_code VARCHAR(100) NULL COMMENT 'Optional badge/asset key for front-end',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL COMMENT 'Soft delete timestamp',
    
    -- Indexes for performance
    INDEX idx_active_rules (is_active, deleted_at),
    INDEX idx_category (category),
    INDEX idx_scope_type (scope_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configurable achievement rules for star rewards';

-- ============================================================================
-- 3. SEASON_USER_STATS TABLE (Per-user, per-season aggregates)
-- ============================================================================

CREATE TABLE IF NOT EXISTS season_user_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    season_id INT NOT NULL,
    total_initial_equity DECIMAL(15, 2) NOT NULL COMMENT 'Total starting capital across all rooms in season',
    total_portfolio_value DECIMAL(15, 2) NOT NULL COMMENT 'Current total portfolio value',
    pnl_abs DECIMAL(15, 2) NOT NULL COMMENT 'Absolute P&L in currency',
    pnl_pct DECIMAL(10, 4) NOT NULL COMMENT 'P&L percentage',
    stars INT DEFAULT 0 COMMENT 'Total stars earned in season',
    score DECIMAL(10, 4) DEFAULT 0 COMMENT 'Composite ranking score',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Unique constraint
    UNIQUE KEY uniq_user_season (user_id, season_id),
    
    -- Indexes for performance
    INDEX idx_season_score (season_id, score DESC),
    INDEX idx_user_season (user_id, season_id),
    
    -- Foreign key constraints
    CONSTRAINT fk_season_stats_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Per-user, per-season aggregates for global ranking';

-- ============================================================================
-- 4. ALTER LEADERBOARD_SNAPSHOTS TABLE (Add stars and score columns)
-- ============================================================================

ALTER TABLE leaderboard_snapshots ADD COLUMN IF NOT EXISTS stars INT DEFAULT 0 COMMENT 'Stars earned in this room';
ALTER TABLE leaderboard_snapshots ADD COLUMN IF NOT EXISTS score DECIMAL(10, 4) DEFAULT 0 COMMENT 'Composite ranking score';

-- ============================================================================
-- 5. ALTER BULL_PENS TABLE (Add season_id for future use)
-- ============================================================================

ALTER TABLE bull_pens ADD COLUMN IF NOT EXISTS season_id INT NULL COMMENT 'Season this room belongs to (for future use)';

-- ============================================================================
-- Migration complete
-- ============================================================================

