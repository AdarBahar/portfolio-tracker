# Fix 401 Error - Quick Checklist

## Progress So Far

✅ **404 Error Fixed** - URL is now correct  
⚠️ **401 Error** - Authentication issue (token missing or invalid)

---

## Quick Fix (Most Common)

### Just Log Out and Log Back In

This fixes 90% of 401 errors:

1. **Go to:** https://www.bahar.co.il/fantasybroker/
2. **Click "Logout"**
3. **Log back in** with Google (adar@bahar.co.il)
4. **Verify admin badge (⭐)** appears next to your avatar
5. **Click "Admin Page"** link
6. **Should work now!**

If this doesn't work, continue below...

---

## Diagnostic Steps

### Step 1: Check Your Token

**Open DevTools (F12) → Console → Run this:**

```javascript
// Quick check
const token = localStorage.getItem('portfolio_auth_token');
if (!token) {
    console.log('❌ NO TOKEN - You need to log in');
} else {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('isAdmin:', payload.isAdmin);
    
    if (!payload.isAdmin) {
        console.log('❌ NOT ADMIN - Token does not have isAdmin:true');
        console.log('→ Backend needs restart OR database is_admin not set');
    } else {
        console.log('✅ Token looks good!');
    }
}
```

**Results:**

- **❌ NO TOKEN** → Log in
- **❌ NOT ADMIN** → Go to Step 2
- **✅ Token looks good** → Go to Step 3

---

### Step 2: Fix Backend/Database

If token doesn't have `isAdmin: true`:

#### Check Database

```sql
SELECT id, email, is_admin FROM users WHERE email = 'adar@bahar.co.il';
```

**Expected:** `is_admin = 1` (or `TRUE`)

**If 0 or FALSE:**
```sql
UPDATE users SET is_admin = TRUE WHERE email = 'adar@bahar.co.il';
```

#### Restart Backend

```bash
# On server
pm2 restart portfolio-tracker-backend
# or
sudo systemctl restart portfolio-tracker-backend
```

#### Get New Token

1. Log out
2. Clear localStorage (F12 → Application → Local Storage → Clear)
3. Log back in
4. Check token again (run script from Step 1)

---

### Step 3: Check Request

If token has `isAdmin: true` but still getting 401:

**Open DevTools → Network tab:**

1. **Refresh admin page**
2. **Find the request:** `admin/users`
3. **Click on it**
4. **Check "Headers" tab:**

**Look for:**
```
Request Headers:
  Authorization: Bearer eyJhbGci...
```

**If Authorization header is MISSING:**
- Problem with `authManager.getAuthHeader()`
- Check console for errors

**If Authorization header is PRESENT:**
- Backend is rejecting the token
- Check backend logs for errors

---

## Common Scenarios

### Scenario 1: Fresh Deployment

**You just deployed the admin feature for the first time.**

**Checklist:**
- [ ] Database has `is_admin` column
- [ ] User has `is_admin = TRUE` in database
- [ ] Backend was restarted after deployment
- [ ] Logged out and logged back in
- [ ] Token has `isAdmin: true`

### Scenario 2: Updated Code

**You just deployed the URL fix (scripts/admin.js).**

**Checklist:**
- [ ] Cleared browser cache (Ctrl+Shift+R)
- [ ] admin.js file updated on server
- [ ] Logged out and logged back in
- [ ] Token has `isAdmin: true`

### Scenario 3: Working Before, Broken Now

**Admin page worked before, now getting 401.**

**Possible causes:**
- [ ] Token expired (check expiry timestamp)
- [ ] Backend was restarted and JWT_SECRET changed
- [ ] Database `is_admin` was changed to FALSE
- [ ] User was deleted/deactivated

---

## Verification Commands

### On Server (Backend)

```bash
# Check if backend is running
pm2 status
# or
systemctl status portfolio-tracker-backend

# Check backend logs
pm2 logs portfolio-tracker-backend --lines 50
# or
journalctl -u portfolio-tracker-backend -n 50

# Check if admin routes are registered
grep -n "adminRoutes" /path/to/backend/src/app.js
# Should show line 16 and 62
```

### In Database

```sql
-- Check user admin status
SELECT id, email, name, is_admin, status 
FROM users 
WHERE email = 'adar@bahar.co.il';

-- Check if is_admin column exists
SHOW COLUMNS FROM users LIKE 'is_admin';
```

### In Browser

```javascript
// Check if logged in
authManager.getUser()
// Should return user object with isAdmin: true

// Check token
authManager.getToken()
// Should return JWT string

// Check auth header
authManager.getAuthHeader()
// Should return { Authorization: "Bearer ..." }
```

---

## Expected Flow

### ✅ Correct Flow

1. User logs in with Google
2. Backend checks database: `is_admin = TRUE`
3. Backend creates JWT with `isAdmin: true`
4. Frontend stores token in localStorage
5. Frontend shows admin badge and link
6. User clicks "Admin Page"
7. Frontend checks `user.isAdmin` → passes
8. Frontend makes request with `Authorization: Bearer <token>`
9. Backend validates token → `isAdmin: true` → allows access
10. Admin page loads successfully

### ❌ Where It Can Break

- **Step 2:** Database doesn't have `is_admin = TRUE` → Token has `isAdmin: false`
- **Step 3:** Backend not restarted → Old code doesn't include `isAdmin` in token
- **Step 4:** Token not stored → 401 error
- **Step 7:** Token has `isAdmin: false` → Redirects to main page
- **Step 8:** Token missing or malformed → 401 error
- **Step 9:** Token invalid or expired → 401 error

---

## Quick Test

**Run this complete test in browser console:**

```javascript
(async function() {
    console.log('=== ADMIN AUTH TEST ===');
    
    // 1. Check user
    const user = authManager.getUser();
    console.log('1. User:', user);
    console.log('   isAdmin:', user?.isAdmin);
    
    // 2. Check token
    const token = authManager.getToken();
    console.log('2. Token exists:', !!token);
    
    // 3. Decode token
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('3. Token payload:', payload);
    }
    
    // 4. Check auth header
    const headers = authManager.getAuthHeader();
    console.log('4. Auth header:', headers);
    
    // 5. Test API call
    const config = await configPromise;
    console.log('5. API URL:', config.apiUrl);
    
    try {
        const response = await fetch(`${config.apiUrl}/admin/users`, {
            headers: authManager.getAuthHeader()
        });
        console.log('6. API Response:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('   Users count:', data.users?.length);
            console.log('✅ SUCCESS!');
        } else {
            const error = await response.text();
            console.log('   Error:', error);
            console.log('❌ FAILED');
        }
    } catch (e) {
        console.log('6. API Error:', e.message);
        console.log('❌ FAILED');
    }
})();
```

---

## Summary

**Most likely cause:** You need to log out and log back in to get a fresh JWT token with `isAdmin: true`.

**Quick fix:**
1. Logout
2. Login
3. Try admin page again

**If that doesn't work:**
1. Check database has `is_admin = TRUE`
2. Restart backend
3. Clear browser cache
4. Logout and login again

**Still not working?** Run the diagnostic script and share the output! 🔍

