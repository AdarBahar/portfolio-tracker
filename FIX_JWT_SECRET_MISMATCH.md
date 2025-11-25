# Fix JWT Secret Mismatch - 401 Error

## Problem Identified

✅ **Token is valid** - Has `isAdmin: true`  
✅ **Frontend is correct** - Sending Authorization header  
✅ **Backend routes registered** - Request reaches the server  
❌ **Backend rejects token** - JWT verification fails  

**Root Cause:** The `JWT_SECRET` on the server doesn't match the secret used to sign your token.

---

## Why This Happens

When you log in, the backend creates a JWT token signed with `JWT_SECRET` from the `.env` file.

**Scenario 1: Backend was restarted with different JWT_SECRET**
- You logged in → Token signed with `JWT_SECRET=abc123`
- Backend restarted → Now using `JWT_SECRET=xyz789`
- Your token is still signed with `abc123` → Backend can't verify it ❌

**Scenario 2: JWT_SECRET not set in production**
- Development: Uses `JWT_SECRET` from `.env`
- Production: `.env` file missing or `JWT_SECRET` not set
- Backend falls back to default: `'changeme-in-env'`
- Your token was signed with a different secret → Backend can't verify it ❌

---

## Quick Fix

### Option 1: Just Log In Again (Simplest)

The backend is running now with a specific `JWT_SECRET`. Just get a new token:

1. **Clear localStorage:**
   ```javascript
   // In browser console (F12)
   localStorage.clear();
   location.reload();
   ```

2. **Log in again** with Google (adar@bahar.co.il)

3. **Try admin page** - Should work now!

**Why this works:** You'll get a new token signed with the current `JWT_SECRET`.

---

### Option 2: Check Backend Logs (Diagnostic)

The backend logs will show why JWT verification is failing.

**On the server:**

```bash
# If using PM2
pm2 logs portfolio-tracker-backend --lines 100

# If using systemd
journalctl -u portfolio-tracker-backend -n 100 -f

# If running directly
# Check wherever your logs are written
```

**Look for:**
```
JWT verification failed: invalid signature
JWT verification failed: jwt malformed
JWT verification failed: jwt expired
```

---

### Option 3: Verify JWT_SECRET is Set

**On the server:**

```bash
# Navigate to backend directory
cd /path/to/fantasybroker/backend

# Check if .env file exists
ls -la .env

# Check if JWT_SECRET is set (don't print the value!)
grep JWT_SECRET .env

# Should show something like:
# JWT_SECRET=your-secret-here-at-least-32-chars
```

**If .env file is missing:**

```bash
# Copy from example
cp .env.example .env

# Edit and set JWT_SECRET
nano .env
# or
vi .env
```

**Set a strong JWT_SECRET:**
```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and add to .env:
# JWT_SECRET=<paste-the-generated-secret-here>
```

**Restart backend:**
```bash
pm2 restart portfolio-tracker-backend
# or
sudo systemctl restart portfolio-tracker-backend
```

**Then clear localStorage and log in again.**

---

## Diagnostic Test

### Test 1: Check Authorization Header is Sent

**In browser (F12 → Network tab):**

1. Refresh admin page
2. Find the request: `admin/users`
3. Click on it
4. Go to "Headers" tab
5. Scroll to "Request Headers"

**Look for:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**If missing:** Frontend issue (but unlikely since token looks good)  
**If present:** Backend is rejecting it → JWT_SECRET mismatch

---

### Test 2: Test Token Directly with curl

**Get your token from localStorage:**

```javascript
// In browser console
console.log(localStorage.getItem('portfolio_auth_token'));
```

**Test on server:**

```bash
# Replace YOUR_TOKEN with the actual token
TOKEN="YOUR_TOKEN"

curl -X GET https://www.bahar.co.il/fantasybroker-api/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -v

# Look for the response:
# 401 → Backend rejects token (JWT_SECRET mismatch)
# 200 → Backend accepts token (different issue)
```

---

### Test 3: Check Backend Environment

**On the server:**

```bash
# Check if backend is using .env file
pm2 env 0  # Replace 0 with your app ID from pm2 list

# Look for JWT_SECRET in the output
# Should NOT be 'changeme-in-env'
```

---

## Common Scenarios

### Scenario 1: First Time Deployment

**You just deployed the admin feature.**

**Problem:** `.env` file not created on server

**Solution:**
1. Create `.env` file in `backend/` directory
2. Set `JWT_SECRET` to a strong random value
3. Restart backend
4. Clear localStorage and log in again

---

### Scenario 2: Backend Restarted

**Backend was restarted and JWT_SECRET changed.**

**Problem:** Your token was signed with old secret

**Solution:**
1. Just clear localStorage and log in again
2. No need to change anything on server

---

### Scenario 3: Multiple Backend Instances

**You have multiple backend instances with different secrets.**

**Problem:** Load balancer sends requests to different instances

**Solution:**
1. Ensure all instances use the same `JWT_SECRET`
2. Use a shared `.env` file or environment variable
3. Restart all instances
4. Clear localStorage and log in again

---

## Step-by-Step Fix

### Step 1: Check Backend Logs

```bash
# On server
pm2 logs portfolio-tracker-backend --lines 50
```

**Look for:** `JWT verification failed: <reason>`

---

### Step 2: Verify .env File

```bash
# On server
cd /path/to/fantasybroker/backend
cat .env | grep JWT_SECRET
```

**Expected:** `JWT_SECRET=<some-long-random-string>`  
**If missing or 'changeme-in-env':** Set a proper secret

---

### Step 3: Set JWT_SECRET (if needed)

```bash
# Generate secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
echo "JWT_SECRET=<paste-generated-secret>" >> .env

# Restart backend
pm2 restart portfolio-tracker-backend
```

---

### Step 4: Get New Token

```javascript
// In browser console
localStorage.clear();
location.reload();
```

Then log in again.

---

### Step 5: Test Admin Page

1. Log in with adar@bahar.co.il
2. Verify admin badge appears
3. Click "Admin Page"
4. Should load without 401 error

---

## Quick Diagnostic Script

**Run this on the server to check everything:**

```bash
#!/bin/bash
echo "=== Backend Diagnostic ==="

# Check if backend is running
echo "1. Backend status:"
pm2 status | grep portfolio-tracker-backend

# Check .env file
echo -e "\n2. .env file exists:"
ls -la /path/to/fantasybroker/backend/.env

# Check JWT_SECRET (don't print value)
echo -e "\n3. JWT_SECRET is set:"
grep -q JWT_SECRET /path/to/fantasybroker/backend/.env && echo "✅ Yes" || echo "❌ No"

# Check if using default secret
echo -e "\n4. Using default secret:"
grep "JWT_SECRET=changeme-in-env" /path/to/fantasybroker/backend/.env && echo "⚠️ Yes (BAD)" || echo "✅ No (Good)"

# Check recent logs
echo -e "\n5. Recent errors:"
pm2 logs portfolio-tracker-backend --lines 20 --nostream | grep -i "jwt\|error\|401"
```

---

## Expected Results After Fix

### ✅ Backend Logs (No Errors)
```
[Admin] Admin user 2 (adar@bahar.co.il) accessing admin endpoint
```

### ✅ Admin Page (Works)
- User list loads
- No 401 errors
- All features work

### ✅ Network Tab (200 OK)
```
GET /api/admin/users
Status: 200 OK
Response: {"users":[...]}
```

---

## Most Likely Solution

**Just clear localStorage and log in again:**

```javascript
// Browser console
localStorage.clear();
location.reload();
```

This will get you a new token signed with the current `JWT_SECRET`, and everything should work! 🚀

---

## If Still Not Working

**Share these details:**

1. **Backend logs** (last 50 lines with any JWT errors)
2. **Environment check:**
   ```bash
   # On server
   cd /path/to/fantasybroker/backend
   ls -la .env
   grep JWT_SECRET .env | wc -c  # Just the length, not the value
   ```
3. **PM2 status:**
   ```bash
   pm2 status
   pm2 env 0  # Replace 0 with your app ID
   ```

The issue is definitely a JWT_SECRET mismatch. Once we align the secrets, it will work! 🔍

