# Backend Debugging for Missing isAdmin in JWT

## Problem
The JWT token does not contain the `isAdmin` field even though:
1. Database has `is_admin = 1` for the user
2. Code includes `isAdmin: !!dbUser.is_admin` in token payload (line 111)

## Most Likely Cause

**The backend server was not restarted after the code changes.**

The old version of `authController.js` did not include `isAdmin` in the JWT token payload. You need to restart the backend server to load the new code.

## Solution

### 1. Restart the Backend Server

**If using PM2:**
```bash
pm2 restart portfolio-tracker-backend
# or
pm2 restart all
```

**If using systemd:**
```bash
sudo systemctl restart portfolio-tracker-backend
```

**If running manually:**
```bash
# Kill the existing process
pkill -f "node.*backend"

# Start the backend again
cd /path/to/portfolio-tracker/backend
node src/app.js
# or
npm start
```

### 2. Verify Backend is Running New Code

Check the backend logs for the startup message. The new code should log:
```
[INFO] Admin routes registered at /api/admin
```

Or check if the admin routes are accessible:
```bash
# This should return 401 (not 404)
curl http://your-server:3000/api/admin/users
```

### 3. Test the Auth Endpoint

After restarting, test the Google auth endpoint to see what it returns:

**Check backend logs** when you log in - you should see the user data being fetched with `is_admin` field.

### 4. Log Out and Log Back In

After restarting the backend:
1. Log out from the application
2. Clear browser localStorage (F12 → Application → Local Storage → Clear All)
3. Log back in with Google
4. Check the new JWT token at https://jwt.io

The token should now include:
```json
{
  "id": 2,
  "email": "adar@bahar.co.il",
  "authProvider": "google",
  "isDemo": false,
  "isAdmin": true,  ← This should now be present
  "iat": 1764073697,
  "exp": 1764678497
}
```

---

## Alternative Debugging: Add Logging

If restarting doesn't work, add temporary logging to see what's happening:

### Edit `backend/src/controllers/authController.js`

Add logging after line 73 (after fetching the user):

```javascript
if (rows.length > 0) {
  dbUser = rows[0];
  
  // DEBUG: Log the user data
  console.log('DEBUG: User data from database:', {
    id: dbUser.id,
    email: dbUser.email,
    is_admin: dbUser.is_admin,
    is_admin_type: typeof dbUser.is_admin
  });
  
  // Check user status
  if (dbUser.status !== 'active') {
    // ...
```

And add logging before creating the token (after line 105):

```javascript
const tokenPayload = {
  id: dbUser.id,
  email: dbUser.email,
  authProvider: 'google',
  isDemo: !!dbUser.is_demo,
  isAdmin: !!dbUser.is_admin
};

// DEBUG: Log the token payload
console.log('DEBUG: Token payload:', tokenPayload);

const token = jwt.sign(tokenPayload, JWT_SECRET || 'changeme-in-env', {
  expiresIn: '7d'
});
```

Then:
1. Restart the backend
2. Log in via Google
3. Check the backend logs for the DEBUG messages
4. This will show you exactly what values are being used

---

## Check Deployment

Verify that the correct version of the code is deployed:

```bash
# Check the authController.js file on the server
grep -n "isAdmin: !!dbUser.is_admin" backend/src/controllers/authController.js

# Should show two lines:
# Line 36: in buildUserResponse
# Line 111: in tokenPayload
```

If these lines are not present, the code was not deployed correctly.

---

## MySQL Column Type Issue

In rare cases, MySQL might return `is_admin` as a Buffer or different type. Check the actual value:

```javascript
// Add this logging
console.log('is_admin raw value:', dbUser.is_admin);
console.log('is_admin type:', typeof dbUser.is_admin);
console.log('is_admin converted:', !!dbUser.is_admin);
```

Expected output:
```
is_admin raw value: 1
is_admin type: number
is_admin converted: true
```

If you see something different (like Buffer or string), we need to adjust the conversion.

---

## Quick Test Script

Create a test script to verify the database connection and query:

```javascript
// test-admin.js
const mysql = require('mysql2/promise');

async function test() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'portfolio_tracker'
  });

  const [rows] = await db.execute(
    'SELECT id, email, name, is_admin FROM users WHERE email = ?',
    ['adar@bahar.co.il']
  );

  console.log('User data:', rows[0]);
  console.log('is_admin value:', rows[0].is_admin);
  console.log('is_admin type:', typeof rows[0].is_admin);
  console.log('!!is_admin:', !!rows[0].is_admin);

  await db.end();
}

test().catch(console.error);
```

Run it:
```bash
cd backend
node test-admin.js
```

---

## Summary

**Most likely fix:** Restart the backend server and log out/in again.

If that doesn't work, add the DEBUG logging and check what values are actually being used.

