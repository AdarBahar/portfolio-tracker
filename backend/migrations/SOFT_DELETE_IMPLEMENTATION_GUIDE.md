# Soft Delete & Status Implementation Guide

## Overview

This guide explains how to implement soft delete and status management in your application code after running the database migration.

---

## 🗄️ Database Changes Applied

### 1. **Soft Delete (deleted_at)**
All tables now have a `deleted_at DATETIME NULL` column:
- `users`, `holdings`, `dividends`, `transactions`
- `bull_pens`, `bull_pen_memberships`, `bull_pen_positions`, `bull_pen_orders`
- `leaderboard_snapshots`

### 2. **User Status**
Users now have a `status` column with these values:
- `active` - Can log in and use the product
- `inactive` - Exists but cannot log in
- `archived` - Permanently disabled, hidden from views
- `pending_verification` - Awaiting email/phone verification
- `invited` - Invitation sent, signup incomplete
- `suspended` - Policy violations or temporary blocks
- `deleted` - Soft deleted, retained for logs/audits

### 3. **Holdings Status**
Holdings now have a `status` column with these values:
- `active` - Currently held position
- `pending_settlement` - Trade executed but not settled (T+2)
- `locked` - Temporarily locked (transfer, legal hold)
- `archived` - Historical record, no longer active

### 4. **Audit Log**
New `user_audit_log` table tracks all user-related events.

---

## 📝 Code Changes Required

### 1. **Update All SELECT Queries**

**Before:**
```javascript
const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
```

**After (exclude soft deleted):**
```javascript
const [rows] = await db.execute(
  'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
  [userId]
);
```

**Or (include soft deleted):**
```javascript
const [rows] = await db.execute(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);
```

### 2. **Update DELETE Operations to Soft Delete**

**Before (hard delete):**
```javascript
await db.execute('DELETE FROM bull_pens WHERE id = ?', [bullPenId]);
```

**After (soft delete):**
```javascript
await db.execute(
  'UPDATE bull_pens SET deleted_at = NOW() WHERE id = ?',
  [bullPenId]
);
```

### 3. **Add Audit Logging for User Events**

Create a helper function:

```javascript
async function logUserEvent({
  userId,
  eventType,
  previousValue = null,
  newValue = null,
  reason = null,
  triggeredByType = 'system',
  triggeredById = null,
  ipAddress = null
}) {
  await db.execute(
    `INSERT INTO user_audit_log 
     (user_id, event_type, previous_value, new_value, reason, 
      triggered_by_type, triggered_by_id, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      eventType,
      previousValue ? JSON.stringify(previousValue) : null,
      newValue ? JSON.stringify(newValue) : null,
      reason,
      triggeredByType,
      triggeredById,
      ipAddress
    ]
  );
}
```

**Usage examples:**

```javascript
// User registration
await logUserEvent({
  userId: newUser.id,
  eventType: 'user_registered',
  newValue: { email: newUser.email, auth_provider: 'google' },
  triggeredByType: 'user',
  triggeredById: newUser.id,
  ipAddress: req.ip
});

// Status change
await logUserEvent({
  userId: user.id,
  eventType: 'status_changed',
  previousValue: { status: 'active' },
  newValue: { status: 'suspended' },
  reason: 'Policy violation: spam',
  triggeredByType: 'admin',
  triggeredById: adminUser.id,
  ipAddress: req.ip
});

// Login success
await logUserEvent({
  userId: user.id,
  eventType: 'login_success',
  triggeredByType: 'user',
  triggeredById: user.id,
  ipAddress: req.ip
});
```

### 4. **Add Status Checks to Authentication**

```javascript
async function authenticateUser(req, res) {
  const [rows] = await db.execute(
    'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL',
    [email]
  );
  
  const user = rows[0];
  if (!user) {
    return unauthorized(res, 'Invalid credentials');
  }
  
  // Check user status
  if (user.status !== 'active') {
    await logUserEvent({
      userId: user.id,
      eventType: 'login_failed',
      reason: `Account status: ${user.status}`,
      triggeredByType: 'user',
      triggeredById: user.id,
      ipAddress: req.ip
    });
    
    return forbidden(res, `Account is ${user.status}. Please contact support.`);
  }
  
  // Continue with authentication...
}
```

---

## 🔍 Common Query Patterns

### Exclude Soft Deleted Records (Default)

```javascript
// Single record
SELECT * FROM users WHERE id = ? AND deleted_at IS NULL

// List records
SELECT * FROM holdings WHERE user_id = ? AND deleted_at IS NULL

// With status filter
SELECT * FROM users WHERE status = 'active' AND deleted_at IS NULL
```

### Include Soft Deleted Records (Admin/Audit Views)

```javascript
// All records including deleted
SELECT * FROM users WHERE id = ?

// Only deleted records
SELECT * FROM users WHERE deleted_at IS NOT NULL

// Deleted within last 30 days
SELECT * FROM users 
WHERE deleted_at IS NOT NULL 
  AND deleted_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
```

---

## 📊 Audit Log Queries

### View User Activity

```javascript
SELECT 
  event_type,
  previous_value,
  new_value,
  reason,
  triggered_by_type,
  created_at
FROM user_audit_log
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 50;
```

### Track Status Changes

```javascript
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

## ⚠️ Important Notes

1. **Immutable Audit Log**: Never UPDATE or DELETE rows in `user_audit_log` unless legally required
2. **Cascade Behavior**: Soft delete does NOT cascade automatically - you must handle related records
3. **Performance**: Always use indexes on `deleted_at` and `status` columns
4. **Testing**: Update all tests to handle soft delete logic
5. **Smoke Tests**: Update `apiSmokeTest.js` to use soft delete instead of hard delete

---

## 🧪 Testing Checklist

- [ ] All SELECT queries exclude `deleted_at IS NOT NULL` by default
- [ ] DELETE operations now set `deleted_at = NOW()`
- [ ] User authentication checks `status = 'active'`
- [ ] Audit log entries created for all user events
- [ ] Soft deleted records can be restored (set `deleted_at = NULL`)
- [ ] Admin views can see soft deleted records
- [ ] Cascade soft delete handled for related records

---

## 🚀 Next Steps

1. Run the migration: `mysql -u root -p portfolio_tracker < backend/migrations/add-soft-delete-status-audit.sql`
2. Update all controllers to use soft delete
3. Add audit logging to user-related operations
4. Update authentication middleware to check user status
5. Test thoroughly in development
6. Deploy to production with rollback plan ready

