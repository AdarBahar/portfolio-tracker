# Fix Auth 500 Error - Missing Base Schema Tables

**Issue**: Login endpoint returning 500 error  
**Root Cause**: Production database is missing the `users` and `user_audit_log` tables

---

## 🔍 Problem Analysis

The auth controller tries to:
1. Query the `users` table to find existing users
2. Check the `status` column in the `users` table
3. Write to the `user_audit_log` table

Since we only applied the Phase 3 migration, the base schema tables were never created in production.

---

## 🔧 Solution

Run this command on production to create the base schema tables:

```bash
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker < backend/scripts/production-base-schema.sql
```

This will create:
- ✅ `users` table with all authentication fields
- ✅ `user_audit_log` table for tracking events
- ✅ All necessary constraints and indexes

---

## ✅ Verification

After running the script, verify the tables exist:

```bash
# Check tables
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker -e "SHOW TABLES LIKE 'user%';"

# Check users table structure
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker -e "DESCRIBE users;"
```

Expected output:
```
Tables_in_baharc5_fantasyBroker (user%)
user_audit_log
users
```

---

## 🚀 After Creating Tables

1. **Restart the backend service**:
```bash
systemctl restart fantasybroker-api
```

2. **Test the login endpoint**:
```bash
curl https://www.bahar.co.il/fantasybroker-api/api/health
```

3. **Try logging in** at https://www.bahar.co.il/fantasybroker/login.html

---

## 📋 What Gets Created

### users table
- id (primary key)
- email (unique)
- name
- auth_provider (email, google, demo)
- password_hash (for email auth)
- google_id (for Google OAuth)
- profile_picture
- is_demo (boolean)
- is_admin (boolean)
- **status** (active, suspended, deleted)
- last_login
- created_at, updated_at, deleted_at

### user_audit_log table
- id (primary key)
- user_id (foreign key to users)
- event_type (login, logout, profile_update, etc.)
- event_category (authentication, profile, admin, security)
- description
- ip_address
- user_agent
- previous_values (JSON)
- new_values (JSON)
- created_at

---

**Status**: Ready to fix auth 500 error

