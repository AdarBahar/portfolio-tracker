# Debug Current State - 401 Error

## Quick Diagnostic

**Run this in browser console (F12) RIGHT NOW:**

```javascript
console.log('=== CURRENT STATE ===');
console.log('1. Token exists:', !!localStorage.getItem('portfolio_auth_token'));
console.log('2. User data:', localStorage.getItem('portfolio_user'));
console.log('3. Token expiry:', localStorage.getItem('portfolio_token_expiry'));

const token = localStorage.getItem('portfolio_auth_token');
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('4. Token payload:', payload);
    console.log('5. isAdmin:', payload.isAdmin);
    console.log('6. Expired:', Date.now() > payload.exp * 1000);
} else {
    console.log('❌ NO TOKEN - You are NOT logged in!');
}
```

---

## Most Likely Issue

**You cleared localStorage but didn't log back in!**

After clearing localStorage, you need to:
1. **Go to the main page:** https://www.bahar.co.il/fantasybroker/
2. **Log in with Google** (adar@bahar.co.il)
3. **Verify admin badge (⭐) appears**
4. **Then go to admin page**

---

## Step-by-Step Fix

### Step 1: Check if You're Logged In

**Look at the main page (https://www.bahar.co.il/fantasybroker/):**

- ✅ **Logged in:** You see your name, avatar, and "Logout" button
- ❌ **Not logged in:** You see "Login with Google" button

**If you're NOT logged in:**
1. Click "Login with Google"
2. Select adar@bahar.co.il
3. Wait for redirect back to main page
4. Verify admin badge (⭐) appears next to your avatar
5. Click "Admin Page" link

---

### Step 2: Verify Token After Login

**After logging in, run this in console:**

```javascript
const token = localStorage.getItem('portfolio_auth_token');
if (!token) {
    console.log('❌ Still no token - login failed');
} else {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('✅ Token exists');
    console.log('   Email:', payload.email);
    console.log('   isAdmin:', payload.isAdmin);
    console.log('   Expires:', new Date(payload.exp * 1000).toLocaleString());
    
    if (!payload.isAdmin) {
        console.log('❌ Token does NOT have isAdmin:true');
        console.log('   → Check database: is_admin should be TRUE');
        console.log('   → Check backend logs for errors');
    } else {
        console.log('✅ Token looks good!');
    }
}
```

---

### Step 3: Test Admin API

**After verifying token, test the API:**

```javascript
(async function() {
    const token = localStorage.getItem('portfolio_auth_token');
    if (!token) {
        console.log('❌ No token - cannot test API');
        return;
    }
    
    const response = await fetch('https://www.bahar.co.il/fantasybroker-api/api/admin/users', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
    
    if (response.status === 401) {
        console.log('❌ Backend rejected token');
        console.log('   → Check backend logs');
        console.log('   → Verify JWT_SECRET is correct');
    } else if (response.status === 200) {
        console.log('✅ API works!');
    }
})();
```

---

## Backend Logs Check

**On the server, watch the logs in real-time:**

```bash
tail -f /home/baharc5/logs/fantasybroker.log
```

**Then refresh the admin page in browser.**

**Look for:**

### Good (No Errors)
```
[Admin] Admin user 2 (adar@bahar.co.il) accessing admin endpoint
```

### Bad (JWT Error)
```
JWT verification failed: invalid signature
JWT verification failed: jwt malformed
JWT verification failed: jwt expired
```

### Bad (Auth Error)
```
Missing or invalid Authorization header
Invalid or expired token
```

---

## Common Issues

### Issue 1: Not Logged In

**Symptom:** No token in localStorage

**Solution:** Log in with Google

---

### Issue 2: Token Missing isAdmin

**Symptom:** Token exists but `isAdmin: false` or missing

**Cause:** Database `is_admin` not set to TRUE

**Solution:**
```sql
UPDATE users SET is_admin = TRUE WHERE email = 'adar@bahar.co.il';
```

Then log out and log back in.

---

### Issue 3: JWT_SECRET Still Wrong

**Symptom:** Token exists with `isAdmin: true`, but backend rejects it

**Cause:** JWT_SECRET mismatch between login time and verification time

**Debug:**
```bash
# On server
cd /home/baharc5/public_html/fantasybroker/backend

# Check JWT_SECRET (show length only)
grep JWT_SECRET .env | wc -c
# Should be > 80 (JWT_SECRET= + 64 chars + newline)

# Check for spaces
grep JWT_SECRET .env | grep " " && echo "❌ HAS SPACES" || echo "✅ NO SPACES"
```

**Solution:** Verify .env file, restart backend, clear localStorage, log in again

---

### Issue 4: Backend Not Restarted

**Symptom:** Changed .env but backend still using old secret

**Solution:**
```bash
# On server
cd /home/baharc5/public_html/fantasybroker/backend
touch tmp/restart.txt

# Wait 5 seconds
sleep 5

# Verify restart
tail -20 /home/baharc5/logs/fantasybroker.log | grep "listening on port"
# Should show recent timestamp
```

---

### Issue 5: Cached admin.js

**Symptom:** Admin page loads but uses old JavaScript

**Solution:**
```javascript
// Hard refresh
location.reload(true);

// Or clear cache
// Chrome: Ctrl+Shift+Delete → Clear cached images and files
```

---

## Complete Test Sequence

**Run this complete test:**

```javascript
(async function() {
    console.log('=== COMPLETE DIAGNOSTIC ===\n');
    
    // 1. Check localStorage
    const token = localStorage.getItem('portfolio_auth_token');
    const user = localStorage.getItem('portfolio_user');
    const expiry = localStorage.getItem('portfolio_token_expiry');
    
    console.log('1. LocalStorage:');
    console.log('   Token exists:', !!token);
    console.log('   User exists:', !!user);
    console.log('   Expiry exists:', !!expiry);
    
    if (!token) {
        console.log('\n❌ NO TOKEN - You need to log in!');
        console.log('   Go to: https://www.bahar.co.il/fantasybroker/');
        console.log('   Click "Login with Google"');
        return;
    }
    
    // 2. Decode token
    console.log('\n2. Token Details:');
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('   Email:', payload.email);
        console.log('   ID:', payload.id);
        console.log('   isAdmin:', payload.isAdmin);
        console.log('   Issued:', new Date(payload.iat * 1000).toLocaleString());
        console.log('   Expires:', new Date(payload.exp * 1000).toLocaleString());
        console.log('   Expired:', Date.now() > payload.exp * 1000);
        
        if (!payload.isAdmin) {
            console.log('\n❌ Token does NOT have isAdmin:true');
            console.log('   → Database is_admin should be TRUE');
            return;
        }
    } catch (e) {
        console.log('   ❌ Failed to decode token:', e.message);
        return;
    }
    
    // 3. Test API
    console.log('\n3. Testing API:');
    try {
        const response = await fetch('https://www.bahar.co.il/fantasybroker-api/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('   Status:', response.status, response.statusText);
        
        if (response.status === 401) {
            const error = await response.text();
            console.log('   Error:', error);
            console.log('\n❌ Backend rejected token');
            console.log('   → Check backend logs for JWT errors');
            console.log('   → Verify JWT_SECRET is correct');
            console.log('   → Backend may not be restarted');
        } else if (response.status === 200) {
            const data = await response.json();
            console.log('   Users:', data.users?.length || 0);
            console.log('\n✅ SUCCESS! API works!');
        } else {
            const text = await response.text();
            console.log('   Response:', text);
            console.log('\n⚠️ Unexpected status:', response.status);
        }
    } catch (e) {
        console.log('   ❌ Request failed:', e.message);
    }
    
    console.log('\n=== END DIAGNOSTIC ===');
})();
```

---

## Next Steps

1. **Run the complete diagnostic** above
2. **Share the output** if still getting 401
3. **Check backend logs** for JWT errors
4. **Verify you're logged in** (see your name on main page)

The most common issue at this point is either:
- Not logged in (no token)
- Backend not restarted (still using old JWT_SECRET)
- Database is_admin not set to TRUE

Run the diagnostic and we'll figure it out! 🔍

