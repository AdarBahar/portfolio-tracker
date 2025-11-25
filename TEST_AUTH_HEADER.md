# Test Authorization Header

## Quick Test - Run in Browser Console

**Copy and paste this into the browser console (F12) on the admin page:**

```javascript
(async function() {
    console.log('=== AUTHORIZATION HEADER TEST ===\n');
    
    // 1. Get token
    const token = localStorage.getItem('portfolio_auth_token');
    console.log('1. Token exists:', !!token);
    console.log('   Token length:', token ? token.length : 0);
    
    // 2. Decode token
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('\n2. Token payload:');
            console.log('   id:', payload.id);
            console.log('   email:', payload.email);
            console.log('   isAdmin:', payload.isAdmin);
            console.log('   exp:', new Date(payload.exp * 1000).toLocaleString());
            console.log('   expired:', Date.now() > payload.exp * 1000);
        } catch (e) {
            console.error('   Failed to decode:', e.message);
        }
    }
    
    // 3. Get auth header
    const authHeader = authManager.getAuthHeader();
    console.log('\n3. Auth header from authManager:');
    console.log('   ', authHeader);
    console.log('   Has Authorization:', !!authHeader.Authorization);
    
    // 4. Test API call with detailed logging
    const config = await configPromise;
    const url = `${config.apiUrl}/admin/users`;
    console.log('\n4. Making request to:', url);
    
    try {
        const response = await fetch(url, {
            headers: authHeader
        });
        
        console.log('\n5. Response:');
        console.log('   Status:', response.status, response.statusText);
        console.log('   Headers:', Object.fromEntries(response.headers.entries()));
        
        const text = await response.text();
        console.log('   Body:', text.substring(0, 200));
        
        if (response.status === 401) {
            console.log('\n❌ 401 UNAUTHORIZED');
            console.log('   → Backend rejected the token');
            console.log('   → Likely JWT_SECRET mismatch');
            console.log('   → Check backend logs for "JWT verification failed"');
        } else if (response.status === 200) {
            console.log('\n✅ SUCCESS!');
        } else {
            console.log('\n⚠️ Unexpected status:', response.status);
        }
    } catch (e) {
        console.log('\n❌ Request failed:', e.message);
    }
    
    console.log('\n=== END TEST ===');
})();
```

---

## What to Look For

### ✅ Good Results
```
1. Token exists: true
   Token length: 200+ (varies)

2. Token payload:
   id: 2
   email: adar@bahar.co.il
   isAdmin: true
   exp: <future date>
   expired: false

3. Auth header from authManager:
   { Authorization: "Bearer eyJhbGci..." }
   Has Authorization: true

4. Making request to: https://www.bahar.co.il/fantasybroker-api/api/admin/users

5. Response:
   Status: 200 OK
   Body: {"users":[...]}

✅ SUCCESS!
```

### ❌ Bad Results (Current Issue)
```
1. Token exists: true
   Token length: 200+

2. Token payload:
   id: 2
   email: adar@bahar.co.il
   isAdmin: true
   exp: <future date>
   expired: false

3. Auth header from authManager:
   { Authorization: "Bearer eyJhbGci..." }
   Has Authorization: true

4. Making request to: https://www.bahar.co.il/fantasybroker-api/api/admin/users

5. Response:
   Status: 401 Unauthorized
   Body: {"error":"Invalid or expired token"}

❌ 401 UNAUTHORIZED
   → Backend rejected the token
   → Likely JWT_SECRET mismatch
```

---

## Next Steps Based on Results

### If "Token exists: false"
→ You're not logged in. Log in again.

### If "expired: true"
→ Token expired. Clear localStorage and log in again.

### If "Has Authorization: false"
→ Frontend issue. Check authManager.getAuthHeader() implementation.

### If "Status: 401" with valid token
→ **JWT_SECRET mismatch** (most likely your issue)

**Solution:**
1. Check backend logs for "JWT verification failed"
2. Verify `.env` file has `JWT_SECRET` set
3. Clear localStorage and log in again to get new token

---

## Backend Log Check

**On the server, run:**

```bash
# Watch logs in real-time
pm2 logs portfolio-tracker-backend --lines 0

# Then refresh the admin page in browser
# Look for error messages like:
# "JWT verification failed: invalid signature"
# "JWT verification failed: jwt malformed"
```

**Expected error:**
```
JWT verification failed: invalid signature
```

This confirms JWT_SECRET mismatch.

---

## Quick Fix

**Most likely you just need to clear localStorage and log in again:**

```javascript
// In browser console
localStorage.clear();
location.reload();
```

Then log in with Google (adar@bahar.co.il) and try the admin page again.

**Why this works:** You'll get a new token signed with the current `JWT_SECRET` that the backend is using.

---

## If That Doesn't Work

**Check the backend `.env` file:**

```bash
# On server
cd /path/to/fantasybroker/backend
cat .env | grep JWT_SECRET

# Should show:
# JWT_SECRET=<some-long-random-string>

# If missing or shows 'changeme-in-env', set a proper secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output and add to .env:
# JWT_SECRET=<paste-here>

# Restart backend
pm2 restart portfolio-tracker-backend

# Then clear localStorage and log in again
```

---

## Summary

1. **Run the test script** above in browser console
2. **Check the results** - likely shows 401 with valid token
3. **Check backend logs** - likely shows "JWT verification failed: invalid signature"
4. **Clear localStorage** and log in again
5. **If still fails** - check/set JWT_SECRET in backend .env file

The token is valid on the frontend, but the backend can't verify it because the JWT_SECRET doesn't match. Getting a new token should fix it! 🚀

