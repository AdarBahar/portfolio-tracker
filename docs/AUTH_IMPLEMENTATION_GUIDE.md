# Authentication Implementation Guide

**Step-by-step guide for implementing Google OAuth fix and new auth methods**

---

## 🎯 CURRENT STATE

### Google OAuth
- ✅ Backend: `/api/auth/google` endpoint exists
- ❌ Frontend: Not properly connected
- ❌ Issue: `login()` in AuthContext calls `/auth/google` but Google callback not wired

### Email/Password
- ❌ Backend: No endpoints yet
- ❌ Frontend: No form fields

### GitHub OAuth
- ❌ Backend: No endpoints yet
- ❌ Frontend: No button or flow

---

## 1️⃣ FIX GOOGLE OAUTH (PRIORITY 1)

### Frontend Changes

**File**: `src/pages/Login.tsx`

Current issue (line 70):
```typescript
await login(response.credential, apiUrl);
```

This calls AuthContext.login() which already sends to `/auth/google`. The issue is the Google Sign-In button initialization.

**Fix**:
1. Ensure Google Sign-In script loads
2. Properly initialize g_id_onload div
3. Ensure callback is registered

### Backend Status
✅ Already working - accepts credential, verifies with Google, returns JWT

### Testing
```bash
# Test with real Google account
1. Open login page
2. Click "Sign in with Google"
3. Select account
4. Should redirect to dashboard
```

---

## 2️⃣ EMAIL/PASSWORD AUTHENTICATION

### Backend Implementation

**File**: `src/controllers/authController.js`

Add two new functions:

```javascript
async function registerUser(req, res) {
  const { email, password, name } = req.body;
  
  // Validate input
  // Hash password with bcrypt
  // Check for duplicate email
  // Create user in database
  // Return JWT token
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  
  // Find user by email
  // Compare password with hash
  // Return JWT token
}
```

**File**: `src/routes/authRoutes.js`

Add routes:
```javascript
router.post('/register', registerUser);
router.post('/login', loginUser);
```

### Frontend Implementation

**File**: `src/pages/Login.tsx`

Add email/password form fields:
```typescript
// In signup mode
<input {...register('email')} placeholder="Email" />
<input {...register('password')} type="password" placeholder="Password" />
<input {...register('confirmPassword')} type="password" placeholder="Confirm Password" />
<input {...register('name')} placeholder="Full Name" />

// In login mode
<input {...register('email')} placeholder="Email" />
<input {...register('password')} type="password" placeholder="Password" />
```

**File**: `src/contexts/AuthContext.tsx`

Add new methods:
```typescript
const loginWithEmail = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', { email, password });
  // Store token and user
};

const registerWithEmail = async (email: string, password: string, name: string) => {
  const response = await apiClient.post('/auth/register', { email, password, name });
  // Store token and user
};
```

---

## 3️⃣ GITHUB OAUTH INTEGRATION

### Backend Implementation

**File**: `src/controllers/authController.js`

Add function:
```javascript
async function githubAuth(req, res) {
  const { code } = req.body;
  
  // Exchange code for GitHub token
  // Get user info from GitHub
  // Create/update user in database
  // Return JWT token
}
```

**File**: `src/routes/authRoutes.js`

Add route:
```javascript
router.post('/github', githubAuth);
```

### Frontend Implementation

**File**: `src/pages/Login.tsx`

Add GitHub button and OAuth flow:
```typescript
const handleGitHubLogin = () => {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/github/callback`;
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;
};
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Google OAuth Fix
- [ ] Verify Google Sign-In script loads
- [ ] Test with real Google account
- [ ] Verify redirect to dashboard
- [ ] Check user data loaded

### Email/Password
- [ ] Create register endpoint
- [ ] Create login endpoint
- [ ] Add password hashing
- [ ] Add form fields to Login component
- [ ] Test registration
- [ ] Test login

### GitHub OAuth
- [ ] Create GitHub auth endpoint
- [ ] Add GitHub button to Login
- [ ] Implement OAuth flow
- [ ] Test with GitHub account

---

## 🔧 DEPENDENCIES

### Backend
- `bcrypt` - Password hashing (already installed)
- `jsonwebtoken` - JWT tokens (already installed)

### Frontend
- `react-hook-form` - Form validation (already installed)

---

## 🧪 TESTING

### Google OAuth
```bash
# Manual test
1. Open login page
2. Click "Sign in with Google"
3. Authorize
4. Check redirect and user data
```

### Email/Password
```bash
# Manual test
1. Click "Sign up"
2. Enter email, password, name
3. Submit
4. Check user created
5. Login with credentials
```

### GitHub OAuth
```bash
# Manual test
1. Click "Sign in with GitHub"
2. Authorize
3. Check redirect and user data
```

---

## 📊 TIMELINE

| Task | Duration |
|---|---|
| Fix Google OAuth | 30 min |
| Email/Password | 2 hours |
| GitHub OAuth | 2 hours |
| Testing | 1 hour |
| **Total** | **5.5 hours** |

---

**Ready to implement! 🚀**


