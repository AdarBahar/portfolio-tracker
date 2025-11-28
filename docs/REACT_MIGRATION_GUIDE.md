# React Migration Guide

## Overview

This guide explains how to build and deploy the React UI alongside the vanilla JavaScript frontend, test it, and eventually switch over.

## Current Setup

- **Vanilla JS Frontend**: Root folder (`index.html`, `login.html`, `admin.html`, `trade-room.html`, etc.)
- **React Build**: `frontend-react/` folder (source code)
- **React Output**: `react/` folder (build output)

## Build Process

### 1. Build the React App

```bash
cd frontend-react
npm run build
```

This will:
- Compile TypeScript
- Bundle React components
- Generate optimized assets
- Output to `../react/` folder

### 2. Verify Build Output

```bash
ls -la react/
ls -la react/assets/
```

You should see:
- `index.html` - Main HTML file
- `assets/` folder with CSS and JS files
- `.htaccess` - URL rewriting rules
- `.env` - Environment configuration

## Testing the React App

### Local Testing

```bash
cd frontend-react
npm run dev
```

Visit: `http://localhost:5173/fantasybroker/react/`

### Production Testing

The React app is available at:
```
https://www.bahar.co.il/fantasybroker/react/
```

Test these routes:
- `/fantasybroker/react/` → Dashboard
- `/fantasybroker/react/dashboard` → Dashboard
- `/fantasybroker/react/trade-room` → Trade Room
- `/fantasybroker/react/admin` → Admin Panel

## Deployment

### Deploy to Production

```bash
# Copy React build to production server
rsync -avz --delete react/ user@your-server:/var/www/fantasy-broker/react/

# Or using scp
scp -r react/* user@your-server:/var/www/fantasy-broker/react/
```

### Set Permissions

```bash
ssh user@your-server
cd /var/www/fantasy-broker/react
chmod -R 755 .
chmod -R 644 assets/*
chmod 644 index.html
chmod 644 .htaccess
```

## Switching from Vanilla JS to React

When ready to switch:

1. **Backup vanilla JS files**:
   ```bash
   mkdir -p Archive/vanilla-js-backup
   cp index.html login.html admin.html trade-room.html user-detail.html Archive/vanilla-js-backup/
   ```

2. **Copy React build to root**:
   ```bash
   cp -r react/* .
   ```

3. **Update .htaccess** in root to use React Router

4. **Test all routes** work correctly

5. **Remove vanilla JS files** (optional):
   ```bash
   rm index.html login.html admin.html trade-room.html user-detail.html
   ```

## Rollback Plan

If issues occur:

```bash
# Restore vanilla JS files
cp Archive/vanilla-js-backup/* .

# Or restore from git
git checkout index.html login.html admin.html trade-room.html user-detail.html
```

## Environment Configuration

The React app uses environment variables from `.env`:

```env
VITE_API_URL=https://www.bahar.co.il/fantasybroker-api
```

Update this on production server before deployment.

## Troubleshooting

### Assets return 404

- Check `.htaccess` is in `react/` folder
- Verify file permissions (644 for files, 755 for directories)
- Check `RewriteBase` matches deployment path

### React Router shows 404

- Verify `basename="/fantasybroker/react"` in `App.tsx`
- Check `.htaccess` rewrite rules are correct
- Clear browser cache (Cmd+Shift+R)

### API calls fail

- Verify `VITE_API_URL` in `.env`
- Check CSP headers allow API domain
- Verify backend is running and accessible

## Next Steps

1. Build React app: `npm run build`
2. Test on production: `https://www.bahar.co.il/fantasybroker/react/`
3. Verify all pages load and API calls work
4. When ready, switch vanilla JS to React
5. Monitor for any issues

