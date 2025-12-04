# Quick Start - Production Testing

## 5-Minute Setup

### Terminal 1: Start Backend

```bash
cd backend
npm install
npm run build
npm start
```

Wait for output:
```
Portfolio Tracker backend listening on port 4000
[Server] WebSocket server started on port 4001
```

### Terminal 2: Start Frontend

```bash
cd frontend-react
npm install
npm run dev
```

Wait for output:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Terminal 3: Run Tests (Optional)

```bash
cd backend
npm test -- src/__tests__/production-e2e.test.js
```

## Quick Manual Tests (10 minutes)

### Test 1: Single Client Connection (2 min)

1. Open http://localhost:5173 in browser
2. Login with test account
3. Navigate to Trade Room
4. Open DevTools (F12) → Network tab
5. Look for WebSocket connection to `ws://localhost:4001`
6. ✅ Should see connection established

### Test 2: Order Broadcasting (3 min)

1. Open Trade Room in 2 browser windows (A and B)
2. In Window A: Place an order
3. In Window B: Watch for real-time update
4. ✅ Order should appear instantly in Window B

### Test 3: Leaderboard Updates (3 min)

1. Keep both windows open
2. Wait for leaderboard snapshot (or trigger manually)
3. Observe leaderboard update in both windows
4. ✅ Rankings should update simultaneously

### Test 4: Position Tracking (2 min)

1. In Window A: Execute another order
2. In Window B: Watch portfolio view
3. ✅ Position should update in real-time

## Verification Checklist

Quick checklist to verify everything works:

```
✅ Backend starts without errors
✅ WebSocket server starts on port 4001
✅ Frontend connects to backend
✅ WebSocket connection established
✅ Orders broadcast to all clients
✅ Leaderboard updates broadcast
✅ Positions update in real-time
✅ No console errors
✅ No React warnings
```

## Common Issues & Quick Fixes

### Issue: WebSocket connection fails

```bash
# Check if WebSocket server is running
lsof -i :4001

# Check backend logs
tail -f backend/logs/app.log | grep WebSocket
```

### Issue: Orders not broadcasting

```bash
# Check if service integration is working
grep "broadcast\|WebSocket" backend/logs/app.log

# Verify room subscription
# Open DevTools Console and check for subscription messages
```

### Issue: Frontend not connecting

```bash
# Check if frontend is running
curl http://localhost:5173

# Check if backend API is accessible
curl http://localhost:4000/api/health

# Check CORS settings
# Look for CORS errors in browser console
```

## Performance Quick Check

### Monitor Connections

```bash
# Count active WebSocket connections
watch -n 1 'lsof -i :4001 | wc -l'
```

### Monitor Memory

```bash
# Check Node.js memory usage
ps aux | grep node
```

### Monitor Messages

```bash
# Count WebSocket messages per second
tail -f backend/logs/app.log | grep "broadcast" | wc -l
```

## Next Steps

After quick tests pass:

1. **Run Full Test Suite**
   ```bash
   npm test
   ```

2. **Load Testing**
   - Open 10+ browser windows
   - Place orders simultaneously
   - Monitor performance

3. **Network Testing**
   - Throttle network in DevTools
   - Test reconnection
   - Test offline handling

4. **Production Deployment**
   - Follow deployment guide
   - Set up monitoring
   - Configure alerts

## Detailed Testing

For comprehensive testing, see:
- `WEBSOCKET_PRODUCTION_TESTING.md` - Full manual testing guide
- `PRODUCTION_TESTING_CHECKLIST.md` - Complete checklist
- `backend/src/__tests__/production-e2e.test.js` - Automated tests

## Support

If you encounter issues:

1. Check logs: `tail -f backend/logs/app.log`
2. Check browser console: F12 → Console
3. Check network: F12 → Network → WS
4. Review troubleshooting guide in WEBSOCKET_PRODUCTION_TESTING.md

## Success Indicators

✅ All tests pass
✅ No console errors
✅ Real-time updates work
✅ Multiple clients sync
✅ Performance acceptable
✅ Ready for production!

