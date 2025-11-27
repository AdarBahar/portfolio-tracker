# Database Setup Guide - MySQL/MariaDB

## Quick Start

### 1. Create MySQL Database

**Option A: Using mysql command line**
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE portfolio_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional, for security)
CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON portfolio_tracker.* TO 'portfolio_user'@'localhost';
FLUSH PRIVILEGES;

# Exit
EXIT;
```

**Option B: Using phpMyAdmin**
1. Open phpMyAdmin
2. Click "New" in the left sidebar
3. Database name: `portfolio_tracker`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

**Option C: Using cPanel**
1. Login to cPanel
2. Go to "MySQL Databases"
3. Create Database: `portfolio_tracker`
4. Create User: `portfolio_user` with a strong password
5. Add User to Database with "All Privileges"

---

### 2. Run Schema SQL

**Option A: Command line**
```bash
# Navigate to project directory
cd /path/to/portfolio-tracker

# Run schema.mysql.sql
mysql -u root -p portfolio_tracker < schema.mysql.sql

# Or with custom user
mysql -u portfolio_user -p portfolio_tracker < schema.mysql.sql
```

**Option B: Using phpMyAdmin**
1. Open phpMyAdmin
2. Select `portfolio_tracker` database
3. Click "Import" tab
4. Choose file: `schema.mysql.sql`
5. Click "Go"

**Option C: Copy and paste**
1. Open `schema.mysql.sql` in a text editor
2. Copy all contents
3. Open phpMyAdmin or MySQL Workbench
4. Select `portfolio_tracker` database
5. Go to SQL tab
6. Paste and click "Go"

---

### 3. Verify Installation

**Check tables were created:**
```sql
-- Show all tables
SHOW TABLES;

-- Expected output:
-- dividends
-- holdings
-- transactions
-- users
```

**Check table structure:**
```sql
-- View users table structure
DESCRIBE users;

-- View holdings table structure
DESCRIBE holdings;

-- View dividends table structure
DESCRIBE dividends;

-- View transactions table structure
DESCRIBE transactions;
```

**Check indexes:**
```sql
-- Show indexes for users table
SHOW INDEX FROM users;

-- Show indexes for holdings table
SHOW INDEX FROM holdings;
```

---

### 4. Test with Sample Data (Optional)

**Create a test user:**
```sql
-- Google OAuth user
INSERT INTO users (email, name, auth_provider, google_id, profile_picture)
VALUES (
    'test@gmail.com', 
    'Test User', 
    'google', 
    'google_test_123', 
    'https://lh3.googleusercontent.com/a/default-user'
);

-- Get the user ID
SELECT id, email, name, auth_provider FROM users;
```

**Add test holdings:**
```sql
-- Replace 1 with your user ID from above
INSERT INTO holdings (user_id, ticker, name, shares, purchase_price, purchase_date, sector, asset_class)
VALUES 
    (1, 'AAPL', 'Apple Inc.', 10, 150.00, '2024-01-15', 'Technology', 'Stock'),
    (1, 'MSFT', 'Microsoft Corporation', 5, 300.00, '2024-02-01', 'Technology', 'Stock');

-- Verify
SELECT * FROM holdings WHERE user_id = 1;
```

**Add test dividend:**
```sql
INSERT INTO dividends (user_id, ticker, amount, shares, date)
VALUES (1, 'AAPL', 0.24, 10, '2024-03-15');

-- Verify
SELECT * FROM dividends WHERE user_id = 1;
```

**Add test transaction:**
```sql
INSERT INTO transactions (user_id, type, ticker, shares, price, fees, date)
VALUES (1, 'buy', 'AAPL', 10, 150.00, 1.99, '2024-01-15');

-- Verify
SELECT * FROM transactions WHERE user_id = 1;
```

---

### 5. Clean Up Test Data (Optional)

```sql
-- Delete test user (CASCADE will delete all related data)
DELETE FROM users WHERE email = 'test@gmail.com';

-- Verify all data is gone
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM holdings;
SELECT COUNT(*) FROM dividends;
SELECT COUNT(*) FROM transactions;
```

---

## Connection Strings

### Local Development (MAMP/XAMPP)

**MySQL connection string:**
```
mysql://username:password@localhost:3306/portfolio_tracker
```

**Example for Node.js (mysql2):**
```javascript
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root', // MAMP default
    database: 'portfolio_tracker',
    port: 3306, // or 8889 for MAMP
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
```

**Example for Python (pymysql):**
```python
import pymysql
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='root',
    database='portfolio_tracker',
    port=3306,
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)
```

### Production (cPanel/Shared Hosting)

**Connection details from cPanel:**
- Host: `localhost` (or specific hostname from cPanel)
- User: `cpanel_username_portfolio_user`
- Password: (from cPanel MySQL Databases)
- Database: `cpanel_username_portfolio_tracker`
- Port: `3306`

**Example connection string:**
```
mysql://cpanel_user_portfolio:password@localhost:3306/cpanel_user_portfolio_tracker
```

---

## MySQL vs PostgreSQL Differences

The MySQL schema has these differences from PostgreSQL:

1. **AUTO_INCREMENT** instead of `SERIAL`
2. **DATETIME** instead of `TIMESTAMP`
3. **CURRENT_TIMESTAMP** instead of `NOW()`
4. **BOOLEAN** (stored as TINYINT(1))
5. **ENGINE=InnoDB** for foreign key support
6. **CHARSET=utf8mb4** for emoji support
7. **COMMENT** syntax is different (inline vs separate statement)
8. **CHECK constraints** (supported in MySQL 8.0.16+, MariaDB 10.2.1+)

---

## Troubleshooting

### "database does not exist"
```sql
CREATE DATABASE portfolio_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### "access denied"
```sql
GRANT ALL PRIVILEGES ON portfolio_tracker.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### "table already exists"
```sql
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS dividends;
DROP TABLE IF EXISTS holdings;
DROP TABLE IF EXISTS users;
```
Then run `schema.mysql.sql` again.

### "CHECK constraint is violated"
Your MySQL/MariaDB version might not support CHECK constraints. Update to:
- MySQL 8.0.16+ or
- MariaDB 10.2.1+

Or remove CHECK constraints from the schema (not recommended).

### "Unknown collation: 'utf8mb4_unicode_ci'"
Your MySQL version is too old. Either:
- Update MySQL/MariaDB
- Change to `utf8_general_ci` in the schema

---

## Useful Commands

```sql
-- View all users
SELECT id, email, name, auth_provider, is_demo, created_at FROM users;

-- View user's portfolio
SELECT h.ticker, h.name, h.shares, h.purchase_price, h.purchase_date
FROM holdings h
JOIN users u ON h.user_id = u.id
WHERE u.email = 'your@email.com';

-- View user's dividends
SELECT d.ticker, d.amount, d.shares, d.date
FROM dividends d
JOIN users u ON d.user_id = u.id
WHERE u.email = 'your@email.com';

-- Count users by auth provider
SELECT auth_provider, COUNT(*) as count
FROM users
GROUP BY auth_provider;

-- Database size
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'portfolio_tracker'
GROUP BY table_schema;

-- Table sizes
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'portfolio_tracker'
ORDER BY (data_length + index_length) DESC;
```

---

**Your MySQL database is ready! 🎉**

**Next steps:**
1. ✅ Database created
2. ✅ Schema applied
3. 🔲 Set up backend API (see `DATABASE_MIGRATION_GUIDE.md`)
4. 🔲 Update connection strings in backend
5. 🔲 Test API endpoints
6. 🔲 Deploy to production

