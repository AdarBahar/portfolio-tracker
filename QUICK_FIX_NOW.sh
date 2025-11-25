#!/bin/bash
# Quick fix for JWT_SECRET space issue

cd /home/baharc5/public_html/fantasybroker/backend

echo "=== Quick Fix for JWT_SECRET ==="

# Generate new secret (no spaces)
NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo "✅ Generated new secret (length: ${#NEW_SECRET})"

# Backup old .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backed up .env"

# Update JWT_SECRET (remove old line and add new one)
grep -v "^JWT_SECRET=" .env > .env.tmp
echo "JWT_SECRET=$NEW_SECRET" >> .env.tmp
mv .env.tmp .env
echo "✅ Updated JWT_SECRET in .env"

# Verify (show first 20 chars only for security)
echo "✅ New JWT_SECRET: ${NEW_SECRET:0:20}... (${#NEW_SECRET} chars, no spaces)"

# Install missing dependency
echo ""
echo "=== Installing node-cron ==="
npm install --save node-cron
echo "✅ Installed node-cron"

# Restart app
echo ""
echo "=== Restarting app ==="
touch tmp/restart.txt
echo "✅ App restarting..."

echo ""
echo "=== ✅ DONE! ==="
echo ""
echo "Next steps:"
echo "1. In browser console (F12), run: localStorage.clear(); location.reload();"
echo "2. Log in with Google (adar@bahar.co.il)"
echo "3. Click 'Admin Page' link"
echo "4. Should work now! 🚀"

