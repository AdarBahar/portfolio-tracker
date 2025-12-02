# WebSocket Deployment Guide - InMotion Hosting

## 🎯 Overview

This guide explains how to deploy the updated WebSocket implementation to InMotion Hosting with Phusion Passenger.

## 🔄 What Changed

### Backend Changes
- WebSocket now attached to same HTTP server as Express
- Eliminates Phusion Passenger "listen() called more than once" error
- Both REST API and WebSocket run on port 4000

### Frontend Changes
- WebSocket connection URL changed from port 4001 to port 4000
- HTTP server automatically upgrades connection to WebSocket

## 📦 Deployment Steps

### Step 1: Deploy Frontend

```bash
# Build frontend (already done)
cd frontend-react
npm run build

# Deploy to production
rsync -avz dist/ user@www.bahar.co.il:/public_html/fantasybroker/react/
```

### Step 2: Deploy Backend

```bash
# Build backend (already done)
cd backend
npm run build

# Deploy to production
rsync -avz dist/ user@www.bahar.co.il:/public_html/fantasybroker/backend/
```

### Step 3: Restart Application in cPanel

1. Log into cPanel
2. Go to **"Setup Node.js App"**
3. Find **"fantasybroker-api"** application
4. Click **"Restart App"**
5. Wait for status to show **"online"**

### Step 4: Verify Deployment

Check logs in cPanel → Setup Node.js App → View Logs:

Should see:
```
Portfolio Tracker backend listening on port 4000
[WebSocket] Server started on port null
[WebSocketIntegration] Initialized
[Server] WebSocket server started on same HTTP server
[Jobs] All background jobs started
[Server] Background jobs started successfully
```

## ✅ Testing

### Test 1: Backend Health

```bash
curl -I https://www.bahar.co.il/fantasybroker-api/api/health
# Should return 200 OK
```

### Test 2: WebSocket Connection

1. Open: `https://www.bahar.co.il/fantasybroker/react/trade-room/35`
2. Press F12 → Console
3. Should see: `[WebSocket] Connected` ✅
4. Should NOT see connection errors

### Test 3: Real-time Updates

1. Open Trade Room page
2. Create a new room or join existing room
3. Place an order
4. Verify order appears in real-time
5. Check leaderboard updates

## 🔍 Troubleshooting

### WebSocket Still Not Connecting

**Check 1: Backend Running**
```bash
ssh user@www.bahar.co.il
ps aux | grep node
# Should show node process running
```

**Check 2: Logs**
- Check cPanel logs for errors
- Look for "WebSocket server started on same HTTP server"

**Check 3: Browser Cache**
- Clear cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+Shift+R

**Check 4: CSP Headers**
```bash
curl -I https://www.bahar.co.il/fantasybroker/react/
# Check Content-Security-Policy header
# Should include: wss://www.bahar.co.il:4001
```

### Connection Timeout

- Verify backend is running
- Check firewall isn't blocking port 4000
- Verify .htaccess CSP allows wss://www.bahar.co.il:4001

## 📋 Deployment Checklist

- [ ] Build frontend: `npm run build`
- [ ] Build backend: `npm run build`
- [ ] Deploy frontend to `/public_html/fantasybroker/react/`
- [ ] Deploy backend to `/public_html/fantasybroker/backend/`
- [ ] Restart application in cPanel
- [ ] Wait for status to show "online"
- [ ] Check logs for success messages
- [ ] Clear browser cache
- [ ] Test WebSocket connection
- [ ] Verify real-time updates work
- [ ] Monitor for 24 hours

## 🔗 Related Files

- `PHUSION_PASSENGER_WEBSOCKET_FIX.md` - Technical details
- `HTACCESS_CSP_FIX_GUIDE.md` - CSP configuration
- `backend/src/server.js` - Backend server setup
- `backend/src/websocket/server.js` - WebSocket server
- `frontend-react/src/services/websocketService.ts` - Frontend WebSocket client

## 📞 Support

If deployment fails:

1. Check cPanel logs
2. Verify backend restarted successfully
3. Check CSP headers are correct
4. Contact InMotion support if port 4000 is blocked

## 🎯 Summary

| Component | Port | Status |
|-----------|------|--------|
| REST API | 4000 | ✅ Running |
| WebSocket | 4000 (upgraded) | ✅ Running |
| Frontend | HTTPS | ✅ Deployed |
| CSP | Updated | ✅ Configured |

---

**Deployment Status**: Ready to deploy! 🚀

