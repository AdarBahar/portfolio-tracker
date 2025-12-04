# Phusion Passenger WebSocket Fix

## 🔴 Problem

When running on InMotion Hosting with Phusion Passenger, the WebSocket server failed to start with error:

```
Error: http.Server.listen() was called more than once, which is not allowed 
because Phusion Passenger is in auto-install mode.
```

## 🔍 Root Cause

Phusion Passenger (InMotion's Node.js hosting) automatically takes over the first HTTP server that calls `listen()`. When we tried to create a second HTTP server for WebSocket on port 4001, Passenger rejected it.

**Original Architecture** (Failed):
```
Express REST API → app.listen(4000) → Passenger takes over
WebSocket Server → new Server().listen(4001) → ERROR! Passenger already took over
```

## ✅ Solution

Attach the WebSocket server to the **same HTTP server** as Express, instead of creating a separate server.

**New Architecture** (Works):
```
HTTP Server → server.listen(4000) → Passenger takes over
├── Express REST API (routes)
└── WebSocket Server (upgraded connections)
```

## 📝 Changes Made

### 1. backend/src/server.js

**Before**:
```javascript
app.listen(PORT, async () => {
  const wsServer = new WebSocketServer(WS_PORT);
  wsServer.start();
});
```

**After**:
```javascript
const http = require('http');
const server = http.createServer(app);

server.listen(PORT, async () => {
  const wsServer = new WebSocketServer(null, server);
  wsServer.start();
});
```

### 2. backend/src/websocket/server.js

**Before**:
```javascript
constructor(port = 4001) {
  this.port = port;
}

start() {
  this.wss = new WebSocket.Server({ port: this.port });
}
```

**After**:
```javascript
constructor(port = 4001, httpServer = null) {
  this.port = port;
  this.httpServer = httpServer;
}

start() {
  if (this.httpServer) {
    this.wss = new WebSocket.Server({ server: this.httpServer });
  } else {
    this.wss = new WebSocket.Server({ port: this.port });
  }
}
```

## 🎯 How It Works

1. **HTTP Server Created**: `http.createServer(app)` creates a single HTTP server
2. **Express Attached**: Express app handles HTTP requests
3. **WebSocket Attached**: WebSocket server handles WebSocket upgrade requests
4. **Passenger Happy**: Only one `listen()` call, so Passenger is satisfied
5. **Client Connects**: Browser connects to `wss://www.bahar.co.il:4001`
6. **HTTP Upgrade**: HTTP server upgrades connection to WebSocket
7. **WebSocket Works**: Real-time updates flow through WebSocket

## 🚀 Deployment Steps

### Step 1: Deploy Updated Backend

Upload the updated backend to production:

```bash
# Build backend
cd backend
npm run build

# Deploy to production
rsync -avz dist/ user@www.bahar.co.il:/public_html/fantasybroker/backend/
```

### Step 2: Restart Application in cPanel

1. Log into cPanel
2. Go to "Setup Node.js App"
3. Find "fantasybroker-api" application
4. Click "Restart App"
5. Wait for status to show "online"

### Step 3: Check Logs

In cPanel → Setup Node.js App → View Logs:

Should see:
```
Portfolio Tracker backend listening on port 4000
[Server] WebSocket server started on same HTTP server
[Server] Background jobs started successfully
```

Should NOT see:
```
[Server] Failed to start WebSocket server
```

### Step 4: Test WebSocket Connection

1. Open: `https://www.bahar.co.il/fantasybroker/react/trade-room/35`
2. Press F12 → Console
3. Should see: `[WebSocket] Connected` ✅
4. Should NOT see connection errors

## ✅ Verification

### Check Backend Logs

```bash
# SSH into server
ssh user@www.bahar.co.il

# Check logs (if available)
tail -f /path/to/passenger/logs
```

### Check WebSocket Connection

```bash
# From browser console
curl -I https://www.bahar.co.il/fantasybroker-api/api/health
# Should return 200 OK

# WebSocket should connect automatically
# Check console for: [WebSocket] Connected
```

## 🔄 Backward Compatibility

The fix maintains backward compatibility:

- **Phusion Passenger Mode**: Pass `httpServer` parameter
  ```javascript
  new WebSocketServer(null, server)
  ```

- **Standalone Mode**: Pass `port` parameter (for local development)
  ```javascript
  new WebSocketServer(4001)
  ```

## 📚 Related Files

- `backend/src/server.js` - Main server file (UPDATED)
- `backend/src/websocket/server.js` - WebSocket server (UPDATED)
- `backend/src/websocket/integration.js` - Event broadcasting (unchanged)
- `backend/src/websocket/roomManager.js` - Room management (unchanged)

## 🎯 Summary

| Item | Details |
|------|---------|
| **Problem** | Phusion Passenger doesn't allow multiple `listen()` calls |
| **Solution** | Attach WebSocket to same HTTP server as Express |
| **Result** | WebSocket works on InMotion Hosting |
| **Compatibility** | Maintains backward compatibility with standalone mode |
| **Deployment** | Rebuild backend, deploy, restart in cPanel |

## 📞 Support

If WebSocket still doesn't connect:

1. **Check logs** in cPanel
2. **Verify backend restarted** successfully
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Check console** for errors (F12)
5. **Contact InMotion support** if port 4001 is blocked

## 🔗 References

- [Phusion Passenger Node.js Guide](https://www.phusionpassenger.com/library/deploy/nodejs/)
- [WebSocket.js Documentation](https://github.com/websockets/ws)
- [HTTP Server Upgrade](https://nodejs.org/en/docs/guides/nodejs-web-server/)

