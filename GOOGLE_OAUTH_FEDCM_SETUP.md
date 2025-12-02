# Google OAuth FedCM Setup Guide

## Overview

FedCM (Federated Credential Management) is the new standard for Google Sign-In on production HTTPS sites. Google is making FedCM mandatory, so proper setup is essential.

## Current Status

- **Environment**: Production (HTTPS)
- **Client ID**: `539842594800-bpqtcpi56vaf7nkiqcf1796socl2cjqp.apps.googleusercontent.com`
- **Origin**: `https://www.bahar.co.il`
- **FedCM Status**: Enabled in code (`.env.production: VITE_DISABLE_FEDCM=false`)

## Setup Steps

### 1. Register Origin in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find and click your OAuth 2.0 Client ID
5. Under **Authorized JavaScript origins**, add:
   - `https://www.bahar.co.il`
   - `https://bahar.co.il`
   - `https://www.bahar.co.il/fantasybroker/react/`

6. Under **Authorized redirect URIs**, add:
   - `https://www.bahar.co.il/fantasybroker/react/`
   - `https://bahar.co.il/fantasybroker/react/`

7. Click **Save**

### 2. Enable FedCM Configuration

1. In the same OAuth 2.0 Client ID settings
2. Look for **FedCM Configuration** section
3. Enable FedCM for your client ID
4. Add your origin to the FedCM allowed list
5. Save changes

### 3. Verify Configuration

After setup, test on production:

1. Open `https://www.bahar.co.il/fantasybroker/react/`
2. Click "Google" login button
3. Expected behavior:
   - Button shows loading animation
   - Google profile picker appears (FedCM dialog)
   - User can select account and sign in

### 4. Check Console Logs

Open browser DevTools (F12) and check console for:

**Success indicators:**
- `[Google Sign-In] One Tap prompt displayed successfully`
- No GSI_LOGGER warnings about FedCM

**Error indicators:**
- `unregistered_origin` - Origin not registered
- `fedcm_not_supported` - Browser doesn't support FedCM
- `credential_unavailable` - User not signed into Google

## Troubleshooting

### Profile picker not showing

1. Verify origin is registered in Google Cloud Console
2. Check browser console for error messages
3. Ensure user is signed into Google account
4. Try incognito/private mode
5. Clear browser cache and cookies

### "unregistered_origin" error

- Origin is not registered in Google Cloud Console
- Follow Step 1 above to register all required origins

### FedCM warnings in console

- These are expected during migration period
- Warnings will disappear once FedCM is fully configured
- Google will make FedCM mandatory in the future

## Code Changes

- **File**: `frontend-react/.env.production`
  - `VITE_DISABLE_FEDCM=false` (FedCM enabled)

- **File**: `frontend-react/src/pages/Login.tsx`
  - Enhanced error handling for FedCM scenarios
  - Better logging for debugging
  - Support for `fedcm_not_supported` reason

## References

- [Google FedCM Migration Guide](https://developers.google.com/identity/gsi/web/guides/fedcm-migration)
- [Google Sign-In Documentation](https://developers.google.com/identity/gsi/web)
- [FedCM Specification](https://fedcm.dev/)

