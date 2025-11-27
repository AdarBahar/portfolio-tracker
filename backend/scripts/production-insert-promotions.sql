-- ============================================================================
-- INSERT SAMPLE PROMOTIONS
-- This file inserts 5 sample promotions into the promotions table
-- Safe to run multiple times - uses ON DUPLICATE KEY UPDATE
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
  ('HOLIDAY250', 'Holiday Special', 'Get 250 VUSD during holiday season', 'seasonal', 250.00, 500, 0, NOW(), DATE_ADD(NOW(), INTERVAL 2 MONTH), TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- VIP Trader Bonus - for high-value traders
INSERT INTO promotions (code, name, description, bonus_type, bonus_amount, max_uses, min_account_age_days, start_date, end_date, is_active)
VALUES 
  ('VIP200', 'VIP Trader Bonus', 'Get 200 VUSD if you trade over 10,000 VUSD', 'custom', 200.00, 100, 30, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Flash Sale Bonus - limited time
INSERT INTO promotions (code, name, description, bonus_type, bonus_amount, max_uses, min_account_age_days, start_date, end_date, is_active)
VALUES 
  ('FLASH75', 'Flash Sale', 'Get 75 VUSD this week only', 'seasonal', 75.00, 200, 0, NOW(), DATE_ADD(NOW(), INTERVAL 1 WEEK), TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Promotions inserted successfully' AS status;

SELECT code, name, bonus_type, bonus_amount, max_uses, start_date, end_date, is_active 
FROM promotions 
WHERE is_active = TRUE 
ORDER BY code;

