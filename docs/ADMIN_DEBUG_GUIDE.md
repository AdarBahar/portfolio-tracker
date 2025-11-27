# Admin Feature Debugging Guide

## Issue: Admin badge and link not showing after setting user as admin

### Root Cause
The `isAdmin` field is included in the JWT token when the user logs in. If you set a user as admin in the database **after** they've already logged in, their existing JWT token won't have the `isAdmin: true` flag.

### Solution: Force Re-login

**The user must log out and log back in to get a new JWT token with the updated `isAdmin` field.**

---

## Step-by-Step Debugging

### 1. Verify Database
First, confirm the user is actually set as admin in the database:

```sql
SELECT id, email, name, is_admin, status FROM users WHERE email = 'adar@bahar.co.il';
```

Expected result:
- `is_admin` should be `1` (or `TRUE`)
- `status` should be `'active'`

### 2. Clear Browser Storage and Re-login

**Option A: Use Browser DevTools**
1. Open browser DevTools (F12)
2. Go to Application tab → Storage → Local Storage
3. Find and delete these keys:
   - `portfolio_user`
   - `portfolio_auth_token`
   - `portfolio_token_expiry`
4. Refresh the page
5. Log in again with Google OAuth

**Option B: Use Logout Button**
1. Click the "Logout" button in the app
2. Log in again with Google OAuth

### 3. Verify JWT Token Contains isAdmin

After logging in, check the JWT token in browser DevTools:

1. Open DevTools (F12) → Application → Local Storage
2. Find `portfolio_auth_token`
3. Copy the token value
4. Go to https://jwt.io
5. Paste the token in the "Encoded" section
6. Check the payload (middle section) - it should contain:
   ```json
   {
     "id": 123,
     "email": "adar@bahar.co.il",
     "authProvider": "google",
     "isDemo": false,
     "isAdmin": true,  ← Should be true
     "iat": 1234567890,
     "exp": 1234567890
   }
   ```

### 4. Verify User Object in Local Storage

In DevTools → Application → Local Storage, check `portfolio_user`:

```json
{
  "id": 123,
  "email": "adar@bahar.co.il",
  "name": "Adar Bahar",
  "picture": "https://...",
  "isDemo": false,
  "isAdmin": true  ← Should be true
}
```

### 5. Check Browser Console for Errors

Open DevTools → Console and look for any JavaScript errors when the page loads.

### 6. Verify Backend Response

Check the network request when logging in:

1. Open DevTools → Network tab
2. Log out and log in again
3. Find the request to `/api/auth/google`
4. Check the response - it should include:
   ```json
   {
     "user": {
       "id": 123,
       "email": "adar@bahar.co.il",
       "name": "Adar Bahar",
       "profilePicture": "https://...",
       "authProvider": "google",
       "isDemo": false,
       "isAdmin": true  ← Should be true
     },
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

---

## Common Issues

### Issue 1: User didn't log out and back in
**Solution**: Force logout and re-login to get new JWT token

### Issue 2: Database value is 0 instead of 1
**Solution**: Run SQL update:
```sql
UPDATE users SET is_admin = 1 WHERE email = 'adar@bahar.co.il';
```

### Issue 3: User status is not 'active'
**Solution**: Update user status:
```sql
UPDATE users SET status = 'active' WHERE email = 'adar@bahar.co.il';
```

### Issue 4: Backend not restarted after code changes
**Solution**: Restart the backend server

### Issue 5: Frontend files not deployed
**Solution**: Ensure these files are deployed:
- `scripts/app.js` (modified)
- `scripts/auth.js` (modified)
- `styles/style.css` (modified)

### Issue 6: Browser cache
**Solution**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R) or clear browser cache

---

## Quick Test Commands

### Test Backend Endpoint (requires valid JWT token)
```bash
# Get your JWT token from browser localStorage: portfolio_auth_token
TOKEN="your-jwt-token-here"

# Test list users endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/admin/users

# Expected: 200 OK with user list (if admin)
# Expected: 403 Forbidden (if not admin)
```

### Verify Backend is Running Latest Code
Check backend logs for the admin routes registration:
```
[INFO] Admin routes registered at /api/admin
```

---

## Expected Behavior After Fix

Once the user logs out and back in with the updated admin status:

1. ✅ Star badge (⭐) appears at bottom-right of user avatar
2. ✅ "Admin Page" link appears under user name
3. ✅ Clicking "Admin Page" navigates to `/admin.html`
4. ✅ Admin page shows list of all users
5. ✅ Can view user logs by clicking "Logs" button
6. ✅ Can grant/revoke admin privileges

---

## Still Not Working?

If the issue persists after following all steps above, check:

1. **Browser DevTools Console** - Any JavaScript errors?
2. **Network Tab** - Is `/api/auth/google` returning `isAdmin: true`?
3. **Backend Logs** - Any errors when authenticating?
4. **Database** - Run the verification query again
5. **File Deployment** - Are all modified files actually deployed to the server?

If you need further assistance, provide:
- Screenshot of browser DevTools → Application → Local Storage → `portfolio_user`
- Screenshot of Network tab showing `/api/auth/google` response
- Backend server logs during login

