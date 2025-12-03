# InMotion Hosting Support Ticket - WebSocket HTTP/2 Issue

## Subject Line
```
URGENT: Disable HTTP/2 for WebSocket Path - /fantasybroker-api/ws
```

## Ticket Body

---

### Issue Description

I have a Node.js application running on Phusion Passenger that uses WebSocket for real-time updates. The WebSocket endpoint is at:

```
https://www.bahar.co.il/fantasybroker-api/ws
```

**The Problem:**
WebSocket connections are failing because nginx is converting HTTP/1.1 requests to HTTP/2. WebSocket requires HTTP/1.1 and uses the `Upgrade` header, which is not supported in HTTP/2.

**Evidence:**
When I test the WebSocket endpoint with curl:

```bash
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  -H "Sec-WebSocket-Version: 13" \
  https://www.bahar.co.il/fantasybroker-api/ws
```

I get:
```
HTTP/2 400 Bad Request
server: nginx/1.27.4
```

But I should get:
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
```

The `HTTP/2 400` response indicates that nginx is converting the HTTP/1.1 request to HTTP/2, which breaks the WebSocket upgrade handshake.

---

### Solution Required

I need nginx to be configured to:

1. **Disable HTTP/2 for the WebSocket path** `/fantasybroker-api/ws`
2. **Use HTTP/1.1** for connections to this path
3. **Properly forward WebSocket headers** to the backend

---

### Requested nginx Configuration

Please add the following location block to the nginx configuration for `www.bahar.co.il`:

```nginx
location /fantasybroker-api/ws {
    # Disable HTTP/2 for WebSocket connections
    http2 off;
    
    # Use HTTP/1.1 for backend communication
    proxy_http_version 1.1;
    
    # Forward WebSocket upgrade headers
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    
    # Forward other important headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Route to backend
    proxy_pass http://backend;
}
```

**Important:** This configuration should be placed BEFORE any catch-all location blocks to ensure it takes precedence.

---

### Account Information

- **Domain:** www.bahar.co.il
- **Backend:** Node.js application running on Phusion Passenger
- **Backend Path:** /home/baharc5/public_html/fantasybroker/backend
- **Application Name:** fantasybroker-api

---

### Testing After Configuration

Once you've applied this configuration, I will test with:

```bash
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  -H "Sec-WebSocket-Version: 13" \
  https://www.bahar.co.il/fantasybroker-api/ws
```

And verify that the response is:
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
```

---

### Additional Context

- This is a critical feature for real-time trading room updates
- The backend is correctly configured and working
- The issue is purely at the nginx reverse proxy level
- HTTP/2 is incompatible with WebSocket's upgrade mechanism
- This is a common issue with HTTP/2 reverse proxies

---

### Urgency

This is blocking a critical feature in production. Please prioritize this request.

---

**Thank you for your assistance!**


