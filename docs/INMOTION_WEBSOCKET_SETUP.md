# WebSocket Setup on InMotion Hosting

## Overview

Your backend is running on InMotion Hosting as a Node.js application via cPanel. The REST API runs on port 4000 at `/fantasybroker-api`.

**Question**: Should WebSocket run on the same application or a different one?

**Answer**: **Same application** - The WebSocket server starts automatically when the backend starts.

## Current Architecture

```
InMotion Hosting (cPanel)
│
└── Node.js Application: "fantasybroker-api"
    ├── Application root: public_html/fantasybroker/backend
    ├── Startup file: src/server.js
    ├── Application URL: /fantasybroker-api
    │
    ├── REST API Server (Express)
    │   └── Port: 4000 (managed by cPanel)
    │   └── URL: https://www.bahar.co.il/fantasybroker-api/api/...
    │
    └── WebSocket Server (ws)
        └── Port: 4001 (needs to be open)
        └── URL: wss://www.bahar.co.il:4001
```

## How It Works

When `src/server.js` starts:

1. **Express REST API** starts on port 4000
2. **WebSocket server** automatically starts on port 4001
3. Both run in the **same Node.js process**

```javascript
// backend/src/server.js
const PORT = process.env.PORT || 4000;      // REST API
const WS_PORT = process.env.WS_PORT || 4001; // WebSocket

app.listen(PORT, async () => {
  // REST API listening on 4000
  
  // WebSocket server starts automatically
  const wsServer = new WebSocketServer(WS_PORT);
  wsServer.start();
});
```

## Setup Steps

### Step 1: Verify Backend is Running

In cPanel → Setup Node.js App:
- Application should be **online**
- Status should show **running**

### Step 2: Set Environment Variables

In cPanel → Setup Node.js App → Environment Variables:

```
PORT=4000
WS_PORT=4001
DB_HOST=localhost
DB_USER=portfolio_user
DB_PASSWORD=<your_password>
DB_NAME=portfolio_tracker
JWT_SECRET=<your_jwt_secret>
API_BASE_PATH=/fantasybroker-api
```

### Step 3: Verify Ports are Open

Contact InMotion support to ensure:
- ✅ Port 4000 is open (REST API) - already working
- ✅ Port 4001 is open (WebSocket) - **needs to be open**

### Step 4: Restart Application

In cPanel → Setup Node.js App:
1. Find your application
2. Click **Restart App**
3. Wait for status to update to **online**

### Step 5: Verify Both Servers Started

Check application logs in cPanel:

```
Portfolio Tracker backend listening on port 4000
[Server] WebSocket server started on port 4001
[Server] Background jobs started successfully
```

### Step 6: Test REST API

```bash
curl https://www.bahar.co.il/fantasybroker-api/api/health
# Should return: {"status":"ok","db":"ok","marketDataMode":"production"}
```

### Step 7: Test WebSocket Connection

1. Open: `https://www.bahar.co.il/fantasybroker/react/trade-room/35`
2. Press F12 → Console
3. Should see: `[WebSocket] Connected`
4. Should NOT see connection errors

## Troubleshooting

### WebSocket not connecting

**Check 1: Is port 4001 open?**
```bash
# Contact InMotion support to verify port 4001 is open
# They may need to open it in the firewall
```

**Check 2: Is backend running?**
- Go to cPanel → Setup Node.js App
- Check if application status is **online**
- If offline, click **Start App** or **Restart App**

**Check 3: Check application logs**
- In cPanel → Setup Node.js App
- Click on your application
- View logs to see if WebSocket server started
- Look for: `[Server] WebSocket server started on port 4001`

**Check 4: Verify environment variables**
- In cPanel → Setup Node.js App
- Verify `WS_PORT=4001` is set
- Verify `PORT=4000` is set

### Port 4001 not open

If InMotion has port 4001 closed:

**Option 1: Use a different port**
- Contact InMotion to open a different port (e.g., 4002, 8001)
- Update `WS_PORT` environment variable
- Update frontend WebSocket URL

**Option 2: Use same port as REST API**
- This is **not recommended** but possible
- Would require reverse proxy configuration
- More complex setup

**Option 3: Use a separate Node.js application**
- Create a second Node.js app just for WebSocket
- More complex but gives more control

## Important Notes

1. **Same Application**: WebSocket runs in the same Node.js process as REST API
2. **No Additional Setup**: No need for separate application or process manager
3. **Port 4001 Must Be Open**: Contact InMotion if it's blocked
4. **Environment Variables**: Set `WS_PORT=4001` in cPanel
5. **Restart Required**: After changing environment variables, restart the app

## Next Steps

1. **Verify port 4001 is open** (contact InMotion if needed)
2. **Set environment variables** in cPanel
3. **Restart application** in cPanel
4. **Check logs** to verify WebSocket started
5. **Test WebSocket** in browser console
6. **Deploy frontend** with WebSocket URL fix

## Contact InMotion Support

If port 4001 is blocked, contact InMotion support:

**Request**: "Please open port 4001 for my Node.js application at public_html/fantasybroker/backend. This is needed for WebSocket connections."

**Details**:
- Account: [your account]
- Application: fantasybroker-api
- Port: 4001
- Purpose: WebSocket server for real-time updates

## Files to Update

**Already Updated**:
- ✅ `frontend-react/public/.htaccess` - Added CSP for port 4001
- ✅ `frontend-react/src/services/websocketService.ts` - Uses port 4001

**No Changes Needed**:
- ✅ `backend/src/server.js` - Already starts WebSocket on port 4001
- ✅ `backend/src/websocket/server.js` - Already configured

## Summary

| Component | Status | Details |
|-----------|--------|---------|
| REST API | ✅ Running | Port 4000, managed by cPanel |
| WebSocket | ⏳ Needs Port | Port 4001, same application |
| Frontend | ✅ Ready | CSP updated, WebSocket URL fixed |
| Environment | ⏳ Verify | Set WS_PORT=4001 in cPanel |

