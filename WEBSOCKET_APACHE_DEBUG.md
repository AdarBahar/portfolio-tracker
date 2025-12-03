# WebSocket Apache Debug Guide

## 🔍 Diagnostic Commands to Run on Production Server

### 1. Check Apache Error Logs

```bash
# Real-time Apache error log
tail -f /var/log/apache2/error_log

# Or check for recent errors
grep -i "websocket\|upgrade\|1006" /var/log/apache2/error_log | tail -20
```

### 2. Check Apache Configuration

```bash
# Verify mod_rewrite is enabled
apache2ctl -M | grep rewrite

# Verify mod_headers is enabled
apache2ctl -M | grep headers

# Verify mod_proxy is enabled (needed for Phusion Passenger)
apache2ctl -M | grep proxy
```

### 3. Check Phusion Passenger Configuration

```bash
# Check if Phusion Passenger is installed
passenger-config about system

# Check Phusion Passenger status
passenger-status

# Check if the app is running
ps aux | grep "node\|passenger" | grep -v grep
```

### 4. Check .htaccess Files

```bash
# Verify all .htaccess files are in place
ls -la /public_html/.htaccess
ls -la /public_html/fantasybroker/.htaccess
ls -la /public_html/fantasybroker/react/.htaccess
ls -la /public_html/fantasybroker/backend/.htaccess

# Check WebSocket rules in each
grep -n "WebSocket\|Upgrade\|websocket" /public_html/.htaccess
grep -n "WebSocket\|Upgrade\|websocket" /public_html/fantasybroker/.htaccess
grep -n "WebSocket\|Upgrade\|websocket" /public_html/fantasybroker/react/.htaccess
```

### 5. Test WebSocket Connection with curl

```bash
# Test WebSocket upgrade request
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  -H "Sec-WebSocket-Version: 13" \
  https://www.bahar.co.il/fantasybroker-api/ws

# Expected response: HTTP/1.1 101 Switching Protocols
# If you get 404, 403, or 500, the request is being blocked
```

### 6. Check Backend Logs

```bash
# Check Node.js backend logs
tail -f /home/baharc5/public_html/fantasybroker/backend/logs/app.log

# Or check cPanel logs
tail -f /home/baharc5/logs/error_log
```

### 7. Verify Phusion Passenger Routing

```bash
# Check if /fantasybroker-api is mapped to the Node.js app
passenger-status

# Should show something like:
# /public_html/fantasybroker/backend (Node.js)
```

## 🎯 What to Look For

### If WebSocket Still Fails

1. **Check Apache error log** for:
   - `mod_rewrite` errors
   - `Upgrade` header issues
   - `Connection` header issues

2. **Check if Phusion Passenger is receiving the request**:
   - Look for connection attempts in backend logs
   - Check if the upgrade request reaches the Node.js server

3. **Check if the issue is at the Phusion Passenger level**:
   - Phusion Passenger might not be forwarding the Upgrade header
   - Phusion Passenger might be buffering the response

## 🔧 Potential Fixes

### If mod_rewrite is interfering:
```apache
# Disable rewriting for /fantasybroker-api
RewriteCond %{REQUEST_URI} ^/fantasybroker-api [NC]
RewriteRule ^ - [L]
```

### If Phusion Passenger is not forwarding headers:
```apache
# Ensure headers are passed through
RequestHeader set Upgrade %{HTTP:Upgrade}e
RequestHeader set Connection %{HTTP:Connection}e
```

### If the issue is with buffering:
```apache
# Disable buffering for WebSocket
SetEnv proxy-nokeepalive 1
SetEnv proxy-initial-not-pooled 1
```

---

**Run these commands and share the output to help debug the issue!**

