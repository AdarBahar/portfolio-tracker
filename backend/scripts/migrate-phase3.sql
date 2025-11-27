-- ============================================================================
-- Phase 3 Schema Migration
-- Adds settlement, cancellation, rake, and bonus system tables
-- ============================================================================

-- ============================================================================
-- 1. MODIFY bull_pens TABLE - Verify settlement_status column exists
-- ============================================================================

-- Note: settlement_status column should already exist in the schema
-- This migration assumes the base schema has been applied
-- If you need to add it, use: ALTER TABLE bull_pens ADD COLUMN settlement_status VARCHAR(20) DEFAULT 'pending' AFTER state;

-- ============================================================================
-- 2. MODIFY bull_pens STATE CONSTRAINT - Add 'cancelled' state
-- ============================================================================

-- Note: This requires dropping and recreating the constraint
-- First, drop the old constraint
ALTER TABLE bull_pens DROP CONSTRAINT chk_bull_pens_state;

-- Add new constraint with 'cancelled' state
ALTER TABLE bull_pens ADD CONSTRAINT chk_bull_pens_state
CHECK (state IN ('draft', 'scheduled', 'active', 'completed', 'cancelled', 'archived'));

-- ============================================================================
-- 3. MODIFY bull_pen_memberships STATUS CONSTRAINT - Add 'cancelled' status
-- ============================================================================

-- Drop old constraint
ALTER TABLE bull_pen_memberships DROP CONSTRAINT chk_bull_pen_memberships_status;

-- Add new constraint with 'cancelled' and 'kicked' statuses
ALTER TABLE bull_pen_memberships ADD CONSTRAINT chk_bull_pen_memberships_status
CHECK (status IN ('pending', 'active', 'kicked', 'left', 'cancelled'));

-- ============================================================================
-- 4. CREATE rake_config TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS rake_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fee_type VARCHAR(20) NOT NULL COMMENT 'percentage, fixed, tiered',
    fee_value DECIMAL(18, 2) NOT NULL,
    min_pool DECIMAL(18, 2) DEFAULT 0,
    max_pool DECIMAL(18, 2) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_rake_fee_type CHECK (fee_type IN ('percentage', 'fixed', 'tiered')),
    CONSTRAINT chk_rake_fee_value CHECK (fee_value > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Rake/house fee configuration';

-- ============================================================================
-- 5. CREATE rake_collection TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS rake_collection (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bull_pen_id INT NOT NULL,
    rake_config_id INT NOT NULL,
    pool_size DECIMAL(18, 2) NOT NULL,
    rake_amount DECIMAL(18, 2) NOT NULL,
    collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rake_collection_bull_pen FOREIGN KEY (bull_pen_id) REFERENCES bull_pens(id),
    CONSTRAINT fk_rake_collection_config FOREIGN KEY (rake_config_id) REFERENCES rake_config(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Rake collection history';

-- Indexes for rake_collection (created with table if not exists)
-- CREATE INDEX IF NOT EXISTS idx_rake_collection_bull_pen ON rake_collection(bull_pen_id);
-- CREATE INDEX IF NOT EXISTS idx_rake_collection_collected_at ON rake_collection(collected_at);

-- ============================================================================
-- 6. CREATE promotions TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    bonus_type VARCHAR(20) NOT NULL COMMENT 'signup, referral, seasonal, custom',
    bonus_amount DECIMAL(18, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VUSD',
    max_uses INT DEFAULT NULL,
    current_uses INT DEFAULT 0,
    min_account_age_days INT DEFAULT 0,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_promotion_type CHECK (bonus_type IN ('signup', 'referral', 'seasonal', 'custom')),
    CONSTRAINT chk_promotion_amount CHECK (bonus_amount > 0),
    CONSTRAINT chk_promotion_dates CHECK (start_date < end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Promotional bonus configurations';

-- Indexes for promotions (created with table if not exists)
-- CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
-- CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);

-- ============================================================================
-- 7. CREATE bonus_redemptions TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS bonus_redemptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    promotion_id INT NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VUSD',
    idempotency_key VARCHAR(255) UNIQUE,
    correlation_id VARCHAR(255),
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bonus_redemptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bonus_redemptions_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    CONSTRAINT chk_bonus_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks bonus redemptions by users';

-- Indexes for bonus_redemptions (created with table if not exists)
-- CREATE INDEX IF NOT EXISTS idx_bonus_redemptions_user ON bonus_redemptions(user_id);
-- CREATE INDEX IF NOT EXISTS idx_bonus_redemptions_promotion ON bonus_redemptions(promotion_id);
-- CREATE INDEX IF NOT EXISTS idx_bonus_redemptions_idempotency ON bonus_redemptions(idempotency_key);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

SELECT 'Phase 3 schema migration completed successfully' AS status;

