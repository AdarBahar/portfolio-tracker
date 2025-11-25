# Production Testing Guide - Code Review Fixes

This guide explains how to test the recent code review fixes on production.

## Overview

The code review fixes include:
1. **Toast Notifications** - Price update failure alerts
2. **API Retry Logic** - Exponential backoff for failed requests
3. **Payload Validation** - Size limits on API requests
4. **Auth Header Security** - Enhanced token validation
5. **Configuration System** - Auto-detection of production environment

## Testing Approach

### Option 1: Test on Production (Recommended)

Since the changes are **low-risk defensive improvements**, you can test directly on production with monitoring.

### Option 2: Test on Staging/Local First

If you want to be extra cautious, test on a staging environment or local production build first.

---

## Pre-Deployment Checklist

### 1. Verify Current Branch

```bash
git status
git log --oneline -5
```

Expected output:
```
On branch code-review-fixes
0f5fbee feat: Update deploy script with verification
e2b253c fix: Correct configuration structure
5fafccf docs: Update code review fixes summary
9a95cbd feat: Implement medium-risk code review fixes
c2bcfc8 Add code review fixes summary document
```

### 2. Build Deployment Package

```bash
./deploy_zip.sh
```

Expected output:
```
[deploy_zip] ✅ All critical files present
Archive: dist/deploy/portfolio-tracker-deploy.zip
Size: 120K

New files (code review fixes):
  ✅ scripts/apiRetry.js
  ✅ scripts/notifications.js
  ✅ styles/notifications.css
```

### 3. Backup Current Production

Before deploying, backup the current production files:

```bash
# On production server
cd /path/to/production
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz .
```

---

## Deployment Steps

### 1. Upload to Production

```bash
# From local machine
scp dist/deploy/portfolio-tracker-deploy.zip user@production-server:/tmp/

# On production server
cd /path/to/production
unzip -o /tmp/portfolio-tracker-deploy.zip
```

### 2. Verify Backend Configuration

The backend `.env` should already exist. No changes needed unless you want to enable debug logging:

```bash
# On production server
cd backend
cat .env

# Optional: Enable verbose logging for testing
# Add to .env:
# MARKET_DATA_MODE=debug
```

### 3. Restart Backend (if needed)

```bash
# On production server
cd backend
npm install --production  # Only if package.json changed
pm2 restart portfolio-tracker  # Or your process manager
```

### 4. Clear Browser Cache

The frontend files have changed, so users need to refresh:

```bash
# Tell users to hard refresh:
# - Chrome/Firefox: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
# - Safari: Cmd+Option+R
```

---

## Testing Scenarios

### Test 1: Toast Notifications (Price Update Failures)

**What to test:** Toast notifications appear after 5 consecutive price update failures

**How to test:**

1. **Simulate API failures** (requires backend access):
   ```bash
   # On production server, temporarily break the Finnhub API
   cd backend
   nano .env
   # Change FINNHUB_API_KEY to invalid value
   # Save and restart backend
   pm2 restart portfolio-tracker
   ```

2. **Trigger price updates:**
   - Open the app in browser
   - Wait for automatic price updates (every 60 seconds)
   - Or manually trigger: Open DevTools Console and run:
     ```javascript
     // Trigger price update
     if (window.appState) {
       window.appState.updatePrices();
     }
     ```

3. **Expected behavior:**
   - After 5 failures, a **warning toast** appears in top-right corner
   - Toast message: "Price updates are experiencing issues. Using cached prices."
   - Toast auto-dismisses after 5 seconds
   - Toast has yellow/orange warning styling

4. **Verify in DevTools Console:**
   ```javascript
   // Check failure count
   console.log(window.priceUpdateFailureCount);
   // Should be >= 5
   ```

5. **Restore API:**
   ```bash
   # Restore correct FINNHUB_API_KEY in .env
   pm2 restart portfolio-tracker
   ```

**Alternative (easier):** Test locally with network throttling:
- Open DevTools → Network tab → Throttling → Offline
- Trigger price updates 5 times
- Toast should appear

---

### Test 2: API Retry Logic

**What to test:** Failed API requests are retried with exponential backoff

**How to test:**

1. **Enable verbose logging:**
   - Open DevTools Console
   - Run:
     ```javascript
     // Enable verbose API logging
     localStorage.setItem('verboseApiLogging', 'true');
     location.reload();
     ```

2. **Simulate transient failures:**
   - Open DevTools → Network tab
   - Right-click on any API request → Block request URL
   - Or use throttling: Slow 3G / Offline

3. **Trigger API calls:**
   - Navigate to Trade Room
   - Try to load BullPens or place an order
   - Or manually trigger:
     ```javascript
     // Test retry logic
     fetch('https://www.bahar.co.il/fantasybroker-api/api/bullpens')
       .then(r => r.json())
       .then(console.log)
       .catch(console.error);
     ```

4. **Expected behavior in Console:**
   ```
   [fetchWithRetry] Attempt 1/3 failed: 503 Service Unavailable
   [fetchWithRetry] Retrying in 1000ms...
   [fetchWithRetry] Attempt 2/3 failed: 503 Service Unavailable
   [fetchWithRetry] Retrying in 2000ms...
   [fetchWithRetry] Attempt 3/3 failed: 503 Service Unavailable
   [fetchWithRetry] All retries exhausted
   ```

5. **Verify retry delays:**
   - 1st retry: 1 second delay
   - 2nd retry: 2 second delay (2x backoff)
   - 3rd retry: 4 second delay (2x backoff)

6. **Disable verbose logging:**
   ```javascript
   localStorage.removeItem('verboseApiLogging');
   ```

---

### Test 3: Payload Validation

**What to test:** Large payloads are rejected before sending to API

**How to test:**

1. **Test symbol limit (Trade Room):**
   - Open DevTools Console
   - Try to fetch too many symbols:
     ```javascript
     // Create array of 51 symbols (limit is 50)
     const symbols = Array.from({length: 51}, (_, i) => `SYMBOL${i}`);
     
     // This should fail validation
     fetch('/api/market-data/multiple', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({symbols})
     });
     ```

2. **Expected behavior:**
   - Error in console: "Payload validation failed: Too many symbols"
   - Request is **not sent** to server (check Network tab)

3. **Test text field limit:**
   - Create a BullPen with very long description (>5000 chars)
   - Expected: Validation error before API call

4. **Test shares limit:**
   - Try to place order with >1,000,000 shares
   - Expected: Validation error

---

### Test 4: Configuration Auto-Detection

**What to test:** Frontend automatically detects production domain and uses correct API URL

**How to test:**

1. **Check configuration in Console:**
   ```javascript
   // Wait for config to load
   setTimeout(async () => {
     const config = await import('./scripts/config.js');
     const cfg = await config.loadConfig();
     console.log('API URL:', cfg.apiUrl);
     console.log('Full config:', cfg);
   }, 1000);
   ```

2. **Expected output on production:**
   ```javascript
   API URL: https://www.bahar.co.il/fantasybroker-api/api
   ```

3. **Verify no config.local.js loaded:**
   ```javascript
   // Should see this in console on page load:
   "ℹ️ Using default configuration. Create config.local.js to override."
   ```

4. **Test API calls work:**
   - Navigate through the app
   - Check Network tab - all API calls should go to production URL
   - No CORS errors

---

### Test 5: Auth Header Security

**What to test:** Invalid tokens are rejected, only whitelisted headers are sent

**How to test:**

1. **Test with invalid token:**
   ```javascript
   // Set invalid token
   localStorage.setItem('authToken', '   ');  // Whitespace only
   
   // Try to make authenticated request
   fetch('/api/portfolio')
     .then(r => console.log('Status:', r.status))
     .catch(console.error);
   ```

2. **Expected behavior:**
   - Console warning: "[Auth] Invalid token format"
   - Request sent **without** Authorization header
   - Server returns 401 Unauthorized

3. **Test with valid token:**
   - Login normally
   - Check Network tab → Headers
   - Should see: `Authorization: Bearer <token>`
   - Should **not** see any unexpected headers

4. **Verify header whitelist:**
   ```javascript
   // Check auth headers
   const authManager = window.authManager;
   const headers = authManager.getAuthHeader();
   console.log('Auth headers:', headers);
   // Should only contain: {Authorization: "Bearer ..."}
   ```

---

## Monitoring After Deployment

### 1. Browser Console Monitoring

Open DevTools Console and watch for:

✅ **Good signs:**
```
✅ Loaded configuration from config.local.js
ℹ️ Using default configuration
[Auth] Token validated successfully
```

❌ **Bad signs:**
```
❌ Uncaught TypeError: ...
❌ Failed to fetch
❌ CORS error
```

### 2. Network Tab Monitoring

Check DevTools → Network tab:

✅ **Good signs:**
- All API calls return 200 OK (or expected status)
- API URL is correct: `https://www.bahar.co.il/fantasybroker-api/api`
- No failed requests (except intentional retries)

❌ **Bad signs:**
- 404 Not Found (missing files)
- 500 Internal Server Error (backend issues)
- CORS errors (configuration issue)

### 3. Application Functionality

Test core features:
- ✅ Login works
- ✅ Portfolio loads
- ✅ Transactions display
- ✅ Charts render
- ✅ Trade Room loads
- ✅ BullPens display
- ✅ Orders can be placed

---

## Rollback Plan

If something goes wrong:

### Quick Rollback

```bash
# On production server
cd /path/to/production
rm -rf *
tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz
pm2 restart portfolio-tracker
```

### Verify Rollback

1. Check browser console - no errors
2. Test login and basic functionality
3. Verify API calls work

---

## Configuration Tweaks (Optional)

If you want to adjust thresholds on production:

### Frontend Configuration

Since frontend uses `config.js` defaults in production, you have two options:

**Option A: Edit config.js directly** (not recommended)
```javascript
// In scripts/config.js, change defaults:
const defaultConfig = {
    priceUpdateFailureThreshold: 10,  // Increase from 5 to 10
    apiMaxRetries: 5,  // Increase from 3 to 5
    // ...
};
```

**Option B: Create config.local.js on production** (better)
```bash
# On production server
cd scripts
nano config.local.js
```

```javascript
// config.local.js
export default {
    // Only override what you need
    priceUpdateFailureThreshold: 10,
    apiMaxRetries: 5,
    verboseApiLogging: true,  // Enable for debugging
};
```

Then hard refresh browser to reload.

---

## Summary

### Testing Priority

1. **High Priority** (test first):
   - ✅ Configuration auto-detection (Test 4)
   - ✅ Basic functionality (login, portfolio, trade room)

2. **Medium Priority** (test if time permits):
   - ✅ API retry logic (Test 2)
   - ✅ Auth header security (Test 5)

3. **Low Priority** (test in background):
   - ✅ Toast notifications (Test 1) - requires simulating failures
   - ✅ Payload validation (Test 3) - edge case

### Expected Timeline

- **Deployment**: 5-10 minutes
- **Basic testing**: 10-15 minutes
- **Comprehensive testing**: 30-60 minutes
- **Monitoring period**: 24-48 hours

### Success Criteria

✅ No console errors on page load  
✅ Login works  
✅ Portfolio and transactions load  
✅ Trade Room functions normally  
✅ API calls use correct production URL  
✅ No CORS errors  
✅ No user complaints  

---

## Need Help?

If you encounter issues:

1. **Check browser console** for errors
2. **Check Network tab** for failed requests
3. **Check backend logs** on server
4. **Rollback** if critical functionality is broken
5. **Contact developer** with error details

All changes are backward compatible and defensive, so the risk is very low! 🚀

