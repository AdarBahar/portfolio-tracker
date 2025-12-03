# WebSocket Apache Upgrade Fix - CRITICAL

## 🔴 The Problem

WebSocket connections were failing because **Apache's rewrite rules were interfering with the WebSocket upgrade handshake**.

When a browser tries to upgrade an HTTP connection to WebSocket:
1. Browser sends: `Upgrade: websocket` header
2. Browser sends: `Connection: upgrade` header
3. Apache's rewrite rules were processing this request
4. The request never reached Phusion Passenger/Node.js backend
5. Browser gets: "WebSocket connection failed"

## ✅ The Solution

**Tell Apache to NOT rewrite WebSocket upgrade requests**

Add these lines to `.htaccess` BEFORE other rewrite rules:

```apache
# === WebSocket Support ===
# Ensure WebSocket upgrade requests are NOT rewritten and are passed to Phusion Passenger
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteCond %{HTTP:Connection} upgrade [NC]
RewriteRule ^ - [L]
```

**What this does:**
- `RewriteCond %{HTTP:Upgrade} websocket [NC]` - Detect WebSocket upgrade requests
- `RewriteCond %{HTTP:Connection} upgrade [NC]` - Detect connection upgrade requests
- `RewriteRule ^ - [L]` - Don't rewrite (the `-` means "no substitution"), and stop processing ([L] = last)

## 📝 Changes Made

### File: `htaccess_files/public_html.htaccess`

Added WebSocket detection BEFORE other rewrite rules (line 13-17):

```apache
# === WebSocket Support ===
# Ensure WebSocket upgrade requests are NOT rewritten and are passed to Phusion Passenger
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteCond %{HTTP:Connection} upgrade [NC]
RewriteRule ^ - [L]
```

### File: `htaccess_files/public_html-fantasybroker-react.htaccess`

Added WebSocket detection in the React app's rewrite section (line 14-18):

```apache
# === WebSocket Support ===
# Ensure WebSocket upgrade requests are NOT rewritten and are passed to Phusion Passenger
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteCond %{HTTP:Connection} upgrade [NC]
RewriteRule ^ - [L]
```

## 🚀 Deployment Steps

### Step 1: Deploy .htaccess Files
```bash
rsync -avz htaccess_files/public_html.htaccess user@www.bahar.co.il:/public_html/.htaccess
rsync -avz htaccess_files/public_html-fantasybroker.htaccess user@www.bahar.co.il:/public_html/fantasybroker/.htaccess
rsync -avz htaccess_files/public_html-fantasybroker-react.htaccess user@www.bahar.co.il:/public_html/fantasybroker/react/.htaccess
```

### Step 2: No Backend Restart Needed
The .htaccess changes take effect immediately. No need to restart the backend.

### Step 3: Test WebSocket
1. Clear browser cache: Ctrl+Shift+Delete
2. Hard refresh: Ctrl+Shift+R
3. Open: `https://www.bahar.co.il/fantasybroker/react/trade-room/35`
4. Press F12 → Console
5. Should see: `[WebSocket] Connected` ✅

## 📋 Verification Checklist

- [ ] All .htaccess files deployed
- [ ] Browser cache cleared
- [ ] Page hard refreshed
- [ ] Console shows "[WebSocket] Connected"
- [ ] No CSP errors
- [ ] Real-time updates work

## 🔍 How It Works Now

```
Browser Request: wss://www.bahar.co.il/fantasybroker-api/ws
                 ↓
Apache (port 443)
                 ↓
.htaccess detects: Upgrade: websocket, Connection: upgrade
                 ↓
Apache: "Don't rewrite this, pass it through" ✓
                 ↓
Phusion Passenger (reverse proxy)
                 ↓
Node.js HTTP Server (port 4000 - internal)
                 ├── Express (REST API routes)
                 └── WebSocket (upgrade handler)
                 ↓
HTTP Upgrade: Connection: Upgrade, Upgrade: websocket
                 ↓
WebSocket Connection Established ✅
```

---

**This is the final piece!** Deploy the .htaccess files. WebSocket should now connect! 🚀

