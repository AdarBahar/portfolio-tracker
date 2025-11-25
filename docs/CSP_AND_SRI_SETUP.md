# Content Security Policy (CSP) and Subresource Integrity (SRI) Setup

This document explains how to implement CSP and SRI for the Portfolio Tracker application.

## Overview

- **CSP (Content Security Policy)**: HTTP header that controls which resources the browser is allowed to load
- **SRI (Subresource Integrity)**: Ensures that files fetched from CDNs haven't been tampered with

## Implementation Strategy

### 1. Subresource Integrity (SRI)

SRI hashes should be added to `<script>` and `<link>` tags that load resources from CDNs.

#### Current CDN Resources

In `index.html`:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

#### How to Add SRI

1. **Generate SRI Hash**:
   ```bash
   # Using curl and openssl
   curl -s https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js | \
     openssl dgst -sha384 -binary | \
     openssl base64 -A
   ```

2. **Add to HTML**:
   ```html
   <script 
     src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"
     integrity="sha384-HASH_HERE"
     crossorigin="anonymous">
   </script>
   ```

3. **Pin Versions**: Always use specific versions (e.g., `@4.4.0`) instead of `@latest`

#### Automated SRI Generation

For build pipelines, use tools like:
- **webpack-subresource-integrity** (Webpack)
- **vite-plugin-sri** (Vite)
- **rollup-plugin-sri** (Rollup)

### 2. Content Security Policy (CSP)

CSP should be configured at the **server level** (not in the application code).

#### Recommended CSP Header

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' https://cdn.jsdelivr.net https://accounts.google.com https://apis.google.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://www.bahar.co.il https://finnhub.io;
  frame-src https://accounts.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  require-sri-for script style;
```

#### CSP Directives Explained

- `default-src 'self'`: Only allow resources from same origin by default
- `script-src`: Allow scripts from self, CDNs, and Google OAuth
- `style-src 'unsafe-inline'`: Allow inline styles (needed for dynamic styling)
- `img-src`: Allow images from self, data URIs, and HTTPS
- `connect-src`: Allow API calls to backend and Finnhub
- `frame-src`: Allow Google OAuth iframe
- `require-sri-for`: Require SRI for all scripts and styles from external sources

#### Server Configuration Examples

**Nginx**:
```nginx
location / {
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://accounts.google.com; ...";
}
```

**Apache** (`.htaccess`):
```apache
Header set Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://accounts.google.com; ..."
```

**Node.js/Express**:
```javascript
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; ...");
  next();
});
```

**Cloudflare Workers**:
```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const response = await fetch(request)
  const newHeaders = new Headers(response.headers)
  newHeaders.set('Content-Security-Policy', "default-src 'self'; ...")
  return new Response(response.body, {
    status: response.status,
    headers: newHeaders
  })
}
```

### 3. Testing CSP

1. **Report-Only Mode** (test before enforcing):
   ```
   Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
   ```

2. **Browser DevTools**: Check Console for CSP violations

3. **Online Tools**:
   - [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
   - [Report URI](https://report-uri.com/)

### 4. Development vs Production

**Development**:
- More permissive CSP for hot-reload, dev tools
- Can skip SRI for local development

**Production**:
- Strict CSP with all directives
- SRI required for all external resources
- Pin all CDN versions

## Implementation Checklist

- [ ] Pin Chart.js version in index.html
- [ ] Generate SRI hash for Chart.js
- [ ] Add `integrity` and `crossorigin` attributes to Chart.js script tag
- [ ] Configure CSP header in server/hosting configuration
- [ ] Test CSP in report-only mode
- [ ] Monitor CSP violations
- [ ] Enable strict CSP in production
- [ ] Document CSP policy in deployment guide

## Security Benefits

1. **Prevents XSS attacks**: Blocks inline scripts and eval()
2. **Prevents data exfiltration**: Controls where data can be sent
3. **Prevents clickjacking**: Controls framing
4. **Ensures CDN integrity**: SRI prevents tampered CDN resources
5. **Defense in depth**: Multiple layers of protection

## References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [CSP Quick Reference](https://content-security-policy.com/)
- [SRI Hash Generator](https://www.srihash.org/)

