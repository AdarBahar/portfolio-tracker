# Security Guide

## 🔐 Understanding OAuth 2.0 Security

### What's Public vs. What's Secret?

#### ✅ **Public (Safe in Frontend)**
- **Google OAuth Client ID** - Designed to be public
  - Identifies your app to Google
  - Cannot access user data without user consent
  - Safe to expose in browser/frontend code
  - Example: `123456789-abc.apps.googleusercontent.com`

#### ❌ **Secret (NEVER in Frontend)**
- **Google OAuth Client Secret** - Must stay private
  - Only use in backend/server code
  - Can be used to impersonate your app
  - NEVER commit to git
  - NEVER expose in frontend code

---

## 🎯 Current Implementation: Secure Configuration

We've implemented a **configuration system** that keeps credentials out of your main codebase:

### **File Structure**

```
scripts/
├── config.js                    # Default config (committed to git)
├── config.local.js              # Your actual credentials (gitignored)
└── config.local.example.js      # Example template (committed to git)
```

### **How It Works**

1. **`config.js`** - Contains default/placeholder values
2. **`config.local.js`** - Contains your actual Client ID (gitignored)
3. **`config.local.example.js`** - Template for other developers

---

## 🚀 Setup Instructions

### **For You (First Time Setup)**

1. **Your credentials are already configured** in `scripts/config.local.js`
2. **This file is gitignored** and won't be committed
3. **You're all set!** The app will use your Client ID automatically

### **For Other Developers (Cloning Your Repo)**

1. **Copy the example file:**
   ```bash
   cp scripts/config.local.example.js scripts/config.local.js
   ```

2. **Edit `scripts/config.local.js`:**
   ```javascript
   export default {
       googleClientId: 'YOUR_CLIENT_ID_HERE',
   };
   ```

3. **Get a Google Client ID:**
   - Follow `GOOGLE_OAUTH_SETUP.md`
   - Or use the same Client ID (if sharing within a team)

---

## 📋 Best Practices

### ✅ **DO**

1. **Use the config system** - Credentials in `config.local.js`
2. **Commit `.gitignore`** - Ensures `config.local.js` is never committed
3. **Commit example files** - `config.local.example.js` helps other developers
4. **Use environment variables in production** - See "Production Deployment" below
5. **Restrict OAuth origins** - Only allow your actual domains in Google Console
6. **Use HTTPS in production** - Required for OAuth in production

### ❌ **DON'T**

1. **Don't commit `config.local.js`** - It's gitignored for a reason
2. **Don't hardcode credentials** - Use the config system
3. **Don't use Client Secret in frontend** - Only in backend code
4. **Don't share credentials publicly** - Even though Client ID is "public"
5. **Don't skip HTTPS in production** - OAuth requires it

---

## 🌐 Production Deployment

### **Option 1: Static Hosting (Current Setup)**

For static hosting (Netlify, Vercel, GitHub Pages):

1. **Keep using `config.local.js`** approach
2. **Set Client ID in build environment variables**
3. **Use a build tool** (Vite, Webpack) to inject variables

### **Option 2: Environment Variables with Vite**

1. **Install Vite:**
   ```bash
   npm install -D vite
   ```

2. **Create `.env` file:**
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id-here
   ```

3. **Update `config.js`:**
   ```javascript
   export const config = {
       googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
   };
   ```

4. **Add to `.gitignore`:**
   ```
   .env
   .env.local
   ```

5. **Set environment variables in hosting platform:**
   - Netlify: Site settings → Environment variables
   - Vercel: Project settings → Environment Variables
   - GitHub Pages: Repository secrets

### **Option 3: Backend API (Most Secure)**

For maximum security, move authentication to a backend:

1. **Backend handles OAuth:**
   - User clicks "Sign in with Google"
   - Frontend redirects to backend endpoint
   - Backend exchanges code for tokens
   - Backend validates tokens
   - Backend issues your own JWT

2. **Benefits:**
   - Can use Client Secret securely
   - Full control over token validation
   - Can add additional security layers
   - Can store user data in database

3. **See `DATABASE_MIGRATION_GUIDE.md`** for backend implementation

---

## 🔒 Additional Security Measures

### **1. Restrict Authorized Origins**

In Google Cloud Console, only allow your actual domains:

**Development:**
```
http://localhost:8888
```

**Production:**
```
https://yourdomain.com
```

**Don't use wildcards** - Be specific!

### **2. Enable HTTPS in Production**

- OAuth requires HTTPS in production
- Use Let's Encrypt (free SSL certificates)
- Most hosting platforms provide HTTPS automatically

### **3. Implement Content Security Policy (CSP)**

Add to your HTML `<head>`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://accounts.google.com; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' https:; 
               connect-src 'self' https://accounts.google.com;">
```

### **4. Regular Security Audits**

- Review authorized origins regularly
- Rotate credentials if compromised
- Monitor usage in Google Cloud Console
- Check for unauthorized access

---

## 🚨 What to Do If Credentials Are Compromised

### **If Client ID is Exposed:**

**Don't panic!** Client ID is designed to be public. However:

1. **Check authorized origins** - Make sure only your domains are listed
2. **Review usage** - Check Google Cloud Console for unusual activity
3. **Consider rotating** - Create a new Client ID if concerned

### **If Client Secret is Exposed (Backend Only):**

**Act immediately!**

1. **Revoke the credential** in Google Cloud Console
2. **Create a new OAuth Client**
3. **Update your backend** with new credentials
4. **Investigate** how it was exposed
5. **Fix the leak** before deploying new credentials

---

## 📊 Security Checklist

- [x] Client ID in `config.local.js` (gitignored)
- [x] `.gitignore` includes `config.local.js`
- [x] Example file (`config.local.example.js`) committed
- [x] No hardcoded credentials in HTML
- [ ] Authorized origins restricted to your domains
- [ ] HTTPS enabled in production
- [ ] Environment variables set in hosting platform (if using)
- [ ] CSP headers configured (optional but recommended)
- [ ] Regular security audits scheduled

---

## 📚 Additional Resources

- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## ❓ FAQ

**Q: Is it safe to commit the Client ID to git?**  
A: Technically yes, but it's better practice to use the config system to keep it separate.

**Q: Can someone steal my Client ID and use it?**  
A: They could try, but Google's authorized origins restriction prevents unauthorized use.

**Q: Do I need a backend for OAuth?**  
A: No, frontend-only OAuth is secure for read-only user data. Use a backend for sensitive operations.

**Q: What if I accidentally commit `config.local.js`?**  
A: Remove it from git history, rotate your Client ID, and ensure `.gitignore` is working.

**Q: Should I use the same Client ID for dev and production?**  
A: You can, but it's better to create separate OAuth clients for each environment.

