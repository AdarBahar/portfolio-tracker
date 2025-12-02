# Authentication Implementation Plan

**Plan for fixing Google OAuth and adding Email/Password & GitHub authentication**

---

## 🎯 OVERVIEW

Three authentication methods to implement:
1. **Google OAuth** - Fix existing integration
2. **Email/Password** - New login/registration
3. **GitHub OAuth** - New OAuth provider

---

## 1️⃣ GOOGLE OAUTH - FIX EXISTING INTEGRATION

### Current Status
- ✅ Backend endpoint exists: `POST /api/auth/google`
- ✅ Accepts Google credential (JWT token)
- ✅ Verifies with Google
- ✅ Creates/updates user in database
- ✅ Returns JWT token

### Frontend Issue
- ❌ Login component calls `login()` but doesn't send to `/api/auth/google`
- ❌ Google Sign-In button not properly initialized
- ❌ Callback handler not connected to backend

### Fix Required
1. Update `Login.tsx` to properly initialize Google Sign-In
2. Connect callback to `/api/auth/google` endpoint
3. Handle token response and redirect

### Implementation
```typescript
// In handleCredentialResponse
const response = await fetch(`${apiUrl}/auth/google`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ credential: response.credential })
});
const data = await response.json();
// Store token and redirect
```

---

## 2️⃣ EMAIL/PASSWORD - NEW ENDPOINTS

### Backend Requirements
- [ ] Create `POST /api/auth/register` endpoint
- [ ] Create `POST /api/auth/login` endpoint
- [ ] Hash passwords with bcrypt
- [ ] Validate email format
- [ ] Check for duplicate emails
- [ ] Return JWT token on success

### Frontend Requirements
- [ ] Add email/password form fields
- [ ] Add registration mode toggle
- [ ] Validate email format
- [ ] Validate password strength
- [ ] Call `/api/auth/register` for signup
- [ ] Call `/api/auth/login` for login
- [ ] Handle errors and redirect

### Database
- ✅ `users` table already has `email` and `password_hash` columns
- ✅ Schema supports email/password auth

---

## 3️⃣ GITHUB OAUTH - NEW OAUTH PROVIDER

### Backend Requirements
- [ ] Create `POST /api/auth/github` endpoint
- [ ] Verify GitHub token
- [ ] Create/update user with GitHub data
- [ ] Return JWT token

### Frontend Requirements
- [ ] Add GitHub OAuth button
- [ ] Initialize GitHub OAuth flow
- [ ] Handle callback
- [ ] Call `/api/auth/github` endpoint
- [ ] Handle errors and redirect

### GitHub OAuth Flow
1. User clicks "Sign in with GitHub"
2. Redirect to GitHub authorization
3. GitHub redirects back with code
4. Exchange code for token
5. Send token to backend
6. Backend verifies and creates user
7. Return JWT token

---

## 📋 IMPLEMENTATION ORDER

### Phase 1: Fix Google OAuth (1-2 hours)
1. Update Login component
2. Fix Google Sign-In initialization
3. Connect callback to backend
4. Test with real Google account

### Phase 2: Email/Password (2-3 hours)
1. Create backend endpoints
2. Add password hashing
3. Update Login component
4. Add form fields and validation
5. Test registration and login

### Phase 3: GitHub OAuth (2-3 hours)
1. Create backend endpoint
2. Update Login component
3. Add GitHub button
4. Implement OAuth flow
5. Test with GitHub account

---

## 🔧 FILES TO MODIFY

### Frontend
- `src/pages/Login.tsx` - Add email/password fields, GitHub button
- `src/contexts/AuthContext.tsx` - Add new auth methods
- `src/lib/api.ts` - Add new API calls

### Backend
- `src/routes/authRoutes.js` - Add new routes
- `src/controllers/authController.js` - Add new handlers
- `src/utils/authMiddleware.js` - Update if needed

---

## ✅ TESTING CHECKLIST

### Google OAuth
- [ ] Google button appears
- [ ] Click button opens Google dialog
- [ ] Select account and authorize
- [ ] Redirects to dashboard
- [ ] User data loaded correctly

### Email/Password
- [ ] Registration form works
- [ ] Password validation works
- [ ] Duplicate email check works
- [ ] Login form works
- [ ] Redirects to dashboard

### GitHub OAuth
- [ ] GitHub button appears
- [ ] Click button redirects to GitHub
- [ ] Authorize and redirect back
- [ ] User created/updated
- [ ] Redirects to dashboard

---

## 📊 TIMELINE

| Task | Duration | Status |
|---|---|---|
| Fix Google OAuth | 1-2 hrs | ⏳ TODO |
| Email/Password | 2-3 hrs | ⏳ TODO |
| GitHub OAuth | 2-3 hrs | ⏳ TODO |
| Testing | 1-2 hrs | ⏳ TODO |
| **Total** | **6-10 hrs** | - |

---

## 🚀 READY TO START!

All three authentication methods are planned and ready for implementation.


