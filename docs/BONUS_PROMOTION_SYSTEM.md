# Bonus & Promotion System

## Overview

The bonus system allows administrators to create promotional codes that users can redeem for account credits. Supports multiple bonus types with configurable constraints.

## Architecture

### Redemption Flow

```
User enters promotion code
  ↓
Validate promotion exists and is active
  ↓
Check user eligibility (account age, max uses, etc.)
  ↓
Check if user already redeemed
  ↓
Create redemption record
  ↓
Credit user budget
  ↓
Increment promotion usage counter
```

## Implementation Details

### 1. Bonus Service (`backend/src/services/bonusService.js`)

**Function: `getPromotionByCode(code)`**
- Fetches active promotion by code
- Validates dates and active status

**Function: `redeemPromotion(userId, code)`**
- Validates promotion eligibility
- Checks account age requirement
- Prevents duplicate redemptions
- Credits user budget with idempotency
- Increments promotion usage

**Function: `getUserBonuses(userId)`**
- Returns all bonuses redeemed by user
- Includes promotion details

### 2. Bonus Controller (`backend/src/controllers/bonusController.js`)

**User Endpoints:**

**POST /api/v1/bonus/redeem**
- Redeem a promotion code
- Requires: Authentication

**GET /api/v1/bonus/my-bonuses**
- Get user's redeemed bonuses
- Requires: Authentication

**Admin Endpoints:**

**POST /api/admin/promotions**
- Create new promotion
- Requires: Admin authentication

**GET /api/admin/promotions**
- Get all promotions
- Requires: Admin authentication

## Database Schema

### promotions Table

```sql
CREATE TABLE promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    bonus_type VARCHAR(20) NOT NULL,  -- 'signup', 'referral', 'seasonal', 'custom'
    bonus_amount DECIMAL(18, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VUSD',
    max_uses INT DEFAULT NULL,  -- NULL = unlimited
    current_uses INT DEFAULT 0,
    min_account_age_days INT DEFAULT 0,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### bonus_redemptions Table

```sql
CREATE TABLE bonus_redemptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    promotion_id INT NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VUSD',
    idempotency_key VARCHAR(255) UNIQUE,
    correlation_id VARCHAR(255),
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id)
);
```

## Bonus Types

- **signup**: Welcome bonus for new accounts
- **referral**: Bonus for referring friends
- **seasonal**: Holiday or seasonal promotions
- **custom**: Custom promotional campaigns

## API Examples

### Redeem Promotion

```bash
curl -X POST \
  -H "Authorization: Bearer <user-token>" \
  -H "Content-Type: application/json" \
  -d '{"code": "WELCOME100"}' \
  http://localhost:4000/api/v1/bonus/redeem
```

**Response (Success):**
```json
{
  "success": true,
  "amount": 100.00,
  "message": "Bonus of 100.00 VUSD credited to your account"
}
```

**Response (Error):**
```json
{
  "error": "ALREADY_REDEEMED",
  "message": "Redemption failed: ALREADY_REDEEMED"
}
```

### Get My Bonuses

```bash
curl -X GET \
  -H "Authorization: Bearer <user-token>" \
  http://localhost:4000/api/v1/bonus/my-bonuses
```

**Response:**
```json
{
  "bonuses": [
    {
      "id": 1,
      "user_id": 123,
      "promotion_id": 1,
      "amount": 100.00,
      "code": "WELCOME100",
      "name": "Welcome Bonus",
      "bonus_type": "signup",
      "redeemed_at": "2025-11-27T10:30:00Z"
    }
  ],
  "total_redeemed": 100.00
}
```

### Create Promotion (Admin)

```bash
curl -X POST \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME100",
    "name": "Welcome Bonus",
    "description": "100 VUSD for new users",
    "bonus_type": "signup",
    "bonus_amount": 100.00,
    "max_uses": 1000,
    "min_account_age_days": 0,
    "start_date": "2025-11-27T00:00:00Z",
    "end_date": "2025-12-31T23:59:59Z"
  }' \
  http://localhost:4000/api/admin/promotions
```

### Get All Promotions (Admin)

```bash
curl -X GET \
  -H "Authorization: Bearer <admin-token>" \
  http://localhost:4000/api/admin/promotions
```

## Error Scenarios

1. **PROMOTION_NOT_FOUND**: Code doesn't exist or is inactive
2. **PROMOTION_EXHAUSTED**: Max uses reached
3. **ALREADY_REDEEMED**: User already redeemed this promotion
4. **ACCOUNT_TOO_NEW**: Account doesn't meet age requirement
5. **BUDGET_ERROR**: Failed to credit budget

## Budget Log Entry

```json
{
  "user_id": 123,
  "direction": "IN",
  "operation_type": "BONUS_REDEMPTION",
  "amount": 100.00,
  "currency": "VUSD",
  "balance_before": 4750.00,
  "balance_after": 4850.00,
  "promotion_id": 1,
  "correlation_id": "promotion-1-redemption-uuid",
  "idempotency_key": "bonus-123-1",
  "created_at": "2025-11-27T10:30:00Z"
}
```

## Files Modified/Created

### Created
- `backend/src/services/bonusService.js` - Bonus logic
- `backend/src/controllers/bonusController.js` - Bonus endpoints
- `backend/src/routes/bonusRoutes.js` - User bonus routes
- `backend/src/routes/adminPromotionRoutes.js` - Admin promotion routes
- `docs/BONUS_PROMOTION_SYSTEM.md` - This documentation

### Modified
- `schema.mysql.sql` - Added promotions and bonus_redemptions tables
- `backend/src/app.js` - Registered bonus routes

## Next Steps

1. Apply schema migration
2. Create sample promotions
3. Test redemption flow
4. Create reconciliation job
5. Add monitoring and alerts

