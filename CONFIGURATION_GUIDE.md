# Configuration Guide

This document explains the configuration structure for the Portfolio Tracker application.

## Overview

The application has **two separate configuration systems**:

1. **Frontend Configuration** - Client-side JavaScript settings
2. **Backend Configuration** - Node.js server settings

These are kept separate because they run in different environments and have different security requirements.

---

## 1. Frontend Configuration

**Location:** `scripts/config.local.js`  
**Example:** `scripts/config.local.example.js`  
**Format:** JavaScript ES6 module

### Setup

```bash
# Copy the example file
cp scripts/config.local.example.js scripts/config.local.js

# Edit with your values
# config.local.js is gitignored and won't be committed
```

### What's Configured Here

- **Google OAuth Client ID** - Public client ID for Google Sign-In
- **API URL** - Backend API endpoint (default: `http://localhost:4000/api`)
- **Price Update Notifications** - Failure threshold, toast duration
- **API Retry Policy** - Max retries, backoff multiplier, delays
- **Payload Validation** - Size limits for API requests
- **Performance Flags** - DOM batching, metrics caching
- **Security Settings** - Allowed headers, strict validation
- **Debug Options** - Verbose logging, performance monitoring

### How It Works

1. `scripts/config.js` defines default values
2. `scripts/config.local.js` overrides defaults (if it exists)
3. Configuration is loaded asynchronously at app startup
4. All modules import from `scripts/config.js`

### Example config.local.js

```javascript
export default {
    // Override API URL for production
    apiUrl: 'https://api.example.com/api',
    
    // Increase retry attempts for unreliable network
    apiMaxRetries: 5,
    
    // Enable verbose logging for debugging
    verboseApiLogging: true,
};
```

---

## 2. Backend Configuration

**Location:** `backend/.env`  
**Example:** `backend/.env.example`  
**Format:** Environment variables (dotenv)

### Setup

```bash
# Navigate to backend directory
cd backend

# Copy the example file
cp .env.example .env

# Edit with your values
# .env is gitignored and won't be committed
```

### What's Configured Here

- **Server Port** - Port for the Node.js server (default: 4000)
- **Database Connection** - MySQL host, port, user, password, database name
- **JWT Secret** - Secret key for signing authentication tokens
- **Google Client ID** - OAuth client ID (must match frontend)
- **Finnhub API Key** - API key for market data
- **Market Data Mode** - `production` or `debug` mode

### How It Works

1. Node.js loads `.env` file using `dotenv` package
2. Environment variables are accessed via `process.env.VARIABLE_NAME`
3. Configuration is loaded at server startup
4. Used by database, authentication, and API services

### Example .env

```bash
# Server
PORT=4000

# MySQL database
DB_HOST=localhost
DB_PORT=3306
DB_USER=portfolio_user
DB_PASSWORD=secure_password_here
DB_NAME=portfolio_tracker

# Auth
JWT_SECRET=your_very_long_random_secret_here
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# Market Data API
FINNHUB_API_KEY=your_finnhub_api_key_here

# Market Data Mode
MARKET_DATA_MODE=production
```

---

## Configuration Separation

### Why Two Systems?

| Aspect | Frontend | Backend |
|--------|----------|---------|
| **Environment** | Browser (client-side) | Node.js (server-side) |
| **Format** | JavaScript module | Environment variables |
| **Security** | Public (visible to users) | Private (server-only) |
| **Examples** | API URL, retry policy | Database password, JWT secret |
| **Loading** | ES6 import | dotenv package |

### Security Considerations

**Frontend (`config.local.js`):**
- ✅ Can contain public values (Google Client ID, API URL)
- ❌ Never put secrets here (API keys, passwords, JWT secrets)
- ⚠️ All values are visible in browser DevTools

**Backend (`backend/.env`):**
- ✅ Can contain secrets (database password, JWT secret, API keys)
- ✅ Never exposed to client
- ⚠️ Must be kept secure on server

---

## Quick Reference

### Frontend Configuration

```bash
# Setup
cp scripts/config.local.example.js scripts/config.local.js
nano scripts/config.local.js

# Location
scripts/config.local.js

# Defaults
scripts/config.js (line 9-53)

# Example
scripts/config.local.example.js
```

### Backend Configuration

```bash
# Setup
cd backend
cp .env.example .env
nano .env

# Location
backend/.env

# Example
backend/.env.example
```

---

## Common Configuration Tasks

### Change API URL

**Frontend:**
```javascript
// scripts/config.local.js
export default {
    apiUrl: 'https://api.myapp.com/api',
};
```

### Adjust Retry Policy

**Frontend:**
```javascript
// scripts/config.local.js
export default {
    apiMaxRetries: 5,
    apiRetryInitialDelayMs: 2000,
    apiRetryBackoffMultiplier: 3,
};
```

### Enable Debug Logging

**Frontend:**
```javascript
// scripts/config.local.js
export default {
    verboseApiLogging: true,
    enablePerformanceMonitoring: true,
};
```

**Backend:**
```bash
# backend/.env
MARKET_DATA_MODE=debug
```

---

## Troubleshooting

### Frontend config not loading?

1. Check file name: `config.local.js` (not `.env`)
2. Check location: `scripts/config.local.js`
3. Check syntax: Must be valid JavaScript ES6 module
4. Check browser console for errors

### Backend config not loading?

1. Check file name: `.env` (not `.env.example`)
2. Check location: `backend/.env`
3. Check syntax: `KEY=value` format (no spaces around `=`)
4. Restart Node.js server after changes

---

## See Also

- [Backend README](backend/README.md) - Backend setup and deployment
- [CSP and SRI Setup](docs/CSP_AND_SRI_SETUP.md) - Security configuration
- [Code Review Fixes Summary](CODE_REVIEW_FIXES_SUMMARY.md) - New configuration options

