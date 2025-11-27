# Fixing Server-Level CSP Issues

## Problem

Your hosting provider is setting **server-level Content Security Policy (CSP) headers** that:
- Override your `.htaccess` settings
- Block Google Sign-In iframes
- Block Chart.js CDN
- Cannot be disabled via `.htaccess`

## Solution Options

### **Option 1: Contact Hosting Provider (Recommended)**

**Ask them to:**
1. Disable server-level CSP for your `/fantasybroker/` directory
2. Or allow you to override CSP via `.htaccess`
3. Or whitelist these domains in their CSP:
   - `https://accounts.google.com`
   - `https://apis.google.com`
   - `https://cdn.jsdelivr.net`

**This is the cleanest solution.**

---

### **Option 2: Use PHP to Override Headers**

If your hosting supports PHP, you can override the CSP headers.

#### **Step 1: Rename HTML files to PHP**

```bash
# On your server
mv login.html login.php
mv index.html index.php
```

#### **Step 2: Add PHP header override at the top of each file**

**login.php** - Add this as the FIRST line:
```php
<?php
header_remove('Content-Security-Policy');
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://static.cloudflareinsights.com https://cdn.jsdelivr.net; frame-src https://accounts.google.com; connect-src 'self' https://accounts.google.com https://cloudflareinsights.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://accounts.google.com; img-src 'self' https: data:;");
?>
<!DOCTYPE html>
<html lang="en">
...
```

**index.php** - Same thing at the top

#### **Step 3: Update .htaccess to use PHP files as index**

```apache
DirectoryIndex login.php index.php login.html index.html
```

#### **Step 4: Update redirects in JavaScript**

In `scripts/auth.js` and `login.html`, change:
- `login.html` → `login.php`
- `index.html` → `index.php`

---

### **Option 3: Disable CSP Entirely (Not Recommended)**

Contact your hosting provider and ask them to disable CSP for your directory.

**Pros:** Everything works  
**Cons:** Less secure (no CSP protection)

---

### **Option 4: Move to Different Hosting**

If your current hosting doesn't allow CSP customization, consider:

**Free/Cheap Options:**
- **Netlify** - Free, supports custom headers
- **Vercel** - Free, supports custom headers
- **GitHub Pages** - Free, no CSP issues
- **Cloudflare Pages** - Free, full control

**Paid Options:**
- **DigitalOcean** - Full control
- **AWS S3 + CloudFront** - Full control
- **Any VPS** - Full control

---

## Quick Test: Is CSP from Server or .htaccess?

### **Test 1: Check Response Headers**

Open browser DevTools:
1. Go to Network tab
2. Load `login.html`
3. Click on the request
4. Look at Response Headers
5. Find `Content-Security-Policy`

**If you see CSP header:**
- Check if it matches your `.htaccess` CSP
- If different, it's server-level CSP

### **Test 2: Disable .htaccess**

1. Rename `.htaccess` to `.htaccess.disabled`
2. Reload page
3. Check if CSP errors still appear

**If errors still appear:**
- CSP is from server, not `.htaccess`

---

## Recommended Action Plan

### **Immediate (5 minutes):**

1. **Contact your hosting provider** via support ticket:
   ```
   Subject: Request to disable server-level CSP for /fantasybroker/

   Hello,

   I'm experiencing issues with server-level Content Security Policy headers
   that are blocking necessary third-party resources for my application.

   Could you please either:
   1. Disable server-level CSP for /fantasybroker/ directory
   2. Allow me to override CSP via .htaccess
   3. Whitelist these domains in the CSP:
      - https://accounts.google.com
      - https://apis.google.com  
      - https://cdn.jsdelivr.net
   
   Thank you!
   ```

### **Short-term (30 minutes):**

While waiting for hosting provider response:

1. **Try PHP solution** (Option 2 above)
2. **Test if it works**
3. **If yes, keep using PHP files**

### **Long-term (if needed):**

If hosting provider can't help:
1. **Consider migrating** to Netlify/Vercel (free, better control)
2. **Or use a build process** and host static files elsewhere

---

## Why This Happens

Some hosting providers (especially shared hosting) set **server-level security headers** to protect all customers. This is good for security but can break apps that need specific CSP settings.

**Common providers with this issue:**
- Some cPanel shared hosting
- Some managed WordPress hosting
- Some security-focused hosting

**Providers without this issue:**
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- Most VPS/dedicated servers

---

## Testing After Fix

Once CSP is fixed, you should see:

**Login page:**
```
✅ Loaded configuration from config.local.js
✅ Google Sign-In button appears
✅ No CSP errors
```

**Main app:**
```
✅ Charts render
✅ No "Chart is not defined" errors
✅ No CSP errors
```

---

## Need Help?

If you're stuck, let me know:
1. What hosting provider are you using?
2. Do they support PHP?
3. Can you access server configuration?
4. Are you willing to migrate to different hosting?

I can help you implement the best solution for your situation!

