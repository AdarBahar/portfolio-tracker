# WebSocket Diagnostics Guide

## 🔧 Overview

A comprehensive diagnostic tool to test and debug WebSocket connections to `wss://www.bahar.co.il/fantasybroker-api/ws`.

## 📍 Access the Diagnostics Page

### Production
```
https://www.bahar.co.il/fantasybroker/react/ws-diagnostics
```

### Development (localhost)
```
http://localhost:5173/ws-diagnostics
```

## 🚀 How to Use

1. **Navigate to the diagnostics page**
2. **Click "Test WebSocket Connection"**
3. **Wait for the test to complete** (up to 10 seconds)
4. **Review the results** in the right panel
5. **Check the logs** in the left panel for detailed information

## 📊 What the Diagnostics Show

### Frontend Information
- **WebSocket URL**: The exact URL being used to connect
- **Protocol**: `wss://` (secure WebSocket)
- **Hostname**: `www.bahar.co.il`
- **Connection State**: `CONNECTING`, `OPEN`, `ERROR`, or `CLOSED`
- **Response Status**: Should be `101 Switching Protocols` on success

### Backend Information
- **Backend Health**: Database connectivity and market data mode
- **WebSocket Configuration**: Expected path, API base path, port
- **Environment Variables**: `API_BASE_PATH`, `NODE_ENV`, `PORT`
- **Server Info**: Uptime, memory usage, process ID

### Request/Response Headers
- **Request Headers**: WebSocket upgrade headers sent by browser
- **Response Headers**: Server response (empty if connection fails)

## ✅ Success Indicators

When WebSocket connection is working:
1. **Connection State**: `OPEN`
2. **Response Status**: `101 Switching Protocols`
3. **Logs show**: `✅ WebSocket connected successfully!`
4. **No error messages**

## ❌ Common Issues & Solutions

### Issue: "WebSocket connection failed"
**Possible Causes:**
- `API_BASE_PATH` not set in backend `.env`
- Apache rewrite rules blocking the request
- Phusion Passenger not forwarding the upgrade request
- CSP headers blocking the connection

**Solution:**
1. Check backend logs for: `[WebSocket] Server attached to HTTP server at path: /fantasybroker-api/ws`
2. Verify `.env` has: `API_BASE_PATH=/fantasybroker-api`
3. Check `.htaccess` has WebSocket detection rules
4. Verify CSP header allows `wss://www.bahar.co.il/fantasybroker-api/ws`

### Issue: "Connection timeout (10 seconds)"
**Possible Causes:**
- Backend not listening on the correct path
- Network firewall blocking WebSocket connections
- Phusion Passenger configuration issue

**Solution:**
1. SSH into production and check backend logs
2. Verify backend is running: `ps aux | grep node`
3. Check if port 4000 is accessible internally

### Issue: Response Headers are empty
**Possible Causes:**
- Server rejecting the upgrade request
- Apache/Phusion Passenger not forwarding the request
- Backend not receiving the request

**Solution:**
1. Check Apache error logs: `/var/log/apache2/error_log`
2. Check backend logs for connection attempts
3. Verify `.htaccess` WebSocket rules are correct

## 🔍 Debugging Steps

### Step 1: Check Backend Logs
```bash
ssh user@www.bahar.co.il
tail -f /home/baharc5/public_html/fantasybroker/backend/logs/app.log
```

Look for:
```
[WebSocket] Server attached to HTTP server at path: /fantasybroker-api/ws
[WebSocket] New connection attempt
```

### Step 2: Check Backend Configuration
```bash
cat /home/baharc5/public_html/fantasybroker/backend/.env | grep API_BASE_PATH
```

Should show:
```
API_BASE_PATH=/fantasybroker-api
```

### Step 3: Check Apache Configuration
```bash
cat /public_html/.htaccess | grep -A 3 "WebSocket Support"
```

Should show WebSocket detection rules.

### Step 4: Test Backend Health
```bash
curl https://www.bahar.co.il/fantasybroker-api/api/health
curl https://www.bahar.co.il/fantasybroker-api/api/ws-diagnostics
```

## 📋 Deployment Checklist

- [ ] Backend `.env` has `API_BASE_PATH=/fantasybroker-api`
- [ ] Backend rebuilt with `npm run build`
- [ ] Backend deployed to production
- [ ] Backend restarted in cPanel
- [ ] `.htaccess` files deployed with WebSocket rules
- [ ] Browser cache cleared
- [ ] Page hard refreshed
- [ ] Diagnostics page shows `Connection State: OPEN`
- [ ] Trade Room WebSocket connects successfully

## 🔗 Related Documentation

- `WEBSOCKET_APACHE_UPGRADE_FIX.md` - Apache configuration for WebSocket
- `PHUSION_PASSENGER_WEBSOCKET_CRITICAL_FIX.md` - Backend initialization
- `WEBSOCKET_FIX_DEPLOYMENT.md` - Complete deployment guide

---

**Use this diagnostic tool to verify WebSocket connectivity before troubleshooting further!**

