# Phusion Passenger WebSocket - CRITICAL FIX

## 🔴 The Problem

WebSocket connections were failing because **WebSocket was being initialized AFTER `server.listen()` was called**.

In Phusion Passenger:
- Passenger intercepts the `listen()` call
- It takes over the HTTP server management
- Any WebSocket setup AFTER `listen()` is too late
- Passenger doesn't know about the WebSocket upgrade handler

## ✅ The Solution

**Initialize WebSocket BEFORE `server.listen()` is called**

### Before (WRONG):
```javascript
const server = http.createServer(app);

server.listen(PORT, async () => {
  // ❌ TOO LATE! Passenger already took over
  const wsServer = new WebSocketServer(null, server);
  wsServer.start();
});
```

### After (CORRECT):
```javascript
const server = http.createServer(app);

// ✅ Initialize WebSocket BEFORE listen()
const wsServer = new WebSocketServer(null, server);
wsServer.start();

// NOW call listen()
server.listen(PORT, () => {
  logger.log(`Server listening on port ${PORT}`);
});

// Export for Phusion Passenger
module.exports = server;
```

## 🔄 What Changed

### File: `backend/src/server.js`

1. **Moved WebSocket initialization** before `server.listen()`
2. **Moved background jobs** to async IIFE (doesn't block startup)
3. **Exported server** for Phusion Passenger to manage
4. **Improved logging** to show WebSocket path instead of null port

### File: `backend/src/websocket/server.js`

- Updated logging to show path when attached to HTTP server
- Shows `[WebSocket] Server attached to HTTP server at path: /fantasybroker-api/ws`

### Files: `.htaccess` files

- Updated CSP to allow `wss://www.bahar.co.il/fantasybroker-api/ws`

## 🚀 Deployment Steps

### Step 1: Deploy Backend
```bash
rsync -avz backend/dist/src/ user@www.bahar.co.il:/home/baharc5/public_html/fantasybroker/backend/src/
```

### Step 2: Deploy .htaccess Files
```bash
rsync -avz htaccess_files/public_html.htaccess user@www.bahar.co.il:/public_html/.htaccess
rsync -avz htaccess_files/public_html-fantasybroker.htaccess user@www.bahar.co.il:/public_html/fantasybroker/.htaccess
rsync -avz htaccess_files/public_html-fantasybroker-react.htaccess user@www.bahar.co.il:/public_html/fantasybroker/react/.htaccess
```

### Step 3: Restart Backend in cPanel
1. Log into cPanel
2. Go to **"Setup Node.js App"**
3. Find **"fantasybroker-api"** application
4. Click **"Restart App"**
5. Wait for status to show **"online"**

### Step 4: Test WebSocket
1. Open: `https://www.bahar.co.il/fantasybroker/react/trade-room/35`
2. Press F12 → Console
3. Should see: `[WebSocket] Connected` ✅
4. Should NOT see CSP errors

## 📋 Verification Checklist

- [ ] Backend deployed
- [ ] All .htaccess files deployed
- [ ] Backend restarted in cPanel
- [ ] Backend status shows "online"
- [ ] Backend logs show: `[WebSocket] Server attached to HTTP server at path: /fantasybroker-api/ws`
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
Phusion Passenger (reverse proxy)
                 ↓
Node.js HTTP Server (port 4000 - internal)
                 ├── Express (REST API routes)
                 └── WebSocket (upgrade handler) ← Attached BEFORE listen()
                 ↓
HTTP Upgrade: Connection: Upgrade, Upgrade: websocket
                 ↓
WebSocket Connection Established ✅
```

## 📝 Key Insight

**Phusion Passenger manages the HTTP server lifecycle.** Any setup that depends on the HTTP server must happen BEFORE `listen()` is called, so Passenger can properly initialize everything.

---

**This is the critical fix!** Deploy and restart the backend. WebSocket should now connect! 🚀

