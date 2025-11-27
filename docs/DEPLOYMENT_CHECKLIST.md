# Production Deployment Checklist

## Pre-Deployment Verification

### ✅ Security Audit Complete
- [x] No `config.local.js` in deployment package
- [x] No `config.local.example.js` in deployment package
- [x] No `.md` documentation files in deployment package
- [x] No test/spec files in deployment package
- [x] Google OAuth Client ID properly configured in `config.js`
- [x] Backend `.env.example` is template-only (no real credentials)

### ✅ Configuration Files
- [x] `scripts/config.js` - Contains production Google Client ID
- [x] `scripts/config.js` - Auto-detects production hostname
- [x] `backend/.env.example` - Template for production environment variables

### ✅ Deployment Package Contents
- **Total Files:** 71 files
- **Frontend:** 3 HTML, 3 CSS, 26 JavaScript files
- **Backend:** Complete source code, no development files
- **Size:** ~403 KB

## Deployment Steps

### 1. Build Deployment Package
```bash
./deploy_zip.sh
```

**Output:** `dist/deploy/portfolio-tracker-deploy.zip`

### 2. Extract on Production Server
```bash
unzip portfolio-tracker-deploy.zip -d /path/to/production
```

### 3. Configure Backend Environment
```bash
cd backend
cp .env.example .env
nano .env  # Edit with production values
```

**Required Environment Variables:**
- `PORT` - Backend server port (default: 4000)
- `DB_HOST` - MySQL host
- `DB_PORT` - MySQL port (default: 3306)
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name (portfolio_tracker)
- `JWT_SECRET` - Strong random secret for JWT tokens
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID (same as frontend)
- `FINNHUB_API_KEY` - Finnhub API key for market data
- `MARKET_DATA_MODE` - Set to `production`

### 4. Install Backend Dependencies
```bash
cd backend
npm ci --production
```

### 5. Start Backend Server
```bash
# Using PM2 (recommended)
pm2 start src/server.js --name fantasybroker-api

# Or using node directly
node src/server.js
```

### 6. Verify Backend is Running
```bash
curl http://localhost:4000/health
```

Expected response: `{"status":"ok"}`

### 7. Deploy Frontend Files
Copy frontend files to web server directory:
```bash
cp index.html /var/www/html/fantasybroker/
cp login.html /var/www/html/fantasybroker/
cp trade-room.html /var/www/html/fantasybroker/
cp -r scripts /var/www/html/fantasybroker/
cp -r styles /var/www/html/fantasybroker/
```

### 8. Configure Web Server

**For Apache (.htaccess):**
```apache
# Enable CORS for API calls
Header set Access-Control-Allow-Origin "*"

# Enable HTTPS redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

**For Nginx:**
```nginx
location /fantasybroker/ {
    root /var/www/html;
    index index.html;
    try_files $uri $uri/ =404;
}

location /fantasybroker-api/ {
    proxy_pass http://localhost:4000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Post-Deployment Verification

### ✅ Frontend Checks
- [ ] Visit `https://www.bahar.co.il/fantasybroker/`
- [ ] Verify page loads without errors
- [ ] Check browser console for errors
- [ ] Verify `config.local.js` returns 404 (should not exist)
- [ ] Test theme toggle (light/dark mode)
- [ ] Test "Join the game" banner link

### ✅ Authentication Checks
- [ ] Visit `https://www.bahar.co.il/fantasybroker/login.html`
- [ ] Test Google Sign-In button appears
- [ ] Test Demo Mode login
- [ ] Verify JWT token is stored in localStorage
- [ ] Test logout functionality

### ✅ Trade Room Checks
- [ ] Visit `https://www.bahar.co.il/fantasybroker/trade-room.html`
- [ ] Verify redirect to login if not authenticated
- [ ] Test dashboard view loads
- [ ] Test BullPen detail view
- [ ] Test trading panel
- [ ] Test portfolio display
- [ ] Test leaderboard

### ✅ API Checks
- [ ] Test `/api/health` endpoint
- [ ] Test `/api/auth/google` endpoint
- [ ] Test `/api/my/bull-pens` endpoint (requires auth)
- [ ] Test `/api/market-data/:symbol` endpoint
- [ ] Verify CORS headers are set correctly

### ✅ Security Checks
- [ ] Verify `config.local.js` is NOT accessible
- [ ] Verify `config.local.example.js` is NOT accessible
- [ ] Verify `.env` file is NOT accessible
- [ ] Verify backend source code is NOT accessible from web
- [ ] Test HTTPS is enforced
- [ ] Verify JWT tokens expire correctly

## Rollback Plan

If issues are found:

1. **Stop backend server:**
   ```bash
   pm2 stop fantasybroker-api
   ```

2. **Restore previous version:**
   ```bash
   cp -r /path/to/backup/* /var/www/html/fantasybroker/
   ```

3. **Restart backend with previous version:**
   ```bash
   pm2 restart fantasybroker-api
   ```

## Monitoring

### Logs to Monitor
- Backend logs: `pm2 logs fantasybroker-api`
- Web server logs: `/var/log/apache2/error.log` or `/var/log/nginx/error.log`
- Browser console: Check for JavaScript errors

### Metrics to Track
- API response times
- Error rates
- User authentication success rate
- Market data API usage

## Support

For issues, check:
1. `DEPLOYMENT_SECURITY_AUDIT.md` - Security audit details
2. `README.md` - General project documentation
3. Backend logs for API errors
4. Browser console for frontend errors

