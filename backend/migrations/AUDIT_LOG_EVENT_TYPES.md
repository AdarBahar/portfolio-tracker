# User Audit Log Event Types

## Overview

This document defines all event types that should be logged in the `user_audit_log` table.

---

## 📋 Event Type Categories

### 1. **Account Lifecycle Events**

| Event Type | Description | Previous Value | New Value |
|------------|-------------|----------------|-----------|
| `user_created` | New user account created | `null` | `{ email, auth_provider }` |
| `user_invited` | User invitation sent | `null` | `{ email, invited_by }` |
| `user_registered` | User completed registration | `{ status: 'invited' }` | `{ status: 'pending_verification' }` |
| `email_verified` | Email verification completed | `{ status: 'pending_verification' }` | `{ status: 'active' }` |
| `account_deleted` | User account soft deleted | `{ status: 'active' }` | `{ status: 'deleted', deleted_at }` |
| `account_restored` | Soft deleted account restored | `{ status: 'deleted' }` | `{ status: 'active' }` |

### 2. **Status Change Events**

| Event Type | Description | Previous Value | New Value |
|------------|-------------|----------------|-----------|
| `status_changed` | User status changed | `{ status: 'active' }` | `{ status: 'suspended' }` |
| `account_suspended` | Account suspended | `{ status: 'active' }` | `{ status: 'suspended' }` |
| `account_reactivated` | Suspended account reactivated | `{ status: 'suspended' }` | `{ status: 'active' }` |
| `account_archived` | Account archived | `{ status: 'inactive' }` | `{ status: 'archived' }` |

### 3. **Authentication Events**

| Event Type | Description | Previous Value | New Value |
|------------|-------------|----------------|-----------|
| `login_success` | Successful login | `null` | `{ ip_address, user_agent }` |
| `login_failed` | Failed login attempt | `null` | `{ reason, ip_address }` |
| `logout` | User logged out | `null` | `{ session_duration }` |
| `password_reset_requested` | Password reset requested | `null` | `{ email }` |
| `password_reset_completed` | Password reset completed | `null` | `{ reset_token_used }` |
| `password_changed` | Password changed by user | `null` | `{ changed_by: 'user' }` |
| `token_refreshed` | OAuth token refreshed | `null` | `{ provider: 'google' }` |

### 4. **Profile Events**

| Event Type | Description | Previous Value | New Value |
|------------|-------------|----------------|-----------|
| `profile_updated` | User profile updated | `{ name: 'Old Name' }` | `{ name: 'New Name' }` |
| `email_changed` | Email address changed | `{ email: 'old@example.com' }` | `{ email: 'new@example.com' }` |
| `profile_picture_updated` | Profile picture changed | `{ url: 'old.jpg' }` | `{ url: 'new.jpg' }` |

### 5. **Security Events**

| Event Type | Description | Previous Value | New Value |
|------------|-------------|----------------|-----------|
| `suspicious_activity` | Suspicious activity detected | `null` | `{ reason, ip_address }` |
| `account_locked` | Account locked due to security | `{ status: 'active' }` | `{ status: 'suspended', reason: 'security' }` |
| `2fa_enabled` | Two-factor auth enabled | `{ 2fa: false }` | `{ 2fa: true }` |
| `2fa_disabled` | Two-factor auth disabled | `{ 2fa: true }` | `{ 2fa: false }` |

### 6. **Role & Permission Events**

| Event Type | Description | Previous Value | New Value |
|------------|-------------|----------------|-----------|
| `role_changed` | User role changed | `{ role: 'user' }` | `{ role: 'admin' }` |
| `permission_granted` | Permission granted | `null` | `{ permission: 'manage_users' }` |
| `permission_revoked` | Permission revoked | `{ permission: 'manage_users' }` | `null` |

### 7. **Data Events**

| Event Type | Description | Previous Value | New Value |
|------------|-------------|----------------|-----------|
| `data_exported` | User data exported | `null` | `{ format: 'csv', records: 150 }` |
| `data_imported` | User data imported | `null` | `{ format: 'csv', records: 50 }` |
| `gdpr_request` | GDPR data request | `null` | `{ request_type: 'export' }` |

### 8. **Bull Pen Events**

| Event Type | Description | Previous Value | New Value |
|------------|-------------|----------------|-----------|
| `bull_pen_created` | User created a Bull Pen | `null` | `{ bull_pen_id, name }` |
| `bull_pen_joined` | User joined a Bull Pen | `null` | `{ bull_pen_id, role: 'player' }` |
| `bull_pen_left` | User left a Bull Pen | `{ bull_pen_id }` | `null` |
| `bull_pen_kicked` | User kicked from Bull Pen | `{ status: 'active' }` | `{ status: 'kicked' }` |

---

## 💡 Usage Examples

### Example 1: User Registration

```javascript
await logUserEvent({
  userId: newUser.id,
  eventType: 'user_registered',
  previousValue: null,
  newValue: { 
    email: newUser.email, 
    auth_provider: 'google',
    status: 'pending_verification'
  },
  triggeredByType: 'user',
  triggeredById: newUser.id,
  ipAddress: req.ip
});
```

### Example 2: Admin Suspends User

```javascript
await logUserEvent({
  userId: targetUser.id,
  eventType: 'account_suspended',
  previousValue: { status: 'active' },
  newValue: { status: 'suspended' },
  reason: 'Policy violation: spam detected in Bull Pen chat',
  triggeredByType: 'admin',
  triggeredById: adminUser.id,
  ipAddress: req.ip
});
```

### Example 3: Failed Login

```javascript
await logUserEvent({
  userId: user.id,
  eventType: 'login_failed',
  previousValue: null,
  newValue: { 
    reason: 'Invalid password',
    attempt_count: 3,
    ip_address: req.ip
  },
  triggeredByType: 'user',
  triggeredById: user.id,
  ipAddress: req.ip
});
```

### Example 4: Profile Update

```javascript
await logUserEvent({
  userId: user.id,
  eventType: 'profile_updated',
  previousValue: { 
    name: user.name,
    profile_picture: user.profile_picture
  },
  newValue: { 
    name: updatedName,
    profile_picture: updatedPicture
  },
  triggeredByType: 'user',
  triggeredById: user.id,
  ipAddress: req.ip
});
```

---

## 🔍 Querying Audit Logs

### Get All Events for a User

```sql
SELECT 
  event_type,
  previous_value,
  new_value,
  reason,
  triggered_by_type,
  created_at
FROM user_audit_log
WHERE user_id = ?
ORDER BY created_at DESC;
```

### Get Security Events

```sql
SELECT 
  u.email,
  ual.event_type,
  ual.new_value,
  ual.ip_address,
  ual.created_at
FROM user_audit_log ual
JOIN users u ON ual.user_id = u.id
WHERE ual.event_type IN ('login_failed', 'suspicious_activity', 'account_locked')
ORDER BY ual.created_at DESC;
```

### Track Status Changes Over Time

```sql
SELECT 
  u.email,
  ual.previous_value->>'$.status' as old_status,
  ual.new_value->>'$.status' as new_status,
  ual.reason,
  ual.created_at
FROM user_audit_log ual
JOIN users u ON ual.user_id = u.id
WHERE ual.event_type = 'status_changed'
ORDER BY ual.created_at DESC;
```

---

## ✅ Best Practices

1. **Always log user-initiated actions** - Login, logout, profile changes
2. **Always log admin actions** - Status changes, suspensions, role changes
3. **Include IP address for security events** - Login attempts, suspicious activity
4. **Use descriptive reasons** - Help future debugging and audits
5. **Never delete audit logs** - Keep for compliance and debugging
6. **Use JSON for complex data** - Store structured data in previous_value/new_value
7. **Index frequently queried fields** - user_id, event_type, created_at

---

## 🚀 Implementation Checklist

- [ ] Create `logUserEvent()` helper function
- [ ] Add audit logging to user registration
- [ ] Add audit logging to authentication (login/logout)
- [ ] Add audit logging to status changes
- [ ] Add audit logging to profile updates
- [ ] Add audit logging to admin actions
- [ ] Add audit logging to security events
- [ ] Test audit log queries
- [ ] Create admin dashboard for viewing audit logs

