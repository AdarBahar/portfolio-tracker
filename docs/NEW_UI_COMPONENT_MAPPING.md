# New UI Component Mapping & Integration Guide

## Component-by-Component Migration Matrix

### 1. LOGIN PAGE

| Component | New UI | Existing | Status | Integration Notes |
|---|---|---|---|---|
| Login Form | Login.tsx | Login.tsx | ✅ Replace | Use existing AuthContext, add real OAuth |
| Email Input | Input | Input | ✅ Same | Use shadcn/ui input |
| Password Input | Input | Input | ✅ Same | Add show/hide toggle |
| OAuth Buttons | Button | Button | ✅ Same | Integrate with Google/GitHub OAuth |
| Form Validation | None | None | ⚠️ Add | Add react-hook-form validation |
| Error Handling | None | None | ⚠️ Add | Add error toast notifications |

---

### 2. DASHBOARD PAGE

| Component | New UI | Existing | Status | Integration Notes |
|---|---|---|---|---|
| TopBar | TopBar.tsx | ProfileHeader | ✅ Merge | Combine notifications + user profile |
| SearchBar | SearchBar.tsx | None | ✅ New | Add search functionality |
| PlayerProfile | PlayerProfile.tsx | ProfileHeaderContainer | ✅ Enhance | Connect to useUserProfile hook |
| CurrentGames | CurrentGames.tsx | TradeRoom (partial) | ✅ Redesign | Filter user's active rooms |
| AvailableGames | AvailableGames.tsx | TradeRoom (partial) | ✅ Redesign | Show available rooms to join |
| GameCard | GameCard.tsx | BullPenCard | ✅ Replace | Use new design |
| CreateRoomModal | CreateRoomModal.tsx | None | ✅ New | Integrate with API |
| Charts | Existing | Existing | ✅ Keep | Maintain existing charts |

---

### 3. TRADE ROOM DETAIL PAGE

| Component | New UI | Existing | Status | Integration Notes |
|---|---|---|---|---|
| TradeRoomView | TradeRoomView.tsx | BullPenDetail.tsx | ✅ Replace | Maintain all functionality |
| Portfolio | Portfolio.tsx | PortfolioView | ✅ Redesign | Connect to holdings API |
| Holdings Table | Table | HoldingsTable | ✅ Redesign | Use shadcn/ui table |
| BuyAssetsModal | BuyAssetsModal.tsx | TradingPanel | ✅ Redesign | Integrate with trading API |
| Leaderboard | Leaderboard.tsx | LeaderboardView | ✅ Redesign | Connect to leaderboard API |
| AIRecommendations | AIRecommendations.tsx | None | ✅ New | Create AI recommendation API |
| StockInfoModal | StockInfoModal.tsx | None | ✅ New | Connect to market data API |

---

### 4. ADMIN PANEL (NOT IN NEW UI)

| Component | New UI | Existing | Status | Integration Notes |
|---|---|---|---|---|
| Admin Layout | N/A | Admin.tsx | ⚠️ Redesign | Create new design matching new UI |
| User Table | N/A | UserTable | ⚠️ Redesign | Update styling |
| User Detail Modal | N/A | UserDetailModal | ⚠️ Redesign | Update styling |
| Rake Config | N/A | RakeConfigForm | ⚠️ Redesign | Update styling |
| Promotions | N/A | PromotionsList | ⚠️ Redesign | Update styling |

---

### 5. LANDING PAGE (NOT IN NEW UI)

| Component | New UI | Existing | Status | Integration Notes |
|---|---|---|---|---|
| Landing | N/A | Landing.tsx | ⚠️ Redesign | Create new design matching new UI |
| Hero Section | N/A | None | ✅ New | Design hero section |
| Features | N/A | None | ✅ New | Design features section |
| CTA Buttons | N/A | None | ✅ New | Design call-to-action |

---

## UI Component Library Mapping

### shadcn/ui Components Used in New UI

| Component | Used In | Purpose |
|---|---|---|
| Button | All pages | Primary action button |
| Input | Login, Modals | Text input fields |
| Dialog | Modals | Modal dialogs |
| Card | Dashboard, TradeRoom | Content containers |
| Table | Portfolio | Holdings display |
| Tabs | TradeRoomView | Tab navigation |
| Badge | GameCard, Leaderboard | Status badges |
| Avatar | TopBar, Leaderboard | User avatars |
| Dropdown Menu | TopBar | User menu |
| Popover | Notifications | Notification popover |
| Tooltip | Various | Hover tooltips |
| Skeleton | Loading | Loading skeletons |
| Alert | Errors | Error messages |
| Checkbox | Forms | Checkbox inputs |
| Radio Group | Forms | Radio inputs |
| Select | Forms | Dropdown selects |
| Textarea | Forms | Text areas |
| Slider | Forms | Range sliders |
| Toggle | Forms | Toggle switches |
| Accordion | Forms | Accordion sections |
| Carousel | Images | Image carousel |
| Pagination | Lists | List pagination |
| Progress | Loading | Progress bars |
| Scroll Area | Lists | Scrollable areas |
| Separator | Layout | Visual separators |
| Sheet | Mobile | Mobile drawer |
| Sidebar | Layout | Sidebar navigation |
| Breadcrumb | Navigation | Breadcrumb navigation |
| Command | Search | Command palette |
| Context Menu | Right-click | Context menus |
| Hover Card | Hover | Hover cards |
| Navigation Menu | Navigation | Navigation menus |
| Menubar | Navigation | Menu bar |
| Resizable | Layout | Resizable panels |

---

## API Integration Points

### Endpoints to Connect

| Component | Endpoint | Method | Purpose |
|---|---|---|---|
| Login | /auth/login | POST | Authenticate user |
| PlayerProfile | /api/user/profile | GET | Fetch user profile |
| CurrentGames | /api/bullpens | GET | Fetch user's rooms |
| AvailableGames | /api/bullpens | GET | Fetch available rooms |
| CreateRoomModal | /api/bullpens | POST | Create new room |
| Portfolio | /api/holdings | GET | Fetch holdings |
| BuyAssetsModal | /api/orders | POST | Place buy order |
| Leaderboard | /api/leaderboard | GET | Fetch rankings |
| AIRecommendations | /api/recommendations | GET | Fetch AI recommendations |
| StockInfoModal | /api/market-data | GET | Fetch stock info |

---

## Hook Integration Points

### Existing Hooks to Use

| Component | Hook | Purpose |
|---|---|---|
| Login | useAuth | Authentication |
| Dashboard | useUserProfile | User data |
| Dashboard | useBullPens | Trade rooms |
| TradeRoom | useBullPenOrders | Orders |
| TradeRoom | useLeaderboard | Rankings |
| Portfolio | usePortfolioData | Holdings |
| AIRecommendations | useRecommendations | AI insights |

---

## Migration Dependency Graph

```
Foundation (Week 1)
├── TypeScript Interfaces
├── Tailwind Config
└── UI Components Library
    ├── Login (Week 1-2)
    │   └── AuthContext Integration
    ├── Dashboard (Week 2-3)
    │   ├── PlayerProfile
    │   ├── CurrentGames
    │   ├── AvailableGames
    │   └── SearchBar
    ├── TradeRoom (Week 3-4)
    │   ├── Portfolio
    │   ├── Leaderboard
    │   ├── AIRecommendations
    │   └── Modals
    ├── Admin (Week 4-5)
    │   └── Redesign
    └── Polish (Week 5-6)
        ├── Testing
        ├── Performance
        └── Accessibility
```


