-- =========================================================================
-- Migration: Add bull_pen_positions and bull_pen_orders tables
-- Date: 2025-11-24
-- Description: Creates the missing tables for Bull Pen orders and positions
-- =========================================================================

-- =========================================================================
-- BULL_PEN_POSITIONS TABLE
-- Per-user symbol positions within Bull Pen sessions
-- =========================================================================

CREATE TABLE IF NOT EXISTS bull_pen_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bull_pen_id INT NOT NULL,
    user_id INT NOT NULL,
    symbol VARCHAR(32) NOT NULL,
    qty DECIMAL(18, 8) NOT NULL,
    avg_cost DECIMAL(18, 6) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bull_pen_positions_bull_pen FOREIGN KEY (bull_pen_id) REFERENCES bull_pens(id) ON DELETE CASCADE,
    CONSTRAINT fk_bull_pen_positions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- BULL_PEN_ORDERS TABLE
-- Orders placed within a Bull Pen session
-- =========================================================================

CREATE TABLE IF NOT EXISTS bull_pen_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bull_pen_id INT NOT NULL,
    user_id INT NOT NULL,
    symbol VARCHAR(32) NOT NULL,
    side ENUM('buy', 'sell') NOT NULL,
    type ENUM('market', 'limit') NOT NULL,
    qty DECIMAL(18, 8) NOT NULL,
    filled_qty DECIMAL(18, 8) NOT NULL DEFAULT 0,
    limit_price DECIMAL(18, 6) NULL,
    avg_fill_price DECIMAL(18, 6) NULL,
    status ENUM('new', 'partially_filled', 'filled', 'cancelled', 'rejected') NOT NULL DEFAULT 'new',
    rejection_reason TEXT NULL,
    placed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    filled_at DATETIME NULL,
    server_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    feed_ts DATETIME NULL,
    CONSTRAINT fk_bull_pen_orders_bull_pen FOREIGN KEY (bull_pen_id) REFERENCES bull_pens(id) ON DELETE CASCADE,
    CONSTRAINT fk_bull_pen_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- Verify tables were created
-- =========================================================================

SELECT 'bull_pen_positions table created' AS status
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'bull_pen_positions';

SELECT 'bull_pen_orders table created' AS status
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'bull_pen_orders';

