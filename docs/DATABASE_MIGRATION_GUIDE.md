# Database Migration Guide

## Overview

This guide walks you through migrating the Portfolio Tracker from localStorage to a database-backed API with per-user data storage.

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│   (Browser)     │
│                 │
│  ┌───────────┐  │
│  │ AppState  │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │DataService│  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │ApiAdapter │  │ ◄─── You implement this
│  └─────┬─────┘  │
└────────┼────────┘
         │ HTTP/HTTPS
         │
┌────────▼────────┐
│   Backend API   │
│  (Node/Python)  │
│                 │
│  ┌───────────┐  │
│  │   Auth    │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │   Routes  │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │    DB     │  │
│  └───────────┘  │
└─────────────────┘
```

## Step-by-Step Migration

### Phase 1: Backend Setup

#### 1.1 Choose Your Stack

**Option A: Node.js + Express + MySQL** ⭐ **Recommended**
```bash
npm init -y
npm install express mysql2 bcrypt jsonwebtoken cors dotenv
```

**Option B: Python + FastAPI + MySQL**
```bash
pip install fastapi uvicorn sqlalchemy pymysql python-jose passlib
```

**Note:** This project uses **MySQL/MariaDB** as the database. The schema file is `schema.mysql.sql`.

#### 1.2 Database Schema

**This project uses MySQL/MariaDB.**

**Schema file:** `schema.mysql.sql`

**MySQL Schema:**
```sql
-- Users table (supports both Google OAuth and traditional auth)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),

    -- Authentication fields
    auth_provider VARCHAR(20) NOT NULL DEFAULT 'email' CHECK (auth_provider IN ('email', 'google', 'demo')),
    password_hash VARCHAR(255), -- NULL for OAuth users
    google_id VARCHAR(255) UNIQUE, -- Google user ID (sub claim)
    profile_picture VARCHAR(500), -- URL to profile picture

    -- OAuth tokens (optional, for future API calls)
    google_access_token TEXT,
    google_refresh_token TEXT,
    google_token_expiry TIMESTAMP,

    -- Metadata
    is_demo BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_auth CHECK (
        (auth_provider = 'email' AND password_hash IS NOT NULL) OR
        (auth_provider = 'google' AND google_id IS NOT NULL) OR
        (auth_provider = 'demo' AND is_demo = TRUE)
    )
);

-- Holdings table
CREATE TABLE holdings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ticker VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    shares DECIMAL(10, 4) NOT NULL CHECK (shares > 0),
    purchase_price DECIMAL(10, 2) NOT NULL CHECK (purchase_price > 0),
    purchase_date DATE NOT NULL,
    sector VARCHAR(50),
    asset_class VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, ticker)
);

-- Dividends table
CREATE TABLE dividends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ticker VARCHAR(10) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    shares DECIMAL(10, 4) NOT NULL CHECK (shares > 0),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('buy', 'sell', 'dividend')),
    ticker VARCHAR(10) NOT NULL,
    shares DECIMAL(10, 4) NOT NULL CHECK (shares > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    fees DECIMAL(10, 2) DEFAULT 0 CHECK (fees >= 0),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_auth_provider ON users(auth_provider);
CREATE INDEX idx_holdings_user_id ON holdings(user_id);
CREATE INDEX idx_dividends_user_id ON dividends(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
```

**MongoDB Schema:**
```javascript
// users collection
{
    _id: ObjectId,
    email: String (unique, required),
    name: String,

    // Authentication
    authProvider: String (enum: ['email', 'google', 'demo'], default: 'email'),
    passwordHash: String (required if authProvider === 'email'),
    googleId: String (unique, required if authProvider === 'google'),
    profilePicture: String (URL),

    // OAuth tokens (optional)
    googleAccessToken: String,
    googleRefreshToken: String,
    googleTokenExpiry: Date,

    // Metadata
    isDemo: Boolean (default: false),
    lastLogin: Date,
    createdAt: Date,
    updatedAt: Date
}

// holdings collection
{
    _id: ObjectId,
    userId: ObjectId (ref: users),
    ticker: String,
    name: String,
    shares: Number,
    purchasePrice: Number,
    purchaseDate: Date,
    sector: String,
    assetClass: String,
    createdAt: Date,
    updatedAt: Date
}

// Similar for dividends and transactions
```

#### 1.3 API Endpoints

**Required Endpoints:**

```
Authentication:
POST   /api/auth/register      - Create new user (email/password)
POST   /api/auth/login         - Login with email/password
POST   /api/auth/google        - Login/register with Google OAuth token
POST   /api/auth/demo          - Create demo user session
POST   /api/auth/logout        - Logout
GET    /api/auth/me            - Get current user
POST   /api/auth/refresh       - Refresh JWT token

Holdings:
GET    /api/holdings           - Get all holdings for user
POST   /api/holdings           - Create new holding
PUT    /api/holdings/:id       - Update holding
DELETE /api/holdings/:id       - Delete holding

Dividends:
GET    /api/dividends          - Get all dividends for user
POST   /api/dividends          - Create new dividend

Transactions:
GET    /api/transactions       - Get all transactions for user
POST   /api/transactions       - Create new transaction

Portfolio Data:
GET    /api/portfolio/all      - Get all data (holdings, dividends, transactions)
POST   /api/portfolio/prices   - Update current prices
```

#### 1.4 Example Backend (Node.js + Express)

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
            [email, passwordHash, name]
        );
        
        const token = jwt.sign(
            { id: result.rows[0].id, email: result.rows[0].email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ user: result.rows[0], token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND auth_provider = $2',
            [email, 'email']
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
        );

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                profilePicture: user.profile_picture,
                authProvider: user.auth_provider
            },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Google OAuth Login/Register
app.post('/api/auth/google', async (req, res) => {
    try {
        const { credential } = req.body; // Google JWT token

        // Verify Google token (you'll need google-auth-library)
        // const { OAuth2Client } = require('google-auth-library');
        // const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        // const ticket = await client.verifyIdToken({
        //     idToken: credential,
        //     audience: process.env.GOOGLE_CLIENT_ID,
        // });
        // const payload = ticket.getPayload();

        // For now, decode the JWT (in production, verify it!)
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString());

        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists
        let result = await pool.query(
            'SELECT * FROM users WHERE google_id = $1',
            [googleId]
        );

        let user;
        if (result.rows.length === 0) {
            // Create new user
            result = await pool.query(
                `INSERT INTO users (email, name, auth_provider, google_id, profile_picture, last_login)
                 VALUES ($1, $2, $3, $4, $5, NOW())
                 RETURNING *`,
                [email, name, 'google', googleId, picture]
            );
            user = result.rows[0];
        } else {
            // Update existing user
            user = result.rows[0];
            await pool.query(
                'UPDATE users SET last_login = NOW(), profile_picture = $1, name = $2 WHERE id = $3',
                [picture, name, user.id]
            );
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name || name,
                profilePicture: picture,
                authProvider: 'google'
            },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Demo Login
app.post('/api/auth/demo', async (req, res) => {
    try {
        // Create or get demo user
        const demoEmail = `demo_${Date.now()}@demo.local`;

        const result = await pool.query(
            `INSERT INTO users (email, name, auth_provider, is_demo, last_login)
             VALUES ($1, $2, $3, $4, NOW())
             RETURNING *`,
            [demoEmail, 'Demo User', 'demo', true]
        );

        const user = result.rows[0];

        const token = jwt.sign(
            { id: user.id, email: user.email, isDemo: true },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Shorter expiry for demo
        );

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                authProvider: 'demo',
                isDemo: true
            },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get holdings
app.get('/api/holdings', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM holdings WHERE user_id = $1 ORDER BY ticker',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create holding
app.post('/api/holdings', authenticateToken, async (req, res) => {
    try {
        const { ticker, name, shares, purchase_price, purchase_date, sector, asset_class } = req.body;
        
        const result = await pool.query(
            `INSERT INTO holdings (user_id, ticker, name, shares, purchase_price, purchase_date, sector, asset_class)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [req.user.id, ticker, name, shares, purchase_price, purchase_date, sector, asset_class]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Similar endpoints for dividends, transactions, etc.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Phase 2: Frontend Integration

#### 2.1 Complete the ApiAdapter

In `scripts/dataService.js`, implement the full ApiAdapter:

```javascript
export class ApiAdapter extends DataAdapter {
    constructor(baseUrl, authToken) {
        super();
        this.baseUrl = baseUrl;
        this.authToken = authToken;
    }

    async _fetch(endpoint, options = {}) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired, redirect to login
                window.location.href = '/login.html';
                throw new Error('Unauthorized');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    async getHoldings() {
        return await this._fetch('/api/holdings');
    }

    async saveHoldings(holdings) {
        // Note: This might need to be changed to individual POST requests
        // depending on your API design
        await this._fetch('/api/holdings', {
            method: 'POST',
            body: JSON.stringify(holdings)
        });
    }

    async getDividends() {
        return await this._fetch('/api/dividends');
    }

    async saveDividends(dividends) {
        await this._fetch('/api/dividends', {
            method: 'POST',
            body: JSON.stringify(dividends)
        });
    }

    // Implement remaining methods...
}
```

#### 2.2 Add Authentication UI

Create `login.html` and `register.html` pages, or add auth modals to the main page.

#### 2.3 Update app.js

```javascript
// Check if user is authenticated
const authToken = localStorage.getItem('auth_token');

if (!authToken) {
    // Redirect to login
    window.location.href = '/login.html';
} else {
    // Initialize with API adapter
    appState = new AppState();
    appState.dataService = new DataService(
        new ApiAdapter('https://your-api.com', authToken)
    );
    await appState.initialize();
}
```

### Phase 3: Deployment

1. **Deploy Backend:**
   - Heroku, AWS, DigitalOcean, etc.
   - Set environment variables (DATABASE_URL, JWT_SECRET)
   - Enable HTTPS

2. **Deploy Frontend:**
   - Netlify, Vercel, GitHub Pages, etc.
   - Update API base URL in production

3. **Configure CORS:**
   - Allow your frontend domain
   - Set proper headers

## Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Token refresh works
- [ ] Holdings CRUD operations work
- [ ] Dividends CRUD operations work
- [ ] Transactions CRUD operations work
- [ ] Data persists across sessions
- [ ] Multiple users have isolated data
- [ ] Logout clears data
- [ ] 401 errors redirect to login
- [ ] HTTPS enabled in production

## Rollback Plan

If issues arise, you can easily rollback to localStorage:

```javascript
// In app.js, change:
appState.dataService = new DataService(new LocalStorageAdapter());
```

The beauty of the adapter pattern is that your entire application continues to work!

---

## Google OAuth Integration

### Backend Setup

#### 1. Install Google Auth Library

**Node.js:**
```bash
npm install google-auth-library
```

**Python:**
```bash
pip install google-auth
```

#### 2. Verify Google Tokens

**Node.js Example:**
```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
        googleId: payload['sub'],
        email: payload['email'],
        name: payload['name'],
        picture: payload['picture'],
        emailVerified: payload['email_verified']
    };
}
```

**Python Example:**
```python
from google.oauth2 import id_token
from google.auth.transport import requests

def verify_google_token(token):
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        return {
            'google_id': idinfo['sub'],
            'email': idinfo['email'],
            'name': idinfo['name'],
            'picture': idinfo['picture'],
            'email_verified': idinfo['email_verified']
        }
    except ValueError:
        raise Exception('Invalid token')
```

### Frontend Integration

The frontend is already set up for Google OAuth! The `scripts/auth.js` file handles:
- Google Sign-In button
- JWT token parsing
- User session management
- Demo mode

**Key Flow:**
1. User clicks "Sign in with Google"
2. Google returns JWT credential
3. Frontend sends credential to `/api/auth/google`
4. Backend verifies token and creates/updates user
5. Backend returns JWT token
6. Frontend stores token and user info
7. All API calls include JWT token in Authorization header

### Environment Variables

**Backend `.env`:**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_tracker

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Google OAuth
GOOGLE_CLIENT_ID=539842594800-bpqtcpi56vaf7nkiqcf1796socl2cjqp.apps.googleusercontent.com

# Server
PORT=3000
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://www.bahar.co.il,https://bahar.co.il
```

### Security Considerations

1. **Always verify Google tokens on the backend** - Never trust client-side verification
2. **Use HTTPS in production** - Required for OAuth
3. **Validate email_verified claim** - Ensure email is verified by Google
4. **Store minimal OAuth data** - Only store what you need
5. **Implement token refresh** - Google tokens expire in 1 hour
6. **Rate limit auth endpoints** - Prevent brute force attacks
7. **Use secure JWT secrets** - Generate strong random secrets

### Migration from Current Auth System

Your current frontend already uses Google OAuth! To migrate:

1. **Create database** with updated schema (includes Google OAuth fields)
2. **Deploy backend API** with Google OAuth endpoints
3. **Update frontend** to use ApiAdapter instead of LocalStorageAdapter
4. **Test thoroughly** with Google Sign-In
5. **Migrate existing localStorage data** (optional, see below)

### Migrating Existing User Data

If users have data in localStorage, you can migrate it:

```javascript
// In app.js, after successful login
async function migrateLocalStorageData(userId) {
    const localAdapter = new LocalStorageAdapter(userId);
    const apiAdapter = new ApiAdapter(API_BASE_URL, authToken);

    // Get data from localStorage
    const holdings = await localAdapter.getHoldings();
    const dividends = await localAdapter.getDividends();
    const transactions = await localAdapter.getTransactions();

    // Save to API
    if (holdings.length > 0) {
        await apiAdapter.saveHoldings(holdings);
    }
    if (dividends.length > 0) {
        await apiAdapter.saveDividends(dividends);
    }
    if (transactions.length > 0) {
        await apiAdapter.saveTransactions(transactions);
    }

    // Clear localStorage after successful migration
    localAdapter.clearAll();

    console.log('✅ Data migrated to database');
}
```

### Testing Google OAuth

**Test Cases:**
- [ ] New Google user can sign in (creates account)
- [ ] Existing Google user can sign in (updates profile)
- [ ] Profile picture is stored and displayed
- [ ] User name is stored correctly
- [ ] Email is stored correctly
- [ ] Google ID is unique (can't create duplicate accounts)
- [ ] Demo mode still works
- [ ] Logout clears session
- [ ] Invalid Google tokens are rejected
- [ ] Token expiry is handled correctly

### Production Checklist

- [ ] Database created with updated schema
- [ ] Backend deployed with HTTPS
- [ ] Environment variables set
- [ ] Google OAuth Client ID configured
- [ ] Authorized origins updated in Google Console
- [ ] CORS configured correctly
- [ ] JWT secret is strong and secure
- [ ] Token verification implemented
- [ ] Error handling implemented
- [ ] Logging implemented
- [ ] Rate limiting implemented
- [ ] Database backups configured

