#!/bin/bash

# Deploy Frontend Fix - WebSocket Port 4001
# This script deploys the updated frontend with WebSocket port 4001 fix

set -e

echo "🚀 Deploying Frontend Fix - WebSocket Port 4001"
echo "================================================"

# Configuration
REMOTE_USER="user"
REMOTE_HOST="www.bahar.co.il"
REMOTE_PATH="/var/www/fantasybroker/react"
LOCAL_BUILD_PATH="./react"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Verify build exists
echo -e "${BLUE}Step 1: Verifying build...${NC}"
if [ ! -d "$LOCAL_BUILD_PATH" ]; then
    echo -e "${RED}Error: Build directory not found at $LOCAL_BUILD_PATH${NC}"
    echo "Please run: npm run build"
    exit 1
fi

if [ ! -f "$LOCAL_BUILD_PATH/index.html" ]; then
    echo -e "${RED}Error: index.html not found in build${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build verified${NC}"

# Step 2: Deploy using rsync
echo -e "${BLUE}Step 2: Deploying to production...${NC}"
echo "Deploying to: $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"

rsync -avz --delete "$LOCAL_BUILD_PATH/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment successful${NC}"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    exit 1
fi

# Step 3: Verify deployment
echo -e "${BLUE}Step 3: Verifying deployment...${NC}"

# Check if index.html exists on remote
ssh "$REMOTE_USER@$REMOTE_HOST" "test -f $REMOTE_PATH/index.html" && \
    echo -e "${GREEN}✓ index.html verified on remote${NC}" || \
    (echo -e "${RED}✗ index.html not found on remote${NC}" && exit 1)

# Check if assets directory exists
ssh "$REMOTE_USER@$REMOTE_HOST" "test -d $REMOTE_PATH/assets" && \
    echo -e "${GREEN}✓ assets directory verified on remote${NC}" || \
    (echo -e "${RED}✗ assets directory not found on remote${NC}" && exit 1)

# Step 4: Summary
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✓ Frontend deployment complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Changes deployed:"
echo "  - WebSocket now connects to port 4001"
echo "  - Fixed: wss://www.bahar.co.il:4001"
echo ""
echo "Next steps:"
echo "  1. Open https://www.bahar.co.il/fantasybroker/react/trade-room/35"
echo "  2. Open browser DevTools (F12)"
echo "  3. Check Console tab for WebSocket connection"
echo "  4. Should see: '[WebSocket] Connected'"
echo ""
echo "Deployment URL:"
echo "  https://www.bahar.co.il/fantasybroker/react/"
echo ""

