# API Testing Guide

This guide explains how to run and manage API smoke tests for the Portfolio Tracker backend.

## Quick Start

### 1. Get Fresh Google Tokens

Google ID tokens expire after 1 hour. To get fresh tokens for testing:

```bash
node backend/getTokenFromBrowser.js
```

Follow the instructions to:
1. Sign in to the app in your browser
2. Extract the token from localStorage
3. Export it as an environment variable

### 2. Run Smoke Tests

```bash
# Set environment variables
export API_BASE_URL="https://www.bahar.co.il/fantasybroker-api"
export TEST_GOOGLE_CREDENTIAL="your-token-here"
export TEST_GOOGLE_CREDENTIAL_2="second-user-token-here"  # Optional

# Run tests
node backend/apiSmokeTest.js
```

## Advanced Usage

### Interactive Token Refresh

Run tests with automatic token refresh prompts:

```bash
node backend/apiSmokeTest.js --interactive
```

This will:
- Check if tokens are expired
- Prompt you to paste fresh tokens if needed
- Cache tokens for future test runs

### List Available Tests

```bash
node backend/apiSmokeTest.js --list
```

### Test Against Local Server

```bash
node backend/apiSmokeTest.js --base-url=http://localhost:4000
```

### Command-Line Options

- `--base-url=URL` - API base URL (default: http://localhost:4000)
- `--google-credential=TOKEN` - Google ID token for user 1
- `--google-credential-2=TOKEN` - Google ID token for user 2
- `--interactive` or `-i` - Enable interactive token refresh
- `--list` or `-l` - List all available tests

## Token Management

### Token Expiry

Google ID tokens expire after **1 hour**. The test suite will:
- ✅ Detect expired tokens before running tests
- ⚠️  Show helpful warnings with expiry times
- 💡 Suggest ways to get fresh tokens

### Token Cache

Tokens can be cached in `backend/.token-cache.json` (gitignored) when using interactive mode.

To clear the cache:

```bash
node -e "require('./backend/tokenRefresher').clearTokenCache()"
```

### Getting Tokens from Browser

**Method 1: Helper Script**
```bash
node backend/getTokenFromBrowser.js
```

**Method 2: Browser Console**
1. Open https://www.bahar.co.il/fantasybroker/login.html
2. Sign in with Google
3. Open DevTools (F12) → Console
4. Run: `localStorage.getItem('authToken')`
5. Copy the token

**Method 3: Bookmarklet**

Create a bookmark with this JavaScript:
```javascript
javascript:(function(){const t=localStorage.getItem('authToken');if(t){prompt('Auth Token (Ctrl+C to copy):',t)}else{alert('No token found. Please sign in first.')}})()
```

Click the bookmark after signing in to quickly extract the token.

## Test Categories

### Public Endpoints (No Auth Required)
- Health check
- OpenAPI spec
- Market data (single/multiple symbols)
- Invalid symbol handling

### Auth Endpoints
- Google OAuth flow
- Token validation
- Invalid credential handling

### Protected Endpoints (Auth Required)
- Portfolio management
- Holdings CRUD
- Dividends CRUD
- Transactions CRUD
- Bull Pens (Fantasy Trader)
- Trading orders

## Troubleshooting

### "Token expired" Errors

**Problem:** Tests fail with 401 errors and expired token warnings.

**Solution:**
```bash
# Option 1: Use interactive mode
node backend/apiSmokeTest.js --interactive

# Option 2: Get fresh token manually
node backend/getTokenFromBrowser.js
export TEST_GOOGLE_CREDENTIAL="new-token-here"
node backend/apiSmokeTest.js
```

### "Auth step failed" Errors

**Problem:** Tests that depend on authentication fail early.

**Solution:** Check that your Google credential is valid and not expired. The test suite will show which token is problematic.

### Network Timeouts

**Problem:** Tests timeout when connecting to remote server.

**Solution:** Check your internet connection and verify the API_BASE_URL is correct.

## CI/CD Integration

For automated testing in CI/CD pipelines:

1. Store long-lived service account credentials (not Google ID tokens)
2. Or use a test user with refresh token flow
3. Or skip auth-required tests in CI (run them manually)

Example GitHub Actions:
```yaml
- name: Run API Smoke Tests
  env:
    API_BASE_URL: ${{ secrets.API_BASE_URL }}
    TEST_GOOGLE_CREDENTIAL: ${{ secrets.TEST_GOOGLE_CREDENTIAL }}
  run: node backend/apiSmokeTest.js
```

## Files

- `backend/apiSmokeTest.js` - Main test runner
- `backend/getTokenFromBrowser.js` - Token extraction helper
- `backend/tokenRefresher.js` - Token refresh mechanism
- `backend/.token-cache.json` - Cached tokens (gitignored)
- `backend/API_TESTS.md` - Detailed test documentation

