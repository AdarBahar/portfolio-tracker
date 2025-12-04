# Final WebSocket Deployment - Complete Guide

## 🎯 Status

All code changes are complete and ready for deployment:
- ✅ Backend: WebSocket attached to shared HTTP server on port 4000
- ✅ Frontend: WebSocket client connects to port 4000 with /ws path
- ✅ CSP: Updated to allow wss://www.bahar.co.il:4000
- ✅ All files built and committed

## 🚀 Deployment Steps

### Step 1: Deploy Backend

```bash
# SSH into production
ssh user@www.bahar.co.il

# Navigate to backend directory
cd /home/baharc5/public_html/fantasybroker/backend

# Backup current version
cp -r src src.backup

# Upload new backend files
# From your local machine:
rsync -avz backend/dist/src/ user@www.bahar.co.il:/home/baharc5/public_html/fantasybroker/backend/src/
```

### Step 2: Deploy Frontend

```bash
# From your local machine:
rsync -avz frontend-react/dist/ user@www.bahar.co.il:/home/baharc5/public_html/fantasybroker/react/
```

### Step 3: Deploy Root .htaccess

**CRITICAL**: The production server's `.htaccess` has a syntax error in the CSP header.

```bash
# From your local machine:
rsync -avz .htaccess user@www.bahar.co.il:/public_html/.htaccess
```

**Verify the upload**:
```bash
ssh user@www.bahar.co.il
cat /public_html/.htaccess | grep "Content-Security-Policy"
# Should show: wss://www.bahar.co.il:4000 (NOT 4001)
# Should have space between https://www.bahar.co.il/fantasybroker-api/ and https://cdn.amplitude.com
```

### Step 4: Restart Application in cPanel

1. Log into cPanel
2. Go to **"Setup Node.js App"**
3. Find **"fantasybroker-api"** application
4. Click **"Restart App"**
5. Wait for status to show **"online"**

### Step 5: Verify Backend Logs

In cPanel → Setup Node.js App → View Logs:

Should see:
```
Portfolio Tracker backend listening on port 4000
[WebSocket] Server started on port null
[WebSocketIntegration] Initialized
[Server] WebSocket server started on same HTTP server
[Jobs] All background jobs started
[Server] Background jobs started successfully
```

### Step 6: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click refresh button → "Empty cache and hard refresh"
3. Or: Ctrl+Shift+Delete → Clear all

### Step 7: Test WebSocket Connection

1. Open: `https://www.bahar.co.il/fantasybroker/react/trade-room/35`
2. Press F12 → Console
3. Should see: `[WebSocket] Connected` ✅
4. Should NOT see:
   - CSP errors
   - Connection refused errors
   - Any error messages

### Step 8: Test Real-time Updates

1. Open Trade Room page
2. Create a new room or join existing room
3. Place an order
4. Verify order appears in real-time
5. Check leaderboard updates in real-time

## ✅ Deployment Checklist

- [ ] Deploy backend/dist/src/ to production
- [ ] Deploy frontend-react/dist/ to production
- [ ] Deploy .htaccess to /public_html/
- [ ] Verify .htaccess CSP has correct syntax
- [ ] Restart application in cPanel
- [ ] Wait for status to show "online"
- [ ] Check logs for success messages
- [ ] Clear browser cache
- [ ] Open Trade Room page
- [ ] Check console for "[WebSocket] Connected"
- [ ] No errors in console
- [ ] Real-time updates work
- [ ] Monitor for 24 hours

## 🔍 Troubleshooting

### WebSocket Still Not Connecting

**Check 1: .htaccess CSP**
```bash
ssh user@www.bahar.co.il
cat /public_html/.htaccess | grep "wss://"
# Should show: wss://www.bahar.co.il:4000
```

**Check 2: Backend Logs**
- Check cPanel logs for errors
- Look for "WebSocket server started on same HTTP server"

**Check 3: Browser Console**
- F12 → Console
- Look for CSP errors or connection errors

**Check 4: Clear Cache**
- Ctrl+Shift+Delete → Clear all
- Hard refresh: Ctrl+Shift+R

## 📋 Files Changed

| File | Change | Status |
|------|--------|--------|
| backend/src/server.js | Shared HTTP server | ✅ Built |
| backend/src/websocket/server.js | Added /ws path | ✅ Built |
| frontend-react/src/services/websocketService.ts | Port 4000 + /ws path | ✅ Built |
| .htaccess | Fixed CSP syntax | ✅ Ready |

## 🔄 Git Commits

```
6537d92 - fix: Update CSP to include fantasybroker-api domain and WebSocket on port 4000
b637548 - fix: Add /ws path to WebSocket connection for proper routing
1f0b49e - fix: Update WebSocket connection to use port 4000 for Phusion Passenger
d644c0a - fix: Attach WebSocket to shared HTTP server for Phusion Passenger compatibility
```

## 📞 Support

If deployment fails:

1. Check cPanel logs
2. Verify backend restarted successfully
3. Check .htaccess CSP syntax
4. Clear browser cache
5. Contact InMotion support if needed

---

**Ready to deploy!** Follow the steps above in order. 🚀

