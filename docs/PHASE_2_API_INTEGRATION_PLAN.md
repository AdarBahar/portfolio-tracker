# Phase 2: API Integration Plan

## 🎯 Objective

Integrate the Profile Header component with real API data instead of mock data.

## 📊 Current State

- ✅ Profile Header component built with horizontal layout
- ✅ All sub-components (Avatar, StarBadge, ProfitIndicator, StatCard) working
- ✅ Mock data system in place for testing
- ❌ No dedicated user profile endpoint in backend
- ❌ No data fetching hooks in frontend

## 🔍 API Analysis

### Existing Endpoints
- `GET /api/v1/budget` - User budget (available/locked balance)
- `GET /api/bull-pens/:id/leaderboard` - Room leaderboard with stars and scores
- `GET /api/admin/users/:id/detail` - Admin endpoint with user stats (not suitable for frontend)

### Data Needed for Profile Header
1. **User Profile**: name, email, picture, username, tier, lifetimeStars, netProfit
2. **User Stats**: globalRank, winRate, totalRoomsPlayed, totalWins, winStreak

## 📋 Implementation Tasks

### Phase 2.1: Backend - Create User Profile Endpoint
**File**: `backend/src/routes/userRoutes.js` (NEW)
**File**: `backend/src/controllers/userController.js` (NEW)

**Endpoint**: `GET /api/users/profile`
- Returns authenticated user's profile and stats
- Response includes: name, email, picture, username, tier, lifetimeStars, netProfit, globalRank, winRate, totalRoomsPlayed, totalWins

### Phase 2.2: Frontend - Create Data Fetching Hooks
**File**: `frontend-react/src/hooks/useUserProfile.ts` (NEW)
**File**: `frontend-react/src/hooks/useUserStats.ts` (NEW)

- Use React Query for caching and state management
- Implement error handling and retry logic
- Add loading states

### Phase 2.3: Frontend - Integrate Hooks into Component
**File**: `frontend-react/src/components/header/ProfileHeader.tsx`

- Replace mock data with API calls
- Handle loading and error states
- Implement data refresh functionality

### Phase 2.4: Testing & Optimization
- Write unit tests for hooks
- Test error scenarios
- Implement caching strategy
- Performance optimization

## 🚀 Next Steps

1. Create backend user profile endpoint
2. Create frontend hooks
3. Integrate into ProfileHeader component
4. Test with real data
5. Optimize and cache

---

**Status**: Planning complete, ready to implement
**Estimated Time**: 4-6 hours

