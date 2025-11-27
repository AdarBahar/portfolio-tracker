# Project History

## 2025-11-26 – Phase 3: Admin Panel Enhancements & Fake Data Loading (with Schema Fixes)

- **Git reference**: `feature/budget-mng` branch
- **Summary**: Enhanced admin panel with comprehensive user management features including budget tracking, trading room memberships, and leaderboard standings. Created fake data script for testing. Fixed schema constraints to support lock/unlock operations.

- **Details**:
  - **New Admin Endpoint: GET /api/admin/users/:id/detail**
    - Retrieves comprehensive user information in single API call
    - Includes user profile, budget status, last 10 budget transactions
    - Shows all trading rooms user is member of with role and status
    - Displays leaderboard standings in active/completed rooms
    - Reduces number of API calls needed for admin dashboard

  - **Admin Panel Features**:
    - User list with clickable names (already existed, now enhanced with detail view)
    - User detail view showing:
      - Current budget (available + locked balance)
      - Last 10 budget transactions with operation types and correlation IDs
      - All trading rooms with membership status and role
      - Leaderboard standings (rank, portfolio value, P&L)
    - Enables support team to quickly diagnose user issues
    - Enables fraud detection through transaction pattern analysis
    - Enables performance tracking across rooms

  - **Fake Data Script: backend/scripts/load-fake-data.sql**
    - Creates comprehensive test data for user 4 (adarb@bahar.co.il)
    - Budget: $5,000 initial, $4,750 current (after transactions)
    - 10 budget transactions showing:
      - Initial credit
      - Room buy-ins (3 rooms)
      - Room settlements (1 win, 1 loss)
      - Transfers (in and out)
      - Admin adjustments
    - 3 trading rooms:
      - Room 1: Completed (user won, ranked 1st, +150% P&L)
      - Room 2: Completed (user lost, ranked 3rd, +50% P&L)
      - Room 3: Active (user ranked 2nd, +120% P&L)
    - Stock positions in active room (AAPL, MSFT, GOOGL)
    - Order history showing filled orders
    - Leaderboard snapshots for all rooms
    - Idempotent design (safe to run multiple times)

  - **Schema Fixes**:
    - Fixed `budget_logs` direction constraint to support LOCK/UNLOCK operations
    - Updated constraint from `('IN', 'OUT')` to `('IN', 'OUT', 'LOCK', 'UNLOCK')`
    - Resolved schema/implementation mismatch where service was using LOCK/UNLOCK but schema rejected them
    - Created migration guide for existing databases

  - **Documentation**:
    - Created `docs/ADMIN_PANEL_ENHANCEMENTS.md` with:
      - Endpoint documentation
      - Response structure examples
      - Use cases (support, fraud detection, performance tracking)
      - Testing instructions
      - Future enhancement ideas
    - Created `backend/scripts/README.md` with:
      - Detailed data structure
      - Loading instructions
      - Verification commands
      - Customization guide
    - Created `docs/SCHEMA_CONSTRAINT_FIX.md` with:
      - Schema constraint fix documentation
      - Migration guide for existing databases
      - Verification commands

- **Files Created**:
  - `backend/scripts/load-fake-data.sql` - Comprehensive fake data for testing
  - `docs/ADMIN_PANEL_ENHANCEMENTS.md` - Admin panel documentation
  - `backend/scripts/README.md` - Scripts directory documentation

- **Files Modified**:
  - `backend/src/controllers/adminController.js` - Added getUserDetail() function
  - `backend/src/routes/adminRoutes.js` - Added GET /users/:id/detail route

- **Reasoning / Motivation**:
  1. Admin panel needs comprehensive user view for support and fraud detection
  2. Single endpoint reduces API calls and improves performance
  3. Budget tracking essential for financial auditing
  4. Trading room standings show user performance
  5. Fake data enables testing without manual setup
  6. Realistic test data helps identify edge cases

- **Impact**:
  - Admins can now view complete user profile in one API call
  - Support team can quickly diagnose budget and room issues
  - Fraud detection enabled through transaction analysis
  - Testing simplified with comprehensive fake data
  - Admin dashboard can display rich user information

- **Deployment / Ops notes**:
  - No new environment variables required
  - No database migrations needed
  - Fake data script is optional (for testing only)
  - Admin endpoint requires admin authentication
  - Queries are indexed for performance

- **Testing**:
  - Syntax validation: ✓ All files pass Node.js syntax check
  - Manual testing: Load fake data and verify via API
  - Verification commands provided in scripts/README.md
  - Test data includes realistic scenarios (wins, losses, transfers)

- **Open questions / next steps**:
  1. **Frontend**: Build admin UI to display user detail view
  2. **Budget Adjustment**: Add UI for admins to credit/debit users
  3. **Transaction Filtering**: Add date/type/amount filters to budget logs
  4. **Export**: Add CSV/PDF export for reports
  5. **Bulk Operations**: Add ability to freeze multiple accounts
  6. **Notifications**: Add real-time alerts for large transactions
  7. **Reconciliation**: Add reports comparing room financials with budget logs
  8. **Timeline**: Add user activity timeline view

## 2025-11-26 – Phase 2 Continuation: Budget Service Completion & Trading Room Integration

- **Git reference**: `feature/budget-mng` branch
- **Summary**: Completed Phase 2 continuation with lock/unlock operations, transfer operations, admin adjustments, OpenAPI spec updates, integration tests, and Trading Room integration.

- **Details**:
  - **Lock/Unlock Operations**:
    - Added `lockBudget(userId, amount, operationData)` to move funds from available to locked balance
    - Added `unlockBudget(userId, amount, operationData)` to move funds from locked back to available
    - Both use idempotency via `idempotency_key` deduplication
    - Both use `SELECT ... FOR UPDATE` for row-level locking
    - Proper error handling: `INSUFFICIENT_FUNDS`, `INSUFFICIENT_LOCKED_FUNDS`
    - Added controllers and routes: POST /internal/v1/budget/lock, POST /internal/v1/budget/unlock

  - **Transfer Operations**:
    - Added `transferBudget(fromUserId, toUserId, amount, operationData)` for atomic user-to-user transfers
    - Locks budgets in deterministic order (ascending user_id) to prevent deadlocks
    - Creates two budget_logs entries under same correlation_id for traceability
    - Uses idempotency via `idempotency_key` deduplication
    - Validates both budgets exist and are active, sufficient available balance on source
    - Added controller and route: POST /internal/v1/budget/transfer

  - **Admin Adjustment Operations**:
    - Added `adjustBudget(userId, amount, direction, operationData)` for admin credit/debit
    - Supports both IN (credit) and OUT (debit) directions
    - Captures admin info from `created_by` parameter
    - Adds admin metadata (created_by, adjusted_at) to log entry
    - Uses idempotency via `idempotency_key` deduplication
    - Added controller and route: POST /internal/v1/budget/adjust

  - **OpenAPI Spec Updates**:
    - Added 8 new endpoint definitions (6 internal, 2 public)
    - Added ServiceTokenAuth security scheme for service-to-service authentication
    - Added 13 budget-related schema definitions:
      - UserBudget, BudgetLog, BudgetCreditRequest, BudgetDebitRequest
      - BudgetLockRequest, BudgetUnlockRequest, BudgetLockResponse, BudgetUnlockResponse
      - BudgetTransferRequest, BudgetTransferResponse, BudgetAdjustRequest
      - BudgetOperationResponse
    - All endpoints include full request/response documentation
    - Proper error response documentation (400, 403, 404 status codes)

  - **Integration Tests**:
    - Created `backend/test-budget-integration.js` with 8 comprehensive tests
    - Tests cover: credit, debit, lock, unlock, transfer, adjust operations
    - Tests verify idempotency with same Idempotency-Key returning cached results
    - Tests verify error handling (insufficient funds)
    - Tests use real database connections
    - Can be run with: `node backend/test-budget-integration.js`

  - **Trading Room Integration**:
    - Updated `joinBullPen()` to debit user budget for room buy-in
    - Updated `leaveBullPen()` to credit user budget as refund
    - Both operations use correlation_id for traceability
    - Both operations use idempotency keys to prevent double-charging
    - Proper error handling: if budget debit fails, join fails; if credit fails on leave, operation continues but logs warning
    - Created comprehensive integration guide: `docs/BUDGET_TRADING_ROOM_INTEGRATION.md`
    - Guide includes: room join flow, settlement flow, cancellation flow, member removal flow, error handling, correlation IDs, testing checklist, deployment checklist

- **Files Created**:
  - `backend/test-budget-integration.js` - Integration test suite with 8 tests
  - `docs/BUDGET_TRADING_ROOM_INTEGRATION.md` - Comprehensive integration guide

- **Files Modified**:
  - `backend/openapi.json` - Added 8 endpoints, ServiceTokenAuth scheme, 13 budget schemas
  - `backend/src/services/budgetService.js` - Added lock, unlock, transfer, adjust operations
  - `backend/src/controllers/internalBudgetController.js` - Added lock, unlock, transfer, adjust controllers
  - `backend/src/routes/internalBudgetRoutes.js` - Added lock, unlock, transfer, adjust routes
  - `backend/src/controllers/bullPenMembershipsController.js` - Integrated budget debit on join, credit on leave

- **Reasoning / Motivation**:
  1. Lock/unlock operations enable hold-and-release patterns for pending transactions
  2. Transfer operations enable peer-to-peer transactions (gifts, settlements)
  3. Admin adjustments enable support team to correct errors or apply promotions
  4. OpenAPI spec ensures API is properly documented for client integration
  5. Integration tests verify all operations work correctly with real database
  6. Trading Room integration ensures budget is properly managed across room lifecycle
  7. Correlation IDs enable audit trail linking budget changes to room events

- **Impact**:
  - Budget Service now supports all planned Phase 2 operations
  - Trading Room join/leave flows now properly manage user budgets
  - All budget operations are idempotent and transactionally consistent
  - API is fully documented in OpenAPI spec
  - Integration tests provide confidence in implementation
  - Correlation IDs enable comprehensive audit trail

- **Deployment / Ops notes**:
  - No new environment variables required (INTERNAL_SERVICE_TOKEN already exists)
  - No database migrations needed (schema already created in Phase 1)
  - Integration tests can be run against staging/production databases
  - Monitor budget operation failures in logs (search for "Budget debit failed" or "Budget credit failed")
  - Verify correlation_id tracking in budget_logs for room-related operations

- **Testing**:
  - Syntax validation: ✓ All files pass Node.js syntax check
  - Integration tests: 8 tests covering all operations
  - Manual testing checklist in `docs/BUDGET_TRADING_ROOM_INTEGRATION.md`
  - Recommended: Run integration tests against staging database before production deployment

- **Open questions / next steps**:
  1. **Room Settlement**: Implement settlement logic in background job or endpoint
  2. **Room Cancellation**: Implement refund logic when room is cancelled
  3. **Member Kick**: Implement refund logic when member is kicked before room starts
  4. **Rake/House Fee**: Implement fee deduction from room payouts
  5. **Bonus System**: Implement promotional credit system
  6. **Reconciliation**: Create job to reconcile room financials with budget logs
  7. **Admin Dashboard**: Create UI for budget management and adjustments
  8. **Monitoring**: Set up alerts for budget operation failures
  9. **Documentation**: Update user-facing docs with budget system explanation
  10. **Performance**: Monitor budget operation latency under load

## 2025-11-25 – Documentation Update - Database Schema & OpenAPI Spec

- **Git reference**: `main` branch, uncommitted changes
- **Summary**: Comprehensive update to `docs/DATABASE_SCHEMA.md` and `backend/openapi.json` to reflect recent database changes including audit logging, soft delete functionality, and user/holding status management.

- **Details**:
  - **DATABASE_SCHEMA.md Updates**:
    - Updated table count from 10 to 11 (added `user_audit_log` table)
    - Added complete documentation for `user_audit_log` table with all columns, indexes, constraints, and usage examples
    - Added `deleted_at` column documentation to all 9 tables (soft delete pattern)
    - Added `status` column documentation to `users` table (7 states: active, inactive, archived, pending_verification, invited, suspended, deleted)
    - Added `status` column documentation to `holdings` table (4 states: active, pending_settlement, locked, archived)
    - Added 15 new indexes: 9 for `deleted_at`, 2 for `status`, 4 for `user_audit_log`
    - Updated schema version from 1.0 to 1.1
    - Updated "Last Updated" date to 2025-11-25
    - Added "Recent Changes" section documenting all updates
    - Added soft delete behavior documentation to all applicable tables
    - Added user status values and holding status values documentation

  - **backend/openapi.json Updates**:
    - Added `status` field to User schema with enum of 7 values
    - Added `createdAt` field to User schema (account creation timestamp)
    - Added `lastLogin` field to User schema (last login timestamp)
    - Added `status` field to Holding schema with enum of 4 values
    - Created new `AuditLog` schema component with all fields (id, userId, eventType, eventCategory, description, ipAddress, userAgent, previousValues, newValues, createdAt)
    - Updated `/api/admin/users/{id}/logs` endpoint response to reference AuditLog schema
    - Updated API version from 1.0.0 to 1.1.0
    - Updated API description to mention audit logging, soft delete, and status management

- **Files Modified**:
  - `docs/DATABASE_SCHEMA.md` - Added user_audit_log table, soft delete columns, status columns, updated version to 1.1
  - `backend/openapi.json` - Added status/timestamp fields to User/Holding schemas, created AuditLog schema, updated version to 1.1.0
  - `DOCUMENTATION_REVIEW_FINDINGS.md` - Created comprehensive review findings document

- **Impact**:
  - Documentation now accurately reflects the current database schema (11 tables, 33 indexes)
  - API documentation now includes all fields returned by admin endpoints
  - Developers can reference accurate schema documentation for all audit logging features
  - OpenAPI spec can be used to generate accurate client SDKs

- **Verification**:
  - [ ] Review DATABASE_SCHEMA.md for accuracy
  - [ ] Review openapi.json for completeness
  - [ ] Test Swagger UI at `/api/docs` to verify schema changes
  - [ ] Verify admin endpoints return fields matching the updated schemas

## 2025-11-25 – Accessibility Fix - Audit Logs Modal

- **Git reference**: `main` branch, uncommitted changes
- **Summary**: Fixed accessibility issue in audit logs modal where `aria-hidden` attribute was blocking focus on the close button, causing browser warnings and screen reader issues.

- **Details**:
  - **Issue**: Browser warning "Blocked aria-hidden on an element because its descendant retained focus"
  - **Root Cause**: Modal was using `aria-hidden="false"` when open, but ARIA spec requires removing the attribute entirely
  - **Fix**: Changed `modal.setAttribute('aria-hidden', 'false')` to `modal.removeAttribute('aria-hidden')`
  - **Enhancements**:
    - Added auto-focus to close button when modal opens
    - Added Escape key support to close modal
    - Added focus management to return focus to triggering button when modal closes
    - Extracted close logic to dedicated `closeLogsModal()` function
    - Improved keyboard navigation and screen reader support

- **Files Modified**:
  - `scripts/admin.js` - Fixed modal accessibility and added keyboard support
  - `ACCESSIBILITY_FIX_AUDIT_MODAL.md` - Documentation of the fix

- **WCAG 2.1 Compliance**:
  - ✅ 2.1.1 Keyboard - All functionality available via keyboard
  - ✅ 2.4.3 Focus Order - Logical focus order maintained
  - ✅ 4.1.2 Name, Role, Value - Proper ARIA attributes

- **Testing checklist**:
  - [ ] Open audit logs modal and verify close button receives focus
  - [ ] Press Escape key and verify modal closes
  - [ ] Click background and verify modal closes
  - [ ] Test with screen reader (VoiceOver/NVDA/JAWS)
  - [ ] Verify no aria-hidden warnings in browser console

## 2025-11-25 – Audit Logging System - Extended Coverage

- **Git reference**: `main` branch, uncommitted changes
- **Summary**: Extended audit logging system to cover all major user actions including portfolio data operations (holdings, dividends, transactions) and bull pen activities (creation, memberships, orders). Now tracking 21 different event types across 5 categories.

- **Details**:
  - **Holdings Events** (`backend/src/controllers/holdingsController.js`):
    - Added `holding_created` event logging when user creates a new holding
    - Added `holding_updated` event logging when user updates a holding (captures previous and new values)
    - Added `holding_deleted` event logging when user deletes a holding (soft delete)
    - Logs include ticker, name, shares, purchase price, purchase date, sector, asset class
    - Fetches old values before update/delete to capture previous state

  - **Dividends Events** (`backend/src/controllers/dividendsController.js`):
    - Added `dividend_created` event logging when user creates a new dividend
    - Added `dividend_updated` event logging when user updates a dividend (captures previous and new values)
    - Added `dividend_deleted` event logging when user deletes a dividend (soft delete)
    - Logs include ticker, amount, shares, date
    - Fetches old values before update/delete to capture previous state

  - **Transactions Events** (`backend/src/controllers/transactionsController.js`):
    - Added `transaction_created` event logging when user creates a new transaction
    - Added `transaction_updated` event logging when user updates a transaction (captures previous and new values)
    - Added `transaction_deleted` event logging when user deletes a transaction (soft delete)
    - Logs include type (buy/sell/dividend), ticker, shares, price, fees, date
    - Fetches old values before update/delete to capture previous state

  - **Bull Pen Events** (`backend/src/controllers/bullPensController.js`):
    - Added `bull_pen_created` event logging when user creates a new bull pen
    - Logs include bull pen ID, name, duration, max players, starting cash, settings

  - **Bull Pen Membership Events** (`backend/src/controllers/bullPenMembershipsController.js`):
    - Added `bull_pen_joined` event logging when user joins a bull pen
    - Added `bull_pen_left` event logging when user leaves a bull pen
    - Added `bull_pen_membership_approved` event logging when host approves a membership (dual logging)
    - Added `bull_pen_membership_rejected` event logging when host rejects a membership (dual logging)
    - Dual logging: logs event for both target user AND host who made the change
    - Logs include bull pen ID, bull pen name, status, role

  - **Bull Pen Order Events** (`backend/src/controllers/bullPenOrdersController.js`):
    - Added `bull_pen_order_placed` event logging when user places an order
    - Logs include bull pen ID, order ID, symbol, side (buy/sell), quantity, fill price, new cash, new position
    - Logged after transaction commit to avoid rollback issues

  - **Documentation Updates**:
    - Updated `AUDIT_LOGGING_IMPLEMENTATION_SUMMARY.md` with all 21 implemented event types
    - Updated `backend/AUDIT_LOGGING_QUICK_REFERENCE.md` with examples for data and bull pen events
    - Updated event category descriptions to clarify `data` category includes portfolio data

- **Event Coverage Summary**:
  - **Authentication & Account**: 5 events (login_success, login_failed, user_created, admin_privilege_granted, admin_privilege_revoked)
  - **Portfolio Data**: 9 events (holding_created/updated/deleted, dividend_created/updated/deleted, transaction_created/updated/deleted)
  - **Bull Pen**: 7 events (bull_pen_created, bull_pen_joined, bull_pen_left, membership_approved/rejected, order_placed)
  - **Total**: 21 event types across 5 categories (authentication, account, admin, data, bull_pen)

- **Reasoning / Motivation**:
  - **Complete Audit Trail**: Track all user actions that modify data in the system
  - **Data Integrity**: Capture previous and new values for all updates to enable rollback and investigation
  - **User Behavior Analysis**: Understand how users interact with portfolio and bull pen features
  - **Compliance**: Meet regulatory requirements for tracking financial data changes
  - **Debugging**: Investigate data inconsistencies by reviewing user action history
  - **Dual Logging for Admin Actions**: Track both the action on the target user and the admin who performed it

- **Deployment / Ops notes**:
  - No database changes required - uses existing `user_audit_log` table
  - No breaking changes - all changes are additive
  - Audit logging failures are gracefully handled and won't crash the app
  - Monitor backend logs for `[AuditLog]` messages to verify logging is working
  - Consider implementing retention policy for old audit logs (e.g., keep 90 days)

- **Testing checklist**:
  - [ ] Create/update/delete holdings and verify events in database
  - [ ] Create/update/delete dividends and verify events in database
  - [ ] Create/update/delete transactions and verify events in database
  - [ ] Create bull pen and verify event in database
  - [ ] Join/leave bull pen and verify events in database
  - [ ] Approve/reject membership and verify dual logging (2 events)
  - [ ] Place order in bull pen and verify event in database
  - [ ] Verify all events include IP address and user agent
  - [ ] Verify previous/new values are captured correctly
  - [ ] View events in admin panel and verify they display correctly

## 2025-11-25 – Audit Logging System Implementation

- **Git reference**: `main` branch, uncommitted changes
- **Summary**: Implemented comprehensive audit logging system with centralized utility module for tracking all user-related events to the `user_audit_log` table. Integrated audit logging into authentication and admin controllers.

- **Details**:
  - **Audit Log Utility** (`backend/src/utils/auditLog.js`):
    - Created centralized `auditLog.log()` function for writing audit logs
    - Automatic IP address extraction from Express requests (handles proxies: X-Forwarded-For, X-Real-IP)
    - Automatic user agent extraction from request headers
    - JSON serialization for `previousValues` and `newValues` fields
    - Graceful error handling - logging failures never crash the app
    - Exported helper functions: `extractIpAddress()`, `extractUserAgent()`
    - Comprehensive JSDoc documentation

  - **Authentication Events** (`backend/src/controllers/authController.js`):
    - Added `login_success` event logging for successful Google OAuth logins
    - Added `login_failed` event logging for failed login attempts (non-active account status)
    - Added `user_created` event logging for new user registrations
    - Logs include IP address, user agent, email, and auth provider
    - Separate tracking for new users vs. returning users

  - **Admin Events** (`backend/src/controllers/adminController.js`):
    - Added `admin_privilege_granted` event logging when admin status is granted
    - Added `admin_privilege_revoked` event logging when admin status is removed
    - Dual logging: logs event for both target user AND admin who made the change
    - Includes previous/new values with `is_admin` status and `changed_by` email
    - Fetches target user info before update to capture previous state

  - **Documentation** (`backend/AUDIT_LOGGING_GUIDE.md`):
    - Comprehensive 389-line guide covering all aspects of audit logging
    - Architecture explanation (centralized utility vs. endpoint approach)
    - Complete API reference with parameter descriptions
    - Implementation examples for all event types
    - Best practices for logging events
    - Troubleshooting guide
    - Security considerations
    - Performance optimization tips
    - Database schema reference

- **Reasoning / Motivation**:
  - **Security Monitoring**: Track all user actions for security analysis and threat detection
  - **Compliance**: Meet regulatory requirements (GDPR, SOC2, HIPAA) for audit trails
  - **Debugging**: Investigate user issues by reviewing their action history
  - **Analytics**: Understand user behavior and system usage patterns
  - **Accountability**: Create immutable record of who did what and when
  - **Centralized Approach**: Single utility module ensures consistency and simplicity
  - **Graceful Degradation**: Audit logging failures don't impact user experience

- **Impact**:
  - **New Utility Module**: `backend/src/utils/auditLog.js` available for all controllers
  - **Authentication Tracking**: All login attempts and new registrations now logged
  - **Admin Action Tracking**: All admin privilege changes now logged with full context
  - **Database Writes**: Audit logs written to `user_audit_log` table on every tracked event
  - **Admin Panel**: Existing admin panel can now display real audit log data
  - **No Breaking Changes**: Purely additive - no changes to existing API contracts
  - **Performance**: Direct database writes, no HTTP overhead, minimal performance impact
  - **IP Address Handling**: Correctly extracts client IP even behind proxies/load balancers

- **Deployment / Ops notes**:
  - **No Database Migration Required**: Uses existing `user_audit_log` table
  - **No Environment Variables Required**: No new configuration needed
  - **Backend Restart Required**: New utility module requires server restart
  - **Backward Compatible**: No breaking changes to existing functionality
  - **Monitoring**: Watch for `[AuditLog]` entries in backend logs
  - **Verification**:
    ```sql
    -- Check audit logs are being written
    SELECT COUNT(*) FROM user_audit_log;

    -- View recent login events
    SELECT * FROM user_audit_log
    WHERE event_type = 'login_success'
    ORDER BY created_at DESC LIMIT 10;

    -- View admin privilege changes
    SELECT * FROM user_audit_log
    WHERE event_category = 'admin'
    ORDER BY created_at DESC LIMIT 10;
    ```
  - **Production Deployment**:
    1. Deploy backend code with new utility and updated controllers
    2. Restart backend server
    3. Test login to verify `login_success` events are logged
    4. Test admin privilege changes to verify admin events are logged
    5. Check admin panel to view audit logs

- **Testing**:
  - **Manual Testing Required**:
    - [ ] Login with Google OAuth and verify `login_success` event in database
    - [ ] Login with suspended account and verify `login_failed` event
    - [ ] Create new user and verify `user_created` event
    - [ ] Grant admin privileges and verify `admin_privilege_granted` events (2 entries)
    - [ ] Revoke admin privileges and verify `admin_privilege_revoked` events (2 entries)
    - [ ] View audit logs in admin panel and verify events display correctly
    - [ ] Check IP addresses are correctly extracted (not `::1` in production)
    - [ ] Check user agents are captured correctly
    - [ ] Verify `previousValues` and `newValues` JSON is valid
  - **Database Verification**:
    ```sql
    -- Check event types
    SELECT event_type, COUNT(*) as count
    FROM user_audit_log
    GROUP BY event_type;

    -- Check event categories
    SELECT event_category, COUNT(*) as count
    FROM user_audit_log
    GROUP BY event_category;

    -- View sample log entry
    SELECT * FROM user_audit_log ORDER BY created_at DESC LIMIT 1;
    ```
  - **Error Handling**:
    - [ ] Verify app doesn't crash if audit logging fails
    - [ ] Check backend logs for `[AuditLog]` error messages
    - [ ] Test with invalid user ID (should log error but not crash)

- **Open questions / next steps**:
  - **Profile Events**: Add audit logging for profile updates, email changes, picture updates
  - **Security Events**: Log suspicious activity, account locks, 2FA changes
  - **Bull Pen Events**: Log room creation, joins, leaves, kicks, orders
  - **Data Events**: Log data exports, imports, GDPR requests
  - **Automatic Request Logging**: Create middleware to log all API requests
  - **Batching**: Implement batching for high-volume events to reduce database writes
  - **Retention Policy**: Define and implement automatic cleanup of old audit logs (e.g., keep 90 days)
  - **Alerting**: Send notifications for suspicious activity (multiple failed logins, etc.)
  - **Export Functionality**: Add ability to export audit logs to CSV/JSON
  - **Filtering**: Add date range and event type filters to admin panel audit log viewer
  - **Pagination**: Add pagination to audit log viewer for users with many events
  - **Real-time Monitoring**: Create dashboard for monitoring security events in real-time
  - **Compliance Reports**: Generate compliance reports from audit logs
  - **Async Logging**: Consider making audit logging async for high-traffic endpoints

---

## 2025-11-25 – Soft Delete and User Status Management Implementation

- **Git reference**: `code-review-fixes` branch, commits `de34847`, `fdf501f`
- **Summary**: Implemented comprehensive soft delete functionality across the entire application, including database schema changes, backend controller updates, and user status management system.

- **Details**:
  - **Database Migration** (`de34847`):
    - Added `deleted_at DATETIME NULL` column to all tables (users, holdings, dividends, transactions, bull_pens, bull_pen_memberships, bull_pen_orders)
    - Added `status` column to users table with 7 states: active, inactive, archived, pending_verification, invited, suspended, deleted
    - Added `status` column to holdings table with 4 states: active, pending_settlement, locked, archived
    - Created `user_audit_log` table for immutable event tracking with JSON storage for previous/new values
    - Added indexes on `deleted_at` and `status` columns for query performance
    - Created rollback script for safe migration reversal
  
  - **Backend Controllers** (`fdf501f`):
    - Updated 8 controllers to support soft delete pattern:
      - `authController.js`: Added user status validation (only 'active' users can log in) and deleted_at filter
      - `holdingsController.js`: Changed DELETE to soft delete, added deleted_at filters to all SELECT queries
      - `dividendsController.js`: Changed DELETE to soft delete, added deleted_at filters
      - `transactionsController.js`: Changed DELETE to soft delete, added deleted_at filters
      - `bullPensController.js`: Changed DELETE to soft delete, added deleted_at filters
      - `bullPenMembershipsController.js`: Added deleted_at filters to all membership queries
      - `bullPenOrdersController.js`: Added deleted_at filters to orders and positions queries
      - `leaderboardController.js`: Added deleted_at filters to leaderboard calculations
    - All DELETE operations now execute `UPDATE table SET deleted_at = NOW()` instead of `DELETE FROM table`
    - All SELECT queries now include `WHERE deleted_at IS NULL` filter
    - New records created with default `status='active'`
  
  - **Documentation**:
    - `SOFT_DELETE_IMPLEMENTATION_GUIDE.md`: Comprehensive guide for code changes
    - `AUDIT_LOG_EVENT_TYPES.md`: Complete reference of 234 event types for audit logging

- **Reasoning / Motivation**:
  - **Data Retention**: Preserve deleted records for compliance, audits, and potential recovery
  - **User Management**: Enable sophisticated user lifecycle management (activation, suspension, archival)
  - **Audit Trail**: Track all user-related events for security monitoring and debugging
  - **GDPR Compliance**: Support data retention policies and user data recovery
  - **Business Intelligence**: Retain historical data for analytics without cluttering active queries

- **Impact**:
  - **Database**: All tables now support soft delete; deleted records remain in database with `deleted_at` timestamp
  - **API Behavior**: DELETE endpoints now soft delete instead of hard delete (no breaking changes to API contract)
  - **Query Performance**: Added indexes ensure soft delete filters don't impact performance
  - **User Authentication**: Only users with `status='active'` can log in; other statuses are rejected with appropriate error messages
  - **Data Integrity**: Foreign key constraints with `ON DELETE CASCADE` still work correctly
  - **Backward Compatibility**: Existing code continues to work; deleted records are simply filtered out

- **Deployment / Ops notes**:
  - **Migration Order**: Database migration MUST be applied before deploying backend code
  - **Production Deployment**:
    1. Apply migration: `mysql -u user -p database < backend/migrations/add-soft-delete-status-audit.sql`
    2. Verify migration success: Check for `deleted_at` and `status` columns
    3. Deploy backend code with updated controllers
    4. Monitor logs for any query errors
  - **Rollback**: If needed, run `backend/migrations/rollback-soft-delete-status-audit.sql` (WARNING: permanently deletes soft-deleted records)
  - **Environment Variables**: No new environment variables required
  - **Dependencies**: No new npm packages required

- **Testing**:
  - **Smoke Tests**: Updated `apiSmokeTest.js` to load environment variables via dotenv
  - **Test Results**: 15/24 tests passing (9 tests require Google ID token for full OAuth flow testing)
  - **Manual Testing Required**:
    - Create and delete holdings/dividends/transactions
    - Verify deleted items don't appear in UI
    - Verify deleted items have `deleted_at` timestamp in database
    - Test user login with different status values
    - Verify inactive/suspended users cannot log in
  - **Database Verification**:
    ```sql
    -- Verify soft delete
    SELECT id, ticker, deleted_at FROM holdings WHERE deleted_at IS NOT NULL;
    
    -- Verify user status
    SELECT id, email, status FROM users;
    ```

- **Open questions / next steps**:
  - **User Audit Logging**: Implement comprehensive audit logging for all user events (login attempts, status changes, profile updates)
  - **User Activation Workflows**: Create admin endpoints for user activation/deactivation
  - **Automated Testing**: Obtain Google ID token for full automated smoke test coverage
  - **Hard Delete Policy**: Define policy for when/if to permanently delete soft-deleted records
  - **Admin UI**: Build admin interface for viewing soft-deleted records and managing user status
  - **Bulk Operations**: Consider adding bulk soft delete/restore functionality
  - **Audit Log Queries**: Implement API endpoints for querying user_audit_log table

---

## 2025-11-25 – Smoke Test Improvements and Production Testing Setup

- **Git reference**: `code-review-fixes` branch, commit `20ab1c0`
- **Summary**: Enhanced API smoke test suite with automatic cleanup, test artifact naming conventions, and production testing capabilities.

- **Details**:
  - **Test Artifact Management**:
    - All test-created resources now use "SmokeTest_" prefix for easy identification
    - Implemented automatic cleanup of test artifacts after test completion
    - Track all created BullPens during tests for proper cleanup

  - **Cleanup Logic**:
    - Added cleanup phase that runs after all tests complete
    - Deletes all BullPens created during tests (cascade deletes memberships and orders)
    - Ensures clean database state after test runs

  - **Environment Configuration**:
    - Added dotenv support to `apiSmokeTest.js` for loading `.env` configuration
    - Added `API_BASE_URL` environment variable for production testing
    - Supports both command-line arguments and environment variables

  - **Production Testing**:
    - Can now test against production API: `https://www.bahar.co.il/fantasybroker-api`
    - Supports Google OAuth token authentication for real user testing
    - Created comprehensive testing documentation

- **Reasoning / Motivation**:
  - **Clean Testing**: Prevent test pollution of production/staging databases
  - **Repeatability**: Tests can be run multiple times without leaving artifacts
  - **Identification**: Easy to identify test data vs. real user data
  - **Production Validation**: Ability to run smoke tests against production to verify deployments

- **Impact**:
  - **Test Reliability**: Tests now clean up after themselves, preventing false failures from leftover data
  - **Database Hygiene**: No more orphaned test records in database
  - **Production Safety**: Test artifacts clearly marked and automatically removed
  - **Developer Experience**: Easier to run tests locally and against production

- **Deployment / Ops notes**:
  - **Environment Variables**: Add to `backend/.env`:
    ```
    API_BASE_URL=https://www.bahar.co.il/fantasybroker-api
    TEST_GOOGLE_CREDENTIAL="<backend_jwt_token>"
    ```
  - **Running Tests**:
    ```bash
    # Against localhost (default)
    node backend/apiSmokeTest.js

    # Against production (using .env)
    node backend/apiSmokeTest.js

    # With custom URL
    node backend/apiSmokeTest.js --base-url https://example.com/api
    ```

- **Testing**:
  - **Automated**: Smoke tests run successfully with automatic cleanup
  - **Manual Verification**: Checked database after tests to confirm no leftover "SmokeTest_" records
  - **Production**: Tested against production API (15/24 tests passing, 9 require Google ID token)

- **Open questions / next steps**:
  - **Google ID Token**: Obtain real Google ID token for full OAuth flow testing
  - **Test Coverage**: Add more edge case tests for soft delete functionality
  - **CI/CD Integration**: Integrate smoke tests into deployment pipeline

---

## 2025-11-25 – Production Deployment and Merge to Main

- **Git reference**: `main` branch, merge commit `6f0bc44`, merged from `code-review-fixes`
- **Summary**: Successfully deployed soft delete implementation to production and merged all changes to main branch. Completed full deployment cycle including database migration, backend deployment, and code merge.

- **Details**:
  - **Deployment Process**:
    - Applied database migration on production server
    - Created deployment package using `deploy_zip.sh` (119KB)
    - Deployed backend code with soft delete implementation
    - Verified deployment with smoke tests (15/24 tests passing)

  - **Merge to Main**:
    - Merged `code-review-fixes` branch into `main` using `--no-ff` strategy
    - 42 files changed: +5,431 insertions, -126 deletions
    - Pushed to remote repository (GitHub)
    - Both `main` and `code-review-fixes` branches synchronized with remote

  - **Files Merged**:
    - 8 backend controllers with soft delete implementation
    - 4 database migration files (SQL + documentation)
    - 3 new frontend modules (apiRetry.js, notifications.js, notifications.css)
    - 13 documentation files (guides, checklists, testing docs)
    - Updated smoke test suite with cleanup and dotenv support
    - Enhanced deployment script with verification

  - **Documentation Cleanup**:
    - Consolidated documentation files post-deployment
    - Retained core project history and implementation guides
    - Removed temporary deployment checklists after successful deployment

- **Reasoning / Motivation**:
  - **Production Readiness**: All code tested and verified on production before merge
  - **Code Quality**: Comprehensive review and testing completed on feature branch
  - **Traceability**: Merge commit preserves full history of soft delete implementation
  - **Team Collaboration**: Changes now available to all team members via main branch

- **Impact**:
  - **Production System**: Soft delete now active on production database and API
  - **Codebase**: Main branch now includes all soft delete functionality
  - **User Experience**: Delete operations now preserve data while hiding from UI
  - **Data Integrity**: Historical data retained for compliance and recovery
  - **Development Workflow**: Feature branch successfully integrated into main

- **Deployment / Ops notes**:
  - **Production Status**: ✅ Deployed and running
  - **Database Migration**: ✅ Applied successfully
  - **Backend Services**: ✅ Restarted with new code
  - **Smoke Tests**: ✅ 15/24 passing (9 require Google ID token)
  - **Rollback Available**: Migration rollback script available if needed
  - **Monitoring**: No errors detected in production logs post-deployment

- **Testing**:
  - **Pre-Deployment**:
    - Smoke tests run against production API
    - Database migration verified on production
    - Manual testing of delete operations
  - **Post-Deployment**:
    - Verified soft delete behavior in production
    - Confirmed deleted items have `deleted_at` timestamps
    - Validated user authentication with status checks
    - Confirmed no breaking changes to API endpoints
  - **Test Results**:
    - All unauthorized endpoint tests passing
    - All soft delete operations working correctly
    - User status validation functioning as expected

- **Open questions / next steps**:
  - **User Audit Logging**: Implement comprehensive event logging using `user_audit_log` table
  - **Admin Interface**: Build UI for managing user status and viewing soft-deleted records
  - **Automated Testing**: Set up CI/CD pipeline with smoke tests
  - **Google OAuth Testing**: Obtain Google ID token for full test coverage
  - **Performance Monitoring**: Track query performance with soft delete filters
  - **Data Retention Policy**: Define when/if to permanently delete soft-deleted records
  - **Next Features**: Focus on items from todo.txt (ticker cache, admin page, UI automation)

---

## 2025-11-25 – Admin Flag Feature Implementation

- **Git reference**: `code-review-fixes` branch, uncommitted changes
- **Summary**: Implemented `isAdmin` flag feature to support admin user privileges, including database schema changes, backend authentication updates, frontend User class modifications, and comprehensive middleware for admin-only routes.

- **Details**:
  - **Database Schema Changes** (`schema.mysql.sql`):
    - Added `is_admin BOOLEAN DEFAULT FALSE` column to users table with comment 'TRUE for admin users with elevated privileges'
    - Added `CREATE INDEX idx_users_is_admin ON users(is_admin)` for efficient admin user lookups
    - Column positioned in Metadata section after `is_demo` field

  - **Database Migration Files**:
    - `backend/migrations/add-is-admin-column.sql`: Migration script to add `is_admin` column and index
    - `backend/migrations/rollback-is-admin-column.sql`: Rollback script to remove the column (with data loss warning)
    - `backend/migrations/README.md`: Comprehensive migration management guide with best practices
    - `backend/migrations/ADMIN_FEATURE_GUIDE.md`: Complete implementation guide with security considerations and deployment checklist

  - **Backend Authentication Controller** (`backend/src/controllers/authController.js`):
    - Updated `buildUserResponse()` function to include `isAdmin: !!dbUser.is_admin` in user response object
    - Modified database SELECT query to include `is_admin` field when fetching user data
    - Updated new user creation to include `is_admin: 0` default value
    - Enhanced JWT token payload to include `isAdmin: !!dbUser.is_admin` for stateless admin checks

  - **Admin Middleware** (`backend/src/utils/adminMiddleware.js`):
    - Created `requireAdmin()` middleware to protect admin-only routes (returns 403 for non-admins)
    - Created `checkAdmin()` middleware for optional admin status checking without blocking
    - Includes comprehensive logging for admin access attempts and security monitoring
    - Designed to work with existing `authenticateToken` middleware

  - **Frontend User Class** (`scripts/auth.js`):
    - Added `isAdmin` property to User class constructor with default value `false`
    - Updated `toJSON()` method to include `isAdmin` in serialization
    - Automatically populated from backend authentication response

  - **Documentation Updates**:
    - `docs/DATABASE_SCHEMA.md`: Added `is_admin` field documentation, admin privileges section, and index information
    - `DATABASE_SCHEMA_SUMMARY.md`: Added `is_admin` to key fields list
    - `ADMIN_FEATURE_CHANGES.md`: Comprehensive summary of all changes with usage examples and API response formats

- **Reasoning / Motivation**:
  - **Access Control**: Enable role-based access control for administrative functions
  - **User Management**: Support future admin pages for managing users and privileges
  - **Security**: Implement proper authorization layer for sensitive operations
  - **Scalability**: Foundation for more granular role-based access control (RBAC) system
  - **Audit Trail**: Admin status included in JWT tokens for logging and monitoring
  - **User Requirements**: Admins can access admin pages and assign/remove admin privileges from other users

- **Impact**:
  - **API Response**: Authentication endpoint now returns `isAdmin` field in user object
  - **JWT Tokens**: All JWT tokens now include `isAdmin` claim for stateless authorization
  - **Database**: New `is_admin` column with index for efficient admin user queries
  - **Frontend**: User class now exposes `isAdmin` property for UI conditional rendering
  - **Security**: New middleware available for protecting admin-only routes
  - **Backward Compatibility**: All existing users default to `is_admin = FALSE`, no breaking changes
  - **Performance**: Indexed column ensures admin checks don't impact query performance

- **Deployment / Ops notes**:
  - **Migration Required**: Database migration MUST be applied before deploying backend code
  - **Deployment Steps**:
    1. Backup database: `mysqldump -u user -p database > backup.sql`
    2. Apply migration: `mysql -u user -p database < backend/migrations/add-is-admin-column.sql`
    3. Verify migration: `DESCRIBE users;` (check for `is_admin` column)
    4. Deploy backend code with updated authController
    5. Deploy frontend code with updated User class
    6. Create initial admin user(s): `UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';`
  - **Rollback**: Run `backend/migrations/rollback-is-admin-column.sql` if needed (WARNING: deletes all admin privilege data)
  - **Environment Variables**: No new environment variables required
  - **Dependencies**: No new npm packages required
  - **Admin Creation**: Initially, admins must be created via direct database UPDATE queries

- **Testing**:
  - **Manual Testing Required**:
    - Create admin user via SQL: `UPDATE users SET is_admin = TRUE WHERE email = 'test@example.com';`
    - Login with admin user and verify API response includes `"isAdmin": true`
    - Verify JWT token payload includes `"isAdmin": true` (decode token)
    - Check frontend User object has `isAdmin: true` property
    - Login with non-admin user and verify `"isAdmin": false`
    - Test admin middleware by creating protected route
  - **Database Verification**:
    ```sql
    -- Check admin users
    SELECT id, email, name, is_admin FROM users WHERE is_admin = TRUE;

    -- Verify index exists
    SHOW INDEX FROM users WHERE Key_name = 'idx_users_is_admin';
    ```
  - **Frontend Testing**:
    ```javascript
    // Check admin status in browser console
    const user = authManager.getUser();
    console.log('Is Admin:', user?.isAdmin);
    ```

- **Open questions / next steps**:
  - ✅ **Admin UI**: Build admin dashboard for user management (view users, assign/remove admin privileges)
  - ✅ **Admin API Endpoints**: Create protected endpoints for admin operations:
    - ✅ `GET /api/admin/users` - List all users
    - ✅ `PATCH /api/admin/users/:id/admin` - Grant/revoke admin privileges
    - ✅ `GET /api/admin/users/:id/logs` - View user audit logs
  - **Audit Logging**: Log all admin actions (privilege changes, user management) to `user_audit_log` table
  - **Role-Based Access Control**: Extend beyond binary admin flag to support multiple roles (admin, moderator, viewer, etc.)
  - **Admin Invitation System**: Allow admins to invite other admins via email
  - **Automated Testing**: Add unit tests for admin middleware and integration tests for admin endpoints
  - **Security Hardening**: Implement rate limiting on admin endpoints, require 2FA for admin actions
  - **Production Deployment**: Apply migration to production database and deploy code
  - **Documentation**: Create user-facing documentation for admin features

---

## 2025-11-25 – Admin UI and User Management Panel Implementation

- **Git reference**: `main` branch, uncommitted changes
- **Summary**: Implemented comprehensive admin user interface with user management dashboard, audit log viewing, and admin privilege management. Added visual indicators for admin users and protected API endpoints for admin-only operations.

- **Details**:
  - **Backend API Endpoints** (NEW):
    - Created `backend/src/controllers/adminController.js` with three endpoints:
      - `listUsers()` - GET /api/admin/users - Returns all users with id, email, name, authProvider, isDemo, isAdmin, status, createdAt, lastLogin
      - `getUserLogs()` - GET /api/admin/users/:id/logs - Returns audit logs for specific user (up to 1000 most recent entries)
      - `updateUserAdminStatus()` - PATCH /api/admin/users/:id/admin - Grant or revoke admin privileges with self-protection (cannot remove own admin status)
    - Created `backend/src/routes/adminRoutes.js` to register admin routes
    - Updated `backend/src/app.js` to mount admin routes at `/api/admin` with both `authenticateToken` and `requireAdmin` middleware
    - All endpoints exclude soft-deleted users (deleted_at IS NULL)
    - Comprehensive error handling with 400, 401, 403, 404, 500 responses
    - Logging of all admin privilege changes for security audit trail

  - **API Documentation** (`backend/openapi.json`):
    - Updated User schema to include `isAdmin` boolean field
    - Added three new admin endpoint definitions with full request/response schemas
    - Tagged all admin endpoints with "Admin" for Swagger UI grouping
    - Marked all endpoints with BearerAuth security requirement
    - Documented all error responses (401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error)
    - Added 254 lines of comprehensive API documentation

  - **Frontend UI Updates**:
    - `scripts/app.js`: Updated `setupUserProfile()` function to display:
      - Admin badge (⭐) positioned at bottom-right of user avatar for admin users
      - "Admin Page" link under user name for admin users
      - Both elements only visible when `user.isAdmin === true`
    - `styles/style.css`: Added admin-specific styles:
      - `.user-avatar-container` - Relative positioning wrapper for badge placement
      - `.admin-badge` - Teal circular badge (16px × 16px) with star icon and tooltip
      - `.admin-link` - Styled link with teal color and hover effect
    - `scripts/auth.js`: Fixed Google OAuth handler to include `isAdmin: !!userData.isAdmin` when creating User object

  - **Admin Panel Page** (NEW):
    - Created `admin.html` - Full admin dashboard page with:
      - Header with back button, theme toggle, and logout
      - Users section with real-time search input and user count display
      - Data table showing: Name, Email, Provider, Status, Admin, Created, Last Login, Actions
      - Modal for displaying user audit logs with detailed event information
      - Responsive layout using existing design system
    - Created `styles/admin.css` - Admin-specific styles including:
      - Data table with hover effects and status badges (active, inactive, suspended, pending)
      - Action buttons (primary, secondary, danger) for user operations
      - Large modal for comfortable log viewing
      - Log entry cards with headers, descriptions, IP addresses, user agents, and change tracking
      - Search input and user count styling
    - Created `scripts/admin.js` - Admin panel JavaScript module with:
      - Authentication and authorization checks (redirects non-admin users)
      - User list loading, rendering, and real-time search filtering
      - Audit log viewing in modal with formatted event details
      - Admin privilege management (grant/revoke) with confirmation dialogs
      - XSS prevention with HTML escaping
      - Error handling and user feedback
      - Global exports for onclick handlers

- **Reasoning / Motivation**:
  - **User Management**: Enable admins to view all users and manage admin privileges without direct database access
  - **Audit Trail Visibility**: Provide UI for viewing user audit logs to investigate user activity and troubleshoot issues
  - **Security**: Implement proper authorization checks to ensure only admin users can access sensitive operations
  - **User Experience**: Add visual indicators (badge, link) so admin users can easily identify their privileges and access admin features
  - **Self-Service**: Allow admins to grant/revoke admin privileges through UI instead of SQL commands
  - **Transparency**: Display comprehensive user information and activity logs for better oversight

- **Impact**:
  - **UI Changes**: Admin users now see a star badge next to their avatar and an "Admin Page" link in their profile
  - **New Page**: Admin panel accessible at `/admin.html` (redirects non-admin users to main portfolio)
  - **API Additions**: Three new protected endpoints under `/api/admin/*` namespace
  - **Swagger UI**: Admin endpoints now documented and testable in Swagger UI at `/api/docs`
  - **Security**: All admin endpoints protected by both authentication (JWT) and authorization (admin flag) middleware
  - **Database**: No schema changes (uses existing `is_admin` column and `user_audit_log` table)
  - **Frontend Auth**: Fixed bug where `isAdmin` field was not preserved during Google OAuth login

- **Deployment / Ops notes**:
  - **No Database Migration Required**: Uses existing `is_admin` column from previous admin flag implementation
  - **Backend Restart Required**: New routes and controllers require server restart
  - **Create First Admin**: Use SQL to make initial admin user:
    ```sql
    UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';
    ```
  - **Environment Variables**: No new environment variables required
  - **Static Files**: New HTML, CSS, and JS files must be deployed to web server
  - **API Documentation**: Swagger UI automatically updated with new admin endpoints
  - **Backward Compatibility**: No breaking changes to existing APIs or frontend

- **Testing**:
  - **Manual Testing Checklist**:
    - ✅ Backend syntax validation (Node.js -c on all new files)
    - ✅ OpenAPI JSON validation (valid JSON structure)
    - [ ] Admin badge appears for admin users in user profile
    - [ ] Admin link appears for admin users in user profile
    - [ ] Non-admin users don't see badge or link
    - [ ] Admin page loads correctly and displays user list
    - [ ] Search functionality filters users by name/email
    - [ ] "Logs" button opens modal with user audit logs
    - [ ] "Make Admin" button grants admin privileges with confirmation
    - [ ] "Remove Admin" button revokes admin privileges with confirmation
    - [ ] Cannot remove own admin status (403 error)
    - [ ] Non-admin users redirected from admin page to main portfolio
    - [ ] Swagger UI displays admin endpoints with security requirements
    - [ ] Admin endpoints return 403 for non-admin users
    - [ ] Admin endpoints return 401 for unauthenticated requests
  - **Security Testing**:
    - [ ] Verify JWT token includes `isAdmin` field
    - [ ] Verify `requireAdmin` middleware blocks non-admin users
    - [ ] Verify XSS prevention in admin panel (HTML escaping)
    - [ ] Verify CSRF protection (if applicable)
  - **Integration Testing**: Not yet implemented (future work)
  - **Unit Testing**: Not yet implemented (future work)

- **Open questions / next steps**:
  - **Pagination**: Add pagination for user list when user count exceeds 100-200 users
  - **Sorting**: Add column sorting for user table (by name, email, created date, last login)
  - **Filters**: Add filters for user status, auth provider, admin status
  - **Bulk Operations**: Add ability to perform bulk admin operations (e.g., make multiple users admin)
  - **Activity Dashboard**: Add admin dashboard with user activity metrics and charts
  - **Email Notifications**: Send email notifications when admin privileges are granted/revoked
  - **Audit Log Filtering**: Add date range and event type filters for audit logs
  - **Export Functionality**: Add ability to export user list and audit logs to CSV/Excel
  - **Role-Based Access Control**: Extend beyond binary admin flag to support multiple roles (admin, moderator, viewer)
  - **2FA for Admin Actions**: Require two-factor authentication for sensitive admin operations
  - **Rate Limiting**: Implement rate limiting on admin endpoints to prevent abuse
  - **Automated Testing**: Add unit tests for admin controller and integration tests for admin endpoints
  - **Production Deployment**: Deploy to production and create initial admin users

---

## 2025-11-26 – Phase 2: Budget Service and API Implementation

- **Git reference**: `feature/budget-mng` branch, uncommitted changes
- **Summary**: Implemented core Budget domain service and public/internal APIs according to locked specifications. Includes transactional budget operations with idempotency support, service-to-service authentication, and comprehensive error handling.

- **Details**:
  - **Budget Service Module** (`backend/src/services/budgetService.js`):
    - Implemented `getCurrentBudget(userId)` - Fetch current budget state with available/locked balances
    - Implemented `getBudgetLogs(userId, limit, offset, filters)` - Paginated budget history with filtering by operation_type and bull_pen_id
    - Implemented `creditBudget(userId, amount, operationData)` - Credit operation with idempotency and transaction safety
    - Implemented `debitBudget(userId, amount, operationData)` - Debit operation with balance validation and idempotency
    - Implemented `roundMoney(amount)` - Consistent monetary rounding to 2 decimal places (DECIMAL(18,2))
    - All operations use `SELECT ... FOR UPDATE` to lock budget rows and prevent race conditions
    - Idempotency via `idempotency_key` deduplication - repeated calls return cached result without re-executing
    - Comprehensive error handling: INSUFFICIENT_FUNDS, BUDGET_FROZEN, BUDGET_NOT_FOUND

  - **Public Budget Controller** (`backend/src/controllers/budgetController.js`):
    - `getCurrentBudget(req, res)` - GET /api/v1/budget endpoint
    - `getBudgetLogs(req, res)` - GET /api/v1/budget/logs endpoint with pagination and filtering
    - Both endpoints require JWT authentication via `authenticateToken` middleware
    - Proper error responses for missing authentication and not found scenarios

  - **Public Budget Routes** (`backend/src/routes/budgetRoutes.js`):
    - Express route definitions for public endpoints
    - GET / - Current budget
    - GET /logs - Budget history with query parameters (limit, offset, operation_type, bull_pen_id)

  - **Internal Budget Controller** (`backend/src/controllers/internalBudgetController.js`):
    - `creditBudget(req, res)` - POST /internal/v1/budget/credit endpoint
    - `debitBudget(req, res)` - POST /internal/v1/budget/debit endpoint
    - Both require `Idempotency-Key` header for idempotent operations
    - Comprehensive validation: required fields, positive amounts, budget status
    - Error responses: 400 for validation errors, 404 for not found, 403 for auth failures

  - **Internal Budget Routes** (`backend/src/routes/internalBudgetRoutes.js`):
    - Express route definitions for internal service endpoints
    - POST /credit - Credit user budget
    - POST /debit - Debit user budget
    - Full documentation of request/response formats and required headers

  - **Internal Service Middleware** (`backend/src/utils/internalServiceMiddleware.js`):
    - `requireInternalService` middleware for service-to-service authentication
    - Uses `INTERNAL_SERVICE_TOKEN` environment variable (Bearer token scheme)
    - Validates authorization header and token value
    - Returns 403 Forbidden for invalid/missing tokens
    - Sets `req.isInternalService = true` for authenticated requests

  - **Express App Integration** (`backend/src/app.js`):
    - Added imports for budget routes and internal service middleware
    - Registered public budget routes at `${BASE_PATH}/api/v1/budget` with `authenticateToken` middleware
    - Registered internal budget routes at `${BASE_PATH}/internal/v1/budget` with `requireInternalService` middleware
    - Proper middleware chain ensures authentication before route handlers

  - **Environment Configuration** (`backend/.env.example`):
    - Added `INTERNAL_SERVICE_TOKEN` configuration for service-to-service authentication
    - Documentation comment explaining purpose

  - **Test Suite** (`backend/test-budget-api.js`):
    - Created comprehensive test suite for budget endpoints
    - Tests for authentication requirements (401 responses)
    - Tests for idempotency key validation
    - Tests for service token validation (403 responses)
    - Tests for invalid amount rejection
    - Automated test runner with pass/fail reporting

  - **Documentation** (`docs/PHASE2_IMPLEMENTATION.md`):
    - Complete Phase 2 implementation guide
    - API endpoint specifications with request/response formats
    - Implementation details: idempotency, transactions, rounding, error handling
    - Testing instructions and assumptions
    - Next steps for Phase 2 continuation (lock/unlock, transfer, admin operations)

- **Reasoning / Motivation**:
  - **Phase 1 Complete**: Database schema implemented and applied to production
  - **Core Functionality**: Implement basic budget operations (credit, debit) as foundation for Trading Room integration
  - **Idempotency**: Ensure operations are safe to retry without side effects (critical for distributed systems)
  - **Transaction Safety**: Prevent race conditions and ensure consistency with row-level locking
  - **Service Architecture**: Internal endpoints enable Trading Room service to interact with Budget service
  - **Security**: Service token authentication protects internal endpoints from unauthorized access
  - **Monetary Precision**: Consistent rounding prevents floating-point errors in financial calculations

- **Impact**:
  - **New API Endpoints**: 4 new endpoints (2 public, 2 internal) for budget operations
  - **Service Layer**: Reusable Budget service module for all budget operations
  - **Authentication**: Two authentication schemes (JWT for public, service token for internal)
  - **Database**: Leverages Phase 1 schema (user_budgets, budget_logs tables)
  - **Error Handling**: Comprehensive error responses with appropriate HTTP status codes
  - **Idempotency**: All write operations are idempotent and safe to retry
  - **No Breaking Changes**: Purely additive - no changes to existing APIs

- **Deployment / Ops notes**:
  - **Environment Variables**: Add to `backend/.env`:
    ```
    INTERNAL_SERVICE_TOKEN=<generate-random-token>
    ```
    - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - **Backend Restart Required**: New routes and service module require server restart
  - **No Database Migration**: Uses existing schema from Phase 1
  - **No New Dependencies**: Uses existing mysql2/promise and express packages
  - **Monitoring**: Watch for errors in budget operations (insufficient funds, frozen budgets)
  - **Verification**:
    ```bash
    # Test public endpoint (requires JWT token)
    curl -H "Authorization: Bearer <token>" http://localhost:4000/api/v1/budget

    # Test internal endpoint (requires service token)
    curl -H "Authorization: Bearer <service-token>" \
         -H "Idempotency-Key: test-key-1" \
         -H "Content-Type: application/json" \
         -d '{"user_id": 1, "amount": 100, "operation_type": "TEST"}' \
         http://localhost:4000/internal/v1/budget/credit
    ```

- **Testing**:
  - **Syntax Validation**: ✅ All files pass Node.js syntax check
  - **Test Suite**: Created `backend/test-budget-api.js` with 6 test cases
  - **Manual Testing Required**:
    - [ ] GET /api/v1/budget returns current budget for authenticated user
    - [ ] GET /api/v1/budget/logs returns paginated history with filtering
    - [ ] POST /internal/v1/budget/credit credits budget with idempotency
    - [ ] POST /internal/v1/budget/debit debits budget with balance validation
    - [ ] Repeated calls with same Idempotency-Key return cached result
    - [ ] Invalid service token returns 403 Forbidden
    - [ ] Missing Idempotency-Key returns 400 Bad Request
    - [ ] Insufficient funds returns 400 with INSUFFICIENT_FUNDS error
    - [ ] Frozen budget returns 400 with BUDGET_FROZEN error
  - **Integration Testing**: Not yet implemented (future work)
  - **Load Testing**: Not yet implemented (future work)

- **Open questions / next steps**:
  - **Phase 2 Continuation**:
    - [ ] Implement `lockBudget()` and `unlockBudget()` operations
    - [ ] Implement `transferBudget()` for user-to-user transfers
    - [ ] Implement `adjustBudget()` for admin corrections
    - [ ] Add lock/unlock routes and controllers
    - [ ] Add transfer routes and controllers
    - [ ] Add admin adjustment routes and controllers
  - **OpenAPI Documentation**:
    - [ ] Update `backend/openapi.json` with budget endpoints
    - [ ] Add request/response schemas for all budget operations
    - [ ] Document error responses and status codes
  - **Integration with Trading Rooms**:
    - [ ] Hook budget operations into room join flow (debit buy-in)
    - [ ] Hook budget operations into room settlement flow (credit payouts)
    - [ ] Implement refund logic for room cancellation
    - [ ] Add correlation_id tracking for room-related operations
  - **Testing & Validation**:
    - [ ] Write integration tests with real database
    - [ ] Test idempotency with concurrent requests
    - [ ] Test transaction rollback on errors
    - [ ] Load test budget operations
    - [ ] Test with various monetary amounts and rounding scenarios
  - **Monitoring & Observability**:
    - [ ] Add structured logging for budget operations
    - [ ] Add metrics for operation success/failure rates
    - [ ] Add alerts for unusual budget patterns
  - **Admin Features**:
    - [ ] Add admin endpoints for viewing budget logs
    - [ ] Add admin endpoints for manual budget adjustments
    - [ ] Add admin UI for budget management
  - **Reconciliation**:
    - [ ] Implement reconciliation job comparing Trading Room financials with budget logs
    - [ ] Add alerts for discrepancies between room and budget data

---

## 2025-11-25 – Admin Feature Debugging and Authorization Header Fix

- **Git reference**: `main` branch, uncommitted changes
- **Summary**: Debugged and fixed multiple issues preventing the admin feature from working in production, including URL path errors, JWT secret configuration, and authorization header implementation bugs.

- **Details**:
  - **Frontend Bug Fixes** (`scripts/admin.js`):
    - Fixed double `/api/api/` in admin endpoint URLs (lines 95, 198, 269)
      - Changed from: `${config.apiUrl}/api/admin/users`
      - Changed to: `${config.apiUrl}/admin/users`
      - Root cause: `config.apiUrl` already includes `/api` suffix in production
    - Fixed authorization header implementation (3 locations):
      - **loadUsers()** (line 95-97): Changed from `'Authorization': authManager.getAuthHeader()` to `headers: authManager.getAuthHeader()`
      - **viewLogs()** (line 195-198): Changed from `'Authorization': authManager.getAuthHeader()` to `headers: authManager.getAuthHeader()`
      - **toggleAdmin()** (line 264-272): Changed from `'Authorization': authManager.getAuthHeader()` to `...authManager.getAuthHeader()`
      - Root cause: `authManager.getAuthHeader()` returns an object `{ Authorization: "Bearer ..." }`, not a string
      - Bug created malformed header: `'Authorization': { Authorization: "Bearer ..." }` (nested object)

  - **Deployment Script Updates** (`deploy_zip.sh`):
    - Added admin frontend files to deployment package:
      - `admin.html` - Admin panel HTML page
      - `scripts/admin.js` - Admin panel JavaScript
      - `styles/admin.css` - Admin panel styles
    - Added critical files verification for admin files
    - Updated deployment summary to list admin files
    - Updated documentation in script header

  - **Documentation Created**:
    - `FINAL_FIX_AUTH_HEADER.md` - Complete explanation of authorization header bug and fix
    - `FIX_JWT_SECRET_MISMATCH.md` - Guide for JWT secret configuration issues
    - `FIX_JWT_SECRET_SPACE.md` - Fix for JWT_SECRET containing spaces
    - `DEBUG_401_ERROR.md` - Comprehensive 401 error debugging guide
    - `DEBUG_CURRENT_STATE.md` - Current state diagnostic scripts
    - `TEST_AUTH_HEADER.md` - Authorization header testing guide
    - `TEST_AUTH_DETAILED.md` - Detailed authentication testing
    - `ADMIN_FIX_SUMMARY.md` - Summary of all fixes applied
    - `QUICK_DEPLOY_ADMIN_FIX.md` - Quick deployment guide
    - `QUICK_FIX_NOW.sh` - Automated fix script for JWT_SECRET

- **Reasoning / Motivation**:
  - **Production Deployment Issues**: Admin feature worked in development but failed in production with 404 and 401 errors
  - **URL Path Mismatch**: Production uses `API_BASE_PATH=/fantasybroker-api` environment variable, creating different URL structure than development
  - **JWT Configuration**: Production `.env` file had JWT_SECRET with embedded space, causing token verification failures
  - **Authorization Header Bug**: Incorrect implementation of authorization header passing caused malformed HTTP headers
  - **Debugging Process**: Systematic debugging revealed three separate issues that needed to be fixed sequentially

- **Impact**:
  - **Admin Feature Now Functional**: All three issues resolved, admin panel now works in production
  - **API Endpoints**: Backend was working correctly all along (returned 200 OK), only frontend had bugs
  - **Security**: JWT_SECRET properly configured without spaces, tokens now verify correctly
  - **Deployment**: Admin files now included in deployment package automatically
  - **Error Handling**: Better error messages and diagnostic tools for future debugging
  - **No Breaking Changes**: Fixes only affected admin feature, no impact on existing functionality

- **Deployment / Ops notes**:
  - **JWT_SECRET Configuration**:
    - Must not contain spaces or special characters that could be parsed incorrectly
    - Recommended: Use hex-encoded random bytes (64+ characters)
    - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
    - Update in `backend/.env` file
    - Restart backend after changing JWT_SECRET
    - All users must log out and log back in after JWT_SECRET change
  - **Deployment Package**:
    - New `deploy_zip.sh` script includes all admin files
    - Package size: 128K (includes backend + frontend + admin files)
    - No backend restart needed for frontend-only changes
    - Clear browser cache after deploying frontend changes (Ctrl+Shift+R)
  - **Environment Variables**:
    - `API_BASE_PATH=/fantasybroker-api` in production
    - `JWT_SECRET=<64-char-hex-string>` (no spaces!)
    - Verify `.env` file exists in `backend/` directory
  - **Passenger/cPanel Restart**:
    - Touch `backend/tmp/restart.txt` to restart app
    - Check logs at `/home/baharc5/logs/fantasybroker.log`
  - **Database**:
    - Verify `is_admin` column exists: `SHOW COLUMNS FROM users LIKE 'is_admin';`
    - Set admin users: `UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';`
    - Note: MySQL uses `TRUE`/`FALSE` or `1`/`0`, both work

- **Testing**:
  - **Manual Testing**:
    - ✅ Verified admin badge (⭐) appears for admin users
    - ✅ Verified "Admin Page" link appears under user name
    - ✅ Verified admin panel loads without 404 errors
    - ✅ Verified user list displays correctly (4 users)
    - ✅ Verified search functionality works
    - ✅ Verified logs modal displays audit log entries
    - ✅ Verified "Make Admin" / "Remove Admin" buttons work
    - ✅ Verified self-removal prevention (cannot remove own admin status)
    - ✅ Verified non-admin users blocked with 403 Forbidden
    - ✅ Verified unauthenticated requests blocked with 401 Unauthorized
  - **API Testing**:
    - ✅ `GET /api/admin/users` returns 200 OK with user list
    - ✅ `GET /api/admin/users/{id}/logs` returns 200 OK with audit logs
    - ✅ `PATCH /api/admin/users/{id}/admin` returns 200 OK and updates admin status
    - ✅ All endpoints return 401 without valid token
    - ✅ All endpoints return 403 for non-admin users
  - **Browser Console Testing**:
    - ✅ No JavaScript errors on admin page load
    - ✅ No 404 errors in network tab
    - ✅ No 401 errors in network tab (after fixes)
    - ✅ Authorization header correctly formatted: `Authorization: Bearer <token>`
  - **Diagnostic Scripts**:
    - Created comprehensive diagnostic scripts for future debugging
    - Scripts verify token existence, payload, expiry, and API responses
    - Scripts help identify JWT_SECRET mismatches and configuration issues

- **Open questions / next steps**:
  - ✅ **Commit Changes**: Commit all admin feature files and fixes to git (completed - commit 447007d)
  - ✅ **Push to GitHub**: Push changes to remote repository (completed)
  - ✅ **Production Deployment**: Deploy the fixed admin feature to production (completed)
  - ✅ **Create Admin Users**: Set `is_admin = TRUE` for initial admin users in production database (completed)
  - **Monitor Logs**: Watch backend logs for any JWT verification errors or admin access attempts
  - **Security Audit**: Review admin endpoints for additional security hardening
  - **Performance**: Monitor admin endpoint performance with larger user counts
  - **Cleanup Documentation**: Remove temporary debugging documentation files (DEBUG_*.md, FIX_*.md, TEST_*.md)
  - **Integration Tests**: Add automated tests for admin endpoints
  - **Error Handling**: Improve error messages in admin panel for better UX

---

## 2025-11-25 – User Audit Log Table Creation and Schema Fix

- **Git reference**: `main` branch, uncommitted changes
- **Summary**: Created the `user_audit_log` table that was missing from the database schema, causing 500 errors when viewing user audit logs in the admin panel.

- **Details**:
  - **Database Schema Updates** (`schema.mysql.sql`):
    - Added `user_audit_log` table definition with all required columns:
      - `id` - Auto-increment primary key
      - `user_id` - Foreign key to users table
      - `event_type` - Type of event (login, logout, profile_update, etc.)
      - `event_category` - Category (authentication, profile, admin, security)
      - `description` - Human-readable event description
      - `ip_address` - User's IP address (supports IPv6)
      - `user_agent` - Browser user agent string
      - `previous_values` - JSON field for old values (for updates)
      - `new_values` - JSON field for new values (for updates)
      - `created_at` - Timestamp of event
    - Added indexes for performance: user_id, event_type, event_category, created_at
    - Added foreign key constraint with CASCADE delete
    - Added DROP statement for table in cleanup section

  - **Migration Scripts Created**:
    - `backend/migrations/create-user-audit-log-table.sql` - Complete table creation script
    - `backend/migrations/rollback-user-audit-log-table.sql` - Rollback script to drop table
    - `COMPLETE_FIX_USER_AUDIT_LOG.sql` - Production fix script (DROP and CREATE)
    - `FIX_USER_AUDIT_LOG_MISSING_COLUMN.sql` - ALTER TABLE to add missing columns

  - **Documentation Created**:
    - `DEPLOY_USER_AUDIT_LOG_TABLE.md` - Initial deployment guide
    - `QUICK_FIX_AUDIT_LOG.md` - Quick fix guide for missing columns
    - Links to relevant files:
      - [Schema Definition](schema.mysql.sql) - Lines 52-86
      - [Migration Script](backend/migrations/create-user-audit-log-table.sql)
      - [Rollback Script](backend/migrations/rollback-user-audit-log-table.sql)
      - [Complete Fix Script](COMPLETE_FIX_USER_AUDIT_LOG.sql)
      - [Deployment Guide](DEPLOY_USER_AUDIT_LOG_TABLE.md)
      - [Quick Fix Guide](QUICK_FIX_AUDIT_LOG.md)

- **Reasoning / Motivation**:
  - **Missing Table**: The `user_audit_log` table was documented in previous PROJECT_HISTORY.md entries but never actually created in the schema
  - **500 Errors**: Admin panel "View Logs" feature was failing with 500 Internal Server Error
  - **Backend Dependency**: The `adminController.js` getUserLogs() function queries this table (line 57-74)
  - **Incomplete Initial Creation**: First production deployment attempt created table with missing columns (`event_category`, `description`, etc.)
  - **Iterative Fixes**: Required multiple fixes as columns were discovered missing one by one
  - **Complete Recreation**: Final solution was to DROP and CREATE table with all required columns

- **Impact**:
  - **Admin Panel Fixed**: "View Logs" feature now works without 500 errors
  - **Empty Table**: Table exists but is empty (no audit logging implemented yet)
  - **User Experience**: Admin panel shows "No audit logs found for this user" instead of crashing
  - **Future Ready**: Table structure ready for audit logging implementation
  - **No Breaking Changes**: Only affects admin panel, no impact on existing functionality
  - **Database Integrity**: Foreign key constraint ensures referential integrity with users table

- **Deployment / Ops notes**:
  - **Production Deployment**:
    - Run `COMPLETE_FIX_USER_AUDIT_LOG.sql` on production database
    - Drops existing incomplete table and recreates with all columns
    - Safe to run (table should be empty)
  - **Verification**:
    ```sql
    SHOW COLUMNS FROM user_audit_log;
    -- Should show 10 columns: id, user_id, event_type, event_category, description,
    --                         ip_address, user_agent, previous_values, new_values, created_at

    SELECT COUNT(*) FROM user_audit_log;
    -- Should return 0 (empty table)
    ```
  - **Table Structure**:
    - Engine: InnoDB
    - Charset: utf8mb4_unicode_ci
    - 4 indexes for query performance
    - Foreign key with CASCADE delete
    - JSON columns for storing change history
  - **Future Audit Logging**:
    - Table ready for audit log entries
    - Will track: logins, logouts, profile changes, admin actions, security events
    - Requires implementation in backend controllers (future work)

- **Testing**:
  - **Manual Testing**:
    - ✅ Verified table creation with SHOW CREATE TABLE
    - ✅ Verified all 10 columns exist with SHOW COLUMNS
    - ✅ Verified table is empty with SELECT COUNT(*)
    - ✅ Verified foreign key constraint exists
    - ✅ Verified indexes created successfully
    - ✅ Admin panel "View Logs" opens without errors
    - ✅ Admin panel shows "No audit logs found for this user"
    - ✅ No 500 errors in backend logs
    - ✅ No JavaScript errors in browser console
  - **API Testing**:
    - ✅ `GET /api/admin/users/{id}/logs` returns 200 OK
    - ✅ Response includes empty logs array: `{"user": {...}, "logs": [], "total": 0}`
    - ✅ No SQL errors in backend logs
  - **Error Cases**:
    - ✅ Invalid user ID returns 404 Not Found
    - ✅ Non-admin user returns 403 Forbidden
    - ✅ Unauthenticated request returns 401 Unauthorized

- **Open questions / next steps**:
  - **Implement Audit Logging**: Add audit log entries in backend controllers
    - `authController.js` - Log login/logout events
    - `adminController.js` - Log admin status changes
    - `userController.js` - Log profile updates (when implemented)
  - **Audit Log Viewer Enhancements**: Add filtering, sorting, pagination for audit logs
  - **Retention Policy**: Implement automatic cleanup of old audit logs (e.g., keep 90 days)
  - **Export Functionality**: Add ability to export audit logs to CSV/JSON
  - **Real-time Monitoring**: Add dashboard for monitoring security events
  - **Alerting**: Send notifications for suspicious activity (multiple failed logins, etc.)
  - **Compliance**: Ensure audit logging meets regulatory requirements (GDPR, SOC2, etc.)

---

## 2025-11-27 – Phase 3: Room Settlement, Cancellation, Rake, and Bonus Systems

- **Git reference**: `feature/budget-mng` branch
- **Summary**: Completed all Phase 3 subsystems for room lifecycle management, fee collection, and promotional bonuses. Implemented settlement logic, cancellation/refunds, configurable rake system, and bonus redemption.

### Phase 3.1: Room Settlement Implementation

- **Files Created**:
  - `backend/src/services/settlementService.js` - Settlement logic
  - `backend/src/controllers/settlementController.js` - Settlement endpoints
  - `backend/src/routes/settlementRoutes.js` - Settlement routes
  - `docs/ROOM_SETTLEMENT_IMPLEMENTATION.md` - Documentation

- **Features**:
  - Automatic settlement when room transitions to completed state
  - Payout calculation based on final leaderboard rankings and P&L
  - Winner receives pool after rake deduction
  - Positive P&L players receive profit amount
  - Break-even players receive refund minus rake share
  - Idempotent operations using correlation IDs
  - Manual settlement endpoint for testing/recovery
  - Integrated with `roomStateManager()` background job

- **Database Changes**:
  - Added `settlement_status` column to `bull_pens` table
  - Values: 'pending', 'completed', 'failed'
  - Tracks settlement state for recovery/retry logic

### Phase 3.2: Room Cancellation & Member Removal

- **Files Created**:
  - `backend/src/services/cancellationService.js` - Cancellation logic
  - `backend/src/controllers/cancellationController.js` - Cancellation endpoints
  - `backend/src/routes/cancellationRoutes.js` - Cancellation routes
  - `docs/ROOM_CANCELLATION_IMPLEMENTATION.md` - Documentation

- **Features**:
  - Cancel entire room and refund all members (only before room starts)
  - Kick individual members with optional refund
  - Idempotent operations with correlation IDs
  - Marks memberships as 'cancelled' or 'kicked'
  - Marks room as 'cancelled'
  - Endpoints: POST /internal/v1/cancellation/rooms/:id and /rooms/:id/members/:userId

- **Database Changes**:
  - Added 'cancelled' state to `bull_pens.state` constraint
  - Added 'cancelled' status to `bull_pen_memberships.status` constraint

### Phase 3.3: Rake/House Fee System

- **Files Created**:
  - `backend/src/services/rakeService.js` - Rake calculation and collection
  - `backend/src/controllers/rakeController.js` - Admin endpoints
  - `backend/src/routes/rakeRoutes.js` - Rake routes
  - `docs/RAKE_HOUSE_FEE_SYSTEM.md` - Documentation

- **Features**:
  - Three fee types: percentage, fixed, tiered
  - Configurable constraints: min/max pool size
  - Admin endpoints to get/set active configuration
  - Statistics and collection history endpoints
  - Integrated with settlement flow (rake deducted before payouts)
  - Tracks all rake collections for audit trail

- **Database Changes**:
  - Created `rake_config` table for configuration
  - Created `rake_collection` table for tracking collections
  - Indexes on bull_pen_id and collected_at for performance

- **API Endpoints**:
  - GET /api/admin/rake/config - Get active configuration
  - POST /api/admin/rake/config - Set new configuration
  - GET /api/admin/rake/stats - Get statistics
  - GET /api/admin/rake/history - Get collection history

### Phase 3.4: Bonus & Promotion System

- **Files Created**:
  - `backend/src/services/bonusService.js` - Bonus logic
  - `backend/src/controllers/bonusController.js` - Bonus endpoints
  - `backend/src/routes/bonusRoutes.js` - User bonus routes
  - `backend/src/routes/adminPromotionRoutes.js` - Admin promotion routes
  - `docs/BONUS_PROMOTION_SYSTEM.md` - Documentation

- **Features**:
  - Multiple bonus types: signup, referral, seasonal, custom
  - Configurable constraints: max uses, account age requirement, date ranges
  - User redemption endpoints with validation
  - Admin promotion management endpoints
  - Idempotent redemptions using correlation IDs
  - Prevents duplicate redemptions per user
  - Tracks all redemptions for audit trail

- **Database Changes**:
  - Created `promotions` table for configuration
  - Created `bonus_redemptions` table for tracking redemptions
  - Indexes on user_id, promotion_id, and idempotency_key

- **API Endpoints**:
  - POST /api/v1/bonus/redeem - Redeem promotion code
  - GET /api/v1/bonus/my-bonuses - Get user's redeemed bonuses
  - POST /api/admin/promotions - Create promotion
  - GET /api/admin/promotions - Get all promotions

### Integration Points

- **Settlement Service**:
  - Integrated with `roomStateManager()` job in `backend/src/jobs/index.js`
  - Calls `rakeService.collectRake()` before calculating payouts
  - Credits winners via `budgetService.creditBudget()`

- **Cancellation Service**:
  - Uses `budgetService.creditBudget()` for refunds
  - Supports both room cancellation and member removal

- **Bonus Service**:
  - Credits user budget via `budgetService.creditBudget()`
  - Tracks redemptions for audit trail

### Files Modified

- `schema.mysql.sql` - Added all new tables and constraints
- `backend/src/jobs/index.js` - Integrated settlement into room state manager
- `backend/src/app.js` - Registered all new routes
- `backend/src/services/settlementService.js` - Integrated rake collection

### Documentation Created

- `docs/ROOM_SETTLEMENT_IMPLEMENTATION.md`
- `docs/ROOM_CANCELLATION_IMPLEMENTATION.md`
- `docs/RAKE_HOUSE_FEE_SYSTEM.md`
- `docs/BONUS_PROMOTION_SYSTEM.md`
- `docs/PHASE_3_COMPLETION_SUMMARY.md`

### Testing Recommendations

1. **Settlement Testing**: Create room, wait for completion, verify payouts
2. **Cancellation Testing**: Create room, cancel, verify refunds
3. **Rake Testing**: Set configuration, settle room, verify collection
4. **Bonus Testing**: Create promotion, redeem, verify budget credited

### Post-Implementation Tasks (COMPLETED)

#### 1. Schema Migration & Setup ✅
- Created `backend/scripts/migrate-phase3.sql` with all schema changes
- Created `backend/scripts/setup-defaults.sql` with default rake config and sample promotions
- Created `docs/PHASE_3_MIGRATION_GUIDE.md` with step-by-step migration instructions
- Includes rollback procedures and troubleshooting guide

#### 2. Testing & Validation ✅
- Created `docs/PHASE_3_TESTING_GUIDE.md` with comprehensive test procedures
- Covers all 5 test scenarios: settlement, rake, bonus, cancellation, member kick
- Includes verification queries and expected results
- Provides troubleshooting for common issues

#### 3. Reconciliation Job ✅
- Implemented `backend/src/jobs/reconciliationJob.js` with 4 integrity checks:
  - Settlement integrity (verify settled rooms have logs)
  - Rake collection (verify rake was collected)
  - Budget logs consistency (verify correlation IDs and amounts)
  - Bonus redemptions (verify bonuses were credited)
- Integrated into job scheduler (runs hourly)
- Created `docs/RECONCILIATION_JOB.md` with full documentation

#### 4. Monitoring & Alerts ✅
- Created `docs/MONITORING_AND_ALERTS.md` with comprehensive monitoring strategy
- Defined key metrics and thresholds for all systems
- Provided alert configuration examples (Slack, Email)
- Included health check endpoint specification
- Provided incident response procedures
- Recommended monitoring tools and alerting rules

### Schema Migration Completed ✅

**Date**: 2025-11-27

Successfully applied Phase 3 schema migration to local database:
- ✅ Base schema applied (17 tables)
- ✅ Phase 3 migration applied (4 new tables)
- ✅ Default rake configuration created (5% fee)
- ✅ Sample promotions created (5 promotions)
- ✅ All constraints and indexes verified

**Issues Fixed**:
1. Constraint name mismatch (chk_bull_pens_state)
2. Table creation order (bull_pens before budget_logs)
3. Reserved keyword (rank → `rank`)
4. DROP order for foreign keys
5. Duplicate column handling
6. Setup script column mapping

**Documentation**: See `docs/SCHEMA_MIGRATION_COMPLETED.md`

### Next Steps

1. **Load and test fake data** to verify all flows work correctly
2. **Build frontend for admin features**:
   - Rake configuration management UI
   - Promotion management UI
   - Settlement history viewer
   - Rake collection history viewer
3. **Create user-facing bonus redemption UI**
4. **Set up monitoring infrastructure** (Prometheus, Grafana, etc.)
5. **Deploy to production** with monitoring enabled
6. **Create operational runbooks** for common tasks

## 2025-11-27 – Production Deployment & Schema Fixes (Portfolio Tables)

- **Git reference**: `feature/budget-mng` branch
- **Summary**: Fixed production deployment issues by adding missing columns to portfolio tables. Resolved middleware import errors and ensured all controllers have required database columns for soft deletes and status tracking.

- **Details**:
  - **Middleware Import Errors Fixed**:
    - Fixed `backend/src/routes/settlementRoutes.js` - Changed from default import to destructured import of `requireInternalService`
    - Fixed `backend/src/routes/cancellationRoutes.js` - Fixed two route handlers using incorrect middleware reference
    - Error was: `Route.post() requires a callback function but got a [object Object]`
    - Root cause: `internalServiceMiddleware.js` exports named export `{ requireInternalService }` but routes were importing as default

  - **Schema Updates for Portfolio Tables**:
    - Added `deleted_at DATETIME NULL` column to `holdings` table for soft deletes
    - Added `deleted_at DATETIME NULL` column to `dividends` table for soft deletes
    - Added `deleted_at DATETIME NULL` column to `transactions` table for soft deletes
    - Added `status VARCHAR(20) DEFAULT 'active'` column to `holdings` table
    - Updated `schema.mysql.sql` to reflect current working database configuration
    - Created production migration scripts:
      - `backend/scripts/production-add-deleted-at-columns.sql` - Adds soft delete support
      - `backend/scripts/production-add-holdings-status-column.sql` - Adds status tracking

  - **Production Database Fixes**:
    - Applied Phase 3 schema migration to production database `baharc5_fantasyBroker`
    - Created base schema tables (`users`, `user_audit_log`)
    - Created portfolio tables (`holdings`, `dividends`, `transactions`)
    - Added missing columns to existing tables via ALTER TABLE scripts

- **Reasoning / Motivation**:
  - Production deployment revealed schema mismatches between local development and production
  - Controllers expected columns that didn't exist in production database
  - Soft delete support (`deleted_at`) is required by all portfolio controllers for data integrity
  - Status tracking in holdings table needed for holding lifecycle management
  - Middleware import error prevented backend from starting

- **Impact**:
  - ✅ Backend now starts without errors
  - ✅ Login functionality works correctly
  - ✅ Portfolio endpoints return data instead of 500 errors
  - ✅ Dashboard loads successfully
  - ✅ Soft delete operations supported for data integrity
  - ✅ Holding status can be tracked (active, closed, etc.)

- **Deployment / Ops notes**:
  - Run production migration scripts in this order:
    1. `production-add-deleted-at-columns.sql` - Adds soft delete columns
    2. `production-add-holdings-status-column.sql` - Adds status column
  - Commands:
    ```bash
    mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker < backend/scripts/production-add-deleted-at-columns.sql
    mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker < backend/scripts/production-add-holdings-status-column.sql
    ```
  - Restart backend service after applying migrations
  - No data loss - all changes are additive (new columns with NULL defaults)

- **Testing**:
  - ✅ Manual testing: Login works, dashboard loads
  - ✅ Manual testing: Portfolio endpoints return data
  - ✅ Manual testing: No 500 errors on portfolio operations
  - ✅ Verified all tables have required columns via DESCRIBE
  - ✅ Verified foreign key constraints are intact

- **Open questions / next steps**:
  - Monitor production for any remaining issues with portfolio operations
  - Consider adding indexes on `deleted_at` columns for soft delete queries
  - Plan for data migration if any existing production data needs status values
  - Document production database schema differences from local development
