# Content Security Policy (CSP) WebSocket Fix

## Issue

WebSocket connection was blocked by Content Security Policy (CSP) with error:

```
Connecting to 'wss://www.bahar.co.il:4001/' violates the following 
Content Security Policy directive: "connect-src 'self' https://www.bahar.co.il ..."
```

## Root Cause

The CSP `connect-src` directive in `.htaccess` did not include `wss://www.bahar.co.il:4001`, which is required for WebSocket connections.

## Fix Applied

**File**: `frontend-react/public/.htaccess`

**Change**: Added `wss://www.bahar.co.il:4001` to the `connect-src` directive:

**Before**:
```apache
connect-src 'self' https://www.bahar.co.il https://bahar.co.il 
  https://mytrips-api.bahar.co.il https://fantasybroker-api.bahar.co.il 
  https://api.amplitude.com https://api.eu.amplitude.com 
  https://sr-client-cfg.eu.amplitude.com https://api.brevo.com 
  https://accounts.google.com https://cloudflareinsights.com 
  https://fonts.googleapis.com https://fonts.gstatic.com 
  https://www.bahar.co.il/fantasybroker-api/
```

**After**:
```apache
connect-src 'self' https://www.bahar.co.il https://bahar.co.il 
  https://mytrips-api.bahar.co.il https://fantasybroker-api.bahar.co.il 
  https://api.amplitude.com https://api.eu.amplitude.com 
  https://sr-client-cfg.eu.amplitude.com https://api.brevo.com 
  https://accounts.google.com https://cloudflareinsights.com 
  https://fonts.googleapis.com https://fonts.gstatic.com 
  https://www.bahar.co.il/fantasybroker-api/ wss://www.bahar.co.il:4001
```

## Deployment

### Step 1: Build Frontend
```bash
cd frontend-react
npm run build
# ✅ Output: react/
```

### Step 2: Deploy to Production
```bash
# Using rsync (recommended)
rsync -avz --delete react/ user@www.bahar.co.il:/var/www/fantasybroker/react/

# Or using SCP
scp -r react/* user@www.bahar.co.il:/var/www/fantasybroker/react/
```

### Step 3: Verify Deployment
1. Open `https://www.bahar.co.il/fantasybroker/react/trade-room/35`
2. Press F12 to open DevTools
3. Check Console tab
4. Should see: `[WebSocket] Connected`
5. Should NOT see CSP violation errors

## CSP Directives Explained

| Directive | Purpose | Allowed Sources |
|-----------|---------|-----------------|
| `default-src` | Default for all resources | `'self'` |
| `script-src` | JavaScript files | CDNs, Google APIs |
| `style-src` | CSS files | Self, inline, Google Fonts |
| `font-src` | Font files | Self, Google Fonts |
| `img-src` | Images | Self, data URIs, HTTPS |
| `frame-src` | Iframes | Google OAuth |
| `connect-src` | API/WebSocket connections | APIs, WebSocket server |

## WebSocket Connection Flow

```
Browser (https://www.bahar.co.il/fantasybroker/react/)
    ↓
WebSocket Service (websocketService.ts)
    ↓
Constructs URL: wss://www.bahar.co.il:4001
    ↓
Browser checks CSP connect-src directive
    ↓
✅ wss://www.bahar.co.il:4001 is allowed
    ↓
WebSocket connection established
    ↓
Backend WebSocket Server (port 4001)
```

## Testing Checklist

- [ ] Frontend builds without errors
- [ ] Frontend deployed to production
- [ ] Open Trade Room page
- [ ] Check browser console (F12)
- [ ] Should see: `[WebSocket] Connected`
- [ ] Should NOT see CSP violation errors
- [ ] Can place orders
- [ ] Real-time updates work
- [ ] Leaderboard updates
- [ ] Position tracking works

## Security Considerations

✅ **Secure**: Only allows WebSocket connections to specific port (4001)
✅ **Specific**: Uses full domain and port, not wildcard
✅ **HTTPS**: Uses `wss://` (secure WebSocket), not `ws://`
✅ **Restricted**: Only allows connections to `www.bahar.co.il:4001`

## Troubleshooting

### Still seeing CSP errors?

1. **Clear browser cache**:
   - Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear all cache
   - Reload page

2. **Check .htaccess deployment**:
   ```bash
   ssh user@www.bahar.co.il
   cat /var/www/fantasybroker/react/.htaccess | grep connect-src
   ```

3. **Verify WebSocket server running**:
   ```bash
   lsof -i :4001
   ```

4. **Check browser DevTools**:
   - Network tab → WS filter
   - Should see connection to `wss://www.bahar.co.il:4001`

## Git Commits

```
5a093f0 - fix: Add WebSocket port 4001 to CSP connect-src directive
fc8479a - fix: WebSocket connection URL to use port 4001
47338d3 - docs: Add WebSocket fix deployment script and summary
```

## Files Modified

- `frontend-react/public/.htaccess` - Added WebSocket to CSP
- `frontend-react/src/services/websocketService.ts` - Fixed WebSocket URL

## Next Steps

1. Deploy the updated frontend
2. Verify WebSocket connection in browser
3. Test Trade Room functionality
4. Monitor for 24 hours
5. Collect user feedback

## References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN: connect-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/connect-src)
- [WebSocket Security](https://owasp.org/www-community/attacks/WebSocket_protocol)

