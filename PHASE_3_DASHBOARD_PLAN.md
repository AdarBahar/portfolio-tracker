# Phase 3: Dashboard Page Migration - PLAN

**Migrate Dashboard page from new UI design with modern layout and real API integration**

---

## 📋 OVERVIEW

The new Dashboard will replace the current portfolio-focused dashboard with a **trade room management dashboard** that shows:
- Player profile with stats (rank, wins, earnings)
- Current games (active trade rooms)
- Available games (trade rooms to join)
- Search and filter functionality
- Create room modal

---

## 🎯 KEY COMPONENTS TO CREATE

### 1. Dashboard.tsx (Main Container)
- Layout with TopBar, header, search, sections
- State management for trade rooms, search, modals
- Real API integration for user data and trade rooms

### 2. TopBar Component
- Logo and branding
- Search bar
- Notifications dropdown
- User menu (profile, settings, logout)
- Theme toggle

### 3. PlayerProfile Component
- User avatar and basic info
- Stats grid: rank, win rate, total rooms, total wins
- Earnings display
- Level badge

### 4. CurrentGames Component
- List of user's active trade rooms
- Game cards with status, players, entry fee
- Join/view buttons
- Search filtering

### 5. AvailableGames Component
- List of available trade rooms to join
- Game cards with difficulty, entry fee, rewards
- Join button
- Search filtering

### 6. SearchBar Component
- Search input for filtering games
- Create room button
- Filter options

---

## 📊 API ENDPOINTS NEEDED

### User Data
- `GET /api/user/profile` - Get user profile and stats
- `GET /api/user/stats` - Get user statistics

### Trade Rooms
- `GET /api/trade-rooms` - Get all available trade rooms
- `GET /api/trade-rooms/my-rooms` - Get user's trade rooms
- `POST /api/trade-rooms` - Create new trade room
- `POST /api/trade-rooms/:id/join` - Join a trade room

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read

---

## 🔄 DATA FLOW

```
Dashboard.tsx
├── TopBar (notifications, user menu)
├── Header (title, description)
├── SearchBar (search, create room)
├── PlayerProfile (user stats from API)
├── CurrentGames (user's rooms from API)
└── AvailableGames (available rooms from API)
```

---

## 📁 FILE STRUCTURE

```
src/pages/
└── Dashboard.tsx (new)

src/components/dashboard/
├── TopBar.tsx (new)
├── PlayerProfile.tsx (new)
├── CurrentGames.tsx (new)
├── AvailableGames.tsx (new)
├── SearchBar.tsx (new)
├── GameCard.tsx (new)
└── CreateRoomModal.tsx (new)
```

---

## ✅ IMPLEMENTATION STEPS

1. **Create Dashboard.tsx** - Main container with layout
2. **Create TopBar** - Header with navigation
3. **Create PlayerProfile** - User stats display
4. **Create CurrentGames** - Active rooms list
5. **Create AvailableGames** - Available rooms list
6. **Create SearchBar** - Search and filter
7. **Create GameCard** - Reusable game card component
8. **Create CreateRoomModal** - Room creation form
9. **Integrate API** - Connect all components to endpoints
10. **Test** - Verify with real data

---

## 🎨 DESIGN FEATURES

✅ Modern split-screen layout  
✅ Gradient cards with backdrop blur  
✅ Responsive design (mobile-first)  
✅ Dark theme by default  
✅ Smooth animations and transitions  
✅ Loading states and skeletons  
✅ Error handling  
✅ Real-time notifications  

---

## 📊 ESTIMATED TIMELINE

| Task | Duration |
|---|---|
| Dashboard.tsx | 30 min |
| TopBar | 45 min |
| PlayerProfile | 30 min |
| CurrentGames | 45 min |
| AvailableGames | 45 min |
| SearchBar | 30 min |
| GameCard | 20 min |
| CreateRoomModal | 45 min |
| API Integration | 1 hour |
| Testing | 30 min |
| **Total** | **5-6 hours** |

---

## 🚀 NEXT STEPS

1. Review this plan
2. Start with Dashboard.tsx
3. Create TopBar component
4. Create PlayerProfile component
5. Continue with other components
6. Integrate with API endpoints
7. Test with real data

---

**Ready to start Phase 3! 🎉**


