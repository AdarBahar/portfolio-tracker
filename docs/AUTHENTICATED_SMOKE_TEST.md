# Authenticated Smoke Test Guide

This guide explains how to run smoke tests on production using a real Google account to test both backend API and frontend features.

## Overview

You have two testing approaches:

1. **Backend API Tests** - Automated tests using `apiSmokeTest.js` (already exists)
2. **Frontend Tests** - Manual browser tests with authenticated user (this guide)

Both use real Google authentication to test the full user experience.

**✨ New: Automatic Cleanup**
- All test artifacts are prefixed with `SmokeTest_` for easy identification
- BullPens, dividends, and transactions are automatically deleted after tests complete
- No manual cleanup required!

---

## Option 1: Backend API Tests (Automated)

### Setup

1. **Get a valid Google token:**
   ```bash
   node backend/getTokenFromBrowser.js
   ```

2. **Follow the instructions:**
   - Open production site: https://www.bahar.co.il/fantasybroker/login.html
   - Sign in with Google
   - Open DevTools Console (F12)
   - Run: `copy(localStorage.getItem('authToken'))`
   - Paste the token when prompted

3. **Export the token:**
   ```bash
   export TEST_GOOGLE_CREDENTIAL="<your-token-here>"
   ```

### Run Tests

```bash
# Test against production
node backend/apiSmokeTest.js --base-url=https://www.bahar.co.il/fantasybroker-api

# Test against localhost
node backend/apiSmokeTest.js --base-url=http://localhost:4000

# List all available tests
node backend/apiSmokeTest.js --list

# Interactive mode (auto-refreshes expired tokens)
node backend/apiSmokeTest.js --interactive --base-url=https://www.bahar.co.il/fantasybroker-api
```

### What Gets Tested

✅ **Authentication:**
- Google OAuth login
- JWT token generation
- Invalid token handling

✅ **Portfolio API:**
- Holdings, dividends, transactions
- CRUD operations
- Authorization checks

✅ **Trade Room API:**
- BullPen creation and management
- Membership approval flow
- Order execution (buy/sell)
- Position tracking
- Rejection scenarios (insufficient cash/shares)

✅ **Market Data API:**
- Single symbol quotes
- Multiple symbol quotes
- Invalid symbol handling

---

## Option 2: Frontend Tests (Manual with Real User)

### Setup

1. **Deploy to production** (if not already done):
   ```bash
   ./deploy_zip.sh
   # Upload and extract on server
   ```

2. **Open production site:**
   ```
   https://www.bahar.co.il/fantasybroker/
   ```

3. **Sign in with Google:**
   - Click "Sign in with Google"
   - Use your real Google account
   - Verify login succeeds

### Test Checklist

#### ✅ **Basic Functionality** (5 minutes)

| Test | Steps | Expected Result |
|------|-------|-----------------|
| **Login** | Click "Sign in with Google" | Login modal opens, auth succeeds |
| **Portfolio** | View main page | Holdings, transactions, charts display |
| **Trade Room** | Navigate to Trade Room | BullPens load, no errors |
| **Logout** | Click logout | Returns to login page |

#### ✅ **New Features - Toast Notifications** (5 minutes)

**Test 1: Manual Toast Trigger**

1. Open DevTools Console (F12)
2. Run this command:
   ```javascript
   import('./scripts/notifications.js').then(m => {
     m.showWarning('Test notification - Price updates are experiencing issues');
   });
   ```
3. **Expected:** Orange toast appears in top-right, auto-dismisses after 5 seconds

**Test 2: Different Toast Types**

```javascript
// Info toast (blue)
import('./scripts/notifications.js').then(m => {
  m.showInfo('This is an info message');
});

// Success toast (green)
import('./scripts/notifications.js').then(m => {
  m.showSuccess('Operation completed successfully');
});

// Error toast (red)
import('./scripts/notifications.js').then(m => {
  m.showError('An error occurred');
});
```

#### ✅ **New Features - API Retry Logic** (5 minutes)

**Test: Enable Verbose Logging**

1. Open DevTools Console
2. Enable logging:
   ```javascript
   localStorage.setItem('verboseApiLogging', 'true');
   location.reload();
   ```
3. Navigate through the app (Trade Room, Portfolio)
4. **Expected:** See detailed API logs in console:
   ```
   [fetchWithRetry] Fetching: /api/bull-pens
   [fetchWithRetry] Success on attempt 1
   ```

5. Disable logging:
   ```javascript
   localStorage.removeItem('verboseApiLogging');
   location.reload();
   ```

**Test: Simulate Network Failure**

1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Try to navigate to Trade Room
4. **Expected:** Console shows retry attempts:
   ```
   [fetchWithRetry] Attempt 1/3 failed
   [fetchWithRetry] Retrying in 1000ms...
   [fetchWithRetry] Attempt 2/3 failed
   [fetchWithRetry] Retrying in 2000ms...
   ```
5. Set throttling back to "No throttling"

#### ✅ **New Features - Configuration Auto-Detection** (2 minutes)

**Test: Verify Production Config**

1. Open DevTools Console
2. Run:
   ```javascript
   setTimeout(async () => {
     const config = await import('./scripts/config.js');
     const cfg = await config.loadConfig();
     console.log('API URL:', cfg.apiUrl);
     console.log('Retry config:', {
       maxRetries: cfg.apiMaxRetries,
       initialDelay: cfg.apiRetryInitialDelayMs,
       backoff: cfg.apiRetryBackoffMultiplier
     });
   }, 1000);
   ```

3. **Expected output:**
   ```javascript
   API URL: https://www.bahar.co.il/fantasybroker-api/api
   Retry config: {
     maxRetries: 3,
     initialDelay: 1000,
     backoff: 2
   }
   ```

#### ✅ **New Features - Auth Header Security** (2 minutes)

**Test: Verify Auth Headers**

1. Open DevTools → Network tab
2. Navigate to Portfolio or Trade Room
3. Click on any API request (e.g., `/api/portfolio/all`)
4. Check "Headers" tab
5. **Expected:**
   - `Authorization: Bearer <token>` present
   - No unexpected headers
   - Token format is valid JWT (3 parts separated by dots)

**Test: Invalid Token Handling**

1. Open DevTools Console
2. Set invalid token:
   ```javascript
   localStorage.setItem('authToken', '   ');  // Whitespace only
   location.reload();
   ```
3. Try to access Portfolio
4. **Expected:**
   - Console warning: `[Auth] Invalid token format`
   - Redirected to login page
   - No API calls with invalid token

5. Restore by logging in again

#### ✅ **Trade Room Features** (10 minutes)

**Test: Create BullPen**

1. Navigate to Trade Room
2. Click "Create BullPen"
3. Fill in details:
   - Name: "Smoke Test Room"
   - Duration: 1 hour
   - Starting cash: $10,000
4. Click "Create"
5. **Expected:** BullPen created, appears in list

**Test: Place Order**

1. Open your BullPen
2. Activate it (if not already active)
3. Place a buy order:
   - Symbol: AAPL
   - Quantity: 10 shares
   - Type: Market
4. **Expected:**
   - Order executes successfully
   - Position appears in holdings
   - Cash balance decreases
   - Toast notification (if implemented)

**Test: View Positions**

1. Click "Positions" tab
2. **Expected:**
   - AAPL position shows 10 shares
   - Current value displayed
   - Gain/loss calculated

---

## Combined Test Script (Best Approach)

For comprehensive testing, combine both approaches:

### Step 1: Backend API Tests

```bash
# Get token
node backend/getTokenFromBrowser.js

# Export token
export TEST_GOOGLE_CREDENTIAL="<token>"

# Run API tests
node backend/apiSmokeTest.js --base-url=https://www.bahar.co.il/fantasybroker-api
```

**Expected:** All tests pass (or only optional tests skip if no token)

### Step 2: Frontend Manual Tests

1. Open browser to production site
2. Sign in with same Google account
3. Run through frontend test checklist above
4. Verify new features work (toasts, retry, config)

### Step 3: Monitor for 24 Hours

- Check for user complaints
- Monitor server logs: `pm2 logs portfolio-tracker`
- Spot-check browser console for errors

---

## Success Criteria

✅ **Backend API Tests:**
- All non-optional tests pass
- Optional tests pass if token provided
- No unexpected errors

✅ **Frontend Tests:**
- Login works
- Portfolio loads correctly
- Trade Room functions
- Toast notifications appear
- API retry logic works
- Configuration auto-detects production
- No console errors

✅ **24-Hour Monitoring:**
- No user complaints
- No server errors
- No console errors in spot checks

---

## Troubleshooting

### Token Expired

**Symptom:** API tests fail with 401 errors

**Solution:**
```bash
# Get fresh token
node backend/getTokenFromBrowser.js

# Or use interactive mode
node backend/apiSmokeTest.js --interactive --base-url=https://www.bahar.co.il/fantasybroker-api
```

### Frontend Not Loading New Files

**Symptom:** New features don't work, old code running

**Solution:**
```bash
# Hard refresh browser
# Mac: Cmd+Shift+R
# Windows: Ctrl+Shift+R

# Or clear cache
# DevTools → Application → Clear storage → Clear site data
```

### API URL Wrong

**Symptom:** CORS errors, API calls to wrong domain

**Solution:**
1. Check console for config loading message
2. Verify API URL:
   ```javascript
   import('./scripts/config.js').then(async m => {
     const cfg = await m.loadConfig();
     console.log('API URL:', cfg.apiUrl);
   });
   ```
3. Should be: `https://www.bahar.co.il/fantasybroker-api/api`

---

## Next Steps

After successful testing:

1. ✅ All tests pass
2. ✅ No issues found in 24-hour monitoring
3. ✅ Ready to merge to main:
   ```bash
   git checkout main
   git merge code-review-fixes
   git push origin main
   ```

---

## Additional Resources

- **Backend API Tests:** `backend/apiSmokeTest.js`
- **Token Helper:** `backend/getTokenFromBrowser.js`
- **API Documentation:** `backend/API_TESTS.md`
- **Quick Test Guide:** `QUICK_PRODUCTION_TEST.md`
- **Comprehensive Guide:** `PRODUCTION_TESTING_GUIDE.md`

