# Phase 1: Quick Reference Guide

**Quick links to all Phase 1 resources**

---

## 📚 DOCUMENTATION

| Document | Purpose | Read Time |
|---|---|---|
| `PHASE_1_COMPLETION_SUMMARY.md` | Overview of Phase 1 | 5 min |
| `PHASE_1_IMPLEMENTATION_GUIDE.md` | Detailed implementation | 10 min |
| `PHASE_1_QUICK_REFERENCE.md` | This file | 2 min |

---

## 🔧 FILES CREATED

### Types (`src/types/index.ts`)
```typescript
import type {
  User,
  UserProfile,
  TradeRoom,
  Portfolio,
  Holding,
  Leaderboard,
  LeaderboardEntry,
  Order,
  StockInfo,
  Notification,
  ApiResponse,
  PaginatedResponse,
} from '@/types';
```

### Hooks (`src/hooks/useNewUIData.ts`)
```typescript
// User
useCurrentUserProfile()
useUserProfile(userId)

// Trade Rooms
useCurrentTradeRooms()
useAvailableTradeRooms()
useTradeRoomDetail(bullPenId)
useCreateTradeRoom()
useJoinTradeRoom()

// Portfolio
usePortfolio(bullPenId)
useHoldings(bullPenId)

// Leaderboard
useLeaderboard(bullPenId)

// Trading
usePlaceOrder()

// Market Data
useStockInfo(symbol)
useStockSearch(query)
```

### Utilities (`src/utils/newUIHelpers.ts`)
```typescript
formatCurrency(value)
formatPercent(value)
formatCompactNumber(value)
calculateTimeRemaining(startTime, durationSec)
getTradeRoomStatusColor(state)
getMedalEmoji(rank)
getRewardStars(rank, totalRewardStars)
sortLeaderboard(entries)
filterTradeRooms(rooms, query)
getChangeColor(change)
getChangeBgColor(change)
formatDate(date)
formatDateShort(date)
getInitials(name)
```

### Components
```typescript
// Error Boundary
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Skeletons
import {
  ProfileHeaderSkeleton,
  GameCardSkeleton,
  PortfolioSkeleton,
  LeaderboardSkeleton,
  HoldingsSkeleton,
  TradeRoomDetailSkeleton,
  SearchResultsSkeleton,
} from '@/components/LoadingSkeletons';
```

### Configuration (`src/config/newUIConfig.ts`)
```typescript
import {
  QUERY_CONFIG,
  UI_CONFIG,
  TRADE_ROOM_CONFIG,
  VALIDATION_CONFIG,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '@/config/newUIConfig';
```

---

## 💡 COMMON PATTERNS

### Fetch Data with Loading & Error
```typescript
import { useCurrentTradeRooms } from '@/hooks/useNewUIData';
import { GameCardSkeleton } from '@/components/LoadingSkeletons';

export function CurrentGames() {
  const { data: rooms, isLoading, error } = useCurrentTradeRooms();

  if (error) return <div>Error loading</div>;
  if (isLoading) return <GameCardSkeleton />;

  return <div>{/* render rooms */}</div>;
}
```

### Format Values
```typescript
import { formatCurrency, formatPercent } from '@/utils/newUIHelpers';

const price = formatCurrency(1234.56); // "$1,234.56"
const change = formatPercent(5.25); // "+5.25%"
```

### Wrap with Error Boundary
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### Use Configuration
```typescript
import { QUERY_CONFIG, UI_CONFIG } from '@/config/newUIConfig';

const staleTime = QUERY_CONFIG.USER_PROFILE.staleTime;
const itemsPerPage = UI_CONFIG.ITEMS_PER_PAGE;
```

---

## 🚀 GETTING STARTED

### Step 1: Import Types
```typescript
import type { TradeRoom, Portfolio } from '@/types';
```

### Step 2: Use Hooks
```typescript
const { data, isLoading, error } = useCurrentTradeRooms();
```

### Step 3: Handle States
```typescript
if (error) return <ErrorUI />;
if (isLoading) return <Skeleton />;
return <Content data={data} />;
```

### Step 4: Format Output
```typescript
const formatted = formatCurrency(value);
```

### Step 5: Wrap with Error Boundary
```typescript
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

## 📊 API ENDPOINTS

All endpoints are in `src/config/newUIConfig.ts`:

```typescript
API_ENDPOINTS.USER_PROFILE           // /user/profile
API_ENDPOINTS.MY_TRADE_ROOMS         // /my/bull-pens
API_ENDPOINTS.ALL_TRADE_ROOMS        // /bull-pens
API_ENDPOINTS.PORTFOLIO(id)          // /bull-pens/{id}/portfolio
API_ENDPOINTS.HOLDINGS(id)           // /bull-pens/{id}/holdings
API_ENDPOINTS.LEADERBOARD(id)        // /bull-pens/{id}/leaderboard
API_ENDPOINTS.PLACE_ORDER(id)        // /bull-pens/{id}/orders
API_ENDPOINTS.STOCK_INFO(symbol)     // /market-data/{symbol}
API_ENDPOINTS.STOCK_SEARCH           // /market-data/search
```

---

## ⚠️ IMPORTANT NOTES

1. **NO MOCK DATA** - All data from API endpoints
2. **Type Safety** - Always use types from `src/types/index.ts`
3. **Error Handling** - Always handle error states
4. **Loading States** - Always show loading skeletons
5. **Error Boundaries** - Wrap components to prevent crashes

---

## 🔗 RELATED FILES

- `src/lib/api.ts` - API client with auth
- `src/contexts/AuthContext.tsx` - Authentication context
- `src/contexts/ThemeContext.tsx` - Theme context

---

## ✅ CHECKLIST FOR NEW COMPONENTS

- [ ] Import types from `src/types/index.ts`
- [ ] Use hooks from `src/hooks/useNewUIData.ts`
- [ ] Handle loading state with skeleton
- [ ] Handle error state with error UI
- [ ] Use utilities for formatting
- [ ] Wrap with ErrorBoundary
- [ ] Add TypeScript types to props
- [ ] Test with real API data

---

## 🎯 NEXT PHASE

Phase 2: Login Page Migration
- Start: After Phase 1 verification
- Duration: 2-3 days
- Focus: Real authentication, form validation


