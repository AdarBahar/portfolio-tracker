# Google OAuth Setup for Localhost Development

## Problem Solved

Google Sign-In was failing on localhost with the error:
- **"Not signed in with the identity provider"** (FedCM error)
- **"The given origin is not allowed for the given client ID"** (OAuth configuration error)

## Root Cause

1. **FedCM (Federated Credential Management)** is too strict on HTTP localhost
   - FedCM requires HTTPS in production
   - On localhost with HTTP, it fails with "Not signed in with the identity provider"
   - Production (HTTPS) works fine with FedCM

2. **Google OAuth configuration** needs proper origin registration
   - The origin must be registered in Google Cloud Console
   - The origin is just `protocol://domain:port` (no path)

## Solution Implemented

### 1. Disabled FedCM on Localhost

Created `.env.local` and `.env.development` files with:
```env
VITE_DISABLE_FEDCM=true
```

This tells the app to use the older One Tap method instead of FedCM on localhost.

### 2. Updated Login Component

Modified `src/pages/Login.tsx` to:
- Check for `VITE_DISABLE_FEDCM` environment variable
- Explicitly set `use_fedcm_for_prompt: false` on localhost
- Keep FedCM enabled on production (HTTPS)

### 3. Production Unchanged

- `.env.production` still uses FedCM (which works fine with HTTPS)
- No changes to production configuration
- Production Google Sign-In continues to work normally

## Setup Instructions for Localhost

### Step 1: Verify Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. Click to edit it

### Step 2: Add Authorized JavaScript Origins

In the OAuth client settings, add to **Authorized JavaScript origins**:
```
http://localhost:5173
```

### Step 3: Add Authorized Redirect URIs

In the OAuth client settings, add to **Authorized redirect URIs**:
```
http://localhost:5173/fantasybroker/react/login
http://localhost:5173/fantasybroker/
http://localhost:5173/fantasybroker/react/
```

### Step 4: Wait for Propagation

Google can take **5-15 minutes** to propagate changes. Wait before testing.

### Step 5: Test Localhost

1. Start the dev server:
   ```bash
   cd frontend-react
   npm run dev
   ```

2. Open http://localhost:5173/fantasybroker/react/login

3. Click the Google Sign-In button

4. You should see the Google One Tap prompt (not FedCM)

## Verification

### Check Console Logs

Open DevTools (F12) → Console tab. You should see:
```
[Google Sign-In] Initialized without FedCM (localhost development)
```

### Check for Errors

You should NOT see:
- ❌ "Not signed in with the identity provider"
- ❌ "FedCM get() rejects with NetworkError"

You SHOULD see:
- ✅ Google One Tap prompt appears
- ✅ Successful authentication

## Why This Works

| Environment | Protocol | FedCM | Method | Status |
|-------------|----------|-------|--------|--------|
| Production | HTTPS | ✅ Enabled | FedCM | ✅ Works |
| Localhost | HTTP | ❌ Disabled | One Tap | ✅ Works |

## Troubleshooting

### Still getting "The given origin is not allowed"

1. **Check the origin format**: Should be `http://localhost:5173` (no path)
2. **Wait for propagation**: Google changes can take 5-15 minutes
3. **Clear browser cache**: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
4. **Check dev server port**: Make sure it's running on 5173 (or update the origin)

### Still getting FedCM errors

1. **Check `.env.local` exists**: Should be in `frontend-react/` directory
2. **Restart dev server**: Kill and restart `npm run dev`
3. **Check environment variable**: Open DevTools → Console and run:
   ```javascript
   console.log(import.meta.env.VITE_DISABLE_FEDCM)
   ```
   Should print `"true"`

### Google One Tap not appearing

1. **Check browser console** for errors
2. **Verify Google Client ID** is correct in `.env.local`
3. **Check network tab** for failed requests to Google APIs
4. **Try incognito mode** to avoid cached credentials

## Files Modified

- `frontend-react/.env.local` - Development environment (localhost)
- `frontend-react/.env.development` - Development environment (alternative)
- `frontend-react/src/pages/Login.tsx` - FedCM disable logic

## Production Deployment

No changes needed! Production continues to use:
- `.env.production` with FedCM enabled
- HTTPS with `www.bahar.co.il`
- Existing Google OAuth configuration

## References

- [Google Sign-In Documentation](https://developers.google.com/identity/gsi/web)
- [FedCM Migration Guide](https://developers.google.com/identity/gsi/web/guides/fedcm-migration)
- [Google Cloud Console](https://console.cloud.google.com/)

