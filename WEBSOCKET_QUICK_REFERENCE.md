# WebSocket Issue - Quick Reference

## 🎯 The Problem
HTTP/2 is breaking WebSocket connections because WebSocket requires HTTP/1.1 and the `Upgrade` header.

## 📋 What to Do

### 1. Copy the Support Ticket
Open: `INMOTION_SUPPORT_TICKET.md`
Copy the entire ticket text.

### 2. Create Support Ticket with InMotion Hosting
- Go to: https://www.inmotionhosting.com/support
- Create a new ticket
- **Subject:** `URGENT: Disable HTTP/2 for WebSocket Path - /fantasybroker-api/ws`
- **Body:** Paste the ticket text from step 1

### 3. Wait for InMotion to Apply Configuration
They will add nginx configuration to disable HTTP/2 for `/fantasybroker-api/ws`

### 4. Test After Configuration Applied
Run this command:
```bash
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  -H "Sec-WebSocket-Version: 13" \
  https://www.bahar.co.il/fantasybroker-api/ws
```

**Expected response:**
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
```

### 5. Test in Browser
1. Clear cache: Ctrl+Shift+Delete
2. Hard refresh: Ctrl+Shift+R
3. Open: `https://www.bahar.co.il/fantasybroker/react/ws-diagnostics`
4. Click "Test WebSocket Connection"
5. Should see: `Connection State: OPEN` ✅

## 📚 Documentation Files

- `WEBSOCKET_HTTP2_ISSUE.md` - Detailed explanation
- `INMOTION_SUPPORT_TICKET.md` - Support ticket template
- `WEBSOCKET_DIAGNOSTICS_GUIDE.md` - How to use diagnostics
- `WebSocketDiagnostics.tsx` - Frontend diagnostic page

## 🔗 Key Files Modified

- `backend/src/app.js` - Added catch-all route for WebSocket
- `backend/src/websocket/server.js` - Enhanced logging
- `htaccess_files/public_html-fantasybroker.htaccess` - Added WebSocket rules

## ✅ Verification Checklist

After InMotion applies the nginx configuration:

- [ ] curl test returns HTTP/1.1 101 Switching Protocols
- [ ] Backend logs show `[WebSocket] ✅ NEW CONNECTION ESTABLISHED`
- [ ] Diagnostics page shows `Connection State: OPEN`
- [ ] Trade Room page loads without WebSocket errors
- [ ] Real-time updates work in Trade Room

## 🚀 Expected Timeline

- Support ticket: Immediate
- InMotion response: 1-24 hours
- Configuration applied: 1-2 hours after approval
- Testing: Immediate after configuration

---

**Once InMotion applies the nginx configuration, WebSocket will work!** 🎉

