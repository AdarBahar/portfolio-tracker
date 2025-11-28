# React Login & Landing Page Testing Guide

## Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:4000/api`
- Google OAuth credentials configured
- React app built and deployed

## Local Development Testing

### 1. Start Development Server

```bash
cd frontend-react
npm install  # if needed
npm run dev
```

Visit: `http://localhost:5173/fantasybroker/react/`

### 2. Test Landing Page

**URL**: `http://localhost:5173/fantasybroker/react/`

**Expected**:
- ✅ Hero section visible with title and CTA buttons
- ✅ Features grid shows 4 feature cards
- ✅ "Sign In" button in navigation
- ✅ "Get Started" button in hero
- ✅ Responsive on mobile/tablet/desktop

**Actions**:
- Click "Sign In" → should navigate to `/login`
- Click "Get Started" → should navigate to `/login`
- Resize window → layout should adapt

### 3. Test Login Page

**URL**: `http://localhost:5173/fantasybroker/react/login`

**Expected**:
- ✅ Login card visible with title
- ✅ Google Sign-In button rendered
- ✅ Demo Mode button visible
- ✅ Features preview cards shown
- ✅ Theme toggle button in top-right

**Actions**:
- Click Google button → Google sign-in popup should appear
- Click Demo Mode → should create demo session and redirect to dashboard
- Theme toggle → should switch between light/dark mode

### 4. Test Google OAuth Flow

**Prerequisites**:
- Google Client ID configured in `.env`
- Backend `/auth/google` endpoint working

**Steps**:
1. Click Google Sign-In button
2. Select Google account
3. Approve permissions
4. Should see success toast: "Welcome back!"
5. Should redirect to `/dashboard` after 1 second
6. Check localStorage for `portfolio_user` and `portfolio_auth_token`

**Expected localStorage**:
```javascript
// portfolio_user
{
  "id": "google_id_123",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://...",
  "isDemo": false,
  "isAdmin": false
}

// portfolio_auth_token
"eyJhbGciOiJIUzI1NiIs..."

// portfolio_token_expiry
"1701234567890"
```

### 5. Test Demo Mode

**Steps**:
1. Click "Continue in Demo Mode"
2. Should see success toast: "Entering demo mode..."
3. Should redirect to `/dashboard` after 1 second
4. Check localStorage for demo user

**Expected localStorage**:
```javascript
// portfolio_user
{
  "id": "demo_1701234567890",
  "email": "demo@demo.local",
  "name": "Demo User",
  "isDemo": true,
  "isAdmin": false
}

// portfolio_auth_token
"demo_token"
```

### 6. Test Protected Routes

**Without Authentication**:
- Visit `/dashboard` → should redirect to `/login`
- Visit `/trade-room` → should redirect to `/login`
- Visit `/admin` → should redirect to `/login`

**With Authentication**:
- After login, visit `/dashboard` → should show dashboard
- Visit `/trade-room` → should show trade room
- Visit `/admin` → should show admin panel

### 7. Test Session Persistence

**Steps**:
1. Login with Google or Demo
2. Refresh page (F5)
3. Should remain logged in
4. Check that user data is still in localStorage

### 8. Test Logout

**Steps**:
1. Login
2. Open browser console
3. Run: `localStorage.clear()`
4. Refresh page
5. Should redirect to login

## Production Testing

### 1. Build for Production

```bash
cd frontend-react
npm run build
```

### 2. Deploy to Server

```bash
rsync -avz --delete react/ user@server:/var/www/fantasy-broker/react/
```

### 3. Test on Production

**Landing Page**: `https://www.bahar.co.il/fantasybroker/react/`
- ✅ Page loads without errors
- ✅ All assets load (CSS, JS)
- ✅ No console errors

**Login Page**: `https://www.bahar.co.il/fantasybroker/react/login`
- ✅ Google button renders
- ✅ Demo button works
- ✅ Network requests to backend succeed

**Google OAuth**: 
- ✅ Sign-in flow completes
- ✅ Token received from backend
- ✅ Redirects to dashboard

**Protected Routes**:
- ✅ Unauthenticated access redirects to login
- ✅ Authenticated access shows page

## Troubleshooting

### Google Button Not Rendering
- Check Google Client ID in `.env`
- Verify Google Sign-In library loaded
- Check browser console for errors

### Login Fails
- Check backend API is running
- Verify `/auth/google` endpoint exists
- Check CORS headers
- Check network tab for 401/500 errors

### Session Lost After Refresh
- Check localStorage is enabled
- Verify token not expired
- Check browser privacy settings

### Redirect Loop
- Check auth context initialization
- Verify protected route logic
- Check localStorage keys match

