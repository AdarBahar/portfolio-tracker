# React App - Content Security Policy (CSP) Troubleshooting

## Issue

Console errors when accessing React app at `https://www.bahar.co.il/fantasybroker/react/`:

```
Connecting to '<URL>' violates the following Content Security Policy directive: "default-src 'self'"
Fetch API cannot load https://fonts.googleapis.com/... Refused to connect because it violates the document's Content Security Policy
```

## Root Cause

The React app needs to load external resources:
- **Google Fonts** - `fonts.googleapis.com` and `fonts.gstatic.com`
- **Google Sign-In** - `accounts.google.com` and `apis.google.com`
- **API Calls** - Backend API endpoints

The default CSP policy (`default-src 'self'`) blocks all external connections.

## Solution

### 1. Added `.htaccess` to React Directory

Created `/react/.htaccess` with proper CSP headers that allow:

```apache
Header always set Content-Security-Policy "
  default-src 'self';
  img-src * data: blob:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https:;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https:;
  font-src 'self' https://fonts.gstatic.com https: data:;
  frame-src https://accounts.google.com;
  connect-src 'self' https://www.bahar.co.il https://bahar.co.il https://mytrips-api.bahar.co.il https://accounts.google.com https://fonts.googleapis.com https://fonts.gstatic.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
"
```

### 2. CSP Directives Explained

| Directive | Purpose | Allowed Sources |
|-----------|---------|-----------------|
| `default-src 'self'` | Default policy | Same origin only |
| `img-src * data: blob:` | Images | Any source, data URIs, blobs |
| `script-src` | JavaScript | Self, inline, eval, Google APIs |
| `style-src` | CSS | Self, inline, Google Fonts |
| `font-src` | Fonts | Self, Google Fonts, data URIs |
| `frame-src` | Iframes | Google Sign-In |
| `connect-src` | API calls | Self, backend, Google, fonts |
| `object-src 'none'` | Plugins | Disabled |

### 3. React Router Configuration

The `.htaccess` also includes rewrite rules for React Router:

```apache
RewriteEngine On
RewriteBase /fantasybroker/react/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

This ensures all routes are handled by React Router.

## Verification Steps

1. **Clear Browser Cache**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear cache in DevTools

2. **Check Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Verify no CSP errors appear

3. **Test Features**
   - Google Sign-In button should work
   - Google Fonts should load
   - API calls should succeed
   - No "Refused to connect" errors

4. **Check Response Headers**
   - Open DevTools Network tab
   - Click on `index.html`
   - Check Response Headers
   - Verify `Content-Security-Policy` header is present

## Service Worker Errors

If you see errors like:
```
sw.js:85 Fetch API cannot load https://fonts.googleapis.com/...
```

This is from the old vanilla JS app's service worker. Solutions:

1. **Clear Service Worker Cache**
   - DevTools → Application → Service Workers
   - Click "Unregister" for any old service workers
   - Clear cache storage

2. **Disable Service Worker (Temporary)**
   - DevTools → Application → Service Workers
   - Check "Bypass for network"

3. **Permanent Fix**
   - The React app doesn't use a service worker
   - Old app's service worker will be replaced when React becomes primary

## Testing Locally

If testing locally with `npm run dev`:

1. Update `.env` with correct API URL:
   ```
   VITE_API_URL=http://localhost:4000/api
   ```

2. Local dev server doesn't have CSP restrictions
   - CSP only applies in production with Apache

3. Test production build:
   ```bash
   npm run build
   # Serve react/ folder with Apache
   ```

## Files Modified

- `react/.htaccess` - Added CSP headers and React Router rules
- `.htaccess` - Already had CSP configured (root level)

## Git Reference

- Commit: `0c6dfc5`
- Branch: `react-migration-test`

## Next Steps

1. ✅ Deploy `.htaccess` to production
2. ✅ Clear browser cache
3. ✅ Verify no console errors
4. ✅ Test Google Sign-In
5. ✅ Test API calls
6. ✅ Test responsive design

## Additional Resources

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Directive Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [Apache mod_headers](https://httpd.apache.org/docs/current/mod/mod_headers.html)

