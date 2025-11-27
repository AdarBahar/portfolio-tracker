# Fix Middleware Import Error - Route.post() Requires Callback

**Issue**: Backend failing to start with error:
```
Error: Route.post() requires a callback function but got a [object Object]
```

**Root Cause**: Incorrect import of `internalServiceMiddleware` in route files

---

## 🔍 Problem

The middleware file exports an object:
```javascript
module.exports = {
  requireInternalService
};
```

But the route files were importing it as a default export:
```javascript
const internalServiceMiddleware = require('../utils/internalServiceMiddleware');
// Then using it directly:
router.post('/rooms/:id', internalServiceMiddleware, ...);
```

This passes an object `{ requireInternalService }` instead of the function, causing Express to fail.

---

## ✅ Solution

Changed the import to destructure the function:
```javascript
const { requireInternalService } = require('../utils/internalServiceMiddleware');
// Then use it directly:
router.post('/rooms/:id', requireInternalService, ...);
```

---

## 📝 Files Fixed

### 1. `backend/src/routes/settlementRoutes.js`
- **Line 9**: Changed import from default to destructured
- **Line 18**: Changed middleware reference from `internalServiceMiddleware` to `requireInternalService`

### 2. `backend/src/routes/cancellationRoutes.js`
- **Line 9**: Changed import from default to destructured
- **Line 18**: Changed middleware reference from `internalServiceMiddleware` to `requireInternalService`
- **Line 29**: Changed middleware reference from `internalServiceMiddleware` to `requireInternalService` (second route)

---

## 🚀 Deployment

1. **Rebuild the backend**:
```bash
cd /path/to/fantasybroker/backend
npm install
```

2. **Restart the service**:
```bash
systemctl restart fantasybroker-api
# OR
pm2 restart fantasybroker-api
```

3. **Verify it starts**:
```bash
# Check logs
tail -f /var/log/fantasybroker.log
# Should see: "Portfolio Tracker backend listening on port 4000"
```

4. **Test the health endpoint**:
```bash
curl https://www.bahar.co.il/fantasybroker-api/api/health
# Should return: {"status":"ok","db":"ok","marketDataMode":"..."}
```

---

## ✅ Expected Results

After deployment:
- ✅ Backend starts without errors
- ✅ Health endpoint responds with 200 OK
- ✅ Auth endpoint works correctly
- ✅ Login page works

---

**Status**: Ready for deployment

