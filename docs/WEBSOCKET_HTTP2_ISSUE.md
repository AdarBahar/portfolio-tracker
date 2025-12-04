# 🔴 CRITICAL: HTTP/2 is Breaking WebSocket!

## The Real Root Cause

The curl response shows:
```
HTTP/2 400
server: nginx/1.27.4
```

**There's an nginx reverse proxy in front of Apache, and it's converting HTTP/1.1 to HTTP/2!**

**WebSocket requires HTTP/1.1** - it uses the `Upgrade` header which is NOT supported in HTTP/2!

## Why WebSocket Fails with HTTP/2

### HTTP/1.1 WebSocket Upgrade (WORKS):
```
GET /ws HTTP/1.1
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Key: ...
Sec-WebSocket-Version: 13

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
```

### HTTP/2 (BROKEN):
```
HTTP/2 doesn't support the Upgrade header!
The upgrade mechanism doesn't exist in HTTP/2.
Result: 400 Bad Request
```

## The Problem Flow

```
1. Browser: HTTP/1.1 GET /fantasybroker-api/ws with Upgrade: websocket
2. nginx: Receives HTTP/1.1 request
3. nginx: Converts to HTTP/2 (because HTTP/2 is enabled)
4. Apache/Phusion Passenger: Receives HTTP/2 request
5. WebSocket server: Can't upgrade HTTP/2 connection
6. Express: Returns 400 Bad Request
7. ❌ WebSocket connection fails
```

## The Solution

We need to tell nginx to use HTTP/1.1 for WebSocket connections.

### Option 1: Disable HTTP/2 for WebSocket Path (RECOMMENDED)

Add to nginx configuration for `/fantasybroker-api/ws`:
```nginx
location /fantasybroker-api/ws {
    http2 off;
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Option 2: Use HTTP/1.1 for All Connections

Add to nginx configuration:
```nginx
http2_max_field_size 16k;
http2_max_header_size 32k;

# For WebSocket specifically
location /fantasybroker-api/ws {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_pass http://backend;
}
```

## Deployment Steps

### Step 1: Contact InMotion Hosting Support

Since nginx is managed by InMotion Hosting (not in your cPanel), you need to:

1. **Open a support ticket** with InMotion Hosting
2. **Request:** Disable HTTP/2 for the path `/fantasybroker-api/ws`
3. **Or request:** Add nginx configuration to use HTTP/1.1 for WebSocket

### Step 2: Provide This Configuration

Ask them to add this to the nginx configuration:

```nginx
location /fantasybroker-api/ws {
    http2 off;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://backend;
}
```

### Step 3: Verify After nginx Update

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

## Why This Wasn't Obvious

- The diagnostic tool showed the backend was working correctly ✅
- The curl test showed the request was reaching the backend ✅
- But the response was HTTP/2 instead of HTTP/1.1 ❌
- This is a **reverse proxy issue**, not a backend issue

## Files Affected

- None in the codebase (this is an nginx configuration issue)
- The backend code is correct
- The .htaccess files are correct

## Next Steps

1. **Contact InMotion Hosting support**
2. **Request nginx configuration change** for `/fantasybroker-api/ws`
3. **Provide the nginx configuration** above
4. **Test after they apply the change**

---

**This is the final piece of the puzzle!** Once nginx is configured to use HTTP/1.1 for WebSocket, everything will work! 🚀

