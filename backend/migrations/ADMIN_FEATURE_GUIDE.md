# Admin Feature Implementation Guide

## Overview

This guide documents the implementation of the `isAdmin` flag feature for the Portfolio Tracker application.

## Feature Description

The `isAdmin` flag allows certain users to have elevated privileges within the application. Admin users can:

1. **Access admin pages** - View and interact with administrative interfaces (to be built)
2. **Manage admin privileges** - Assign or remove admin status from other users

## Database Changes

### Schema Update

Added `is_admin` column to the `users` table:

```sql
is_admin BOOLEAN DEFAULT FALSE COMMENT 'TRUE for admin users with elevated privileges'
```

### Migration

To apply this change to an existing database, run:

```bash
mysql -u [username] -p [database_name] < backend/migrations/add-is-admin-column.sql
```

Or manually execute:

```sql
ALTER TABLE users 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE 
COMMENT 'TRUE for admin users with elevated privileges';

CREATE INDEX idx_users_is_admin ON users(is_admin);
```

### Rollback

To rollback this change:

```bash
mysql -u [username] -p [database_name] < backend/migrations/rollback-is-admin-column.sql
```

## Backend Changes

### 1. Auth Controller (`backend/src/controllers/authController.js`)

**Updated `buildUserResponse()` function:**
- Now includes `isAdmin: !!dbUser.is_admin` in the user response object

**Updated database queries:**
- Added `is_admin` to SELECT statements when fetching user data
- Ensures `is_admin` is included when creating new users (defaults to FALSE)

**Updated JWT token payload:**
- Added `isAdmin: !!dbUser.is_admin` to the JWT token payload
- This allows middleware to check admin status without additional database queries

### 2. Database Schema (`schema.mysql.sql`)

**Updated users table:**
- Added `is_admin` column in the Metadata section
- Added index `idx_users_is_admin` for efficient admin lookups

## Frontend Changes

### User Class (`scripts/auth.js`)

**Updated `User` class:**
- Added `isAdmin` property to constructor
- Added `isAdmin` to `toJSON()` method for proper serialization
- The property is automatically populated from the backend response

**Usage in frontend:**
```javascript
const user = authManager.getUser();
if (user && user.isAdmin) {
    // Show admin UI elements
    // Enable admin features
}
```

## API Response Format

### Authentication Response

When a user logs in via Google OAuth (`POST /api/auth/google`), the response now includes:

```json
{
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "profilePicture": "https://...",
    "authProvider": "google",
    "isDemo": false,
    "isAdmin": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### JWT Token Payload

The JWT token now includes the `isAdmin` field:

```json
{
  "id": 123,
  "email": "user@example.com",
  "authProvider": "google",
  "isDemo": false,
  "isAdmin": false,
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Making a User an Admin

To grant admin privileges to a user, update the database directly:

```sql
-- Make a user an admin by email
UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';

-- Make a user an admin by ID
UPDATE users SET is_admin = TRUE WHERE id = 123;

-- Remove admin privileges
UPDATE users SET is_admin = FALSE WHERE email = 'user@example.com';
```

**Note:** In the future, this should be done through an admin UI that checks if the current user has admin privileges.

## Security Considerations

1. **Backend Validation Required**: Always validate admin status on the backend for any admin-only operations
2. **JWT Token**: The `isAdmin` flag in the JWT token should be trusted only after proper token verification
3. **Frontend UI**: The frontend can use `isAdmin` to show/hide UI elements, but all admin operations must be protected on the backend
4. **Middleware**: Create admin-only middleware for routes that require admin access:

```javascript
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
```

## Future Enhancements

1. **Admin Dashboard**: Build admin pages for user management
2. **Admin API Endpoints**: Create endpoints for managing users and admin privileges
3. **Audit Log**: Track admin actions for security and compliance
4. **Role-Based Access Control (RBAC)**: Extend beyond simple admin flag to support multiple roles
5. **Admin Invitation System**: Allow admins to invite other admins via email

## Testing

### Manual Testing

1. **Create a test admin user:**
   ```sql
   UPDATE users SET is_admin = TRUE WHERE email = 'test@example.com';
   ```

2. **Login with the admin user** and verify:
   - The API response includes `"isAdmin": true`
   - The JWT token payload includes `"isAdmin": true`
   - The frontend `User` object has `isAdmin: true`

3. **Login with a non-admin user** and verify:
   - The API response includes `"isAdmin": false`
   - The JWT token payload includes `"isAdmin": false`
   - The frontend `User` object has `isAdmin: false`

### Automated Testing

Add tests to verify:
- Database migration applies correctly
- Auth controller returns `isAdmin` field
- JWT token includes `isAdmin` field
- Frontend User class properly stores `isAdmin` property

## Documentation Updates

The following documentation files have been updated:

1. `schema.mysql.sql` - Added `is_admin` column and index
2. `docs/DATABASE_SCHEMA.md` - Added `is_admin` field documentation
3. `DATABASE_SCHEMA_SUMMARY.md` - Added `is_admin` to field list
4. `backend/src/controllers/authController.js` - Updated to include `isAdmin`
5. `scripts/auth.js` - Updated User class to include `isAdmin`

## Deployment Checklist

- [ ] Backup database before migration
- [ ] Apply migration: `mysql -u user -p database < backend/migrations/add-is-admin-column.sql`
- [ ] Verify migration: `DESCRIBE users;` (should show `is_admin` column)
- [ ] Deploy backend code with updated auth controller
- [ ] Deploy frontend code with updated User class
- [ ] Test login flow with admin and non-admin users
- [ ] Verify JWT tokens include `isAdmin` field
- [ ] Create initial admin user(s) if needed
- [ ] Monitor logs for any errors

## Support

For questions or issues related to the admin feature, please refer to:
- Database schema: `schema.mysql.sql`
- Migration files: `backend/migrations/add-is-admin-column.sql`
- Auth controller: `backend/src/controllers/authController.js`
- Frontend auth: `scripts/auth.js`

