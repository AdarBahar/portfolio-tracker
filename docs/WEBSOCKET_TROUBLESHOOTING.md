# WebSocket Troubleshooting Guide

## 🔍 Current Status

- ✅ Frontend: Connecting to `wss://www.bahar.co.il:4000/ws`
- ✅ CSP: Allows `wss://www.bahar.co.il:4000`
- ❌ Connection: Still failing after 1 minute
- ❌ Backend: Not accepting WebSocket upgrade requests

## 🎯 Diagnostic Steps

### Step 1: Check Backend is Running

**In cPanel → Setup Node.js App:**
1. Find "fantasybroker-api" application
2. Check status - should be **"online"**
3. If offline, click **"Start App"** or **"Restart App"**

### Step 2: Check Backend Logs

**In cPanel → Setup Node.js App:**
1. Click on "fantasybroker-api" application
2. Click **"View Logs"**
3. Look for these messages:
   ```
   Portfolio Tracker backend listening on port 4000
   [WebSocket] Server started on port null
   [WebSocketIntegration] Initialized
   [Server] WebSocket server started on same HTTP server
   ```

**If you see these messages**: Backend is running correctly ✅

**If you DON'T see these messages**: Backend needs to be restarted

### Step 3: Verify Backend Code is Deployed

**SSH into production:**
```bash
ssh user@www.bahar.co.il
cat /home/baharc5/public_html/fantasybroker/backend/src/websocket/server.js | grep "path: '/ws'"
```

Should show:
```
this.wss = new WebSocket.Server({ server: this.httpServer, path: '/ws' });
```

If not, backend code wasn't deployed.

### Step 4: Test REST API Connection

**In browser console:**
```javascript
fetch('https://www.bahar.co.il/fantasybroker-api/health')
  .then(r => r.json())
  .then(d => console.log('REST API works:', d))
  .catch(e => console.log('REST API failed:', e))
```

Should show: `REST API works: {...}`

If REST API fails, backend isn't running.

### Step 5: Check Network Tab

**In browser DevTools:**
1. Press F12 → Network tab
2. Filter by "WS" (WebSocket)
3. Look for request to `wss://www.bahar.co.il:4000/ws`
4. Check the status:
   - **101 Switching Protocols** = Success ✅
   - **Connection refused** = Backend not listening
   - **Timeout** = Firewall blocking port
   - **403 Forbidden** = CSP or other security issue

### Step 6: Check for Middleware Issues

**Possible issues:**
1. Express middleware blocking WebSocket upgrade
2. Compression middleware interfering
3. CORS middleware blocking upgrade

**Check backend/src/app.js:**
```bash
ssh user@www.bahar.co.il
cat /home/baharc5/public_html/fantasybroker/backend/src/app.js | head -50
```

Look for middleware that might block WebSocket:
- `app.use(compression())` - OK
- `app.use(cors())` - OK
- `app.use(bodyParser)` - OK
- Custom middleware that checks request type - MIGHT BLOCK

## 🚀 Most Likely Solution

**The backend code wasn't deployed or backend wasn't restarted.**

### Deploy Backend Code

```bash
# From your local machine:
rsync -avz backend/dist/src/ user@www.bahar.co.il:/home/baharc5/public_html/fantasybroker/backend/src/
```

### Restart Backend in cPanel

1. Log into cPanel
2. Go to **"Setup Node.js App"**
3. Find **"fantasybroker-api"** application
4. Click **"Restart App"**
5. Wait for status to show **"online"**
6. Wait 10 seconds for app to fully start

### Verify Backend Started

Check logs for:
```
[Server] WebSocket server started on same HTTP server
```

### Test WebSocket

1. Open: `https://www.bahar.co.il/fantasybroker/react/trade-room/35`
2. Press F12 → Console
3. Should see: `[WebSocket] Connected` ✅

## 📋 Checklist

- [ ] Backend code deployed to production
- [ ] Backend restarted in cPanel
- [ ] Backend status shows "online"
- [ ] Backend logs show WebSocket started
- [ ] REST API responds to health check
- [ ] Browser Network tab shows 101 Switching Protocols
- [ ] Console shows "[WebSocket] Connected"

## 🆘 If Still Not Working

1. **Check cPanel logs** for errors
2. **Verify backend code** was deployed correctly
3. **Restart backend** again
4. **Clear browser cache** (Ctrl+Shift+Delete)
5. **Hard refresh** page (Ctrl+Shift+R)
6. **Contact InMotion support** if port 4000 is blocked

---

**Most likely issue**: Backend code not deployed or backend not restarted after deployment.

