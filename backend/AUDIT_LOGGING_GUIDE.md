# Audit Logging System Guide

## Overview

The audit logging system provides centralized, consistent logging of all user-related events to the `user_audit_log` table. This is essential for:

- **Security monitoring** - Track login attempts, privilege changes, suspicious activity
- **Compliance** - Meet regulatory requirements (GDPR, SOC2, etc.)
- **Debugging** - Investigate user issues and trace actions
- **Analytics** - Understand user behavior and system usage

## Architecture

### Centralized Utility Approach

The system uses a **centralized utility module** (`backend/src/utils/auditLog.js`) rather than an API endpoint. This provides:

✅ **Simplicity** - Single function call to log events  
✅ **Performance** - Direct database writes, no HTTP overhead  
✅ **Reliability** - No network failures, no authentication issues  
✅ **Consistency** - All logs follow the same format  
✅ **Graceful degradation** - Logging failures don't crash the app  

## Usage

### Basic Example

```javascript
const auditLog = require('../utils/auditLog');

// Log an event
await auditLog.log({
  userId: req.user.id,
  eventType: 'login_success',
  eventCategory: 'authentication',
  description: 'User logged in successfully',
  req  // Express request object (for IP and user agent extraction)
});
```

### With Previous/New Values

```javascript
await auditLog.log({
  userId: targetUserId,
  eventType: 'admin_privilege_granted',
  eventCategory: 'admin',
  description: `Admin privileges granted by ${req.user.email}`,
  req,
  previousValues: { is_admin: false },
  newValues: { is_admin: true, changed_by: req.user.email }
});
```

### Manual IP and User Agent

```javascript
await auditLog.log({
  userId: user.id,
  eventType: 'password_changed',
  eventCategory: 'security',
  description: 'User changed their password',
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
  newValues: { changed_by: 'user' }
});
```

## API Reference

### `auditLog.log(options)`

Writes an audit log entry to the database.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | number | ✅ Yes | User ID who performed the action |
| `eventType` | string | ✅ Yes | Event type (e.g., `login_success`, `admin_privilege_granted`) |
| `eventCategory` | string | ✅ Yes | Category: `authentication`, `admin`, `profile`, `security`, `account` |
| `description` | string | No | Human-readable description of the event |
| `req` | object | No | Express request object (auto-extracts IP and user agent) |
| `ipAddress` | string | No | IP address (auto-extracted from `req` if not provided) |
| `userAgent` | string | No | User agent (auto-extracted from `req` if not provided) |
| `previousValues` | object | No | Previous values before change (will be JSON stringified) |
| `newValues` | object | No | New values after change (will be JSON stringified) |

**Returns:** `Promise<void>`

**Error Handling:** Logs errors but never throws - graceful degradation ensures audit logging failures don't crash the app.

### `auditLog.extractIpAddress(req)`

Extracts IP address from Express request, handling proxies and load balancers.

**Checks in order:**
1. `X-Forwarded-For` header (takes first IP)
2. `X-Real-IP` header (nginx proxy)
3. `req.ip` (Express default)

**Returns:** `string` - IP address (IPv4 or IPv6)

### `auditLog.extractUserAgent(req)`

Extracts user agent from Express request headers.

**Returns:** `string` - User agent string or `'unknown'`

## Event Types

See [`backend/migrations/AUDIT_LOG_EVENT_TYPES.md`](./migrations/AUDIT_LOG_EVENT_TYPES.md) for complete list of 234+ event types.

### Common Event Types

**Authentication:**
- `login_success` - Successful login
- `login_failed` - Failed login attempt
- `logout` - User logged out

**Account:**
- `user_created` - New user account created
- `account_deleted` - Account soft deleted
- `status_changed` - User status changed

**Admin:**
- `admin_privilege_granted` - Admin privileges granted
- `admin_privilege_revoked` - Admin privileges revoked

**Profile:**
- `profile_updated` - User profile updated
- `email_changed` - Email address changed

**Security:**
- `suspicious_activity` - Suspicious activity detected
- `account_locked` - Account locked due to security

## Implementation Examples

### Example 1: Login Event (authController.js)

```javascript
await auditLog.log({
  userId: dbUser.id,
  eventType: 'login_success',
  eventCategory: 'authentication',
  description: 'User logged in successfully via Google OAuth',
  req,
  newValues: { 
    auth_provider: 'google',
    email: dbUser.email
  }
});
```

### Example 2: Failed Login (authController.js)

```javascript
await auditLog.log({
  userId: dbUser.id,
  eventType: 'login_failed',
  eventCategory: 'authentication',
  description: `Login attempt failed: account status is ${dbUser.status}`,
  req,
  newValues: {
    reason: `account_${dbUser.status}`,
    email: dbUser.email
  }
});
```

### Example 3: Admin Privilege Change (adminController.js)

```javascript
// Log for target user
await auditLog.log({
  userId: parseInt(userId),
  eventType: isAdmin ? 'admin_privilege_granted' : 'admin_privilege_revoked',
  eventCategory: 'admin',
  description: `Admin privileges ${isAdmin ? 'granted' : 'revoked'} by ${req.user.email}`,
  req,
  previousValues: { is_admin: previousIsAdmin },
  newValues: { is_admin: isAdmin, changed_by: req.user.email }
});

// Log for admin who made the change
await auditLog.log({
  userId: req.user.id,
  eventType: isAdmin ? 'admin_privilege_granted' : 'admin_privilege_revoked',
  eventCategory: 'admin',
  description: `Granted admin privileges for user ${targetUser.email}`,
  req,
  newValues: {
    target_user_id: parseInt(userId),
    target_user_email: targetUser.email,
    is_admin: isAdmin
  }
});
```

## Current Implementation Status

### ✅ Implemented

- **Audit Log Utility** (`backend/src/utils/auditLog.js`)
  - Core logging function with graceful error handling
  - IP address extraction (handles proxies and load balancers)
  - User agent extraction
  - JSON serialization for previous/new values

- **Authentication Events** (`backend/src/controllers/authController.js`)
  - `login_success` - Successful Google OAuth login
  - `login_failed` - Failed login due to account status
  - `user_created` - New user registration via Google OAuth

- **Admin Events** (`backend/src/controllers/adminController.js`)
  - `admin_privilege_granted` - Admin status granted
  - `admin_privilege_revoked` - Admin status removed
  - Dual logging (target user + admin who made change)

### 🔄 Future Enhancements

- **Profile Events** - Log profile updates, email changes, picture updates
- **Security Events** - Log suspicious activity, account locks, 2FA changes
- **Bull Pen Events** - Log room creation, joins, leaves, kicks
- **Data Events** - Log data exports, imports, GDPR requests
- **Automatic Request Logging** - Middleware to log all API requests
- **Batching** - Batch multiple log entries for high-volume events
- **Retention Policy** - Automatic cleanup of old audit logs
- **Alerting** - Send notifications for suspicious activity

## Best Practices

### 1. Always Use `req` Parameter

Pass the Express request object to automatically extract IP and user agent:

```javascript
// ✅ Good - automatic extraction
await auditLog.log({ userId, eventType, eventCategory, req });

// ❌ Avoid - manual extraction
await auditLog.log({
  userId,
  eventType,
  eventCategory,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});
```

### 2. Provide Descriptive Messages

Include context in the description field:

```javascript
// ✅ Good - clear context
description: `Admin privileges granted by ${req.user.email}`

// ❌ Avoid - vague
description: 'Admin change'
```

### 3. Log Both Sides of Admin Actions

When an admin performs an action on another user, log for both:

```javascript
// Log for target user
await auditLog.log({ userId: targetUserId, ... });

// Log for admin
await auditLog.log({ userId: req.user.id, ... });
```

### 4. Use Appropriate Event Categories

Choose the correct category for filtering and organization:

- `authentication` - Login, logout, token refresh
- `admin` - Admin privilege changes, user management
- `profile` - Profile updates, email changes
- `security` - Suspicious activity, locks, 2FA
- `account` - User creation, deletion, status changes

### 5. Include Relevant Data in Values

Store useful context in `previousValues` and `newValues`:

```javascript
previousValues: { is_admin: false, status: 'active' },
newValues: { is_admin: true, changed_by: 'admin@example.com' }
```

## Viewing Audit Logs

### Admin Panel

Admins can view user audit logs through the admin panel:

1. Navigate to `/admin.html`
2. Click "Logs" button next to any user
3. View detailed audit log entries with:
   - Event type and category
   - Description
   - IP address and user agent
   - Previous/new values
   - Timestamp

### API Endpoint

```
GET /api/admin/users/:id/logs
Authorization: Bearer <admin_token>
```

Returns up to 1000 most recent audit log entries for the specified user.

## Database Schema

```sql
CREATE TABLE user_audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    previous_values JSON,
    new_values JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_audit_log_user_id (user_id),
    INDEX idx_user_audit_log_event_type (event_type),
    INDEX idx_user_audit_log_event_category (event_category),
    INDEX idx_user_audit_log_created_at (created_at),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Troubleshooting

### Audit Logs Not Appearing

1. **Check database table exists:**
   ```sql
   SHOW TABLES LIKE 'user_audit_log';
   ```

2. **Check for errors in backend logs:**
   ```bash
   tail -f /path/to/backend/logs
   ```

3. **Verify user ID is valid:**
   ```sql
   SELECT id FROM users WHERE id = ?;
   ```

### IP Address Shows as `::1`

This is normal for localhost (IPv6 loopback). In production, you'll see real IP addresses.

### User Agent Shows as `unknown`

The client didn't send a `User-Agent` header. This is rare but possible with API clients.

## Security Considerations

- **Immutable Logs** - Audit logs should never be modified or deleted (except by retention policy)
- **Access Control** - Only admins can view audit logs
- **Sensitive Data** - Don't log passwords, tokens, or other secrets in `previousValues`/`newValues`
- **IP Privacy** - Consider GDPR implications of storing IP addresses
- **Retention** - Define and implement a retention policy for compliance

## Performance

- **Indexes** - The table has indexes on `user_id`, `event_type`, `event_category`, and `created_at` for fast queries
- **Async Logging** - Consider making audit logging async for high-traffic endpoints
- **Batching** - For bulk operations, consider batching log entries
- **Cleanup** - Implement automatic cleanup of old logs to prevent table bloat

---

**Last Updated:** 2025-11-25
**Version:** 1.0.0
**Maintainer:** Portfolio Tracker Team

