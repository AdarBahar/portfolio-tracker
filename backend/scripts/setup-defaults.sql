-- ============================================================================
-- Setup Default Rake Configuration and Sample Promotions
-- ============================================================================

-- ============================================================================
-- 1. INSERT DEFAULT RAKE CONFIGURATION
-- ============================================================================

INSERT INTO rake_config (name, description, fee_type, fee_value, min_pool, max_pool, is_active)
VALUES
  ('Default Rake Config', 'Default 5% percentage fee for all rooms', 'percentage', 5.00, 100.00, NULL, TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- ============================================================================
-- 2. INSERT SAMPLE PROMOTIONS
-- ============================================================================

-- Welcome Bonus - for new users
INSERT INTO promotions (code, name, description, bonus_type, bonus_amount, max_uses, min_account_age_days, start_date, end_date, is_active)
VALUES 
  ('WELCOME100', 'Welcome Bonus', 'Get 100 VUSD when you sign up', 'signup', 100.00, 1000, 0, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Referral Bonus - for referring friends
INSERT INTO promotions (code, name, description, bonus_type, bonus_amount, max_uses, min_account_age_days, start_date, end_date, is_active)
VALUES 
  ('REFER50', 'Referral Bonus', 'Get 50 VUSD for each friend you refer', 'referral', 50.00, NULL, 7, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Seasonal Bonus - Holiday promotion
INSERT INTO promotions (code, name, description, bonus_type, bonus_amount, max_uses, min_account_age_days, start_date, end_date, is_active)
VALUES 
  ('HOLIDAY250', 'Holiday Special', 'Celebrate with 250 VUSD bonus', 'seasonal', 250.00, 500, 0, NOW(), DATE_ADD(NOW(), INTERVAL 2 MONTH), TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- VIP Bonus - for active traders
INSERT INTO promotions (code, name, description, bonus_type, bonus_amount, max_uses, min_account_age_days, start_date, end_date, is_active)
VALUES 
  ('VIP200', 'VIP Trader Bonus', 'Exclusive 200 VUSD for active traders', 'custom', 200.00, 100, 30, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Flash Sale - Limited time
INSERT INTO promotions (code, name, description, bonus_type, bonus_amount, max_uses, min_account_age_days, start_date, end_date, is_active)
VALUES 
  ('FLASH75', 'Flash Sale', 'Limited time: 75 VUSD bonus', 'seasonal', 75.00, 200, 0, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT 'Rake Configuration:' AS section;
SELECT * FROM rake_config WHERE is_active = TRUE;

SELECT '' AS blank;
SELECT 'Active Promotions:' AS section;
SELECT code, name, bonus_type, bonus_amount, max_uses, start_date, end_date FROM promotions WHERE is_active = TRUE;

SELECT '' AS blank;
SELECT 'Setup completed successfully' AS status;

