# Database Schema Summary for Google OAuth

## ✅ Schema is Now Complete and Supports Google OAuth

The `DATABASE_MIGRATION_GUIDE.md` has been updated to fully support:
- ✅ Google OAuth authentication
- ✅ Traditional email/password authentication
- ✅ Demo mode
- ✅ User profile pictures
- ✅ Multiple authentication providers
- ✅ Per-user data isolation

---

## Database Tables

### 1. Users Table

**Supports:**
- Google OAuth users (with `google_id`, `profile_picture`)
- Email/password users (with `password_hash`)
- Demo users (with `is_demo` flag)

**Key Fields:**
```sql
id                    -- Primary key
email                 -- Unique, required
name                  -- User's display name
auth_provider         -- 'email', 'google', or 'demo'
password_hash         -- NULL for OAuth users
google_id             -- Google user ID (sub claim), unique
profile_picture       -- URL to profile picture
google_access_token   -- Optional, for future API calls
google_refresh_token  -- Optional, for token refresh
google_token_expiry   -- Token expiration timestamp
is_demo               -- TRUE for demo users
is_admin              -- TRUE for admin users with elevated privileges
last_login            -- Last login timestamp
created_at            -- Account creation timestamp
updated_at            -- Last update timestamp
```

**Constraints:**
- Email must be unique
- Google ID must be unique (if provided)
- Email/password users must have `password_hash`
- Google users must have `google_id`
- Demo users must have `is_demo = TRUE`

### 2. Holdings Table

**Per-user stock holdings**

```sql
id                -- Primary key
user_id           -- Foreign key to users(id)
ticker            -- Stock ticker symbol
name              -- Company name
shares            -- Number of shares
purchase_price    -- Price per share at purchase
purchase_date     -- Date of purchase
sector            -- Stock sector
asset_class       -- Asset classification
created_at        -- Record creation timestamp
updated_at        -- Last update timestamp
```

**Constraints:**
- Each user can have only one holding per ticker (unique constraint)
- Shares must be > 0
- Purchase price must be > 0
- Cascading delete (if user is deleted, holdings are deleted)

### 3. Dividends Table

**Per-user dividend records**

```sql
id          -- Primary key
user_id     -- Foreign key to users(id)
ticker      -- Stock ticker symbol
amount      -- Dividend amount per share
shares      -- Number of shares
date        -- Dividend payment date
created_at  -- Record creation timestamp
```

**Constraints:**
- Amount must be > 0
- Shares must be > 0
- Cascading delete

### 4. Transactions Table

**Per-user transaction history**

```sql
id          -- Primary key
user_id     -- Foreign key to users(id)
type        -- 'buy', 'sell', or 'dividend'
ticker      -- Stock ticker symbol
shares      -- Number of shares
price       -- Price per share
fees        -- Transaction fees
date        -- Transaction date
created_at  -- Record creation timestamp
```

**Constraints:**
- Type must be 'buy', 'sell', or 'dividend'
- Shares must be > 0
- Price must be >= 0
- Fees must be >= 0
- Cascading delete

---

## Indexes for Performance

```sql
-- User lookups
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_auth_provider ON users(auth_provider);

-- Per-user data queries
CREATE INDEX idx_holdings_user_id ON holdings(user_id);
CREATE INDEX idx_dividends_user_id ON dividends(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Transaction date queries
CREATE INDEX idx_transactions_date ON transactions(date);
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Email/password registration
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/google` - **Google OAuth login/register**
- `POST /api/auth/demo` - **Demo mode login**
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Holdings
- `GET /api/holdings` - Get user's holdings
- `POST /api/holdings` - Create holding
- `PUT /api/holdings/:id` - Update holding
- `DELETE /api/holdings/:id` - Delete holding

### Dividends
- `GET /api/dividends` - Get user's dividends
- `POST /api/dividends` - Create dividend

### Transactions
- `GET /api/transactions` - Get user's transactions
- `POST /api/transactions` - Create transaction

### Portfolio
- `GET /api/portfolio/all` - Get all user data
- `POST /api/portfolio/prices` - Update current prices

---

## Google OAuth Flow

1. **User clicks "Sign in with Google"** on frontend
2. **Google returns JWT credential** to frontend
3. **Frontend sends credential** to `POST /api/auth/google`
4. **Backend verifies token** with Google
5. **Backend checks if user exists** by `google_id`
6. **If new user:** Create user with Google data
7. **If existing user:** Update `last_login` and `profile_picture`
8. **Backend returns JWT token** for API authentication
9. **Frontend stores token** in localStorage
10. **All subsequent API calls** include JWT in Authorization header

---

## Data Isolation

Each user's data is completely isolated:
- Holdings are filtered by `user_id`
- Dividends are filtered by `user_id`
- Transactions are filtered by `user_id`
- Users can only access their own data
- JWT token contains `user_id` for authentication

---

## Ready to Create Database

You can now create the database using the SQL in `DATABASE_MIGRATION_GUIDE.md`:

1. **Create PostgreSQL database:**
   ```bash
   createdb portfolio_tracker
   ```

2. **Run the schema SQL:**
   ```bash
   psql portfolio_tracker < schema.sql
   ```

3. **Or use the SQL from the guide** (lines 69-147)

The schema is complete and production-ready! ✅

