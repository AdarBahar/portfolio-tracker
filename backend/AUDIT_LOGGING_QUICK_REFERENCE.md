# Audit Logging Quick Reference

## Import

```javascript
const auditLog = require('../utils/auditLog');
```

## Basic Usage

```javascript
await auditLog.log({
  userId: req.user.id,
  eventType: 'login_success',
  eventCategory: 'authentication',
  description: 'User logged in successfully',
  req  // Auto-extracts IP and user agent
});
```

## Common Event Types

### Authentication
```javascript
// Login success
await auditLog.log({
  userId: user.id,
  eventType: 'login_success',
  eventCategory: 'authentication',
  description: 'User logged in via Google OAuth',
  req,
  newValues: { auth_provider: 'google', email: user.email }
});

// Login failed
await auditLog.log({
  userId: user.id,
  eventType: 'login_failed',
  eventCategory: 'authentication',
  description: `Login failed: ${reason}`,
  req,
  newValues: { reason, email: user.email }
});

// Logout
await auditLog.log({
  userId: req.user.id,
  eventType: 'logout',
  eventCategory: 'authentication',
  description: 'User logged out',
  req
});
```

### Account
```javascript
// User created
await auditLog.log({
  userId: newUser.id,
  eventType: 'user_created',
  eventCategory: 'account',
  description: 'New user account created',
  req,
  newValues: { 
    email: newUser.email,
    auth_provider: 'google',
    status: 'active'
  }
});

// Status changed
await auditLog.log({
  userId: user.id,
  eventType: 'status_changed',
  eventCategory: 'account',
  description: `Account status changed from ${oldStatus} to ${newStatus}`,
  req,
  previousValues: { status: oldStatus },
  newValues: { status: newStatus }
});
```

### Admin
```javascript
// Admin privilege granted
await auditLog.log({
  userId: targetUserId,
  eventType: 'admin_privilege_granted',
  eventCategory: 'admin',
  description: `Admin privileges granted by ${req.user.email}`,
  req,
  previousValues: { is_admin: false },
  newValues: { is_admin: true, changed_by: req.user.email }
});

// Admin privilege revoked
await auditLog.log({
  userId: targetUserId,
  eventType: 'admin_privilege_revoked',
  eventCategory: 'admin',
  description: `Admin privileges revoked by ${req.user.email}`,
  req,
  previousValues: { is_admin: true },
  newValues: { is_admin: false, changed_by: req.user.email }
});
```

### Profile
```javascript
// Profile updated
await auditLog.log({
  userId: req.user.id,
  eventType: 'profile_updated',
  eventCategory: 'profile',
  description: 'User updated their profile',
  req,
  previousValues: { name: oldName },
  newValues: { name: newName }
});

// Email changed
await auditLog.log({
  userId: req.user.id,
  eventType: 'email_changed',
  eventCategory: 'profile',
  description: 'User changed their email address',
  req,
  previousValues: { email: oldEmail },
  newValues: { email: newEmail }
});
```

### Security
```javascript
// Suspicious activity
await auditLog.log({
  userId: user.id,
  eventType: 'suspicious_activity',
  eventCategory: 'security',
  description: `Suspicious activity detected: ${reason}`,
  req,
  newValues: { reason, details }
});

// Account locked
await auditLog.log({
  userId: user.id,
  eventType: 'account_locked',
  eventCategory: 'security',
  description: 'Account locked due to security concerns',
  req,
  previousValues: { status: 'active' },
  newValues: { status: 'suspended', reason: 'security' }
});
```

### Data
```javascript
// Holding created
await auditLog.log({
  userId: req.user.id,
  eventType: 'holding_created',
  eventCategory: 'data',
  description: `Created holding for ${ticker}`,
  req,
  newValues: { ticker, name, shares, purchasePrice }
});

// Dividend created
await auditLog.log({
  userId: req.user.id,
  eventType: 'dividend_created',
  eventCategory: 'data',
  description: `Created dividend for ${ticker}`,
  req,
  newValues: { ticker, amount, shares, date }
});

// Transaction created
await auditLog.log({
  userId: req.user.id,
  eventType: 'transaction_created',
  eventCategory: 'data',
  description: `Created ${type} transaction for ${ticker}`,
  req,
  newValues: { type, ticker, shares, price, fees, date }
});
```

### Bull Pen
```javascript
// Bull pen created
await auditLog.log({
  userId: req.user.id,
  eventType: 'bull_pen_created',
  eventCategory: 'bull_pen',
  description: `Created bull pen "${name}"`,
  req,
  newValues: { bullPenId, name, durationSec, startingCash }
});

// Bull pen joined
await auditLog.log({
  userId: req.user.id,
  eventType: 'bull_pen_joined',
  eventCategory: 'bull_pen',
  description: `Joined bull pen "${bullPenName}"`,
  req,
  newValues: { bullPenId, bullPenName, status: 'active' }
});

// Order placed
await auditLog.log({
  userId: req.user.id,
  eventType: 'bull_pen_order_placed',
  eventCategory: 'bull_pen',
  description: `Placed ${side} order for ${qty} shares of ${symbol}`,
  req,
  newValues: { bullPenId, orderId, symbol, side, qty, fillPrice }
});
```

## Event Categories

- `authentication` - Login, logout, token refresh
- `account` - User creation, deletion, status changes
- `admin` - Admin privilege changes, user management
- `profile` - Profile updates, email changes
- `security` - Suspicious activity, locks, 2FA
- `data` - Holdings, dividends, transactions (portfolio data)
- `bull_pen` - Bull pen creation, joins, leaves, orders

## Full Documentation

See [`backend/AUDIT_LOGGING_GUIDE.md`](./AUDIT_LOGGING_GUIDE.md) for complete documentation.

