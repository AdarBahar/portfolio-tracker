# Production Deployment Guide - Phase 3

**Date**: 2025-11-27  
**Status**: Ready for Deployment  
**Database**: baharc5_fantasyBroker (production)

---

## 🚀 Quick Start

Run these commands on your production server to deploy Phase 3:

```bash
# 1. Apply schema migration
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker < backend/scripts/production-schema-complete.sql

# 2. Setup default configuration
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker < backend/scripts/production-setup-complete.sql

# 3. Restart the backend service
# (Use your deployment method - systemctl, docker, pm2, etc.)
```

---

## 📋 What Gets Deployed

### Schema Changes
- ✅ Add `settlement_status` column to `bull_pens`
- ✅ Update `bull_pens` state constraint (add 'cancelled')
- ✅ Update `bull_pen_memberships` status constraint (add 'cancelled', 'kicked')
- ✅ Create `rake_config` table
- ✅ Create `rake_collection` table
- ✅ Create `promotions` table
- ✅ Create `bonus_redemptions` table

### Default Configuration
- ✅ Default rake: 5% percentage fee
- ✅ 5 sample promotions (signup, referral, seasonal, custom)

---

## ✅ Verification

After deployment, verify everything is working:

```bash
# Check tables exist
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker -e "SHOW TABLES;"

# Check rake config
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker -e "SELECT * FROM rake_config;"

# Check promotions
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker -e "SELECT * FROM promotions WHERE is_active = TRUE;"

# Test login endpoint
curl -X POST https://www.bahar.co.il/fantasybroker-api/api/health
```

---

## 🔍 Troubleshooting

### Issue: Access Denied
```
ERROR 1045 (28000): Access denied for user 'baharc5_fantasyBroker'
```
**Solution**: Check credentials and network access to database server

### Issue: Table Already Exists
```
ERROR 1050 (42S01): Table 'rake_config' already exists
```
**Solution**: This is OK - the script uses `IF NOT EXISTS` and will skip existing tables

### Issue: Foreign Key Constraint Failed
```
ERROR 1452 (23000): Cannot add or update a child row
```
**Solution**: Ensure all parent tables exist before running the script

---

## 📊 Files Included

1. **production-schema-complete.sql** - Complete schema migration
2. **production-setup-complete.sql** - Default configuration
3. **PRODUCTION_DEPLOYMENT_GUIDE.md** - This guide

---

## 🔄 Rollback Plan

If something goes wrong, you can rollback by:

```bash
# Drop Phase 3 tables (if needed)
mysql -h 213.165.242.8 -u baharc5_fantasyBroker -p'4PAec@TRh1k!1!6' baharc5_fantasyBroker -e "
DROP TABLE IF EXISTS bonus_redemptions;
DROP TABLE IF EXISTS rake_collection;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS rake_config;
"

# Restart service
# (Use your deployment method)
```

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the error message carefully
3. Verify database connectivity
4. Check that all prerequisites are met

---

## ✨ Next Steps After Deployment

1. ✅ Test login endpoint
2. ✅ Verify settlement flows
3. ✅ Test bonus redemption
4. ✅ Monitor logs for errors
5. ✅ Build frontend for admin features

**Status**: Ready for Production Deployment

