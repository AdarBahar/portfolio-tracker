# Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          USERS                              │
├─────────────────────────────────────────────────────────────┤
│ PK  id                    SERIAL                            │
│ UQ  email                 VARCHAR(255)  NOT NULL            │
│     name                  VARCHAR(100)                      │
│                                                             │
│ ┌─ Authentication ────────────────────────────────────────┐ │
│ │   auth_provider         VARCHAR(20)   NOT NULL          │ │
│ │   password_hash         VARCHAR(255)  (NULL for OAuth)  │ │
│ │ UQ google_id            VARCHAR(255)                    │ │
│ │   profile_picture       VARCHAR(500)                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ OAuth Tokens (Optional) ───────────────────────────────┐ │
│ │   google_access_token   TEXT                            │ │
│ │   google_refresh_token  TEXT                            │ │
│ │   google_token_expiry   TIMESTAMP                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Metadata ──────────────────────────────────────────────┐ │
│ │   is_demo               BOOLEAN       DEFAULT FALSE     │ │
│ │   last_login            TIMESTAMP                       │ │
│ │   created_at            TIMESTAMP     DEFAULT NOW()     │ │
│ │   updated_at            TIMESTAMP     DEFAULT NOW()     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Indexes: google_id, auth_provider, email                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1
                              │
                              │ *
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│     HOLDINGS      │ │    DIVIDENDS      │ │   TRANSACTIONS    │
├───────────────────┤ ├───────────────────┤ ├───────────────────┤
│ PK  id            │ │ PK  id            │ │ PK  id            │
│ FK  user_id       │ │ FK  user_id       │ │ FK  user_id       │
│     ticker        │ │     ticker        │ │     type          │
│     name          │ │     amount        │ │     ticker        │
│     shares        │ │     shares        │ │     shares        │
│     purchase_price│ │     date          │ │     price         │
│     purchase_date │ │     created_at    │ │     fees          │
│     sector        │ └───────────────────┘ │     date          │
│     asset_class   │                       │     created_at    │
│     created_at    │ Indexes:              └───────────────────┘
│     updated_at    │ - user_id             
└───────────────────┘ - ticker              Indexes:
                                            - user_id
Indexes:                                    - ticker
- user_id                                   - date
- ticker                                    - type

Unique: (user_id, ticker)
```

---

## Table Relationships

### One-to-Many Relationships

```
users (1) ──────< holdings (*)
  │
  ├──────< dividends (*)
  │
  └──────< transactions (*)
```

**Cascade Delete:**
- When a user is deleted, ALL their holdings, dividends, and transactions are automatically deleted
- This ensures data integrity and prevents orphaned records

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Authentication                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Google OAuth │     │Email/Password│     │  Demo Mode   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      users table                            │
│                                                             │
│  auth_provider = 'google'                                   │
│  google_id = 'sub_claim_from_jwt'                           │
│  profile_picture = 'https://...'                            │
│  password_hash = NULL                                       │
│                                                             │
│  auth_provider = 'email'                                    │
│  password_hash = '$2b$10$...'                               │
│  google_id = NULL                                           │
│                                                             │
│  auth_provider = 'demo'                                     │
│  is_demo = TRUE                                             │
│  password_hash = NULL                                       │
│  google_id = NULL                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Isolation

Each user has their own isolated data:

```
User 1 (Google OAuth)
├── Holdings
│   ├── AAPL (10 shares)
│   └── MSFT (5 shares)
├── Dividends
│   └── AAPL ($2.40 on 2024-03-15)
└── Transactions
    ├── Buy AAPL (10 shares @ $150)
    └── Buy MSFT (5 shares @ $300)

User 2 (Email/Password)
├── Holdings
│   └── GOOGL (3 shares)
├── Dividends
│   └── (none)
└── Transactions
    └── Buy GOOGL (3 shares @ $140)

User 3 (Demo)
├── Holdings
│   └── (sample data)
├── Dividends
│   └── (sample data)
└── Transactions
    └── (sample data)
```

**Query Example:**
```sql
-- Get all holdings for user with email 'user@example.com'
SELECT h.*
FROM holdings h
JOIN users u ON h.user_id = u.id
WHERE u.email = 'user@example.com';

-- User 1 can ONLY see their own holdings
-- User 2 can ONLY see their own holdings
-- Complete data isolation ✅
```

---

## Constraints Summary

### Users Table
- ✅ Email must be unique
- ✅ Google ID must be unique (if provided)
- ✅ Auth provider must be 'email', 'google', or 'demo'
- ✅ Email users must have password_hash
- ✅ Google users must have google_id
- ✅ Demo users must have is_demo = TRUE

### Holdings Table
- ✅ Each user can have only ONE holding per ticker
- ✅ Shares must be > 0
- ✅ Purchase price must be > 0
- ✅ User must exist (foreign key)

### Dividends Table
- ✅ Amount must be > 0
- ✅ Shares must be > 0
- ✅ User must exist (foreign key)

### Transactions Table
- ✅ Type must be 'buy', 'sell', or 'dividend'
- ✅ Shares must be > 0
- ✅ Price must be >= 0 (can be 0 for dividends)
- ✅ Fees must be >= 0
- ✅ User must exist (foreign key)

---

## Index Strategy

### Why These Indexes?

**User Lookups:**
- `idx_users_google_id` - Fast Google OAuth login
- `idx_users_auth_provider` - Filter by auth method
- `idx_users_email` - Fast email lookup

**Per-User Data Queries:**
- `idx_holdings_user_id` - Get all holdings for a user
- `idx_dividends_user_id` - Get all dividends for a user
- `idx_transactions_user_id` - Get all transactions for a user

**Ticker Lookups:**
- `idx_holdings_ticker` - Find all users holding a specific stock
- `idx_dividends_ticker` - Find all dividends for a specific stock
- `idx_transactions_ticker` - Find all transactions for a specific stock

**Date Range Queries:**
- `idx_transactions_date` - Filter transactions by date range

**Transaction Type Filtering:**
- `idx_transactions_type` - Filter by buy/sell/dividend

---

## Storage Estimates

**Typical User:**
- 1 user record: ~500 bytes
- 20 holdings: ~2 KB
- 50 dividends: ~2.5 KB
- 100 transactions: ~5 KB
- **Total per user: ~10 KB**

**1,000 users:**
- ~10 MB of data
- Very small database!

**10,000 users:**
- ~100 MB of data
- Still very manageable

**PostgreSQL free tiers:**
- Heroku: 10,000 rows (plenty for this app)
- Supabase: 500 MB (can handle 50,000+ users)
- AWS RDS Free Tier: 20 GB (massive overkill)

---

**Schema is production-ready! 🚀**

