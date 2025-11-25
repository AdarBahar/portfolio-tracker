# Debug 401 Unauthorized Error on Admin Page

## Good News! 🎉

The **404 error is fixed**! You're now getting **401 Unauthorized** instead of **404 Not Found**, which means:
- ✅ The URL is correct (`/api/admin/users` not `/api/api/admin/users`)
- ✅ The backend route is registered and working
- ✅ The request is reaching the backend

The 401 error means **authentication is failing**. Let's debug why.

---

## Step-by-Step Debugging

### Step 1: Check if You're Logged In

Open the admin page and check the browser console:

1. **Open DevTools** (F12)
2. **Go to Console tab**
3. **Look for these messages:**
   - ✅ Good: No redirect messages
   - ❌ Bad: "Access denied. Admin privileges required." (means you're not logged in as admin)

If you see the alert and redirect, **you're not logged in as an admin user**.

---

### Step 2: Check Your JWT Token

**Open DevTools → Application → Local Storage → https://www.bahar.co.il**

Look for these keys:
- `portfolio_auth_token` - Your JWT token
- `portfolio_user` - Your user data
- `portfolio_token_expiry` - Token expiration timestamp

#### Check 1: Token Exists
```
portfolio_auth_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

If **missing or empty** → You're not logged in. Go to Step 3.

#### Check 2: Token Not Expired
```
portfolio_token_expiry: "1764678497000"
```

Compare with current time:
```javascript
// In browser console
Date.now() < parseInt(localStorage.getItem('portfolio_token_expiry'))
// Should return: true (not expired)
```

If **expired** → Token is old. Go to Step 3.

#### Check 3: Token Has isAdmin
1. Copy the value of `portfolio_auth_token`
2. Go to https://jwt.io
3. Paste the token in the "Encoded" box
4. Look at the "Payload" section (decoded)

**Expected payload:**
```json
{
  "id": 2,
  "email": "adar@bahar.co.il",
  "authProvider": "google",
  "isDemo": false,
  "isAdmin": true,  ← MUST BE TRUE
  "iat": 1764073697,
  "exp": 1764678497
}
```

If `isAdmin` is **missing or false** → You need a new token. Go to Step 3.

---

### Step 3: Get a Fresh Token

**You need to log out and log back in to get a new JWT token with `isAdmin: true`.**

#### Option A: Full Logout (Recommended)

1. **Go to main page:** https://www.bahar.co.il/fantasybroker/
2. **Click "Logout" button**
3. **Clear localStorage:**
   - Open DevTools (F12)
   - Application → Local Storage → https://www.bahar.co.il
   - Right-click → Clear
4. **Close DevTools**
5. **Log back in** with Google (adar@bahar.co.il)
6. **Verify admin badge (⭐) appears** next to your avatar
7. **Click "Admin Page" link**

#### Option B: Manual Clear (If logout doesn't work)

1. **Open DevTools** (F12)
2. **Go to Console tab**
3. **Run these commands:**
   ```javascript
   localStorage.removeItem('portfolio_auth_token');
   localStorage.removeItem('portfolio_user');
   localStorage.removeItem('portfolio_token_expiry');
   location.reload();
   ```
4. **Log back in** with Google

---

### Step 4: Verify New Token

After logging back in:

1. **Check localStorage again:**
   - `portfolio_auth_token` should have a new value
   - `portfolio_user` should show your user data

2. **Decode the new token at jwt.io:**
   - Should have `"isAdmin": true`

3. **Check the main page:**
   - ⭐ Admin badge should appear next to your avatar
   - "Admin Page" link should appear under your name

4. **Try admin page again:**
   - Click "Admin Page" link
   - Should load without 401 error

---

## Common Issues

### Issue 1: Token Doesn't Have isAdmin

**Symptom:** JWT token payload shows `"isAdmin": false` or missing

**Cause:** Backend wasn't restarted after deploying the updated `authController.js`

**Solution:**
```bash
# On server
pm2 restart portfolio-tracker-backend
# or
sudo systemctl restart portfolio-tracker-backend
```

Then log out and log back in.

---

### Issue 2: Database Doesn't Have is_admin Set

**Symptom:** Token has `"isAdmin": false` even after backend restart

**Cause:** Database `is_admin` column is not set to TRUE

**Solution:**
```sql
-- Check current value
SELECT id, email, is_admin FROM users WHERE email = 'adar@bahar.co.il';

-- Set to admin
UPDATE users SET is_admin = TRUE WHERE email = 'adar@bahar.co.il';

-- Verify
SELECT id, email, is_admin FROM users WHERE email = 'adar@bahar.co.il';
```

Then log out and log back in.

---

### Issue 3: Old Token Cached

**Symptom:** Logged out and back in, but still getting 401

**Cause:** Browser is caching the old token

**Solution:**
1. **Hard refresh:** Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. **Clear cache:** Ctrl+Shift+Delete → Clear cached images and files
3. **Incognito mode:** Try in a new incognito/private window

---

### Issue 4: Authorization Header Not Sent

**Symptom:** 401 error, but token exists and is valid

**Cause:** `getAuthHeader()` is returning empty object

**Debug:**
```javascript
// In browser console on admin page
authManager.getAuthHeader()

// Should return:
// { Authorization: "Bearer eyJhbGci..." }

// If returns {} → Token is missing or invalid format
```

---

## Quick Diagnostic Script

**Run this in the browser console on the admin page:**

```javascript
// Diagnostic script
console.log('=== Admin Page Diagnostics ===');

// Check token
const token = localStorage.getItem('portfolio_auth_token');
console.log('Token exists:', !!token);
console.log('Token length:', token ? token.length : 0);

// Check expiry
const expiry = localStorage.getItem('portfolio_token_expiry');
const isExpired = expiry ? Date.now() > parseInt(expiry) : true;
console.log('Token expired:', isExpired);

// Check user
const userStr = localStorage.getItem('portfolio_user');
const user = userStr ? JSON.parse(userStr) : null;
console.log('User:', user);
console.log('Is Admin:', user ? user.isAdmin : false);

// Check auth header
console.log('Auth header:', authManager.getAuthHeader());

// Decode token (basic)
if (token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Token isAdmin:', payload.isAdmin);
    } catch (e) {
        console.error('Failed to decode token:', e);
    }
}
```

---

## Expected Results After Fix

### ✅ Successful Login
- Token exists in localStorage
- Token has `"isAdmin": true` in payload
- Admin badge (⭐) appears on main page
- "Admin Page" link appears on main page

### ✅ Admin Page Works
- No 401 errors
- User list loads
- Search works
- Logs button works
- Make Admin / Remove Admin works

---

## Next Steps

1. **Run the diagnostic script** above
2. **Check your JWT token** at jwt.io
3. **If isAdmin is false or missing:**
   - Verify database has `is_admin = TRUE`
   - Restart backend service
   - Log out and log back in
4. **If still getting 401:**
   - Share the diagnostic script output
   - Share the decoded JWT token payload (remove sensitive data)

The 401 error is almost always a token issue. Once you get a fresh token with `isAdmin: true`, the admin page will work! 🚀

