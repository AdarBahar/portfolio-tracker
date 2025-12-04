# Root .htaccess CSP Fix - WebSocket Connection

## 🔴 Problem

Browser console error:
```
Connecting to 'wss://www.bahar.co.il:4001/' violates the following 
Content Security Policy directive: "connect-src 'self' https://www.bahar.co.il ..."
```

## ✅ Solution

Add `wss://www.bahar.co.il:4001` to the CSP `connect-src` directive in your root `.htaccess` file.

## 📝 The Fix

Find this line in your root `.htaccess`:

```apache
Header set Content-Security-Policy "default-src 'self'; img-src * data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.amplitude.com https://accounts.google.com https://apis.google.com https:; style-src 'self' 'unsafe-inline' https://accounts.google.com https:; font-src 'self' https: data:; frame-src https://accounts.google.com; connect-src 'self' https://www.bahar.co.il https://bahar.co.il https://mytrips-api.bahar.co.il https://api.amplitude.com https://api.eu.amplitude.com https://sr-client-cfg.eu.amplitude.com https://api.brevo.com https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://accounts.google.com https://cloudflareinsights.com; object-src 'none'; base-uri 'self'; form-action 'self';"
```

Replace it with:

```apache
Header set Content-Security-Policy "default-src 'self'; img-src * data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.amplitude.com https://accounts.google.com https://apis.google.com https:; style-src 'self' 'unsafe-inline' https://accounts.google.com https:; font-src 'self' https: data:; frame-src https://accounts.google.com; connect-src 'self' https://www.bahar.co.il https://bahar.co.il https://mytrips-api.bahar.co.il https://api.amplitude.com https://api.eu.amplitude.com https://sr-client-cfg.eu.amplitude.com https://api.brevo.com https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://accounts.google.com https://cloudflareinsights.com wss://www.bahar.co.il:4001; object-src 'none'; base-uri 'self'; form-action 'self';"
```

## 🔍 What Changed

**Before** (connect-src):
```
connect-src 'self' https://www.bahar.co.il https://bahar.co.il 
  https://mytrips-api.bahar.co.il https://api.amplitude.com 
  https://api.eu.amplitude.com https://sr-client-cfg.eu.amplitude.com 
  https://api.brevo.com https://unpkg.com https://cdn.jsdelivr.net 
  https://cdnjs.cloudflare.com https://accounts.google.com 
  https://cloudflareinsights.com;
```

**After** (connect-src):
```
connect-src 'self' https://www.bahar.co.il https://bahar.co.il 
  https://mytrips-api.bahar.co.il https://api.amplitude.com 
  https://api.eu.amplitude.com https://sr-client-cfg.eu.amplitude.com 
  https://api.brevo.com https://unpkg.com https://cdn.jsdelivr.net 
  https://cdnjs.cloudflare.com https://accounts.google.com 
  https://cloudflareinsights.com wss://www.bahar.co.il:4001;
```

**Added**: `wss://www.bahar.co.il:4001` before the semicolon

## 🚀 Deployment Steps

### Step 1: Edit Root .htaccess

1. SSH into your server or use cPanel File Manager
2. Navigate to `/public_html/` (root of your domain)
3. Edit `.htaccess` file
4. Find the CSP line (search for "connect-src")
5. Add `wss://www.bahar.co.il:4001` before the semicolon
6. Save the file

### Step 2: Verify the Change

```bash
# SSH into server
ssh user@www.bahar.co.il

# Check the CSP header
cat /public_html/.htaccess | grep "connect-src"

# Should show: wss://www.bahar.co.il:4001 in the output
```

### Step 3: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click refresh button → "Empty cache and hard refresh"
3. Or: Ctrl+Shift+Delete → Clear all

### Step 4: Test WebSocket

1. Open: `https://www.bahar.co.il/fantasybroker/react/trade-room/35`
2. Press F12 → Console
3. Should see: `[WebSocket] Connected` ✅
4. Should NOT see CSP errors

## 📋 Complete Fixed .htaccess

A complete corrected `.htaccess` file is available in the repository:
- File: `.htaccess.production`
- Location: Root of portfolio-tracker repository

You can use this as a reference or copy it directly to your server.

## ✅ Verification

After deployment, verify the CSP header is correct:

```bash
curl -I https://www.bahar.co.il/fantasybroker/react/
# Look for Content-Security-Policy header
# Should include: wss://www.bahar.co.il:4001
```

## 🎯 Summary

| Item | Details |
|------|---------|
| File | Root `.htaccess` |
| Location | `/public_html/.htaccess` |
| Change | Add `wss://www.bahar.co.il:4001` to `connect-src` |
| Result | WebSocket connections allowed by CSP |

