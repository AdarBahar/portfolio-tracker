# Next Steps: Frontend Development

## Overview

This document outlines the frontend development tasks for Phase 3 features.

## Frontend Features to Build

### 1. Admin Rake Configuration UI

**Location**: Admin Dashboard → Settings → Rake Configuration

**Features**:
- Display current active rake configuration
- Form to create/update rake configuration
- Fields:
  - Fee Type (dropdown: percentage, fixed, tiered)
  - Fee Value (number input)
  - Min Pool (number input)
  - Max Pool (number input, optional)
  - Is Active (toggle)
- Save button with validation
- Success/error messages

**API Endpoints**:
- `GET /api/admin/rake/config` - Get current config
- `POST /api/admin/rake/config` - Update config

**Example UI**:
```
┌─ Rake Configuration ─────────────────┐
│                                      │
│ Fee Type:        [Percentage ▼]     │
│ Fee Value:       [5.00]             │
│ Min Pool:        [100.00]           │
│ Max Pool:        [Unlimited]        │
│ Active:          [Toggle ON]        │
│                                      │
│ [Save] [Cancel]                     │
└──────────────────────────────────────┘
```

### 2. Admin Promotion Management UI

**Location**: Admin Dashboard → Settings → Promotions

**Features**:
- List all promotions with pagination
- Create new promotion button
- Edit/delete promotion buttons
- Columns:
  - Code
  - Name
  - Type
  - Amount
  - Max Uses / Current Uses
  - Status (Active/Inactive)
  - Actions

**Create/Edit Form**:
- Code (text input, unique)
- Name (text input)
- Description (textarea)
- Bonus Type (dropdown)
- Bonus Amount (number input)
- Max Uses (number input, optional)
- Min Account Age (number input)
- Start Date (datetime picker)
- End Date (datetime picker)
- Is Active (toggle)

**API Endpoints**:
- `GET /api/admin/promotions` - List all
- `POST /api/admin/promotions` - Create
- `PUT /api/admin/promotions/:id` - Update (if implemented)
- `DELETE /api/admin/promotions/:id` - Delete (if implemented)

**Example UI**:
```
┌─ Promotions ──────────────────────────────────┐
│ [+ New Promotion]                             │
├───────────────────────────────────────────────┤
│ Code    │ Name      │ Type    │ Amount │ Uses │
├─────────┼───────────┼─────────┼────────┼──────┤
│WELCOME  │Welcome    │signup   │100.00 │1/1000│
│REFER50  │Referral   │referral │50.00  │0/∞   │
│HOLIDAY  │Holiday    │seasonal │250.00 │0/500 │
│ [Edit] [Delete]                              │
└───────────────────────────────────────────────┘
```

### 3. Settlement History Viewer

**Location**: Admin Dashboard → Reports → Settlement History

**Features**:
- List all settled rooms with pagination
- Filters:
  - Date range
  - Status (completed, failed)
  - User
- Columns:
  - Room ID
  - Room Name
  - Settlement Date
  - Status
  - Pool Size
  - Rake Collected
  - Winner
  - Actions (View Details)

**Details Modal**:
- Room information
- Settlement details
- Payout breakdown
- Budget logs

**API Endpoints**:
- `GET /api/admin/settlement/history` - List settlements
- `GET /api/admin/settlement/history/:id` - Get details

**Example UI**:
```
┌─ Settlement History ──────────────────────────┐
│ Date Range: [From] [To]  Status: [All ▼]    │
│ [Filter]                                      │
├───────────────────────────────────────────────┤
│ Room │ Date      │ Status    │ Pool  │ Rake  │
├──────┼───────────┼───────────┼───────┼───────┤
│ 1    │ 2025-11-27│ Completed │ 1000  │ 50.00 │
│ 2    │ 2025-11-26│ Completed │ 500   │ 25.00 │
│ [View Details]                               │
└───────────────────────────────────────────────┘
```

### 4. Rake Collection History Viewer

**Location**: Admin Dashboard → Reports → Rake Collection

**Features**:
- List all rake collections with pagination
- Filters:
  - Date range
  - Min/Max rake amount
- Columns:
  - Room ID
  - Collection Date
  - Pool Size
  - Rake Amount
  - Fee Type
  - Actions

**Summary Stats**:
- Total rake collected (today, week, month)
- Average rake percentage
- Number of collections

**API Endpoints**:
- `GET /api/admin/rake/history` - List collections
- `GET /api/admin/rake/stats` - Get statistics

**Example UI**:
```
┌─ Rake Collection History ─────────────────────┐
│ Summary: Total Today: $1,234.56               │
│          This Week: $8,901.23                 │
│          This Month: $45,678.90               │
├───────────────────────────────────────────────┤
│ Room │ Date      │ Pool   │ Rake   │ Type    │
├──────┼───────────┼────────┼────────┼─────────┤
│ 1    │ 2025-11-27│ 1000   │ 50.00  │ 5%      │
│ 2    │ 2025-11-26│ 500    │ 25.00  │ 5%      │
└───────────────────────────────────────────────┘
```

### 5. User Bonus Redemption UI

**Location**: User Dashboard → Bonuses

**Features**:
- Display available promotions
- Redemption code input
- Redeem button
- My Bonuses section showing:
  - Promotion name
  - Amount redeemed
  - Date redeemed
  - Status

**API Endpoints**:
- `POST /api/v1/bonus/redeem` - Redeem code
- `GET /api/v1/bonus/my-bonuses` - Get user bonuses

**Example UI**:
```
┌─ Bonuses ─────────────────────────────────────┐
│ Available Promotions:                         │
│ • WELCOME100: 100 VUSD for new users         │
│ • REFER50: 50 VUSD for referrals             │
│ • HOLIDAY250: 250 VUSD seasonal bonus        │
│                                               │
│ Redeem Code: [________________] [Redeem]     │
│                                               │
│ My Bonuses:                                   │
│ • WELCOME100 - 100 VUSD (Nov 27, 2025)      │
│ • REFER50 - 50 VUSD (Nov 26, 2025)          │
└───────────────────────────────────────────────┘
```

## Implementation Priority

1. **High Priority** (Week 1):
   - Rake Configuration UI
   - Promotion Management UI
   - User Bonus Redemption UI

2. **Medium Priority** (Week 2):
   - Settlement History Viewer
   - Rake Collection History Viewer

3. **Low Priority** (Week 3):
   - Advanced filtering
   - Export functionality
   - Real-time updates

## Technical Considerations

- Use existing admin panel framework
- Follow existing UI patterns
- Implement proper error handling
- Add loading states
- Add confirmation dialogs for destructive actions
- Implement pagination for large datasets
- Add search/filter functionality
- Use existing API client

## Testing Checklist

- [ ] All forms validate correctly
- [ ] API calls work correctly
- [ ] Error messages display properly
- [ ] Loading states show correctly
- [ ] Pagination works
- [ ] Filters work
- [ ] Mobile responsive
- [ ] Accessibility compliant

## Files to Create/Modify

### New Components
- `frontend/src/components/RakeConfigForm.jsx`
- `frontend/src/components/PromotionList.jsx`
- `frontend/src/components/PromotionForm.jsx`
- `frontend/src/components/SettlementHistory.jsx`
- `frontend/src/components/RakeHistory.jsx`
- `frontend/src/components/BonusRedemption.jsx`

### New Pages
- `frontend/src/pages/admin/RakeConfiguration.jsx`
- `frontend/src/pages/admin/PromotionManagement.jsx`
- `frontend/src/pages/admin/SettlementHistory.jsx`
- `frontend/src/pages/admin/RakeHistory.jsx`
- `frontend/src/pages/user/Bonuses.jsx`

### API Client Updates
- Add rake endpoints
- Add promotion endpoints
- Add settlement history endpoints
- Add bonus endpoints

## Estimated Timeline

- Rake Configuration UI: 4 hours
- Promotion Management UI: 6 hours
- Settlement History: 4 hours
- Rake History: 4 hours
- Bonus Redemption UI: 3 hours
- Testing & Polish: 5 hours

**Total: ~26 hours (3-4 days)**

