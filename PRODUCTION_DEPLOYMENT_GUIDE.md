# Production Deployment Guide - WebSocket Backend Integration

## Overview

This guide covers deploying both the backend (Node.js/Express with WebSocket) and frontend (React) to production.

## Prerequisites

- Node.js 18+ and npm
- SSH access to production server
- Git access to repository
- Production server with:
  - Port 4000 available (REST API)
  - Port 4001 available (WebSocket)
  - MySQL/MariaDB database
  - Node.js runtime

## Architecture

```
Production Server (www.bahar.co.il)
├── Backend (Node.js)
│   ├── REST API on port 4000
│   ├── WebSocket on port 4001
│   └── MySQL database connection
└── Frontend (React)
    ├── Served at /fantasybroker/react/
    └── Connects to backend API
```

## Step 1: Build Backend

```bash
cd backend
npm install
npm run build
```

**Output**: `backend/dist/` directory with:
- `src/` - All source files
- `package.json` - Dependencies
- `openapi.json` - API documentation

## Step 2: Build Frontend

```bash
cd frontend-react
npm install
npm run build
```

**Output**: `react/` directory with:
- `index.html` - Main HTML
- `assets/` - JavaScript and CSS bundles

## Step 3: Deploy Backend

### Option A: Using rsync (Recommended)

```bash
# Deploy backend
rsync -avz backend/dist/ user@www.bahar.co.il:/var/www/fantasybroker-api/

# Deploy environment file
scp backend/.env.production user@www.bahar.co.il:/var/www/fantasybroker-api/.env
```

### Option B: Using SCP

```bash
scp -r backend/dist/* user@www.bahar.co.il:/var/www/fantasybroker-api/
scp backend/.env.production user@www.bahar.co.il:/var/www/fantasybroker-api/.env
```

### Option C: Using Git on Server

```bash
# On production server
cd /var/www/fantasybroker-api
git pull origin main
npm install
npm run build
```

## Step 4: Deploy Frontend

### Option A: Using rsync (Recommended)

```bash
rsync -avz react/* user@www.bahar.co.il:/var/www/fantasybroker/react/
```

### Option B: Using SCP

```bash
scp -r react/* user@www.bahar.co.il:/var/www/fantasybroker/react/
```

## Step 5: Start Backend Services

```bash
# SSH into production server
ssh user@www.bahar.co.il

# Navigate to backend directory
cd /var/www/fantasybroker-api

# Install dependencies
npm install

# Start backend (using PM2 or systemd)
# Option 1: PM2
pm2 start dist/src/server.js --name "portfolio-backend"
pm2 save

# Option 2: systemd (if configured)
sudo systemctl restart portfolio-backend
```

## Step 6: Verify Deployment

### Backend Verification

```bash
# Check REST API
curl https://www.bahar.co.il/fantasybroker-api/api/health

# Check WebSocket connection
# Use browser DevTools or WebSocket client
```

### Frontend Verification

1. Open `https://www.bahar.co.il/fantasybroker/react/`
2. Check browser console (F12) for errors
3. Test login functionality
4. Test Trade Room features:
   - Create/join room
   - Place order
   - Check real-time updates
   - Verify leaderboard updates

## Step 7: Monitor Deployment

### Backend Monitoring

```bash
# Check process status
pm2 status

# View logs
pm2 logs portfolio-backend

# Monitor WebSocket connections
# Check for connection count and message throughput
```

### Frontend Monitoring

```bash
# Check browser console for errors
# Monitor network requests
# Check for WebSocket connection status
```

## Environment Configuration

### Backend (.env.production)

```bash
NODE_ENV=production
PORT=4000
WS_PORT=4001
DB_HOST=localhost
DB_USER=portfolio_user
DB_PASSWORD=secure_password
DB_NAME=portfolio_tracker
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://www.bahar.co.il
```

### Frontend (.env.production)

```bash
VITE_API_URL=https://www.bahar.co.il/fantasybroker-api/api
VITE_GOOGLE_CLIENT_ID=539842594800-bpqtcpi56vaf7nkiqcf1796socl2cjqp.apps.googleusercontent.com
VITE_DISABLE_FEDCM=false
```

## Rollback Procedure

If deployment fails:

```bash
# Backend rollback
cd /var/www/fantasybroker-api
git checkout previous_commit
npm install
npm run build
pm2 restart portfolio-backend

# Frontend rollback
cd /var/www/fantasybroker/react
git checkout previous_commit
npm install
npm run build
# Copy build to web root
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
pm2 logs portfolio-backend

# Check port availability
lsof -i :4000
lsof -i :4001

# Check database connection
mysql -h localhost -u portfolio_user -p portfolio_tracker
```

### Frontend not loading

```bash
# Check web server logs
tail -f /var/log/nginx/error.log

# Check file permissions
ls -la /var/www/fantasybroker/react/

# Check browser console for errors
```

### WebSocket not connecting

```bash
# Check WebSocket server
curl https://www.bahar.co.il/fantasybroker-api/health

# Check firewall rules
sudo ufw status

# Check port availability
netstat -tlnp | grep 4001
```

## Post-Deployment Checklist

- [ ] Backend REST API responding
- [ ] WebSocket server running
- [ ] Frontend loads without errors
- [ ] Login functionality works
- [ ] Trade Room features work
- [ ] Real-time updates working
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Monitoring configured
- [ ] Alerts configured

## Next Steps

1. Monitor for 24 hours
2. Collect user feedback
3. Optimize if needed
4. Document any issues
5. Plan next features

