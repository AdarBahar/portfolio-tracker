# Portfolio Tracker Database Schema

**Database:** MySQL/MariaDB  
**Charset:** utf8mb4_unicode_ci  
**Engine:** InnoDB

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Core Tables](#core-tables)
4. [Trade Room (Bull Pen) Tables](#trade-room-bull-pen-tables)
5. [Supporting Tables](#supporting-tables)
6. [Indexes](#indexes)
7. [Relationships](#relationships)

---

## Overview

The Portfolio Tracker database supports:
- **Multi-auth user management** (Google OAuth, Email/Password, Demo mode)
- **Personal portfolio tracking** (holdings, dividends, transactions)
- **Trade Room (Bull Pen) sessions** - Competitive trading game rooms
- **Real-time market data caching** (Finnhub API integration)
- **Leaderboard rankings** for trade room performance

**Total Tables:** 10

---

## Entity Relationship Diagram

See the interactive ER diagram rendered above, or view the Mermaid source in this file.

---

## Core Tables

### 1. `users`
**Purpose:** User accounts with multi-provider authentication support

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | User ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| `name` | VARCHAR(100) | | Display name |
| `auth_provider` | VARCHAR(20) | NOT NULL, DEFAULT 'email' | Auth method: `email`, `google`, `demo` |
| `password_hash` | VARCHAR(255) | | Bcrypt hash (NULL for OAuth users) |
| `google_id` | VARCHAR(255) | UNIQUE | Google user ID (sub claim) |
| `profile_picture` | VARCHAR(500) | | Profile picture URL |
| `google_access_token` | TEXT | | OAuth access token (optional) |
| `google_refresh_token` | TEXT | | OAuth refresh token (optional) |
| `google_token_expiry` | DATETIME | | Token expiration timestamp |
| `is_demo` | BOOLEAN | DEFAULT FALSE | TRUE for demo/guest users |
| `last_login` | DATETIME | | Last login timestamp |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| `updated_at` | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Constraints:**
- `auth_provider` must be one of: `email`, `google`, `demo`
- Email auth requires `password_hash`
- Google auth requires `google_id`
- Demo auth requires `is_demo = TRUE`

**Indexes:**
- `idx_users_google_id` on `google_id`
- `idx_users_auth_provider` on `auth_provider`
- `idx_users_email` on `email`

---

### 2. `holdings`
**Purpose:** User's stock holdings (personal portfolio)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Holding ID |
| `user_id` | INT | FOREIGN KEY → users(id), NOT NULL | Owner user ID |
| `ticker` | VARCHAR(10) | NOT NULL | Stock ticker symbol |
| `name` | VARCHAR(100) | NOT NULL | Company/asset name |
| `shares` | DECIMAL(10,4) | NOT NULL, > 0 | Number of shares |
| `purchase_price` | DECIMAL(10,2) | NOT NULL, > 0 | Purchase price per share |
| `purchase_date` | DATE | NOT NULL | Date of purchase |
| `sector` | VARCHAR(50) | | Industry sector |
| `asset_class` | VARCHAR(50) | | Asset classification |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Constraints:**
- UNIQUE constraint on `(user_id, ticker)` - one holding per ticker per user
- `shares > 0`
- `purchase_price > 0`
- CASCADE DELETE when user is deleted

**Indexes:**
- `idx_holdings_user_id` on `user_id`
- `idx_holdings_ticker` on `ticker`

---

### 3. `dividends`
**Purpose:** Dividend payment records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Dividend record ID |
| `user_id` | INT | FOREIGN KEY → users(id), NOT NULL | Recipient user ID |
| `ticker` | VARCHAR(10) | NOT NULL | Stock ticker symbol |
| `amount` | DECIMAL(10,2) | NOT NULL, > 0 | Dividend amount received |
| `shares` | DECIMAL(10,4) | NOT NULL, > 0 | Number of shares |
| `date` | DATE | NOT NULL | Dividend payment date |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Constraints:**
- `amount > 0`
- `shares > 0`
- CASCADE DELETE when user is deleted

**Indexes:**
- `idx_dividends_user_id` on `user_id`
- `idx_dividends_ticker` on `ticker`

---

### 4. `transactions`
**Purpose:** Transaction history (buy/sell/dividend)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Transaction ID |
| `user_id` | INT | FOREIGN KEY → users(id), NOT NULL | User who made transaction |
| `type` | VARCHAR(20) | NOT NULL | Transaction type: `buy`, `sell`, `dividend` |
| `ticker` | VARCHAR(10) | NOT NULL | Stock ticker symbol |
| `shares` | DECIMAL(10,4) | NOT NULL, > 0 | Number of shares |
| `price` | DECIMAL(10,2) | NOT NULL, >= 0 | Price per share |
| `fees` | DECIMAL(10,2) | DEFAULT 0, >= 0 | Transaction fees |
| `date` | DATE | NOT NULL | Transaction date |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Constraints:**
- `type` must be one of: `buy`, `sell`, `dividend`
- `shares > 0`
- `price >= 0`
- `fees >= 0`
- CASCADE DELETE when user is deleted

**Indexes:**
- `idx_transactions_user_id` on `user_id`
- `idx_transactions_ticker` on `ticker`
- `idx_transactions_date` on `date`
- `idx_transactions_type` on `type`

---

## Trade Room (Bull Pen) Tables

### 5. `bull_pens`
**Purpose:** Trade Room (Bull Pen) sessions - competitive trading game rooms

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Bull Pen ID |
| `host_user_id` | INT | FOREIGN KEY → users(id), NOT NULL | Host/creator user ID |
| `name` | VARCHAR(255) | NOT NULL | Room name |
| `description` | TEXT | | Room description |
| `state` | VARCHAR(20) | NOT NULL, DEFAULT 'draft' | Room state (see below) |
| `start_time` | DATETIME | | Scheduled/actual start time |
| `duration_sec` | INT | NOT NULL, > 0 | Session duration in seconds |
| `max_players` | INT | NOT NULL, DEFAULT 10, > 0 | Maximum number of players |
| `starting_cash` | DECIMAL(18,2) | NOT NULL, > 0 | Starting cash for each player |
| `allow_fractional` | BOOLEAN | NOT NULL, DEFAULT FALSE | Allow fractional share trading |
| `approval_required` | BOOLEAN | NOT NULL, DEFAULT FALSE | Require host approval to join |
| `invite_code` | VARCHAR(16) | UNIQUE | Invite code for joining |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Room creation time |
| `updated_at` | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**State Values:**
- `draft` - Being configured by host
- `scheduled` - Scheduled to start at `start_time`
- `active` - Currently running
- `completed` - Finished (duration elapsed)
- `archived` - Archived by host

**Constraints:**
- `state` must be one of: `draft`, `scheduled`, `active`, `completed`, `archived`
- `duration_sec > 0`
- `max_players > 0`
- `starting_cash > 0`
- CASCADE DELETE when host user is deleted

**Indexes:**
- `idx_bull_pens_state_start_time` on `(state, start_time)`
- `idx_bull_pens_host_user_id` on `host_user_id`

---

### 6. `bull_pen_memberships`
**Purpose:** User memberships in Bull Pen sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Membership ID |
| `bull_pen_id` | INT | FOREIGN KEY → bull_pens(id), NOT NULL | Bull Pen ID |
| `user_id` | INT | FOREIGN KEY → users(id), NOT NULL | Member user ID |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'player' | User role: `host`, `player` |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Membership status (see below) |
| `cash` | DECIMAL(18,2) | NOT NULL, >= 0 | Current cash balance |
| `joined_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Join timestamp |

**Status Values:**
- `pending` - Awaiting host approval (if `approval_required = TRUE`)
- `active` - Active member
- `kicked` - Removed by host
- `left` - Voluntarily left

**Constraints:**
- UNIQUE constraint on `(bull_pen_id, user_id)` - one membership per user per room
- `role` must be one of: `host`, `player`
- `status` must be one of: `pending`, `active`, `kicked`, `left`
- `cash >= 0`
- CASCADE DELETE when bull pen or user is deleted

**Indexes:**
- `idx_bull_pen_memberships_bull_pen_id_status` on `(bull_pen_id, status)`
- `idx_bull_pen_memberships_user_id` on `user_id`

---

### 7. `bull_pen_positions`
**Purpose:** Per-user stock positions within a Bull Pen

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Position ID |
| `bull_pen_id` | INT | FOREIGN KEY → bull_pens(id), NOT NULL | Bull Pen ID |
| `user_id` | INT | FOREIGN KEY → users(id), NOT NULL | Position owner user ID |
| `symbol` | VARCHAR(32) | NOT NULL | Stock ticker symbol |
| `qty` | DECIMAL(18,8) | NOT NULL, >= 0 | Quantity held |
| `avg_cost` | DECIMAL(18,6) | NOT NULL | Average cost basis |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Position creation time |
| `updated_at` | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Constraints:**
- `qty >= 0` (can be 0 after selling all shares)
- CASCADE DELETE when bull pen or user is deleted

**Indexes:**
- `idx_bull_pen_positions_room_user_symbol` on `(bull_pen_id, user_id, symbol)`

---

### 8. `bull_pen_orders`
**Purpose:** Orders placed within Bull Pen sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Order ID |
| `bull_pen_id` | INT | FOREIGN KEY → bull_pens(id), NOT NULL | Bull Pen ID |
| `user_id` | INT | FOREIGN KEY → users(id), NOT NULL | Order placer user ID |
| `symbol` | VARCHAR(32) | NOT NULL | Stock ticker symbol |
| `side` | ENUM | NOT NULL | Order side: `buy`, `sell` |
| `type` | ENUM | NOT NULL | Order type: `market`, `limit` |
| `qty` | DECIMAL(18,8) | NOT NULL, > 0 | Order quantity |
| `filled_qty` | DECIMAL(18,8) | NOT NULL, DEFAULT 0 | Filled quantity |
| `limit_price` | DECIMAL(18,6) | NULL | Limit price (for limit orders) |
| `avg_fill_price` | DECIMAL(18,6) | NULL | Average fill price |
| `status` | ENUM | NOT NULL, DEFAULT 'new' | Order status (see below) |
| `rejection_reason` | TEXT | NULL | Reason for rejection |
| `placed_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Order placement time |
| `filled_at` | DATETIME | NULL | Order fill time |
| `server_ts` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Server timestamp |
| `feed_ts` | DATETIME | NULL | Market data feed timestamp |

**Status Values:**
- `new` - Order placed, not yet filled
- `partially_filled` - Partially executed
- `filled` - Fully executed
- `cancelled` - Cancelled by user
- `rejected` - Rejected (insufficient funds/shares, etc.)

**Constraints:**
- `side` must be one of: `buy`, `sell`
- `type` must be one of: `market`, `limit`
- `status` must be one of: `new`, `partially_filled`, `filled`, `cancelled`, `rejected`
- `qty > 0`
- CASCADE DELETE when bull pen or user is deleted

**Indexes:**
- `idx_bull_pen_orders_room_user` on `(bull_pen_id, user_id, placed_at)`
- `idx_bull_pen_orders_room_symbol` on `(bull_pen_id, symbol, placed_at)`

---

## Supporting Tables

### 9. `market_data`
**Purpose:** Cached stock price information from Finnhub API

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `symbol` | VARCHAR(32) | PRIMARY KEY | Stock ticker symbol |
| `current_price` | DECIMAL(18,6) | NOT NULL | Current stock price |
| `company_name` | VARCHAR(255) | | Company name |
| `change_percent` | DECIMAL(10,4) | | Percentage change from previous close |
| `last_updated` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last cache update time |

**Cache TTL:** 15 minutes (enforced in application layer)

**Indexes:**
- `idx_market_data_updated` on `last_updated`

---

### 10. `leaderboard_snapshots`
**Purpose:** Periodic rankings of player performance in Bull Pens

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Snapshot ID |
| `bull_pen_id` | INT | FOREIGN KEY → bull_pens(id), NOT NULL | Bull Pen ID |
| `user_id` | INT | FOREIGN KEY → users(id), NOT NULL | Player user ID |
| `snapshot_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Snapshot timestamp |
| `rank` | INT | | Player rank in leaderboard |
| `portfolio_value` | DECIMAL(18,2) | NOT NULL | Total portfolio value (cash + positions) |
| `pnl_abs` | DECIMAL(18,2) | NOT NULL | Absolute P&L (profit/loss) |
| `pnl_pct` | DECIMAL(10,4) | NOT NULL | Percentage P&L |
| `last_trade_at` | TIMESTAMP | NULL | Last trade timestamp |

**Snapshot Frequency:** Every 5 minutes for active rooms (via background job)

**Constraints:**
- CASCADE DELETE when bull pen or user is deleted

**Indexes:**
- `idx_leaderboard_room_snapshot` on `(bull_pen_id, snapshot_at DESC)`
- `idx_leaderboard_user` on `(user_id, snapshot_at DESC)`

---

## Relationships

### User-Centric Relationships
- **users → holdings** (1:N) - A user owns multiple holdings
- **users → dividends** (1:N) - A user receives multiple dividend payments
- **users → transactions** (1:N) - A user makes multiple transactions
- **users → bull_pens** (1:N) - A user can host multiple Bull Pens
- **users → bull_pen_memberships** (1:N) - A user can join multiple Bull Pens
- **users → bull_pen_positions** (1:N) - A user has positions in multiple Bull Pens
- **users → bull_pen_orders** (1:N) - A user places orders in multiple Bull Pens
- **users → leaderboard_snapshots** (1:N) - A user appears in multiple leaderboard snapshots

### Bull Pen-Centric Relationships
- **bull_pens → bull_pen_memberships** (1:N) - A Bull Pen has multiple members
- **bull_pens → bull_pen_positions** (1:N) - A Bull Pen tracks multiple positions
- **bull_pens → bull_pen_orders** (1:N) - A Bull Pen contains multiple orders
- **bull_pens → leaderboard_snapshots** (1:N) - A Bull Pen has multiple leaderboard snapshots

### Cascade Delete Behavior
All foreign key relationships use `ON DELETE CASCADE`, meaning:
- Deleting a **user** deletes all their holdings, dividends, transactions, hosted Bull Pens, memberships, positions, orders, and leaderboard entries
- Deleting a **bull_pen** deletes all its memberships, positions, orders, and leaderboard snapshots

---

## Indexes Summary

**Total Indexes:** 18

### User Authentication & Lookup
- `idx_users_google_id` - Fast Google OAuth lookups
- `idx_users_auth_provider` - Filter by auth method
- `idx_users_email` - Email-based lookups

### Personal Portfolio Queries
- `idx_holdings_user_id` - User's holdings
- `idx_holdings_ticker` - Holdings by ticker
- `idx_dividends_user_id` - User's dividends
- `idx_dividends_ticker` - Dividends by ticker
- `idx_transactions_user_id` - User's transactions
- `idx_transactions_ticker` - Transactions by ticker
- `idx_transactions_date` - Transactions by date
- `idx_transactions_type` - Transactions by type

### Bull Pen Queries
- `idx_bull_pens_state_start_time` - Find rooms by state and start time (for background jobs)
- `idx_bull_pens_host_user_id` - Rooms hosted by user
- `idx_bull_pen_memberships_bull_pen_id_status` - Active members in a room
- `idx_bull_pen_memberships_user_id` - Rooms a user is member of
- `idx_bull_pen_positions_room_user_symbol` - User's positions in a room
- `idx_bull_pen_orders_room_user` - User's orders in a room
- `idx_bull_pen_orders_room_symbol` - Orders for a symbol in a room

### Supporting Tables
- `idx_market_data_updated` - Find stale cache entries
- `idx_leaderboard_room_snapshot` - Latest leaderboard for a room
- `idx_leaderboard_user` - User's leaderboard history

---

## Database Maintenance

### Recommended Maintenance Tasks

1. **Clean old leaderboard snapshots** (monthly)
   ```sql
   DELETE FROM leaderboard_snapshots
   WHERE snapshot_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
   ```

2. **Archive completed Bull Pens** (weekly)
   ```sql
   UPDATE bull_pens
   SET state = 'archived'
   WHERE state = 'completed'
   AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
   ```

3. **Clean stale market data** (daily)
   ```sql
   DELETE FROM market_data
   WHERE last_updated < DATE_SUB(NOW(), INTERVAL 7 DAY);
   ```

4. **Optimize tables** (monthly)
   ```sql
   OPTIMIZE TABLE users, holdings, dividends, transactions,
                 bull_pens, bull_pen_memberships, bull_pen_positions,
                 bull_pen_orders, market_data, leaderboard_snapshots;
   ```

---

## Schema Version

**Version:** 1.0
**Last Updated:** 2025-11-24
**Schema File:** `schema.mysql.sql`

---

## Notes

- All tables use `utf8mb4_unicode_ci` collation for full Unicode support (including emojis)
- All tables use InnoDB engine for transaction support and foreign key constraints
- Decimal precision is chosen to support high-precision financial calculations
- Timestamps use `DATETIME` for application-controlled times and `TIMESTAMP` for auto-updated fields
- Background jobs (room state manager, leaderboard updater) run via `node-cron` in the backend process

