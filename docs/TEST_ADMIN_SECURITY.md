# Admin Security Testing Guide

## Fixed Issues

✅ **Fixed double `/api/api/` in admin.js URLs**
- Changed: `${config.apiUrl}/api/admin/users` → `${config.apiUrl}/admin/users`
- Fixed in 3 places: loadUsers(), viewLogs(), toggleAdmin()

✅ **Swagger/OpenAPI documentation already complete**
- All 3 admin endpoints documented in `backend/openapi.json`
- Tagged as "Admin" with security requirements
- Accessible at: https://www.bahar.co.il/fantasybroker-api/api/docs

✅ **Admin middleware properly configured**
- `requireAdmin` middleware blocks non-admin users with 403
- Applied to all admin routes in `backend/src/app.js` line 62

---

## Security Verification Tests

### Test 1: Unauthenticated Access (No Token)

**Test all three admin endpoints without authentication:**

```bash
# List users
curl -X GET https://www.bahar.co.il/fantasybroker-api/api/admin/users

# Expected: {"error":"No token provided"} (401)

# Get user logs
curl -X GET https://www.bahar.co.il/fantasybroker-api/api/admin/users/1/logs

# Expected: {"error":"No token provided"} (401)

# Update admin status
curl -X PATCH https://www.bahar.co.il/fantasybroker-api/api/admin/users/1/admin \
  -H "Content-Type: application/json" \
  -d '{"isAdmin": true}'

# Expected: {"error":"No token provided"} (401)
```

**Result:** ✅ Should return 401 Unauthorized

---

### Test 2: Non-Admin User Access (Valid Token, Not Admin)

**Prerequisites:**
1. Create a non-admin user in the database
2. Log in as that user to get a JWT token
3. Copy the token from localStorage

**Test with non-admin token:**

```bash
# Replace YOUR_NON_ADMIN_TOKEN with actual token
TOKEN="YOUR_NON_ADMIN_TOKEN"

# List users
curl -X GET https://www.bahar.co.il/fantasybroker-api/api/admin/users \
  -H "Authorization: Bearer $TOKEN"

# Expected: {"error":"Admin privileges required"} (403)

# Get user logs
curl -X GET https://www.bahar.co.il/fantasybroker-api/api/admin/users/1/logs \
  -H "Authorization: Bearer $TOKEN"

# Expected: {"error":"Admin privileges required"} (403)

# Update admin status
curl -X PATCH https://www.bahar.co.il/fantasybroker-api/api/admin/users/1/admin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isAdmin": true}'

# Expected: {"error":"Admin privileges required"} (403)
```

**Result:** ✅ Should return 403 Forbidden

---

### Test 3: Admin User Access (Valid Token, Is Admin)

**Prerequisites:**
1. Log in as admin user (adar@bahar.co.il)
2. Copy the token from localStorage

**Test with admin token:**

```bash
# Replace YOUR_ADMIN_TOKEN with actual token
TOKEN="YOUR_ADMIN_TOKEN"

# List users
curl -X GET https://www.bahar.co.il/fantasybroker-api/api/admin/users \
  -H "Authorization: Bearer $TOKEN"

# Expected: {"users":[...]} (200)

# Get user logs
curl -X GET https://www.bahar.co.il/fantasybroker-api/api/admin/users/2/logs \
  -H "Authorization: Bearer $TOKEN"

# Expected: {"user":{...},"logs":[...]} (200)

# Update admin status (grant)
curl -X PATCH https://www.bahar.co.il/fantasybroker-api/api/admin/users/3/admin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isAdmin": true}'

# Expected: {"message":"Admin status updated successfully","user":{...}} (200)
```

**Result:** ✅ Should return 200 OK with data

---

### Test 4: Self-Admin Removal Prevention

**Test that admins cannot remove their own admin status:**

```bash
# Replace YOUR_ADMIN_TOKEN and YOUR_USER_ID
TOKEN="YOUR_ADMIN_TOKEN"
USER_ID="2"  # Your own user ID

curl -X PATCH https://www.bahar.co.il/fantasybroker-api/api/admin/users/$USER_ID/admin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isAdmin": false}'

# Expected: {"error":"Cannot remove your own admin privileges"} (400)
```

**Result:** ✅ Should return 400 Bad Request

---

## Browser Testing

### Test 5: Non-Admin User UI Access

1. **Create a non-admin test user:**
   ```sql
   INSERT INTO users (email, name, auth_provider, is_admin, status)
   VALUES ('test@example.com', 'Test User', 'google', FALSE, 'active');
   ```

2. **Log in as non-admin user** (you'll need to temporarily modify the auth to allow this)

3. **Verify UI restrictions:**
   - ❌ No admin badge (⭐) next to avatar
   - ❌ No "Admin Page" link under name
   - ❌ Cannot access `/fantasybroker/admin.html` (should redirect to index.html)

4. **Try to access admin page directly:**
   - Navigate to: https://www.bahar.co.il/fantasybroker/admin.html
   - Expected: Alert "Access denied. Admin privileges required."
   - Expected: Redirect to `/fantasybroker/index.html`

---

## Swagger UI Testing

### Test 6: Swagger Documentation

1. **Access Swagger UI:**
   - Navigate to: https://www.bahar.co.il/fantasybroker-api/api/docs

2. **Verify admin endpoints are documented:**
   - Look for "Admin" tag/section
   - Should see 3 endpoints:
     - `GET /api/admin/users` - List all users (Admin only)
     - `GET /api/admin/users/{id}/logs` - Get user audit logs (Admin only)
     - `PATCH /api/admin/users/{id}/admin` - Update user admin status (Admin only)

3. **Verify security requirements:**
   - Each endpoint should show 🔒 lock icon
   - Click "Authorize" button
   - Enter admin JWT token
   - Try the endpoints - should work

4. **Test without authorization:**
   - Click "Authorize" and logout
   - Try the endpoints - should return 401

---

## Security Checklist

- [x] **Backend middleware** - `requireAdmin` blocks non-admin users
- [x] **Route protection** - All admin routes use `authenticateToken` + `requireAdmin`
- [x] **Frontend protection** - Admin page checks `user.isAdmin` on load
- [x] **UI visibility** - Admin badge/link only shown to admin users
- [x] **Self-removal prevention** - Admins cannot remove their own admin status
- [x] **API documentation** - All admin endpoints documented in Swagger
- [x] **Security tags** - Endpoints marked with BearerAuth requirement
- [x] **Logging** - Admin access attempts logged (see `adminMiddleware.js`)

---

## Expected Behavior Summary

| User Type | Token | Endpoint Access | UI Access | Expected Result |
|-----------|-------|----------------|-----------|-----------------|
| No auth | None | Admin API | Admin page | 401 Unauthorized |
| Non-admin | Valid | Admin API | Admin page | 403 Forbidden / Redirect |
| Admin | Valid | Admin API | Admin page | 200 OK / Full access |
| Admin | Valid | Remove own admin | N/A | 400 Bad Request |

---

## How to Get JWT Token for Testing

### From Browser (Logged In)

1. Open DevTools (F12)
2. Go to Application tab → Local Storage
3. Find `portfolio_auth_token`
4. Copy the value (this is your JWT token)

### Decode Token to Verify Admin Status

1. Go to https://jwt.io
2. Paste your token
3. Check the payload for `"isAdmin": true` or `"isAdmin": false`

---

## Next Steps After Testing

1. ✅ Deploy the fixed `scripts/admin.js` to production
2. ✅ Clear browser cache and hard refresh
3. ✅ Log out and log back in to get fresh token
4. ✅ Test admin page functionality
5. ✅ Run security tests above to verify protection
6. ✅ Update PROJECT_HISTORY.md with fix details

---

## Files Changed

- ✅ `scripts/admin.js` - Fixed double `/api/api/` in URLs (3 places)

## Files Already Correct

- ✅ `backend/src/utils/adminMiddleware.js` - Properly blocks non-admin users
- ✅ `backend/src/routes/adminRoutes.js` - Routes defined correctly
- ✅ `backend/src/app.js` - Middleware applied correctly
- ✅ `backend/openapi.json` - All endpoints documented
- ✅ `admin.html` - Frontend checks admin status

