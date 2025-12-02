# Phase 1: File Structure & Organization

**Complete file structure for Phase 1 foundation**

---

## 📁 NEW FILES CREATED

```
frontend-react/src/
├── types/
│   └── index.ts (180 lines)
│       ├── User & UserProfile
│       ├── TradeRoom & CreateTradeRoomInput
│       ├── Portfolio & Holding
│       ├── Leaderboard & LeaderboardEntry
│       ├── Order & CreateOrderInput
│       ├── StockInfo
│       ├── Notification
│       └── ApiResponse & PaginatedResponse
│
├── hooks/
│   └── useNewUIData.ts (220 lines)
│       ├── User Profile Hooks
│       │   ├── useCurrentUserProfile()
│       │   └── useUserProfile(userId)
│       ├── Trade Room Hooks
│       │   ├── useCurrentTradeRooms()
│       │   ├── useAvailableTradeRooms()
│       │   ├── useTradeRoomDetail(bullPenId)
│       │   ├── useCreateTradeRoom()
│       │   └── useJoinTradeRoom()
│       ├── Portfolio Hooks
│       │   ├── usePortfolio(bullPenId)
│       │   └── useHoldings(bullPenId)
│       ├── Leaderboard Hooks
│       │   └── useLeaderboard(bullPenId)
│       ├── Trading Hooks
│       │   └── usePlaceOrder()
│       └── Market Data Hooks
│           ├── useStockInfo(symbol)
│           └── useStockSearch(query)
│
├── utils/
│   └── newUIHelpers.ts (150 lines)
│       ├── formatCurrency(value)
│       ├── formatPercent(value)
│       ├── formatCompactNumber(value)
│       ├── calculateTimeRemaining(startTime, durationSec)
│       ├── getTradeRoomStatusColor(state)
│       ├── getMedalEmoji(rank)
│       ├── getRewardStars(rank, totalRewardStars)
│       ├── sortLeaderboard(entries)
│       ├── filterTradeRooms(rooms, query)
│       ├── getChangeColor(change)
│       ├── getChangeBgColor(change)
│       ├── formatDate(date)
│       ├── formatDateShort(date)
│       └── getInitials(name)
│
├── components/
│   ├── ErrorBoundary.tsx (60 lines)
│   │   ├── Error catching
│   │   ├── Error logging
│   │   ├── User-friendly UI
│   │   └── Recovery options
│   │
│   └── LoadingSkeletons.tsx (120 lines)
│       ├── ProfileHeaderSkeleton()
│       ├── GameCardSkeleton()
│       ├── PortfolioSkeleton()
│       ├── LeaderboardSkeleton()
│       ├── HoldingsSkeleton()
│       ├── TradeRoomDetailSkeleton()
│       └── SearchResultsSkeleton()
│
└── config/
    └── newUIConfig.ts (200 lines)
        ├── QUERY_CONFIG
        │   ├── USER_PROFILE
        │   ├── TRADE_ROOMS
        │   ├── PORTFOLIO
        │   ├── LEADERBOARD
        │   ├── MARKET_DATA
        │   └── STOCK_SEARCH
        ├── UI_CONFIG
        │   ├── ITEMS_PER_PAGE
        │   ├── LEADERBOARD_ITEMS
        │   ├── GAMES_PER_PAGE
        │   ├── TOAST_DURATION
        │   └── MODAL_ANIMATION_DURATION
        ├── TRADE_ROOM_CONFIG
        │   ├── DEFAULT_STARTING_CASH
        │   ├── DEFAULT_MAX_PLAYERS
        │   ├── DEFAULT_DURATION_HOURS
        │   ├── REWARD_DISTRIBUTION
        │   ├── TYPES
        │   └── STATES
        ├── VALIDATION_CONFIG
        │   ├── EMAIL_REGEX
        │   ├── USERNAME_REGEX
        │   ├── PASSWORD_MIN_LENGTH
        │   ├── SYMBOL_REGEX
        │   └── ROOM_NAME_MIN_LENGTH
        ├── API_ENDPOINTS
        │   ├── USER_PROFILE
        │   ├── MY_TRADE_ROOMS
        │   ├── ALL_TRADE_ROOMS
        │   ├── PORTFOLIO
        │   ├── HOLDINGS
        │   ├── LEADERBOARD
        │   ├── PLACE_ORDER
        │   ├── STOCK_INFO
        │   └── STOCK_SEARCH
        ├── ERROR_MESSAGES
        └── SUCCESS_MESSAGES
```

---

## 📊 STATISTICS

| Category | Count | Lines |
|---|---|---|
| Type Definitions | 12 | 180 |
| Custom Hooks | 13 | 220 |
| Utility Functions | 14 | 150 |
| Error Boundary | 1 | 60 |
| Skeleton Components | 7 | 120 |
| Configuration Items | 50+ | 200 |
| **Total** | **47+** | **930** |

---

## 🔗 IMPORT PATTERNS

### Import Types
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

### Import Hooks
```typescript
import {
  useCurrentUserProfile,
  useUserProfile,
  useCurrentTradeRooms,
  useAvailableTradeRooms,
  useTradeRoomDetail,
  useCreateTradeRoom,
  useJoinTradeRoom,
  usePortfolio,
  useHoldings,
  useLeaderboard,
  usePlaceOrder,
  useStockInfo,
  useStockSearch,
} from '@/hooks/useNewUIData';
```

### Import Utilities
```typescript
import {
  formatCurrency,
  formatPercent,
  formatCompactNumber,
  calculateTimeRemaining,
  getTradeRoomStatusColor,
  getMedalEmoji,
  getRewardStars,
  sortLeaderboard,
  filterTradeRooms,
  getChangeColor,
  getChangeBgColor,
  formatDate,
  formatDateShort,
  getInitials,
} from '@/utils/newUIHelpers';
```

### Import Components
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';
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

### Import Configuration
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

## 🎯 USAGE EXAMPLES

### Fetch Data
```typescript
const { data, isLoading, error } = useCurrentTradeRooms();
```

### Format Values
```typescript
const price = formatCurrency(1234.56);
const change = formatPercent(5.25);
```

### Handle Errors
```typescript
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Show Loading
```typescript
{isLoading && <GameCardSkeleton />}
```

### Use Configuration
```typescript
const staleTime = QUERY_CONFIG.USER_PROFILE.staleTime;
```

---

## ✅ INTEGRATION CHECKLIST

When creating new components:

- [ ] Import types from `src/types/index.ts`
- [ ] Use hooks from `src/hooks/useNewUIData.ts`
- [ ] Use utilities from `src/utils/newUIHelpers.ts`
- [ ] Wrap with `ErrorBoundary`
- [ ] Use skeletons from `src/components/LoadingSkeletons.tsx`
- [ ] Use config from `src/config/newUIConfig.ts`
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Add TypeScript types

---

## 📚 DOCUMENTATION FILES

```
docs/
├── PHASE_1_IMPLEMENTATION_GUIDE.md
├── PHASE_1_COMPLETION_SUMMARY.md
├── PHASE_1_QUICK_REFERENCE.md
├── PHASE_1_VERIFICATION_CHECKLIST.md
├── PHASE_1_FINAL_SUMMARY.md
└── PHASE_1_FILE_STRUCTURE.md (this file)
```

---

## 🚀 READY FOR PHASE 2

All files are in place and ready for component migration!


