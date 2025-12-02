# Phase 3: Dashboard Implementation Guide

**Step-by-step guide to migrate Dashboard page**

---

## 🎯 IMPLEMENTATION ORDER

### Step 1: Create Dashboard.tsx (Main Container)
**File**: `src/pages/Dashboard.tsx`

**Key Features**:
- Import all sub-components
- State management for trade rooms, search, modals
- API calls for user data and trade rooms
- Layout structure with TopBar, header, sections
- Loading and error states

**Data to Fetch**:
- User profile (name, avatar, stats)
- User's trade rooms (current games)
- Available trade rooms
- Notifications

---

### Step 2: Create TopBar Component
**File**: `src/components/dashboard/TopBar.tsx`

**Key Features**:
- Logo and branding
- Search bar
- Notifications dropdown
- User menu (profile, settings, logout)
- Theme toggle
- Responsive design

**Props**:
- `notifications: Notification[]`
- `onMarkNotificationRead: (id: string) => void`
- `onClearNotifications: () => void`

---

### Step 3: Create PlayerProfile Component
**File**: `src/components/dashboard/PlayerProfile.tsx`

**Key Features**:
- User avatar with level badge
- User name and username
- Stats grid (rank, win rate, total rooms, wins)
- Earnings display
- Gradient card styling

**Data from API**:
- User profile (name, avatar, level)
- User stats (rank, wins, win rate, earnings)

---

### Step 4: Create CurrentGames Component
**File**: `src/components/dashboard/CurrentGames.tsx`

**Key Features**:
- List of user's active trade rooms
- Game cards with status, players, entry fee
- Search filtering
- View/manage buttons
- Empty state

**Data from API**:
- `GET /api/trade-rooms/my-rooms`

---

### Step 5: Create AvailableGames Component
**File**: `src/components/dashboard/AvailableGames.tsx`

**Key Features**:
- List of available trade rooms
- Game cards with difficulty, entry fee, rewards
- Search filtering
- Join button
- Empty state

**Data from API**:
- `GET /api/trade-rooms`

---

### Step 6: Create SearchBar Component
**File**: `src/components/dashboard/SearchBar.tsx`

**Key Features**:
- Search input
- Create room button
- Filter options (difficulty, entry fee)
- Real-time search

---

### Step 7: Create GameCard Component
**File**: `src/components/dashboard/GameCard.tsx`

**Key Features**:
- Game name and description
- Players count
- Entry fee and rewards
- Status badge
- Action buttons
- Responsive design

---

### Step 8: Create CreateRoomModal Component
**File**: `src/components/dashboard/CreateRoomModal.tsx`

**Key Features**:
- Form for creating new trade room
- Fields: name, type, difficulty, entry fee, max players
- Date range picker
- Player invitation
- Submit and cancel buttons

---

## 🔌 API INTEGRATION

### User Profile
```typescript
const userProfile = await apiClient.get('/api/user/profile');
// Returns: { id, name, avatar, level, email }
```

### User Stats
```typescript
const userStats = await apiClient.get('/api/user/stats');
// Returns: { rank, wins, totalGames, winRate, earnings }
```

### Trade Rooms
```typescript
const myRooms = await apiClient.get('/api/trade-rooms/my-rooms');
const availableRooms = await apiClient.get('/api/trade-rooms');
```

### Create Room
```typescript
const newRoom = await apiClient.post('/api/trade-rooms', roomData);
```

---

## 🎨 STYLING PATTERNS

### Gradient Cards
```tsx
<div className="gradient-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-lg">
  {/* Content */}
</div>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Items */}
</div>
```

### Loading State
```tsx
{isLoading && <LoadingSkeleton />}
```

---

## 📊 STATE MANAGEMENT

```typescript
const [userProfile, setUserProfile] = useState(null);
const [userStats, setUserStats] = useState(null);
const [myRooms, setMyRooms] = useState([]);
const [availableRooms, setAvailableRooms] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [showCreateRoom, setShowCreateRoom] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);
```

---

## 🧪 TESTING CHECKLIST

- [ ] Dashboard loads without errors
- [ ] User profile displays correctly
- [ ] Trade rooms load from API
- [ ] Search filtering works
- [ ] Create room modal opens/closes
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] Loading states show
- [ ] Error states handled

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] All components created
- [ ] API integration complete
- [ ] Build passes (zero TypeScript errors)
- [ ] No console errors
- [ ] Responsive design verified
- [ ] All tests passing
- [ ] Ready for production

---

**Ready to implement! 🎉**


