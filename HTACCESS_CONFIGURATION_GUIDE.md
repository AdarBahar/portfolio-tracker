# .htaccess Configuration Guide

## 📋 Overview

There are 3 .htaccess files in the production environment, each with a specific purpose:

| File | Location | Purpose | Status |
|------|----------|---------|--------|
| `public_html.htaccess` | `/public_html/` | Root CSP and security headers | ✅ Correct |
| `public_html-fantasybroker.htaccess` | `/public_html/fantasybroker/` | Old vanilla JS site | ✅ Updated |
| `public_html-fantasybroker-react.htaccess` | `/public_html/fantasybroker/react/` | Active React frontend | ✅ Fixed |

## 🔍 CSP Hierarchy

Apache applies .htaccess files hierarchically:

```
/public_html/.htaccess (ROOT)
    ↓ (overridden by)
/public_html/fantasybroker/.htaccess
    ↓ (overridden by)
/public_html/fantasybroker/react/.htaccess (ACTIVE for React app)
```

When accessing `https://www.bahar.co.il/fantasybroker/react/trade-room/35`:
- The React app's `.htaccess` CSP is used (most specific)
- This was the problem: it had `wss://www.bahar.co.il:4001` ❌

## ✅ Fixed Issues

### Issue 1: React App CSP Had Wrong WebSocket Port
**File**: `public_html-fantasybroker-react.htaccess`
**Problem**: `wss://www.bahar.co.il:4001` (old port)
**Solution**: Changed to `wss://www.bahar.co.il:4000`

### Issue 2: React App CSP Missing API Domains
**File**: `public_html-fantasybroker-react.htaccess`
**Problem**: Missing `https://fantasybroker-api.bahar.co.il` and `https://www.bahar.co.il/fantasybroker-api/`
**Solution**: Added both domains to connect-src

### Issue 3: Fantasybroker CSP Missing WebSocket
**File**: `public_html-fantasybroker.htaccess`
**Problem**: No WebSocket support
**Solution**: Added `wss://www.bahar.co.il:4000` and API domains

## 📝 CSP Configuration Details

### Root CSP (public_html.htaccess)
```
connect-src 'self' https://www.bahar.co.il https://bahar.co.il 
  https://mytrips-api.bahar.co.il https://fantasybroker-api.bahar.co.il 
  https://www.bahar.co.il/fantasybroker-api/ https://api.amplitude.com 
  https://api.eu.amplitude.com https://sr-client-cfg.eu.amplitude.com 
  https://api.brevo.com https://accounts.google.com 
  https://cloudflareinsights.com wss://www.bahar.co.il:4000
```

### React App CSP (public_html-fantasybroker-react.htaccess)
```
connect-src 'self' https://www.bahar.co.il https://bahar.co.il 
  https://mytrips-api.bahar.co.il https://fantasybroker-api.bahar.co.il 
  https://api.amplitude.com https://api.eu.amplitude.com 
  https://sr-client-cfg.eu.amplitude.com https://api.brevo.com 
  https://accounts.google.com https://cloudflareinsights.com 
  https://fonts.googleapis.com https://fonts.gstatic.com 
  https://www.bahar.co.il/fantasybroker-api/ wss://www.bahar.co.il:4000
```

## 🚀 Deployment Steps

### Step 1: Upload All Three .htaccess Files

```bash
# From your local machine:
rsync -avz htaccess_files/public_html.htaccess user@www.bahar.co.il:/public_html/.htaccess
rsync -avz htaccess_files/public_html-fantasybroker.htaccess user@www.bahar.co.il:/public_html/fantasybroker/.htaccess
rsync -avz htaccess_files/public_html-fantasybroker-react.htaccess user@www.bahar.co.il:/public_html/fantasybroker/react/.htaccess
```

### Step 2: Verify Files Are Uploaded

```bash
ssh user@www.bahar.co.il
cat /public_html/.htaccess | grep "wss://"
cat /public_html/fantasybroker/.htaccess | grep "wss://"
cat /public_html/fantasybroker/react/.htaccess | grep "wss://"
# All should show: wss://www.bahar.co.il:4000
```

### Step 3: Clear Browser Cache

- Ctrl+Shift+Delete → Clear all
- Or: Hard refresh (Ctrl+Shift+R)

### Step 4: Test WebSocket

1. Open: `https://www.bahar.co.il/fantasybroker/react/trade-room/35`
2. Press F12 → Console
3. Should see: `[WebSocket] Connected` ✅
4. Should NOT see CSP errors

## ✅ Verification Checklist

- [ ] Upload all three .htaccess files
- [ ] Verify files are in correct locations
- [ ] Verify CSP has `wss://www.bahar.co.il:4000` (not 4001)
- [ ] Clear browser cache
- [ ] Hard refresh page
- [ ] Check console for "[WebSocket] Connected"
- [ ] No CSP errors in console
- [ ] Real-time updates work

## 📚 Files in Repository

All .htaccess files are stored in: `htaccess_files/`

- `public_html.htaccess` - Root configuration
- `public_html-fantasybroker.htaccess` - Fantasybroker folder
- `public_html-fantasybroker-react.htaccess` - React app folder

---

**All .htaccess files are now correctly configured!** 🚀

