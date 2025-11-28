# React Frontend Deployment Guide

This guide explains how to deploy the React frontend alongside the existing vanilla JavaScript frontend on your production server.

## Architecture

The deployment uses a reverse proxy setup:
- **Vanilla JS Frontend**: Served at `/` (root path)
- **React Frontend**: Served at `/react/` (sub-path)
- **Backend API**: Available at `/api/` (proxied to Node.js backend)

## Prerequisites

- Node.js 18+ installed on production server
- Nginx or Apache configured as reverse proxy
- Backend API running on port 4000

## Deployment Steps

### 1. Build the React App

```bash
cd frontend-react
npm install
npm run build
```

This creates an optimized production build in `frontend-react/dist/`.

### 2. Copy Build to Server

```bash
# From your local machine
scp -r frontend-react/dist/* user@server:/var/www/fantasy-broker/react/
```

### 3. Configure Nginx

Add this location block to your Nginx configuration:

```nginx
location /react/ {
    alias /var/www/fantasy-broker/react/;
    try_files $uri $uri/ /react/index.html;
}
```

### 4. Configure Apache

Add this to your Apache configuration:

```apache
<Directory /var/www/fantasy-broker/react>
    RewriteEngine On
    RewriteBase /react/
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /react/index.html [L]
</Directory>
```

### 5. Environment Configuration

Create `.env` file in the React build directory or configure via environment variables:

```env
VITE_API_URL=https://yourdomain.com/api
```

## Testing

1. **Vanilla JS Frontend**: Visit `https://yourdomain.com/`
2. **React Frontend**: Visit `https://yourdomain.com/react/`
3. **API Connectivity**: Check browser console for any CORS or API errors

## Troubleshooting

### React app shows 404

Ensure the Nginx/Apache rewrite rules are correctly configured to serve `index.html` for all routes.

### API calls fail

Check that the `VITE_API_URL` environment variable is correctly set and the backend API is accessible.

### Styles not loading

Verify that the CSS files are being served with correct MIME types and that the base path `/react/` is correctly configured in `vite.config.ts`.

## Rollback

If issues occur, simply remove the `/react/` directory and the Nginx/Apache configuration will serve only the vanilla JS frontend.

## Performance Monitoring

Monitor these metrics:
- React app bundle size (target: < 500KB gzipped)
- API response times
- Page load times
- Error rates in browser console

