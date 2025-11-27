# Rake/House Fee System

## Overview

The rake system allows administrators to configure and collect house fees from room settlements. Fees are deducted from the total pool before calculating payouts.

## Architecture

### Fee Collection Flow

```
Room settlement triggered
  ↓
Calculate total pool (all buy-ins)
  ↓
Get active rake configuration
  ↓
Calculate rake amount based on config
  ↓
Deduct rake from pool
  ↓
Calculate payouts from remaining pool
  ↓
Record rake collection
```

## Implementation Details

### 1. Rake Service (`backend/src/services/rakeService.js`)

**Function: `getActiveRakeConfig()`**
- Fetches the currently active rake configuration
- Returns null if no active config exists

**Function: `calculateRake(poolSize, config)`**
- Calculates rake amount based on pool size and configuration
- Supports three fee types:
  - **percentage**: Percentage of pool (e.g., 5% = 0.05)
  - **fixed**: Fixed amount regardless of pool size
  - **tiered**: Scales with pool size

**Function: `collectRake(bullPenId, poolSize)`**
- Collects rake from a room settlement
- Records collection in database
- Returns rake amount and config ID

**Function: `getRakeStats(filters)`**
- Returns rake statistics (total collected, count, average)
- Supports filtering by date range and room

### 2. Rake Controller (`backend/src/controllers/rakeController.js`)

**Endpoint: `GET /api/admin/rake/config`**
- Get active rake configuration

**Endpoint: `POST /api/admin/rake/config`**
- Create or update rake configuration
- Deactivates previous configs

**Endpoint: `GET /api/admin/rake/stats`**
- Get rake statistics with optional filters

**Endpoint: `GET /api/admin/rake/history`**
- Get rake collection history with pagination

### 3. Settlement Integration

Settlement service now:
1. Calculates total pool
2. Calls `rakeService.collectRake()`
3. Deducts rake from payouts
4. Credits remaining amounts to winners

## Database Schema

### rake_config Table

```sql
CREATE TABLE rake_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    fee_type VARCHAR(20) NOT NULL,  -- 'percentage', 'fixed', 'tiered'
    fee_value DECIMAL(10, 4) NOT NULL,
    min_pool DECIMAL(18, 2) DEFAULT 0,
    max_pool DECIMAL(18, 2) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### rake_collection Table

```sql
CREATE TABLE rake_collection (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bull_pen_id INT NOT NULL,
    rake_config_id INT NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VUSD',
    pool_size DECIMAL(18, 2) NOT NULL,
    collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bull_pen_id) REFERENCES bull_pens(id),
    FOREIGN KEY (rake_config_id) REFERENCES rake_config(id)
);
```

## API Examples

### Get Active Configuration

```bash
curl -X GET \
  -H "Authorization: Bearer <admin-token>" \
  http://localhost:4000/api/admin/rake/config
```

**Response:**
```json
{
  "id": 1,
  "name": "Standard 5% Rake",
  "description": "5% house fee on all rooms",
  "fee_type": "percentage",
  "fee_value": 5.0,
  "min_pool": 0,
  "max_pool": null,
  "is_active": true
}
```

### Set New Configuration

```bash
curl -X POST \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium 3% Rake",
    "description": "3% fee for premium rooms",
    "fee_type": "percentage",
    "fee_value": 3.0,
    "min_pool": 1000,
    "max_pool": null
  }' \
  http://localhost:4000/api/admin/rake/config
```

### Get Statistics

```bash
curl -X GET \
  -H "Authorization: Bearer <admin-token>" \
  "http://localhost:4000/api/admin/rake/stats?start_date=2025-11-01&end_date=2025-11-30"
```

**Response:**
```json
{
  "total_collected": 1250.50,
  "count": 25,
  "average": 50.02
}
```

### Get Collection History

```bash
curl -X GET \
  -H "Authorization: Bearer <admin-token>" \
  "http://localhost:4000/api/admin/rake/history?limit=10&offset=0"
```

## Fee Types

### Percentage-Based

```javascript
// 5% of pool
fee_value: 5.0
rake = (poolSize * 5) / 100
```

### Fixed Amount

```javascript
// Fixed $50 per room
fee_value: 50.0
rake = 50.0
```

### Tiered

```javascript
// Scales with pool size
fee_value: 2.5
rake = (poolSize * 2.5) / 100
```

## Payout Calculation Example

**Scenario:**
- 5 players, $500 buy-in each
- Total pool: $2,500
- Rake config: 5% percentage
- Rake amount: $125
- Pool after rake: $2,375

**Payouts:**
- Rank 1 (Winner): $2,375
- Rank 2 (P&L +$100): $100
- Rank 3 (P&L -$50): $0
- Rank 4 (Break-even): $475 (buy-in - rake share)
- Rank 5 (P&L -$200): $0

## Files Modified/Created

### Created
- `backend/src/services/rakeService.js` - Rake calculation and collection
- `backend/src/controllers/rakeController.js` - Admin endpoints
- `backend/src/routes/rakeRoutes.js` - Rake routes
- `docs/RAKE_HOUSE_FEE_SYSTEM.md` - This documentation

### Modified
- `schema.mysql.sql` - Added rake_config and rake_collection tables
- `backend/src/services/settlementService.js` - Integrated rake collection
- `backend/src/app.js` - Registered rake routes

## Next Steps

1. Apply schema migration
2. Create default rake configuration
3. Test rake collection with fake data
4. Implement bonus & promotion system
5. Create reconciliation job

