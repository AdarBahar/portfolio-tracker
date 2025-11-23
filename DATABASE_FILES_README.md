# Database Files Overview

## 🎯 Database Schema

This project uses **MySQL/MariaDB** for the database.

### **Schema File**

- ✅ **`schema.mysql.sql`** - MySQL-compatible schema (USE THIS FILE)

### **Documentation Files**

- ✅ **`DATABASE_SETUP_MYSQL.md`** - Step-by-step setup guide
- ✅ **`DATABASE_MIGRATION_GUIDE.md`** - Complete backend migration guide
- ✅ **`DATABASE_SCHEMA_DIAGRAM.md`** - Visual schema reference
- ✅ **`DATABASE_SCHEMA_SUMMARY.md`** - Quick reference

---

## 📁 File Descriptions

### Schema File

| File | Lines | Purpose |
|------|-------|---------|
| `schema.mysql.sql` | 150 | **MySQL schema - Import this into your database** |

### Documentation

| File | Purpose |
|------|---------|
| `DATABASE_SETUP_MYSQL.md` | **Step-by-step MySQL setup guide** |

### Reference Documentation

| File | Purpose |
|------|---------|
| `DATABASE_MIGRATION_GUIDE.md` | Complete backend migration guide |
| `DATABASE_SCHEMA_DIAGRAM.md` | Visual diagrams and relationships |
| `DATABASE_SCHEMA_SUMMARY.md` | Quick reference for tables/fields |
| `DATABASE_FILES_README.md` | This file - overview of all files |

---

## 🚀 Quick Start for MySQL (Your Setup)

### 1. Create Database

**Using phpMyAdmin:**
1. Open phpMyAdmin
2. Click "New"
3. Database name: `portfolio_tracker`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

**Using command line:**
```bash
mysql -u root -p
CREATE DATABASE portfolio_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2. Run Schema

**Using phpMyAdmin:**
1. Select `portfolio_tracker` database
2. Click "Import" tab
3. Choose file: `schema.mysql.sql`
4. Click "Go"

**Using command line:**
```bash
mysql -u root -p portfolio_tracker < schema.mysql.sql
```

### 3. Verify

```sql
SHOW TABLES;
-- Should show: users, holdings, dividends, transactions

DESCRIBE users;
-- Should show all user fields including google_id, profile_picture, etc.
```

---

---

## ✅ What the Schema Supports

The MySQL schema supports:
- ✅ Google OAuth authentication
- ✅ Email/password authentication
- ✅ Demo mode
- ✅ User profile pictures
- ✅ Per-user data isolation
- ✅ Holdings, dividends, transactions
- ✅ Foreign key constraints
- ✅ Cascade delete
- ✅ Indexes for performance
- ✅ Check constraints (on supported versions)

---

## 📊 Database Schema Overview

```
users (1) ──────< holdings (*)
  │
  ├──────< dividends (*)
  │
  └──────< transactions (*)
```

**4 Tables:**
1. **users** - User accounts (Google OAuth, email/password, demo)
2. **holdings** - Stock holdings per user
3. **dividends** - Dividend records per user
4. **transactions** - Transaction history per user

**11 Indexes** for fast queries

**Complete data isolation** - each user's data is separate

---

## 🎯 Your Next Steps

1. ✅ **Use `schema.mysql.sql`** - The MySQL schema file
2. ✅ **Follow `DATABASE_SETUP_MYSQL.md`** for detailed setup instructions
3. 🔲 Create database in phpMyAdmin or command line
4. 🔲 Import `schema.mysql.sql`
5. 🔲 Verify tables were created
6. 🔲 Test with sample data (optional)
7. 🔲 Set up backend API (see `DATABASE_MIGRATION_GUIDE.md`)

---

## 💡 Tips

### For cPanel Hosting
- Database name will be prefixed: `cpanel_user_portfolio_tracker`
- User will be prefixed: `cpanel_user_portfolio_user`
- Use phpMyAdmin from cPanel for easy management
- Connection host is usually `localhost`

### For MAMP (Local Development)
- Default user: `root`
- Default password: `root`
- Default port: `8889` (not 3306)
- Use phpMyAdmin at `http://localhost:8888/phpMyAdmin`

### For XAMPP (Local Development)
- Default user: `root`
- Default password: (empty)
- Default port: `3306`
- Use phpMyAdmin at `http://localhost/phpmyadmin`

---

## 🆘 Troubleshooting

### "Unknown collation: utf8mb4_unicode_ci"
❌ Your MySQL version is too old
✅ Update MySQL or change to `utf8_general_ci`

### "CHECK constraint is violated"
❌ Your MySQL/MariaDB version doesn't support CHECK constraints
✅ Update to MySQL 8.0.16+ or MariaDB 10.2.1+

### "Table already exists"
✅ Drop tables first:
```sql
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS dividends;
DROP TABLE IF EXISTS holdings;
DROP TABLE IF EXISTS users;
```

---

## 📖 Additional Resources

- **MySQL Documentation:** https://dev.mysql.com/doc/
- **MariaDB Documentation:** https://mariadb.com/kb/en/
- **phpMyAdmin Documentation:** https://docs.phpmyadmin.net/

---

**Ready to create your database! 🎉**

**Start with:** `schema.mysql.sql` + `DATABASE_SETUP_MYSQL.md`

