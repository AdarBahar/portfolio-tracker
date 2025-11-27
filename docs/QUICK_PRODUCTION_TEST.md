# Quick Production Testing Checklist

## 🚀 Deploy to Production

```bash
# 1. Build deployment package
./deploy_zip.sh

# 2. Upload to server
scp dist/deploy/portfolio-tracker-deploy.zip user@server:/tmp/

# 3. On server: Backup current version
cd /path/to/production
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz .

# 4. Extract new version
unzip -o /tmp/portfolio-tracker-deploy.zip

# 5. Restart backend (if needed)
cd backend
pm2 restart portfolio-tracker
```

---

## ✅ Quick Smoke Test (5 minutes)

### 1. Open Production Site
- URL: https://www.bahar.co.il (or your production URL)
- **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### 2. Check Browser Console (F12)
Open DevTools → Console tab

✅ **Should see:**
```
ℹ️ Using default configuration
```

❌ **Should NOT see:**
```
Uncaught TypeError
Failed to fetch
CORS error
```

### 3. Test Core Features

| Feature | Test | Expected Result |
|---------|------|-----------------|
| **Login** | Click "Sign in with Google" | Login modal opens, authentication works |
| **Portfolio** | View main page | Holdings, transactions, charts display |
| **Trade Room** | Navigate to Trade Room | BullPens load, no errors |
| **API Calls** | Check Network tab | All requests to production API URL |

### 4. Verify Configuration

Open Console and run:
```javascript
setTimeout(async () => {
  const config = await import('./scripts/config.js');
  const cfg = await config.loadConfig();
  console.log('API URL:', cfg.apiUrl);
}, 1000);
```

✅ **Expected output:**
```
API URL: https://www.bahar.co.il/fantasybroker-api/api
```

---

## 🧪 Test New Features (10 minutes)

### Test 1: Toast Notifications

**Easiest way:** Use browser DevTools

```javascript
// Open Console and run:
import('./scripts/notifications.js').then(m => {
  m.showWarning('Test notification - Price updates are experiencing issues');
});
```

✅ **Expected:** Orange toast appears in top-right, auto-dismisses after 5 seconds

### Test 2: API Retry Logic

**Enable verbose logging:**
```javascript
// In Console:
localStorage.setItem('verboseApiLogging', 'true');
location.reload();
```

**Simulate failure:**
- DevTools → Network tab → Throttling → Offline
- Try to navigate to Trade Room
- Check Console for retry messages

✅ **Expected:**
```
[fetchWithRetry] Attempt 1/3 failed
[fetchWithRetry] Retrying in 1000ms...
```

**Disable logging:**
```javascript
localStorage.removeItem('verboseApiLogging');
location.reload();
```

### Test 3: Verify New Files Loaded

Check Network tab → Filter by "JS":

✅ **Should see:**
- `apiRetry.js` (loaded)
- `notifications.js` (loaded)
- `notifications.css` (loaded)

---

## 📊 Monitor for 24 Hours

### What to Watch

1. **User Reports**
   - Any login issues?
   - Any functionality broken?
   - Any visual glitches?

2. **Server Logs**
   ```bash
   # On server
   pm2 logs portfolio-tracker
   ```
   - Watch for errors
   - Check API response times

3. **Browser Console** (spot check)
   - Open app in different browsers
   - Check for console errors
   - Verify no CORS issues

---

## 🔄 Rollback (if needed)

```bash
# On server
cd /path/to/production
rm -rf *
tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz
pm2 restart portfolio-tracker
```

---

## 🎯 Success Criteria

✅ No console errors on page load  
✅ Login works  
✅ Portfolio loads correctly  
✅ Trade Room functions  
✅ API calls succeed  
✅ No user complaints  

**If all checks pass → Merge to main!**

```bash
git checkout main
git merge code-review-fixes
git push origin main
```

---

## 💡 Optional: Test Edge Cases

### Test Price Update Failures

**Requires backend access:**

1. Temporarily break Finnhub API:
   ```bash
   # On server
   cd backend
   nano .env
   # Change FINNHUB_API_KEY to "invalid"
   pm2 restart portfolio-tracker
   ```

2. Wait for 5 automatic price updates (5 minutes)

3. ✅ **Expected:** Warning toast appears

4. Restore API key and restart

### Test Payload Validation

```javascript
// In Console:
const symbols = Array.from({length: 51}, (_, i) => `SYM${i}`);
fetch('/api/market-data/multiple', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({symbols})
});
```

✅ **Expected:** Error in console, request not sent

---

## 📞 Support

If issues arise:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Check server logs: `pm2 logs portfolio-tracker`
4. Rollback if critical
5. Report issues with screenshots/logs

**All changes are low-risk defensive improvements!** 🛡️

