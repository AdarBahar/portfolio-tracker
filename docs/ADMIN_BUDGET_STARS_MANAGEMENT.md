# Admin Budget and Stars Management Feature

## Overview

This document describes the admin features for managing user budgets and stars in the Portfolio Tracker application.

## Features Implemented

### 1. Budget Management
Admins can add or remove money from user budgets with the following capabilities:
- **Add Money**: Credit user account with specified amount
- **Remove Money**: Debit user account with specified amount
- **Validation**: Prevents removing more money than available balance
- **Audit Logging**: All transactions logged with admin name and reason

### 2. Stars Management
Admins can grant or remove stars from users:
- **Grant Stars**: Award stars to users for achievements or corrections
- **Remove Stars**: Deduct stars for penalties or corrections
- **Audit Logging**: All actions logged with admin name and reason

## API Endpoints

### POST /api/admin/users/:id/adjust-budget
Adjust user budget (add or remove money).

**Authentication**: Bearer token (admin required)

**Request Body**:
```json
{
  "amount": 100.50,
  "direction": "IN",
  "reason": "Bonus for referral"
}
```

**Parameters**:
- `amount` (number, required): Amount to adjust (positive value)
- `direction` (string, required): "IN" to add money, "OUT" to remove money
- `reason` (string, required): Reason for adjustment

**Response**:
```json
{
  "success": true,
  "message": "Added $100.50 to user john@example.com",
  "user_id": 5,
  "amount": 100.50,
  "direction": "IN",
  "balance_before": 500.00,
  "balance_after": 600.50,
  "log_id": 42
}
```

### POST /api/admin/users/:id/remove-stars
Remove stars from a user.

**Authentication**: Bearer token (admin required)

**Request Body**:
```json
{
  "stars": 50,
  "reason": "Penalty for violation"
}
```

**Parameters**:
- `stars` (number, required): Number of stars to remove
- `reason` (string, required): Reason for removal

**Response**:
```json
{
  "success": true,
  "message": "Removed 50 stars from user john@example.com",
  "totalStars": 150
}
```

### POST /api/admin/users/:id/grant-stars
Grant stars to a user (existing endpoint, now with reason).

**Authentication**: Bearer token (admin required)

**Request Body**:
```json
{
  "stars": 100,
  "reason": "Achievement unlocked"
}
```

## Frontend Components

### BudgetStarsAdjustmentPanel
React component for admin adjustments with two forms:

**Features**:
- Budget adjustment form with amount, direction, and reason
- Stars adjustment form with amount, action (grant/remove), and reason
- Form validation and error handling
- Loading states during submission
- Success callbacks to refresh data

**Usage**:
```tsx
<BudgetStarsAdjustmentPanel user={userDetail} onSuccess={handleSuccess} />
```

### UserDetailModal Integration
The adjustment panel is integrated into the UserDetailModal with:
- Collapsible section labeled "⚙️ Admin Adjustments"
- Accessible only to admin users
- Automatic data refresh after successful adjustments

## Audit Logging

All admin actions are logged with the following format:

**For Admin User**:
```
Admin: John Doe added $100.50 to jane@example.com account. Reason: Bonus for referral
```

**For Target User**:
```
Admin: John Doe added $100.50 to your account. Reason: Bonus for referral
```

**Log Entry Structure**:
- `event_type`: "admin_adjust_budget" or "admin_grant_stars" or "admin_remove_stars"
- `event_category`: "admin"
- `description`: Human-readable description with admin name, action, and reason
- `new_values`: Contains amount, direction, reason, balance before/after

## Database Changes

### budget_logs Table
New entries are created with:
- `operation_type`: "ADMIN_CREDIT" or "ADMIN_DEBIT"
- `meta`: JSON containing admin_id, admin_name, and reason

### user_audit_log Table
Entries logged for both admin and target user with full details.

## Frontend Hooks

### useAdjustBudget()
```tsx
const { mutate: adjustBudget, isPending } = useAdjustBudget();

adjustBudget({
  userId: 5,
  amount: 100.50,
  direction: 'IN',
  reason: 'Bonus'
});
```

### useRemoveStars()
```tsx
const { mutate: removeStars, isPending } = useRemoveStars();

removeStars({
  userId: 5,
  stars: 50,
  reason: 'Penalty'
});
```

### useGrantStars() (Updated)
Now includes reason parameter:
```tsx
const { mutate: grantStars, isPending } = useGrantStars();

grantStars({
  userId: 5,
  stars: 100,
  reason: 'Achievement'
});
```

## Security Considerations

1. **Admin-Only Access**: All endpoints require admin privileges
2. **Validation**: Amount and reason validation on both frontend and backend
3. **Audit Trail**: All actions logged for compliance and debugging
4. **Balance Protection**: Cannot remove more money than available
5. **Idempotency**: Budget logs include correlation IDs for traceability

## Testing

To test the feature:

1. Log in as an admin user
2. Navigate to Admin Panel → User Management
3. Click on a user to open the detail modal
4. Click "⚙️ Admin Adjustments" to expand the panel
5. Use the forms to:
   - Add/remove money from budget
   - Grant/remove stars
6. Check the audit logs to verify actions were recorded

## Files Modified

- `backend/src/controllers/adminController.js` - Added adjustBudget and removeStars functions
- `backend/src/routes/adminRoutes.js` - Added new routes
- `frontend-react/src/hooks/useAdmin.ts` - Added new hooks
- `frontend-react/src/components/admin/UserDetailModal.tsx` - Integrated adjustment panel
- `frontend-react/src/components/admin/BudgetStarsAdjustmentPanel.tsx` - New component

## Future Enhancements

- Batch operations for multiple users
- Scheduled adjustments
- Approval workflow for large adjustments
- Export audit logs to CSV
- Advanced filtering in audit logs

