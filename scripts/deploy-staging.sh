#!/bin/bash

# Staging Deployment Script
# This script deploys the Portfolio Tracker to the staging environment
# Usage: ./deploy-staging.sh

set -e

echo "=========================================="
echo "Portfolio Tracker - Staging Deployment"
echo "=========================================="

# Configuration
STAGING_BACKEND_PATH="/home/user/public_html/fantasybroker-api-staging"
STAGING_FRONTEND_PATH="/home/user/public_html/fantasybroker-staging"
REPO_PATH="/home/user/portfolio-tracker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
  echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
  echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[!]${NC} $1"
}

# Step 1: Pull latest code
echo ""
print_status "Pulling latest code from repository..."
cd "$REPO_PATH"
git pull origin main

# Step 2: Build frontend
echo ""
print_status "Building frontend for staging..."
cd "$REPO_PATH/frontend-react"
npm install
npm run build

# Step 3: Deploy frontend
echo ""
print_status "Deploying frontend to staging..."
rm -rf "$STAGING_FRONTEND_PATH"/*
cp -r "$REPO_PATH/react"/* "$STAGING_FRONTEND_PATH/"
print_status "Frontend deployed to $STAGING_FRONTEND_PATH"

# Step 4: Deploy backend
echo ""
print_status "Deploying backend to staging..."
cd "$STAGING_BACKEND_PATH"
git pull origin main
npm install

# Step 5: Copy staging environment file
echo ""
print_status "Setting up environment configuration..."
if [ ! -f "$STAGING_BACKEND_PATH/.env" ]; then
  cp "$REPO_PATH/backend/.env.staging" "$STAGING_BACKEND_PATH/.env"
  print_warning "Created .env file - please verify database credentials"
else
  print_warning ".env already exists - skipping (verify it's correct)"
fi

# Step 6: Restart Passenger
echo ""
print_status "Restarting Passenger..."
touch "$STAGING_BACKEND_PATH/tmp/restart.txt"
sleep 2

# Step 7: Verify deployment
echo ""
print_status "Verifying deployment..."

# Check frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://www.bahar.co.il/fantasybroker-staging/")
if [ "$FRONTEND_STATUS" = "200" ]; then
  print_status "Frontend is accessible (HTTP $FRONTEND_STATUS)"
else
  print_error "Frontend returned HTTP $FRONTEND_STATUS"
fi

# Check backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://www.bahar.co.il/fantasybroker-api-staging/api/health")
if [ "$BACKEND_STATUS" = "200" ]; then
  print_status "Backend is accessible (HTTP $BACKEND_STATUS)"
else
  print_error "Backend returned HTTP $BACKEND_STATUS"
fi

echo ""
echo "=========================================="
print_status "Staging deployment completed!"
echo "=========================================="
echo ""
echo "Staging URLs:"
echo "  Frontend: https://www.bahar.co.il/fantasybroker-staging"
echo "  Backend:  https://www.bahar.co.il/fantasybroker-api-staging/api"
echo ""
echo "Next steps:"
echo "  1. Visit the staging frontend URL"
echo "  2. Verify the 'STAGING' badge appears in the toolbar"
echo "  3. Test login and core features"
echo "  4. Check browser console for any errors"
echo ""

