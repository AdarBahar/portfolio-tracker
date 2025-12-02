# WebSocket Connection Fix - Production Deployment

## Issue

WebSocket connection was failing in production with error:
```
WebSocket connection to 'wss://www.bahar.co.il/' failed
```

## Root Cause

The WebSocket service was constructing the URL incorrectly:
- **Was**: `wss://www.bahar.co.il/` (frontend port 443)
- **Should be**: `wss://www.bahar.co.il:4001` (WebSocket server port 4001)

## Fix Applied

**File**: `frontend-react/src/services/websocketService.ts`

**Change**: Updated `getWebSocketUrl()` method to always use port 4001:

```typescript
private getWebSocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const hostname = window.location.hostname;
  
  // In production, connect to port 4001 for WebSocket server
  // In development, also use port 4001
  const port = ':4001';
  
  return `${protocol}//${hostname}${port}`;
}
```

## Deployment Steps

### Option 1: Using Deployment Script (Recommended)

```bash
cd /Users/adar.bahar/Code/portfolio-tracker
./DEPLOY_FRONTEND_FIX.sh
```

The script will:
1. Verify build exists
2. Deploy using rsync
3. Verify deployment on remote server

### Option 2: Manual Deployment

```bash
# Deploy using rsync
rsync -avz --delete react/ user@www.bahar.co.il:/var/www/fantasybroker/react/

# Or using SCP
scp -r react/* user@www.bahar.co.il:/var/www/fantasybroker/react/
```

## Verification

After deployment, verify the fix:

1. **Open Trade Room**:
   ```
   https://www.bahar.co.il/fantasybroker/react/trade-room/35
   ```

2. **Check Browser Console** (F12):
   - Should see: `[WebSocket] Connected`
   - Should NOT see: `WebSocket connection to 'wss://www.bahar.co.il/' failed`

3. **Check Network Tab**:
   - Look for WebSocket connection to `wss://www.bahar.co.il:4001`
   - Status should be `101 Switching Protocols`

4. **Test Functionality**:
   - Place an order
   - Should see real-time updates
   - Leaderboard should update
   - Position tracking should work

## Architecture

```
Production Server (www.bahar.co.il)
│
├── Frontend (React) - Port 443 (HTTPS)
│   └── Connects to WebSocket at port 4001
│
├── Backend REST API - Port 4000
│   └── https://www.bahar.co.il/fantasybroker-api/api
│
└── WebSocket Server - Port 4001
    └── wss://www.bahar.co.il:4001
```

## Firewall Requirements

Ensure these ports are open on the production server:
- **Port 443**: HTTPS (frontend)
- **Port 4000**: REST API
- **Port 4001**: WebSocket (NEW - must be open)

## Testing Checklist

- [ ] Frontend loads without errors
- [ ] WebSocket connects successfully
- [ ] Console shows `[WebSocket] Connected`
- [ ] Can create/join Trade Room
- [ ] Can place orders
- [ ] Real-time updates work
- [ ] Leaderboard updates in real-time
- [ ] Position tracking works
- [ ] No console errors

## Rollback (if needed)

If issues occur, rollback to previous version:

```bash
# On production server
cd /var/www/fantasybroker/react
git checkout HEAD~1
npm install
npm run build
# Copy build to web root
```

## Git Commit

```
Commit: fc8479a
Message: fix: WebSocket connection URL to use port 4001
```

## Next Steps

1. Deploy using `./DEPLOY_FRONTEND_FIX.sh`
2. Verify WebSocket connection in browser
3. Test Trade Room functionality
4. Monitor for 24 hours
5. Collect user feedback

## Support

If WebSocket still doesn't connect after deployment:

1. **Check firewall**: Ensure port 4001 is open
2. **Check backend**: Verify WebSocket server is running on port 4001
3. **Check logs**: Review browser console and server logs
4. **Check CORS**: Verify CORS is configured correctly

## Files Modified

- `frontend-react/src/services/websocketService.ts` - Fixed WebSocket URL

## Files Created

- `DEPLOY_FRONTEND_FIX.sh` - Deployment script
- `WEBSOCKET_FIX_SUMMARY.md` - This document

