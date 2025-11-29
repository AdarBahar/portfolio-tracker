# Cross-Origin-Opener-Policy (COOP) and Cross-Origin-Embedder-Policy (COEP) Headers

## Problem

When running the React app in production, the browser console showed:

```
Cross-Origin-Opener-Policy policy would block the window.postMessage call.
```

This error occurs when:
- Google Sign-In tries to communicate with the app via `postMessage`
- Other cross-origin windows try to send messages to the app
- The COOP header is not properly configured

## Solution

Added two security headers to `frontend-react/public/.htaccess`:

### 1. Cross-Origin-Opener-Policy (COOP)

```
Header always set Cross-Origin-Opener-Policy "same-origin-allow-popups"
```

**What it does:**
- `same-origin-allow-popups` allows the page to open popups and receive messages from them
- Enables Google Sign-In popup to communicate with the main window
- Maintains security by isolating from other cross-origin windows

**Why it's needed:**
- Google OAuth opens a popup window for authentication
- The popup needs to send the authentication token back to the main window
- Without this header, the browser blocks the `postMessage` call

### 2. Cross-Origin-Embedder-Policy (COEP)

```
Header always set Cross-Origin-Embedder-Policy "require-corp"
```

**What it does:**
- `require-corp` requires all cross-origin resources to explicitly allow embedding
- Enables SharedArrayBuffer and other advanced features
- Provides additional security isolation

**Why it's needed:**
- Allows cross-origin resources (fonts, APIs) to be loaded
- Complements COOP for comprehensive cross-origin security
- Required for modern web APIs

## Implementation

The headers are set in `frontend-react/public/.htaccess`:

```apache
<IfModule mod_headers.c>
    # Cross-Origin-Opener-Policy - Allow postMessage from cross-origin windows
    # Required for Google Sign-In and other cross-origin communication
    Header always set Cross-Origin-Opener-Policy "same-origin-allow-popups"

    # Cross-Origin-Embedder-Policy - Allow cross-origin resources
    Header always set Cross-Origin-Embedder-Policy "require-corp"
</IfModule>
```

## Browser Compatibility

| Browser | COOP Support | COEP Support |
|---------|-------------|-------------|
| Chrome  | ✅ 89+      | ✅ 87+      |
| Firefox | ✅ 79+      | ✅ 77+      |
| Safari  | ✅ 15.1+    | ✅ 15.1+    |
| Edge    | ✅ 89+      | ✅ 87+      |

## Related Headers

The app also uses these security headers:

- **Content-Security-Policy (CSP)** - Controls which resources can be loaded
- **X-Content-Type-Options** - Prevents MIME sniffing
- **X-XSS-Protection** - Enables XSS protection
- **Referrer-Policy** - Controls referrer information

## Testing

To verify the headers are set correctly:

```bash
# Check response headers
curl -I https://www.bahar.co.il/fantasybroker/react/

# Should include:
# Cross-Origin-Opener-Policy: same-origin-allow-popups
# Cross-Origin-Embedder-Policy: require-corp
```

## References

- [MDN: Cross-Origin-Opener-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy)
- [MDN: Cross-Origin-Embedder-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy)
- [Google Sign-In Documentation](https://developers.google.com/identity/gsi/web)

## Files Modified

- `frontend-react/public/.htaccess` - Added COOP and COEP headers

## Commit

- `0249f1a` - Add COOP and COEP headers for cross-origin communication

