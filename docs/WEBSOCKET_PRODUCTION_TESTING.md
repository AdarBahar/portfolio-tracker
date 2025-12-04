# WebSocket Production Testing Guide

## Overview

This guide provides step-by-step instructions for testing the WebSocket Backend Integration in production.

## Prerequisites

- Backend running on port 4000 (REST API)
- WebSocket server running on port 4001
- Frontend running on port 5173 (development) or production URL
- Valid JWT token for authentication
- Multiple browser windows/tabs for multi-client testing

## Test Environment Setup

### 1. Start Backend Services

```bash
cd backend
npm install
npm run build
npm start
```

Expected output:
```
Portfolio Tracker backend listening on port 4000
[Server] WebSocket server started on port 4001
[Server] Background jobs started successfully
```

### 2. Start Frontend

```bash
cd frontend-react
npm install
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

## Manual Testing Procedures

### Test 1: WebSocket Connection Establishment

**Objective**: Verify WebSocket server accepts connections

**Steps**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to Trade Room page
4. Look for WebSocket connection in Network tab
5. Should see `ws://localhost:4001` connection

**Expected Result**: ✅ WebSocket connection established and authenticated

### Test 2: Order Execution Broadcasting

**Objective**: Verify order execution broadcasts to all connected clients

**Steps**:
1. Open Trade Room in 2 browser windows (Window A and Window B)
2. In Window A, place an order
3. Observe Window B's leaderboard and order history
4. Check browser console for WebSocket messages

**Expected Result**: ✅ Order appears in real-time in Window B

### Test 3: Leaderboard Updates Broadcasting

**Objective**: Verify leaderboard snapshots broadcast to all members

**Steps**:
1. Open Trade Room in 2 browser windows
2. Wait for leaderboard snapshot (every 5 minutes)
3. Observe leaderboard updates in both windows simultaneously
4. Check rankings and P&L values

**Expected Result**: ✅ Leaderboard updates appear in real-time in both windows

### Test 4: Position Tracking Broadcasting

**Objective**: Verify position updates broadcast in real-time

**Steps**:
1. Open Trade Room in 2 browser windows
2. In Window A, execute an order
3. Observe position updates in Window B
4. Check position quantity, average cost, and P&L

**Expected Result**: ✅ Position updates appear in real-time in Window B

### Test 5: Room State Changes Broadcasting

**Objective**: Verify room state transitions broadcast to all members

**Steps**:
1. Open Trade Room in 2 browser windows
2. As admin, transition room state (draft → active → completed)
3. Observe state changes in both windows
4. Check room status and duration

**Expected Result**: ✅ Room state changes appear in real-time in both windows

### Test 6: Connection Loss and Recovery

**Objective**: Verify graceful handling of connection loss

**Steps**:
1. Open Trade Room
2. Open DevTools Network tab
3. Throttle network to "Offline"
4. Try to place an order
5. Restore network connection
6. Verify reconnection and message sync

**Expected Result**: ✅ Connection recovers, messages sync after reconnection

### Test 7: Multiple Concurrent Connections

**Objective**: Verify system handles multiple concurrent connections

**Steps**:
1. Open Trade Room in 5+ browser windows
2. Place orders in different windows
3. Observe broadcasts to all windows
4. Monitor browser console for errors
5. Check backend logs for connection tracking

**Expected Result**: ✅ All connections receive broadcasts, no errors

### Test 8: Error Handling

**Objective**: Verify graceful error handling

**Steps**:
1. Open DevTools Console
2. Manually send invalid WebSocket message:
   ```javascript
   ws.send(JSON.stringify({ type: 'invalid' }));
   ```
3. Observe error handling
4. Verify app continues functioning

**Expected Result**: ✅ Errors logged, app continues functioning

## Browser Console Debugging

### View WebSocket Messages

```javascript
// In browser console
// Monitor all WebSocket messages
const originalSend = WebSocket.prototype.send;
WebSocket.prototype.send = function(data) {
  console.log('📤 Sending:', JSON.parse(data));
  return originalSend.call(this, data);
};

// Monitor received messages
// (Already logged by frontend)
```

### Check Connection Status

```javascript
// In browser console
// Check if WebSocket is connected
console.log('WebSocket ready state:', ws.readyState);
// 0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED
```

## Backend Logging

### View WebSocket Server Logs

```bash
# In backend terminal
# Look for WebSocket logs
grep "WebSocket\|ws\|\[WS\]" logs/app.log
```

### Enable Debug Logging

```bash
# Set debug environment variable
DEBUG=* npm start
```

## Performance Monitoring

### Monitor Connection Count

```bash
# Check active WebSocket connections
lsof -i :4001 | wc -l
```

### Monitor Memory Usage

```bash
# In Node.js process
# Check memory usage
console.log(process.memoryUsage());
```

### Monitor Message Throughput

```bash
# Count WebSocket messages per second
grep "broadcast\|message" logs/app.log | wc -l
```

## Troubleshooting

### Issue: WebSocket connection fails

**Solution**:
1. Verify WebSocket server is running on port 4001
2. Check firewall rules
3. Verify JWT token is valid
4. Check browser console for errors

### Issue: Messages not broadcasting

**Solution**:
1. Verify room subscription is successful
2. Check backend logs for broadcast errors
3. Verify service integration is working
4. Check network tab for WebSocket messages

### Issue: Connection drops frequently

**Solution**:
1. Check network stability
2. Verify server resources (CPU, memory)
3. Check for timeout settings
4. Verify firewall/proxy settings

### Issue: High latency

**Solution**:
1. Check network latency
2. Monitor server CPU/memory
3. Check message size
4. Consider message batching

## Success Criteria

✅ All tests pass
✅ No console errors
✅ Real-time updates appear instantly
✅ Multiple connections work simultaneously
✅ Connection recovery works
✅ Error handling is graceful
✅ Performance is acceptable
✅ No memory leaks

## Next Steps

After successful testing:
1. Deploy to production
2. Set up monitoring
3. Configure alerts
4. Document deployment
5. Train support team

