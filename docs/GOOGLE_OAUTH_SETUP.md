# Google OAuth Setup Guide

## Overview

This guide walks you through setting up Google OAuth authentication for the Portfolio Tracker application.

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create a new project:**
   - Click "Select a project" → "New Project"
   - Name: "Portfolio Tracker" (or your preferred name)
   - Click "Create"

3. **Select your project:**
   - Make sure your new project is selected in the top dropdown

## Step 2: Enable Google+ API

1. **Navigate to APIs & Services:**
   - In the left sidebar, click "APIs & Services" → "Library"

2. **Enable Google+ API:**
   - Search for "Google+ API"
   - Click on it
   - Click "Enable"

## Step 3: Configure OAuth Consent Screen

1. **Navigate to OAuth consent screen:**
   - In the left sidebar, click "OAuth consent screen"

2. **Choose user type:**
   - Select "External" (for testing with any Google account)
   - Click "Create"

3. **Fill in app information:**
   - **App name:** Portfolio Tracker
   - **User support email:** Your email
   - **App logo:** (optional)
   - **Application home page:** http://localhost:8888/fantasybroker/
   - **Authorized domains:** localhost (for development)
   - **Developer contact information:** Your email
   - Click "Save and Continue"

4. **Scopes:**
   - Click "Add or Remove Scopes"
   - Select:
     - `userinfo.email`
     - `userinfo.profile`
     - `openid`
   - Click "Update"
   - Click "Save and Continue"

5. **Test users (for External apps):**
   - Click "Add Users"
   - Add your Google email address
   - Click "Save and Continue"

6. **Summary:**
   - Review and click "Back to Dashboard"

## Step 4: Create OAuth Client ID

1. **Navigate to Credentials:**
   - In the left sidebar, click "Credentials"

2. **Create credentials:**
   - Click "Create Credentials" → "OAuth client ID"

3. **Configure OAuth client:**
   - **Application type:** Web application
   - **Name:** Portfolio Tracker Web Client
   
4. **Authorized JavaScript origins:**
   - Add: `http://localhost:8888`
   - Add: `http://localhost:3000` (if using different port)
   - For production, add your domain: `https://yourdomain.com`

5. **Authorized redirect URIs:**
   - Add: `http://localhost:8888/fantasybroker/`
   - Add: `http://localhost:8888/fantasybroker/index.html`
   - For production, add: `https://yourdomain.com/`

6. **Create:**
   - Click "Create"
   - **IMPORTANT:** Copy your Client ID (looks like: `123456789-abc123.apps.googleusercontent.com`)

## Step 5: Update Your Application

1. **Open `login.html`:**
   ```bash
   # Edit line 23
   ```

2. **Replace the Client ID:**
   ```html
   <!-- Find this line: -->
   <div id="g_id_onload"
        data-client_id="YOUR_GOOGLE_CLIENT_ID"
        ...
   
   <!-- Replace with your actual Client ID: -->
   <div id="g_id_onload"
        data-client_id="123456789-abc123.apps.googleusercontent.com"
        ...
   ```

3. **Save the file**

## Step 6: Test the Integration

1. **Start your local server:**
   - Make sure MAMP is running
   - Or use: `python3 -m http.server 8888`

2. **Open the login page:**
   - Navigate to: `http://localhost:8888/fantasybroker/login.html`

3. **Test Google Sign-In:**
   - Click the "Sign in with Google" button
   - Select your Google account
   - Grant permissions
   - You should be redirected to the main app

4. **Test Demo Mode:**
   - Click "Continue in Demo Mode"
   - You should be redirected to the main app

## Step 7: Verify User-Specific Data

1. **Sign in with Google:**
   - Add some positions
   - Note your data

2. **Logout:**
   - Click the "Logout" button

3. **Sign in with Demo Mode:**
   - You should see different data (or empty portfolio)
   - Add some positions

4. **Logout and sign in with Google again:**
   - Your original Google account data should be there
   - Demo data should be separate

## Production Deployment

When deploying to production:

1. **Update OAuth Client:**
   - Go back to Google Cloud Console → Credentials
   - Edit your OAuth client
   - Add production URLs to:
     - Authorized JavaScript origins: `https://yourdomain.com`
     - Authorized redirect URIs: `https://yourdomain.com/`

2. **Update login.html:**
   - No changes needed (same Client ID works for both dev and prod)

3. **Publish OAuth Consent Screen:**
   - Go to OAuth consent screen
   - Click "Publish App"
   - Submit for verification (if needed)

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure your redirect URI in Google Cloud Console matches exactly
- Check for trailing slashes
- Verify the protocol (http vs https)

### "Error 401: invalid_client"
- Double-check your Client ID in login.html
- Make sure you copied the entire Client ID

### "This app isn't verified"
- This is normal for development
- Click "Advanced" → "Go to Portfolio Tracker (unsafe)"
- For production, submit your app for verification

### Google Sign-In button doesn't appear
- Check browser console for errors
- Verify the Google Sign-In library is loading
- Check that your Client ID is correct

### Data not persisting between users
- Check browser console for errors
- Verify localStorage is enabled
- Check that user ID is being passed correctly

## Security Notes

1. **Never commit your Client ID to public repositories** (though it's not a secret, it's best practice)
2. **Use environment variables** for production
3. **Enable HTTPS** in production
4. **Regularly rotate credentials** if compromised
5. **Monitor usage** in Google Cloud Console

## Next Steps

After setting up Google OAuth:

1. ✅ Test with multiple Google accounts
2. ✅ Test demo mode
3. ✅ Verify data isolation between users
4. 🔄 Set up backend API (see DATABASE_MIGRATION_GUIDE.md)
5. 🔄 Deploy to production
6. 🔄 Submit app for verification (if needed)

## Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

