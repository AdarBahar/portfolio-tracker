# Production Backend Startup Guide

## Issue

WebSocket server is not running on production server (www.bahar.co.il:4001).

**Verification**:
```bash
ssh user@www.bahar.co.il
lsof -i :4001
# Returns: nothing (port not in use)
```

## Solution

You need to start the backend server on the production server.

### Step 1: SSH into Production Server

```bash
ssh user@www.bahar.co.il
```

### Step 2: Navigate to Backend Directory

```bash
cd /var/www/fantasybroker-api
```

### Step 3: Verify Backend Files Exist

```bash
ls -la
# Should see: dist/, src/, package.json, .env.production, etc.
```

### Step 4: Install Dependencies (if needed)

```bash
npm ci --production
```

### Step 5: Build Backend (if needed)

```bash
npm run build
```

### Step 6: Start Backend Using PM2

**Option A: Start with PM2 (Recommended)**

```bash
# Start backend
pm2 start dist/src/server.js --name "portfolio-backend"

# Save PM2 configuration
pm2 save

# Verify it's running
pm2 status
pm2 logs portfolio-backend
```

**Option B: Start with Node Directly (Temporary)**

```bash
node dist/src/server.js
```

### Step 7: Verify Backend is Running

```bash
# Check if port 4000 is listening (REST API)
lsof -i :4000

# Check if port 4001 is listening (WebSocket)
lsof -i :4001

# Both should show node process
```

### Step 8: Check Backend Logs

```bash
# Using PM2
pm2 logs portfolio-backend

# Should see:
# Portfolio Tracker backend listening on port 4000
# [Server] WebSocket server started on port 4001
# [Server] Background jobs started successfully
```

### Step 9: Verify REST API is Working

```bash
curl https://www.bahar.co.il/fantasybroker-api/api/health
# Should return: {"status":"ok","db":"ok","marketDataMode":"production"}
```

### Step 10: Test WebSocket Connection

1. Open browser: `https://www.bahar.co.il/fantasybroker/react/trade-room/35`
2. Press F12 to open DevTools
3. Check Console tab
4. Should see: `[WebSocket] Connected`
5. Should NOT see CSP or connection errors

## Environment Configuration

Ensure `.env.production` exists with:

```bash
NODE_ENV=production
PORT=4000
WS_PORT=4001
DB_HOST=localhost
DB_USER=portfolio_user
DB_PASSWORD=<secure_password>
DB_NAME=portfolio_tracker
JWT_SECRET=<your_jwt_secret>
CORS_ORIGIN=https://www.bahar.co.il
API_BASE_PATH=/fantasybroker-api
```

## PM2 Management

### View Status
```bash
pm2 status
```

### View Logs
```bash
pm2 logs portfolio-backend
```

### Restart Backend
```bash
pm2 restart portfolio-backend
```

### Stop Backend
```bash
pm2 stop portfolio-backend
```

### Delete from PM2
```bash
pm2 delete portfolio-backend
```

### Resurrect on Server Restart
```bash
pm2 startup
pm2 save
```

## Troubleshooting

### Backend won't start

1. **Check Node.js version**:
   ```bash
   node --version
   # Should be 14+ (16+ recommended)
   ```

2. **Check database connection**:
   ```bash
   mysql -u portfolio_user -p portfolio_tracker -e "SELECT 1"
   ```

3. **Check logs**:
   ```bash
   pm2 logs portfolio-backend
   ```

4. **Check ports**:
   ```bash
   lsof -i :4000
   lsof -i :4001
   ```

### WebSocket still not connecting

1. **Verify backend is running**:
   ```bash
   pm2 status
   lsof -i :4001
   ```

2. **Check firewall**:
   ```bash
   sudo ufw status
   # Port 4001 should be open
   ```

3. **Check CORS**:
   - Backend should have CORS enabled
   - Frontend origin should be allowed

4. **Check browser console**:
   - F12 → Console tab
   - Look for connection errors
   - Check Network tab for WebSocket connection

## Deployment Checklist

- [ ] SSH into production server
- [ ] Navigate to `/var/www/fantasybroker-api`
- [ ] Verify backend files exist
- [ ] Install dependencies: `npm ci --production`
- [ ] Build backend: `npm run build`
- [ ] Start with PM2: `pm2 start dist/src/server.js --name "portfolio-backend"`
- [ ] Verify ports 4000 and 4001 are listening
- [ ] Check logs: `pm2 logs portfolio-backend`
- [ ] Test REST API: `curl https://www.bahar.co.il/fantasybroker-api/api/health`
- [ ] Test WebSocket: Open Trade Room in browser
- [ ] Verify console shows: `[WebSocket] Connected`
- [ ] Monitor logs for 5 minutes

## Next Steps

1. SSH into production server
2. Start backend using PM2
3. Verify ports 4000 and 4001 are listening
4. Test WebSocket connection in browser
5. Monitor logs for errors
6. Test Trade Room functionality

## Support

If backend won't start:
1. Check logs: `pm2 logs portfolio-backend`
2. Check database: `mysql -u portfolio_user -p portfolio_tracker -e "SELECT 1"`
3. Check ports: `lsof -i :4000` and `lsof -i :4001`
4. Check Node.js version: `node --version`

