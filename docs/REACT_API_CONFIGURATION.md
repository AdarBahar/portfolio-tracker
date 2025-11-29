# React App - API Configuration Guide

## Overview

The React app is configured to automatically detect the environment and use the correct API endpoint.

## API Endpoint Configuration

### Production Environment

**Endpoint:** `https://www.bahar.co.il/fantasybroker-api/api`

The app automatically detects production when running on:
- `www.bahar.co.il`
- `bahar.co.il`

### Development Environment

**Endpoint:** `http://localhost:4000/api`

Used when running locally or on any other hostname.

### Environment Variable Override

You can override the automatic detection by setting `VITE_API_URL`:

```bash
# Development
VITE_API_URL=http://localhost:4000/api npm run dev

# Production
VITE_API_URL=https://www.bahar.co.il/fantasybroker-api/api npm run build
```

## Implementation Details

### API Client (frontend-react/src/lib/api.ts)

```typescript
const getApiUrl = (): string => {
  // 1. Check environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2. Check hostname for production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'www.bahar.co.il' || hostname === 'bahar.co.il') {
      return 'https://www.bahar.co.il/fantasybroker-api/api';
    }
  }

  // 3. Default to localhost
  return 'http://localhost:4000/api';
};
```

### Environment Files

**Development (.env):**
```
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=539842594800-bpqtcpi56vaf7nkiqcf1796socl2cjqp.apps.googleusercontent.com
```

**Production (.env.production):**
```
VITE_API_URL=https://www.bahar.co.il/fantasybroker-api/api
VITE_GOOGLE_CLIENT_ID=539842594800-bpqtcpi56vaf7nkiqcf1796socl2cjqp.apps.googleusercontent.com
```

## Content Security Policy (CSP)

The `.htaccess` file includes CSP headers that allow:

- **Production API:** `https://fantasybroker-api.bahar.co.il`
- **Production Domain:** `https://www.bahar.co.il`, `https://bahar.co.il`
- **External Services:** Google APIs, Fonts, Amplitude, Brevo

### CSP Connect-Src Directive

```
connect-src 'self' 
  https://www.bahar.co.il 
  https://bahar.co.il 
  https://mytrips-api.bahar.co.il 
  https://fantasybroker-api.bahar.co.il 
  https://api.amplitude.com 
  https://api.eu.amplitude.com 
  https://sr-client-cfg.eu.amplitude.com 
  https://api.brevo.com 
  https://unpkg.com 
  https://cdn.jsdelivr.net 
  https://cdnjs.cloudflare.com 
  https://accounts.google.com 
  https://cloudflareinsights.com 
  https://fonts.googleapis.com 
  https://fonts.gstatic.com
```

## Deployment

### Build Process

```bash
cd frontend-react
npm run build
```

This creates:
- `react/index.html` - Main HTML file
- `react/assets/` - JavaScript and CSS bundles
- `react/.htaccess` - Apache configuration (copied from public/)

### Deploy to Production

```bash
rsync -avz react/ user@server:/var/www/fantasy-broker/react/
```

### Verify Deployment

1. Open https://www.bahar.co.il/fantasybroker/react/dashboard
2. Open DevTools Console (F12)
3. Check for API errors - should be NONE
4. Verify API calls in Network tab
5. Check Response Headers for Content-Security-Policy

## Troubleshooting

### CSP Errors

If you see "violates Content Security Policy" errors:

1. Check the error message for the blocked URL
2. Add the domain to the `connect-src` directive in `.htaccess`
3. Rebuild and redeploy

### API Connection Errors

If the app can't connect to the API:

1. Verify the API endpoint is correct
2. Check that the API server is running
3. Verify CORS headers are set correctly
4. Check browser console for detailed error messages

### Wrong API Endpoint

If the app is using the wrong endpoint:

1. Check `window.location.hostname` in DevTools console
2. Verify the hostname matches production domain
3. Check `VITE_API_URL` environment variable
4. Clear browser cache and reload

## Files

- `frontend-react/src/lib/api.ts` - API client with hostname detection
- `frontend-react/.env.example` - Development environment template
- `frontend-react/.env.production` - Production environment (not committed)
- `frontend-react/public/.htaccess` - Apache configuration
- `react/.htaccess` - Generated during build

## Git Reference

- Commit: `4f05f27` - API endpoint configuration
- Commit: `4522779` - .htaccess in public folder
- Branch: `react-migration-test`

