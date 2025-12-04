# Root .htaccess CSP Fix - WebSocket Connection

## 🔴 Problem

Browser console error:
```
Connecting to 'wss://www.bahar.co.il:4001/' violates the following 
Content Security Policy directive: "connect-src 'self' https://www.bahar.co.il ..."
```

WebSocket connection was being blocked by CSP policy.

## 🔍 Root Cause

**The root `.htaccess` file was overriding the React app's `.htaccess` CSP!**

### File Hierarchy

```
/fantasybroker/                    ← Root .htaccess (APPLIES HERE)
├── .htaccess                      ← Root CSP (was missing WebSocket)
├── react/                         ← React app
│   ├── .htaccess                  ← React CSP (had WebSocket)
│   └── index.html
└── backend/                       ← Backend API
```

### Why Root .htaccess Wins

Apache applies `.htaccess` files from parent directories first, then child directories. When multiple `.htaccess` files set the same header, the **most specific one wins**.

However, in this case:
- Root `.htaccess` at `/fantasybroker/` sets CSP
- React `.htaccess` at `/fantasybroker/react/` also sets CSP
- **Root CSP was being applied** because it was set with `Header always set`

The React app's `.htaccess` had the correct CSP with `wss://www.bahar.co.il:4001`, but the root `.htaccess` was overriding it.

## ✅ Solution

Added `wss://www.bahar.co.il:4001` to the root `.htaccess` CSP `connect-src` directive.

### Before

```apache
connect-src 'self' https://www.bahar.co.il https://bahar.co.il 
  https://mytrips-api.bahar.co.il https://api.amplitude.com 
  https://api.eu.amplitude.com https://sr-client-cfg.eu.amplitude.com 
  https://api.brevo.com https://unpkg.com https://cdn.jsdelivr.net 
  https://cdnjs.cloudflare.com https://accounts.google.com 
  https://cloudflareinsights.com https://fonts.googleapis.com 
  https://fonts.gstatic.com;
```

### After

```apache
connect-src 'self' https://www.bahar.co.il https://bahar.co.il 
  https://mytrips-api.bahar.co.il https://api.amplitude.com 
  https://api.eu.amplitude.com https://sr-client-cfg.eu.amplitude.com 
  https://api.brevo.com https://unpkg.com https://cdn.jsdelivr.net 
  https://cdnjs.cloudflare.com https://accounts.google.com 
  https://cloudflareinsights.com https://fonts.googleapis.com 
  https://fonts.gstatic.com wss://www.bahar.co.il:4001;
```

**Change**: Added `wss://www.bahar.co.il:4001` at the end of `connect-src`

## 📋 Files Updated

| File | Change | Status |
|------|--------|--------|
| `.htaccess` (root) | Added WebSocket URL to CSP | ✅ Fixed |
| `frontend-react/public/.htaccess` | Already had WebSocket URL | ✅ OK |

## 🚀 Deployment Steps

### Step 1: Deploy Root .htaccess

Upload the updated `.htaccess` file to production:

```bash
# Option 1: Using rsync
rsync -avz .htaccess user@www.bahar.co.il:/public_html/fantasybroker/

# Option 2: Using SCP
scp .htaccess user@www.bahar.co.il:/public_html/fantasybroker/

# Option 3: Using FTP
# Upload .htaccess to /public_html/fantasybroker/
```

### Step 2: Verify Deployment

```bash
# SSH into server
ssh user@www.bahar.co.il

# Check .htaccess was updated
cat /public_html/fantasybroker/.htaccess | grep "wss://www.bahar.co.il:4001"
# Should show the WebSocket URL in the CSP
```

### Step 3: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click refresh button → "Empty cache and hard refresh"
3. Or: Ctrl+Shift+Delete → Clear all

### Step 4: Test WebSocket Connection

1. Open: `https://www.bahar.co.il/fantasybroker/react/trade-room/35`
2. Press F12 → Console
3. Should see: `[WebSocket] Connected` ✅
4. Should NOT see CSP errors

## 🔄 Git Commits

```
9cfa610 - fix: Add WebSocket port 4001 to root .htaccess CSP
```

## 📚 Related Files

- `.htaccess` - Root configuration (FIXED)
- `frontend-react/public/.htaccess` - React app configuration (OK)
- `frontend-react/src/services/websocketService.ts` - WebSocket client (OK)
- `backend/src/websocket/server.js` - WebSocket server (OK)

## ✅ Verification Checklist

- [ ] Root `.htaccess` deployed to production
- [ ] Browser cache cleared
- [ ] Open Trade Room page
- [ ] Check console for `[WebSocket] Connected`
- [ ] No CSP errors in console
- [ ] WebSocket connection works
- [ ] Real-time updates appear

## 🎯 Summary

**Problem**: Root `.htaccess` CSP was blocking WebSocket connections

**Root Cause**: Root `.htaccess` was overriding React app's `.htaccess` CSP

**Solution**: Added `wss://www.bahar.co.il:4001` to root `.htaccess` CSP

**Result**: WebSocket connections now allowed by CSP policy

## 📞 Support

If WebSocket still doesn't connect after deployment:

1. **Check CSP header**:
   ```bash
   curl -I https://www.bahar.co.il/fantasybroker/react/
   # Look for Content-Security-Policy header
   # Should include: wss://www.bahar.co.il:4001
   ```

2. **Check browser console** (F12):
   - Should see: `[WebSocket] Connected`
   - Should NOT see CSP errors

3. **Check backend is running**:
   - Verify port 4001 is open
   - Verify backend is running on production

4. **Contact InMotion support** if port 4001 is blocked

