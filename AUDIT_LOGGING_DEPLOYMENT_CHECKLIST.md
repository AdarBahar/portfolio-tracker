# Audit Logging Deployment Checklist

## Pre-Deployment

### 1. Code Review
- [x] Review `backend/src/utils/auditLog.js` for correctness
- [x] Review `backend/src/controllers/authController.js` changes
- [x] Review `backend/src/controllers/adminController.js` changes
- [x] Verify no syntax errors: `node -c backend/src/utils/auditLog.js`
- [x] Verify no syntax errors: `node -c backend/src/controllers/authController.js`
- [x] Verify no syntax errors: `node -c backend/src/controllers/adminController.js`

### 2. Database Verification
- [ ] Verify `user_audit_log` table exists in production database
  ```sql
  SHOW TABLES LIKE 'user_audit_log';
  ```
- [ ] Verify table has all required columns
  ```sql
  SHOW COLUMNS FROM user_audit_log;
  ```
- [ ] Verify indexes exist
  ```sql
  SHOW INDEX FROM user_audit_log;
  ```

### 3. Documentation Review
- [x] Read `backend/AUDIT_LOGGING_GUIDE.md`
- [x] Read `backend/AUDIT_LOGGING_QUICK_REFERENCE.md`
- [x] Read `AUDIT_LOGGING_IMPLEMENTATION_SUMMARY.md`

## Deployment Steps

### 1. Backup
- [ ] Backup production database
  ```bash
  mysqldump -u user -p database > backup_$(date +%Y%m%d_%H%M%S).sql
  ```
- [ ] Backup current backend code
  ```bash
  cp -r backend backend_backup_$(date +%Y%m%d_%H%M%S)
  ```

### 2. Deploy Code
- [ ] Commit changes to git
  ```bash
  git add backend/src/utils/auditLog.js
  git add backend/src/controllers/authController.js
  git add backend/src/controllers/adminController.js
  git add backend/AUDIT_LOGGING_GUIDE.md
  git add backend/AUDIT_LOGGING_QUICK_REFERENCE.md
  git add AUDIT_LOGGING_IMPLEMENTATION_SUMMARY.md
  git add AUDIT_LOGGING_DEPLOYMENT_CHECKLIST.md
  git add PROJECT_HISTORY.md
  git commit -m "Implement audit logging system"
  ```
- [ ] Push to repository
  ```bash
  git push origin main
  ```
- [ ] Deploy to production server
  ```bash
  # Use your deployment script
  ./deploy_zip.sh
  # Or manually copy files
  ```

### 3. Restart Backend
- [ ] Restart backend server
  ```bash
  # For Passenger/cPanel
  touch backend/tmp/restart.txt
  
  # Or for PM2
  pm2 restart portfolio-tracker-backend
  
  # Or for systemd
  sudo systemctl restart portfolio-tracker-backend
  ```
- [ ] Verify server started successfully
  ```bash
  # Check logs
  tail -f /path/to/backend/logs
  ```

## Post-Deployment Testing

### 1. Health Check
- [ ] Verify API is responding
  ```bash
  curl https://www.bahar.co.il/fantasybroker-api/health
  ```
- [ ] Check for errors in backend logs
  ```bash
  tail -n 100 /home/baharc5/logs/fantasybroker.log
  ```

### 2. Authentication Event Testing
- [ ] Login with Google OAuth
- [ ] Verify `login_success` event in database
  ```sql
  SELECT * FROM user_audit_log 
  WHERE event_type = 'login_success' 
  ORDER BY created_at DESC LIMIT 1;
  ```
- [ ] Check IP address is captured correctly (not `::1`)
- [ ] Check user agent is captured correctly
- [ ] Verify `newValues` JSON is valid

### 3. Failed Login Testing
- [ ] Suspend a test user account
  ```sql
  UPDATE users SET status = 'suspended' WHERE email = 'test@example.com';
  ```
- [ ] Attempt to login with suspended account
- [ ] Verify `login_failed` event in database
  ```sql
  SELECT * FROM user_audit_log 
  WHERE event_type = 'login_failed' 
  ORDER BY created_at DESC LIMIT 1;
  ```
- [ ] Reactivate test user
  ```sql
  UPDATE users SET status = 'active' WHERE email = 'test@example.com';
  ```

### 4. New User Testing
- [ ] Create new user via Google OAuth (use different Google account)
- [ ] Verify `user_created` event in database
  ```sql
  SELECT * FROM user_audit_log 
  WHERE event_type = 'user_created' 
  ORDER BY created_at DESC LIMIT 1;
  ```

### 5. Admin Privilege Testing
- [ ] Login as admin user
- [ ] Navigate to admin panel (`/admin.html`)
- [ ] Grant admin privileges to a test user
- [ ] Verify 2 `admin_privilege_granted` events in database
  ```sql
  SELECT * FROM user_audit_log 
  WHERE event_type = 'admin_privilege_granted' 
  ORDER BY created_at DESC LIMIT 2;
  ```
- [ ] Revoke admin privileges from test user
- [ ] Verify 2 `admin_privilege_revoked` events in database
  ```sql
  SELECT * FROM user_audit_log 
  WHERE event_type = 'admin_privilege_revoked' 
  ORDER BY created_at DESC LIMIT 2;
  ```

### 6. Admin Panel Testing
- [ ] View audit logs for a user in admin panel
- [ ] Verify events display correctly with:
  - Event type and category
  - Description
  - IP address
  - User agent
  - Previous/new values
  - Timestamp

### 7. Error Handling Testing
- [ ] Temporarily break database connection
- [ ] Attempt to login
- [ ] Verify app doesn't crash
- [ ] Check backend logs for `[AuditLog]` error messages
- [ ] Restore database connection

## Monitoring

### 1. Check Audit Log Growth
- [ ] Monitor audit log table size
  ```sql
  SELECT COUNT(*) FROM user_audit_log;
  ```
- [ ] Check disk space usage
  ```sql
  SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
  FROM information_schema.TABLES 
  WHERE table_schema = 'portfolio_tracker' 
  AND table_name = 'user_audit_log';
  ```

### 2. Review Event Distribution
- [ ] Check event type distribution
  ```sql
  SELECT event_type, COUNT(*) as count 
  FROM user_audit_log 
  GROUP BY event_type 
  ORDER BY count DESC;
  ```
- [ ] Check event category distribution
  ```sql
  SELECT event_category, COUNT(*) as count 
  FROM user_audit_log 
  GROUP BY event_category 
  ORDER BY count DESC;
  ```

### 3. Monitor for Errors
- [ ] Watch backend logs for audit logging errors
  ```bash
  tail -f /path/to/logs | grep AuditLog
  ```
- [ ] Set up alerts for repeated audit logging failures

## Rollback Plan

If issues occur:

1. **Stop backend server**
2. **Restore backup code**
   ```bash
   rm -rf backend
   cp -r backend_backup_YYYYMMDD_HHMMSS backend
   ```
3. **Restart backend server**
4. **Verify app is working**
5. **Investigate issues**

Note: Audit logs already written will remain in database (no data loss).

## Success Criteria

- [x] All code deployed successfully
- [ ] Backend server running without errors
- [ ] Login events being logged
- [ ] Admin privilege changes being logged
- [ ] Admin panel displays audit logs correctly
- [ ] No performance degradation
- [ ] No errors in backend logs

## Next Steps After Deployment

1. Monitor audit logs for 24-48 hours
2. Review event patterns and distributions
3. Plan implementation of additional event types (logout, profile updates, etc.)
4. Define retention policy for old audit logs
5. Set up alerting for suspicious activity

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete | ⬜ Rolled Back

