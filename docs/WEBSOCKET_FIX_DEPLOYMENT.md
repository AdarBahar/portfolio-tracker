# WebSocket Fix - Deployment Guide

## 🎯 The Problem

The WebSocket was trying to connect to `wss://www.bahar.co.il:4000/ws`, but:
- Port 4000 is **internal** to Phusion Passenger
- The backend is served through Apache at `/fantasybroker-api`
- WebSocket should be at `/fantasybroker-api/ws` (no port)

## ✅ The Solution

### Frontend Fix
- **Old**: `wss://www.bahar.co.il:4000/ws`
- **New**: `wss://www.bahar.co.il/fantasybroker-api/ws`

### Backend Fix
- WebSocket now attaches to `${API_BASE_PATH}/ws`
- With `API_BASE_PATH=/fantasybroker-api`, it becomes `/fantasybroker-api/ws`

### CSP Fix
- **Old**: `wss://www.bahar.co.il:4000`
- **New**: `wss://www.bahar.co.il/fantasybroker-api/ws`

## 🚀 Deployment Steps

### Step 1: Deploy Backend

```bash
# From your local machine:
rsync -avz backend/dist/src/ user@www.bahar.co.il:/home/baharc5/public_html/fantasybroker/backend/src/
```

### Step 2: Deploy Frontend

```bash
# From your local machine:
rsync -avz frontend-react/dist/ user@www.bahar.co.il:/home/baharc5/public_html/fantasybroker/react/
```

### Step 3: Deploy .htaccess Files

```bash
# Deploy all three .htaccess files:
rsync -avz htaccess_files/public_html.htaccess user@www.bahar.co.il:/public_html/.htaccess
rsync -avz htaccess_files/public_html-fantasybroker.htaccess user@www.bahar.co.il:/public_html/fantasybroker/.htaccess
rsync -avz htaccess_files/public_html-fantasybroker-react.htaccess user@www.bahar.co.il:/public_html/fantasybroker/react/.htaccess
```

### Step 4: Restart Backend in cPanel

1. Log into cPanel
2. Go to **"Setup Node.js App"**
3. Find **"fantasybroker-api"** application
4. Click **"Restart App"**
5. Wait for status to show **"online"**

### Step 5: Clear Browser Cache

- Ctrl+Shift+Delete → Clear all
- Or: Hard refresh (Ctrl+Shift+R)

### Step 6: Test WebSocket

1. Open: `https://www.bahar.co.il/fantasybroker/react/trade-room/35`
2. Press F12 → Console
3. Should see: `[WebSocket] Connected` ✅
4. Should NOT see CSP errors

## 📋 Verification Checklist

- [ ] Backend deployed to `/home/baharc5/public_html/fantasybroker/backend/src/`
- [ ] Frontend deployed to `/home/baharc5/public_html/fantasybroker/react/`
- [ ] All three .htaccess files deployed
- [ ] Backend restarted in cPanel
- [ ] Backend status shows "online"
- [ ] Browser cache cleared
- [ ] Page hard refreshed
- [ ] Console shows "[WebSocket] Connected"
- [ ] No CSP errors in console
- [ ] Real-time updates work

## 🔍 Troubleshooting

### If WebSocket still doesn't connect:

1. **Check Network Tab** (F12 → Network)
   - Filter by "WS"
   - Look for request to `wss://www.bahar.co.il/fantasybroker-api/ws`
   - Status should be **101 Switching Protocols**

2. **Check Backend Logs**
   - In cPanel → Setup Node.js App → View Logs
   - Look for: `[Server] WebSocket server started on same HTTP server`

3. **Verify CSP Header**
   ```bash
   ssh user@www.bahar.co.il
   cat /public_html/fantasybroker/react/.htaccess | grep "wss://"
   # Should show: wss://www.bahar.co.il/fantasybroker-api/ws
   ```

4. **Test REST API**
   ```bash
   curl https://www.bahar.co.il/fantasybroker-api/api/health
   # Should return: {"status":"ok","db":"ok",...}
   ```

## 📝 Files Changed

| File | Change |
|------|--------|
| `frontend-react/src/services/websocketService.ts` | URL: `/fantasybroker-api/ws` |
| `backend/src/websocket/server.js` | Path: `${API_BASE_PATH}/ws` |
| `htaccess_files/public_html-fantasybroker-react.htaccess` | CSP: `wss://www.bahar.co.il/fantasybroker-api/ws` |
| `htaccess_files/public_html-fantasybroker.htaccess` | CSP: `wss://www.bahar.co.il/fantasybroker-api/ws` |

---

**Ready to deploy!** Follow the steps above in order. 🚀

