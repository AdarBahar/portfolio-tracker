# Staging Environment - Quick Start Guide

## What is Staging?

Staging is an exact copy of your production environment that allows you to test changes before deploying to production. It uses:
- Same code as production
- Separate database (staging data only)
- Separate domain (www.bahar.co.il/fantasybroker-staging)
- Prominent "STAGING" badge to prevent confusion

## Quick Setup (5 minutes)

### 1. Create Staging Database

```bash
# SSH into your server
ssh user@www.bahar.co.il

# Run the database setup script
mysql -u root -p < /path/to/backend/scripts/setup-staging-database.sql

# Import schema
mysql -u baharc5_fantacyBroker-staging -p baharc5_fantasyBroker-staging < /path/to/schema.mysql.sql
```

### 2. Deploy Backend

```bash
# Navigate to staging backend directory
cd /home/user/public_html/fantasybroker-api-staging

# Clone repository
git clone <repo-url> .

# Install dependencies
npm install

# Copy staging environment file
cp /path/to/backend/.env.staging .env

# Restart Passenger
touch tmp/restart.txt
```

### 3. Deploy Frontend

```bash
# Build frontend
cd /path/to/frontend-react
npm install
npm run build

# Deploy to staging
cp -r react/* /home/user/public_html/fantasybroker-staging/

# Copy .htaccess
cp htaccess_files/public_html-fantasybroker-staging.htaccess /home/user/public_html/fantasybroker-staging/.htaccess
```

### 4. Verify Deployment

Visit these URLs:
- Frontend: https://www.bahar.co.il/fantasybroker-staging
- Backend: https://www.bahar.co.il/fantasybroker-api-staging/api/health

You should see:
- ✅ Frontend loads without errors
- ✅ "STAGING" badge in top toolbar
- ✅ Backend returns 200 OK

## Using Staging

### Testing Workflow

1. **Make changes** in your local development environment
2. **Push to develop branch** on GitHub
3. **CI/CD automatically deploys** to staging
4. **Test in staging** at https://www.bahar.co.il/fantasybroker-staging
5. **Verify everything works** (login, create room, place orders, etc.)
6. **Merge to main** when ready
7. **CI/CD automatically deploys** to production

### Testing Checklist

- [ ] Frontend loads without errors
- [ ] Can login with Google OAuth or demo mode
- [ ] Can create a trade room
- [ ] Can place orders
- [ ] Can see real-time updates
- [ ] Can view leaderboard
- [ ] Can access admin panel (if admin user)
- [ ] No console errors (F12 → Console tab)
- [ ] Staging badge visible in toolbar

## Environment Variables

### Backend (.env.staging)
```
NODE_ENV=staging
DB_NAME=baharc5_fantasyBroker-staging
DB_USER=baharc5_fantacyBroker-staging
DB_PASSWORD=DE%vl@$sXAEZj43O
API_URL=https://www.bahar.co.il/fantasybroker-api-staging/api
FRONTEND_URL=https://www.bahar.co.il/fantasybroker-staging
```

### Frontend (.env.staging)
```
VITE_API_URL=https://www.bahar.co.il/fantasybroker-api-staging/api
VITE_ENVIRONMENT=staging
VITE_STAGING_MODE=true
```

## Troubleshooting

### Staging Badge Not Showing
- Rebuild frontend: `npm run build`
- Clear browser cache (Ctrl+Shift+Delete)
- Verify `.env.staging` has `VITE_STAGING_MODE=true`

### Can't Connect to Backend
- Check backend is running: `curl https://www.bahar.co.il/fantasybroker-api-staging/api/health`
- Check Passenger logs: `tail -f /var/log/passenger.log`
- Verify database credentials in `.env`

### Database Connection Error
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`
- Verify user exists: `mysql -u root -p -e "SELECT User FROM mysql.user;"`
- Verify password is correct

### Frontend Shows Blank Page
- Check browser console (F12) for errors
- Verify `.htaccess` is deployed
- Check file permissions: `ls -la /home/user/public_html/fantasybroker-staging/`

## Next Steps

1. ✅ Set up staging environment (this guide)
2. ⏭️ Set up CI/CD pipeline (see CICD_STAGING_PRODUCTION_PIPELINE.md)
3. ⏭️ Configure monitoring and alerts
4. ⏭️ Document team procedures

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review STAGING_ENVIRONMENT_SETUP.md for detailed instructions
3. Check backend logs: `tail -f /var/log/passenger.log`
4. Check frontend console: F12 → Console tab

