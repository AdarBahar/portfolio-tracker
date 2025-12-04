# Build and Deploy Guide - React Frontend

## Overview

This guide covers building and deploying the React frontend to production.

## Prerequisites

- Node.js 18+ and npm
- Access to production server (www.bahar.co.il)
- SSH access for deployment
- Git access to repository

## Development Setup

### 1. Install Dependencies

```bash
cd frontend-react
npm install
```

### 2. Environment Configuration

Development uses `.env.local` or `.env.development`:

```bash
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=539842594800-bpqtcpi56vaf7nkiqcf1796socl2cjqp.apps.googleusercontent.com
VITE_DISABLE_FEDCM=true
```

### 3. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:5173/`

## Production Build

### 1. Build for Production

```bash
cd frontend-react
npm run build
```

Output: `../react/` directory

### 2. Build Output

- `react/index.html` - Main HTML file
- `react/assets/` - JavaScript and CSS bundles
- Bundle size: ~450 kB (131 kB gzipped)

### 3. Environment Configuration

Production uses `.env.production`:

```bash
VITE_API_URL=https://www.bahar.co.il/fantasybroker-api/api
VITE_GOOGLE_CLIENT_ID=539842594800-bpqtcpi56vaf7nkiqcf1796socl2cjqp.apps.googleusercontent.com
VITE_DISABLE_FEDCM=false
```

## Deployment to Production

### 1. Deploy Build Files

```bash
# Copy build output to production server
scp -r react/* user@www.bahar.co.il:/var/www/fantasybroker/react/
```

### 2. Verify Deployment

- Open `https://www.bahar.co.il/fantasybroker/react/`
- Check browser console for errors
- Test login functionality

### 3. Google Sign-In Setup

See `GOOGLE_OAUTH_FEDCM_SETUP.md` for:
- Origin registration in Google Cloud Console
- FedCM configuration
- Troubleshooting

## Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### TypeScript Errors

```bash
npm run type-check
```

### Production Issues

1. Check browser console (F12)
2. Check server logs
3. Verify environment variables
4. Verify Google Cloud Console configuration

## References

- `GOOGLE_OAUTH_FEDCM_SETUP.md` - Google Sign-In setup
- `docs/PROJECT_HISTORY.md` - Project history and changes
- `frontend-react/README.md` - Frontend documentation

