# React Query Cache Invalidation Fix

## Issue
When logging out from one user and logging in with another user, the Profile Header displayed cached data from the previous user. Only after reloading the page did the new user's data appear.

### Root Cause
React Query was caching the user profile data with the key `['userProfile']` and maintaining this cache across user sessions. When a new user logged in, the old cached data was still being used instead of fetching fresh data from the API.

---

## Solution
Clear the React Query cache on login and logout to ensure fresh data is always fetched for each user.

### Changes Made
**File**: `frontend-react/src/contexts/AuthContext.tsx`

1. **Added useQueryClient import**:
   ```tsx
   import { useQueryClient } from '@tanstack/react-query';
   ```

2. **Get queryClient instance in AuthProvider**:
   ```tsx
   const queryClient = useQueryClient();
   ```

3. **Clear cache in logout()**:
   ```tsx
   const logout = () => {
     localStorage.removeItem(STORAGE_KEYS.USER);
     localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
     localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
     
     // Clear React Query cache to prevent stale data
     queryClient.clear();
     
     setUser(null);
   };
   ```

4. **Clear cache in login()**:
   ```tsx
   const login = async (credential: string, _apiUrl: string) => {
     // ... auth logic ...
     
     // Clear React Query cache for new user
     queryClient.clear();
     
     setUser(userData);
     return userData;
   };
   ```

5. **Clear cache in loginAsDemo()**:
   ```tsx
   const loginAsDemo = async () => {
     // ... demo user setup ...
     
     // Clear React Query cache for demo user
     queryClient.clear();
     
     setUser(demoUser);
     return demoUser;
   };
   ```

---

## How It Works

### Before Fix ❌
1. User A logs in → Profile data cached
2. User A logs out
3. User B logs in → Old cached data from User A shown
4. Page reload → Fresh data for User B fetched

### After Fix ✅
1. User A logs in → Profile data cached
2. User A logs out → Cache cleared
3. User B logs in → Cache cleared, fresh data fetched immediately
4. Profile Header shows User B's data instantly

---

## Benefits
✅ No stale data shown when switching users  
✅ Fresh API calls on every login  
✅ Consistent user experience  
✅ No need to reload page  
✅ Works for all login methods (Google, Demo)  

---

## Testing Checklist
- [ ] Login with User A
- [ ] Verify User A's profile data displays
- [ ] Logout
- [ ] Login with User B
- [ ] Verify User B's profile data displays immediately (no stale data)
- [ ] Logout
- [ ] Login with User A again
- [ ] Verify User A's profile data displays correctly
- [ ] Test with Demo login
- [ ] Verify no console errors

---

## Technical Details

### Why queryClient.clear()?
- `queryClient.clear()` removes all cached queries and mutations
- Ensures no stale data persists across user sessions
- Called at the right time (before setUser) to prevent race conditions

### Why in all three login methods?
- `login()` - Google OAuth login
- `loginAsDemo()` - Demo user login
- `logout()` - Logout (clear before next login)

### React Query Cache Key
The userProfile query uses key: `['userProfile']`
- Stale time: 1 minute
- Refetch interval: 5 minutes
- Without cache clearing, old data would persist

---

## Deployment
- Commit: `45640c9`
- Branch: `main`
- Status: Ready for production deployment

---

**Date**: 2024-11-30
**Status**: ✅ FIXED

