# Staging Environment Setup Guide

## Overview

This guide explains how to set up and deploy the Portfolio Tracker application to a staging environment on your server. The staging environment is identical to production but uses a separate database, allowing you to test changes before deploying to production.

## Staging Environment Details

| Component | Production | Staging |
|-----------|-----------|---------|
| **Backend API** | `www.bahar.co.il/fantasybroker-api` | `www.bahar.co.il/fantasybroker-api-staging` |
| **Frontend URL** | `www.bahar.co.il/fantasybroker` | `www.bahar.co.il/fantasybroker-staging` |
| **Database Name** | `baharc5_fantasyBroker` | `baharc5_fantasyBroker-staging` |
| **Database User** | `baharc5_fantasyBroker` | `baharc5_fantacyBroker-staging` |
| **Database Pass** | (production pass) | `DE%vl@$sXAEZj43O` |
| **WebSocket Port** | 4001 | 4002 (or same with different domain) |

## Prerequisites

- SSH access to www.bahar.co.il
- MySQL/MariaDB access
- Node.js v14+ installed on server
- Git installed on server
- Phusion Passenger configured for Node.js

## Step 1: Create Staging Database

Connect to MySQL and run:

```sql
-- Create staging database
CREATE DATABASE baharc5_fantasyBroker-staging;

-- Create staging user
CREATE USER 'baharc5_fantacyBroker-staging'@'localhost' IDENTIFIED BY 'DE%vl@$sXAEZj43O';

-- Grant all privileges
GRANT ALL PRIVILEGES ON `baharc5_fantasyBroker-staging`.* TO 'baharc5_fantacyBroker-staging'@'localhost';
FLUSH PRIVILEGES;

-- Import schema from production
USE `baharc5_fantasyBroker-staging`;
SOURCE /path/to/schema.mysql.sql;
```

## Step 2: Deploy Backend to Staging

```bash
# SSH into server
ssh user@www.bahar.co.il

# Navigate to staging backend directory
cd /home/user/public_html/fantasybroker-api-staging

# Clone or pull latest code
git clone <repo-url> . # or git pull origin main

# Install dependencies
npm install

# Copy staging environment file
cp .env.staging .env

# Update .env with correct database credentials
nano .env

# Restart Passenger
touch tmp/restart.txt
```

## Step 3: Deploy Frontend to Staging

```bash
# Navigate to frontend directory
cd /home/user/portfolio-tracker/frontend-react

# Build for staging
npm run build

# Copy built files to staging directory
cp -r ../react/* /home/user/public_html/fantasybroker-staging/

# Verify .htaccess is deployed
ls -la /home/user/public_html/fantasybroker-staging/.htaccess
```

## Step 4: Configure Apache/nginx

Create `.htaccess` for staging frontend:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /fantasybroker-staging/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /fantasybroker-staging/index.html [L]
</IfModule>
```

## Step 5: Verify Staging Environment

1. **Check Frontend**: Visit `https://www.bahar.co.il/fantasybroker-staging`
   - Should see "STAGING" badge in top toolbar
   - Should load without errors

2. **Check Backend**: Visit `https://www.bahar.co.il/fantasybroker-api-staging/api/health`
   - Should return 200 OK

3. **Check Database**: Verify staging database has data
   ```bash
   mysql -u baharc5_fantacyBroker-staging -p baharc5_fantasyBroker-staging
   SELECT COUNT(*) FROM users;
   ```

## Step 6: Test Staging Environment

1. **Login**: Use Google OAuth or demo mode
2. **Create Trade Room**: Test creating a new room
3. **Place Orders**: Test order execution
4. **Check Leaderboard**: Verify real-time updates
5. **Test WebSocket**: Check browser console for connection status

## Staging Badge

The staging environment displays a prominent "STAGING" badge in the top toolbar. This badge:
- Only appears when `VITE_STAGING_MODE=true` in `.env.staging`
- Uses amber/yellow color to distinguish from production
- Helps developers and testers identify the environment

## Environment Variables

### Backend (.env.staging)
- `NODE_ENV=staging`
- `DB_NAME=baharc5_fantasyBroker-staging`
- `DB_USER=baharc5_fantacyBroker-staging`
- `DB_PASSWORD=DE%vl@$sXAEZj43O`
- `API_URL=https://www.bahar.co.il/fantasybroker-api-staging/api`
- `FRONTEND_URL=https://www.bahar.co.il/fantasybroker-staging`

### Frontend (.env.staging)
- `VITE_API_URL=https://www.bahar.co.il/fantasybroker-api-staging/api`
- `VITE_ENVIRONMENT=staging`
- `VITE_STAGING_MODE=true`

## CI/CD Integration

Once staging is running, set up CI/CD pipeline:

1. **Staging Deployment**:
   - Trigger on push to `develop` branch
   - Build frontend and backend
   - Deploy to staging environment
   - Run automated tests

2. **Production Deployment**:
   - Trigger on push to `main` branch (after staging verified)
   - Build frontend and backend
   - Deploy to production environment
   - Run smoke tests

## Troubleshooting

### Staging Badge Not Showing
- Verify `VITE_STAGING_MODE=true` in `.env.staging`
- Rebuild frontend: `npm run build`
- Clear browser cache

### Database Connection Error
- Verify database user and password
- Check MySQL is running: `systemctl status mysql`
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### API Connection Error
- Verify backend is running: `curl https://www.bahar.co.il/fantasybroker-api-staging/api/health`
- Check Passenger logs: `tail -f /var/log/passenger.log`
- Verify environment variables in `.env`

## Next Steps

1. Deploy staging environment using this guide
2. Test all features in staging
3. Set up CI/CD pipeline for automated deployments
4. Configure monitoring and alerting for staging
5. Document any staging-specific procedures

