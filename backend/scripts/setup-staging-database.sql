-- Staging Database Setup Script
-- This script creates the staging database and user for testing
-- Run this script as root or with sufficient privileges

-- Create staging database
CREATE DATABASE IF NOT EXISTS `baharc5_fantasyBroker-staging`;

-- Create staging user
CREATE USER IF NOT EXISTS 'baharc5_fantacyBroker-staging'@'localhost' IDENTIFIED BY 'DE%vl@$sXAEZj43O';

-- Grant all privileges on staging database
GRANT ALL PRIVILEGES ON `baharc5_fantasyBroker-staging`.* TO 'baharc5_fantacyBroker-staging'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Verify user was created
SELECT User, Host FROM mysql.user WHERE User = 'baharc5_fantacyBroker-staging';

-- Verify database was created
SHOW DATABASES LIKE '%fantasyBroker-staging%';

-- Note: After running this script, import the schema:
-- mysql -u baharc5_fantacyBroker-staging -p baharc5_fantasyBroker-staging < schema.mysql.sql

