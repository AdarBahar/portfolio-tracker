# 🏗️ Trade Room View - Architecture & Flow Documentation

## 📋 Overview
This document provides technical architecture, data flow, component interactions, and logic patterns for the Trade Room View feature.

---

## 🎯 System Architecture

### **High-Level Component Tree**

```
App (State Container)
├── Login (if !isLoggedIn)
└── Main Application (if isLoggedIn)
    ├── TopBar (persistent)
    │   ├── Logo
    │   ├── Notifications Dropdown
    │   └── Profile Dropdown
    │
    └── Conditional Routing
        ├── Dashboard View (if !selectedTradeRoom)
        │   ├── SearchBar
        │   ├── PlayerProfile
        │   ├── CurrentGames
        │   ├── AvailableGames
        │   └── CreateRoomModal (conditional)
        │
        └── Trade Room View (if selectedTradeRoom)
            ├── Back Button
            ├── Page Header
            ├── TradeRoomSummary
            └── Main Grid
                ├── Left Column
                │   ├── Portfolio
                │   │   ├── Summary Stats
                │   │   ├── Holdings Table/Cards
                │   │   ├── BuyAssetsModal (conditional)
                │   │   └── StockInfoModal (conditional)
                │   └── AIRecommendations
                │       ├── Market Insights
                │       └── Recommendation Cards
                └── Right Column
                    └── Leaderboard (sticky)
                        ├── Rewards Display
                        ├── Player Rankings
                        └── View Full Button
```

---

## 🔄 Data Flow Architecture

### **State Management (App.tsx)**

```typescript
// Primary State Variables
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [selectedTradeRoom, setSelectedTradeRoom] = useState<any>(null);
const [searchQuery, setSearchQuery] = useState('');
const [showCreateRoom, setShowCreateRoom] = useState(false);
const [userCreatedRooms, setUserCreatedRooms] = useState<any[]>([]);
const [notifications, setNotifications] = useState<any[]>([]);
```

### **Data Flow Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                              │
│                   (Central State)                           │
│                                                             │
│  State:                                                     │
│  • selectedTradeRoom                                        │
│  • userCreatedRooms                                         │
│  • notifications                                            │
│  • isLoggedIn                                               │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────────────────────────┐
             │                                  │
             ▼                                  ▼
    ┌────────────────┐               ┌──────────────────┐
    │   Dashboard    │               │ Trade Room View  │
    │                │               │                  │
    │  GameCard      │───onClick────▶│  tradeRoom prop  │
    │  (passes game) │               │                  │
    │                │               │  TradeRoomSummary│
    │                │◀──onBack()────│  Portfolio       │
    │                │               │  AIRecommend     │
    │                │               │  Leaderboard     │
    └────────────────┘               └──────────────────┘
```

---

## 🎮 User Flow & Navigation

### **Flow Diagram: Dashboard → Trade Room → Dashboard**

```
┌──────────────────┐
│  User Dashboard  │
│                  │
│  • CurrentGames  │
│  • AvailableGames│
└────────┬─────────┘
         │
         │ 1. Click "View Trade Room" or "Join Trade Room"
         │    on GameCard
         ▼
┌────────────────────────────────┐
│  GameCard.onSelect(game)       │
│  → Triggers parent callback    │
└────────┬───────────────────────┘
         │
         │ 2. App.tsx: setSelectedTradeRoom(game)
         │
         ▼
┌────────────────────────────────┐
│  Conditional Render Logic      │
│                                │
│  if (selectedTradeRoom) {      │
│    return <TradeRoomView />    │
│  }                             │
└────────┬───────────────────────┘
         │
         │ 3. Render Trade Room View
         ▼
┌────────────────────────────────┐
│     Trade Room View            │
│                                │
│  • TradeRoomSummary            │
│  • Portfolio (left column)     │
│  • AIRecommendations (left)    │
│  • Leaderboard (right, sticky) │
│                                │
│  [Back to Dashboard] button    │
└────────┬───────────────────────┘
         │
         │ 4. User clicks "Back to Dashboard"
         │
         ▼
┌────────────────────────────────┐
│  onBack() callback triggered   │
│  → App.tsx: setSelectedTradeRoom(null)
└────────┬───────────────────────┘
         │
         │ 5. State change triggers re-render
         ▼
┌──────────────────┐
│  Back to         │
│  Dashboard View  │
└──────────────────┘
```

---

## 💡 Logic Patterns

### **1. View Switching Logic**

```typescript
// App.tsx - Conditional Rendering Pattern
export default function App() {
  const [selectedTradeRoom, setSelectedTradeRoom] = useState<any>(null);
  
  // Login gate
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }
  
  // Trade Room View gate
  if (selectedTradeRoom) {
    return (
      <div className="dark">
        <TopBar />
        <TradeRoomView 
          tradeRoom={selectedTradeRoom} 
          onBack={() => setSelectedTradeRoom(null)} 
        />
      </div>
    );
  }
  
  // Default: Dashboard View
  return (
    <div className="dark min-h-screen bg-background">
      <TopBar />
      {/* Dashboard components */}
    </div>
  );
}
```

### **2. Trade Room Selection Logic**

```typescript
// In Dashboard - CurrentGames.tsx or AvailableGames.tsx
<GameCard 
  game={game} 
  isActive={true}
  onSelect={(selectedGame) => {
    // Callback bubbles up to App.tsx
    setSelectedTradeRoom(selectedGame);
  }}
/>
```

### **3. Back Navigation Logic**

```typescript
// In TradeRoomView.tsx
<button
  onClick={onBack}  // Callback from parent App.tsx
  className="flex items-center gap-2..."
>
  <ArrowLeft className="w-5 h-5" />
  <span>Back to Dashboard</span>
</button>

// Parent handler in App.tsx
onBack={() => setSelectedTradeRoom(null)}
```

---

## 📊 Data Models & Interfaces

### **Trade Room Data Structure**

```typescript
interface TradeRoom {
  // Identifiers
  id: number;
  
  // Basic Info
  name: string;                    // "Tech Giants Challenge"
  type: string;                    // "Stock Trading"
  difficulty?: string;             // "Intermediate"
  description?: string;            // Room description
  
  // Participants
  players: number;                 // 45
  maxPlayers: number;              // 50
  
  // Status
  status?: string;                 // "active" | "waiting" | "ended" | "ending-soon"
  
  // Timing
  startDate?: string;              // "2025-11-25"
  endDate?: string;                // "2025-12-08"
  timeLeft?: string;               // "5 days 14h"
  
  // User Performance
  position?: number;               // 3 (user's rank)
  portfolio?: number;              // 24780 (user's portfolio value)
  
  // Rewards
  rewardStars: number;             // 5000
  entryFee?: number;               // 50
  
  // Room Settings
  startingBalance?: number;        // 25000
  isPrivate?: boolean;             // false
  allowInvites?: boolean;          // true
  
  // Creator Info
  isCreator?: boolean;             // true
  creator?: string;                // "You"
  
  // Invitations
  invitedPlayers?: Player[];
}
```

### **Player Data Structure**

```typescript
interface Player {
  id: string;
  rank: number;                    // 1-N
  name: string;                    // "Sarah Chen"
  username: string;                // "@sarahc_trades"
  portfolio: number;               // 28450
  change: number;                  // 14.2 (percentage)
  avatar: string;                  // URL
  isCurrentUser?: boolean;         // true
}
```

### **Asset/Holding Data Structure**

```typescript
interface Asset {
  symbol: string;                  // "AAPL"
  name: string;                    // "Apple Inc."
  type: string;                    // "Stock" | "Cryptocurrency"
  currentPrice: number;            // 185.20
  changePercent: number;           // 3.75
  
  // Portfolio Holdings (if owned)
  shares?: number;                 // 50
  avgPrice?: number;               // 178.50
  value?: number;                  // 9260
  change?: number;                 // 3.75
  
  // Market Data
  volume?: string;                 // "52.3M"
  marketCap?: string;              // "$2.89T"
  dayHigh?: number;                // 186.50
  dayLow?: number;                 // 183.20
  description?: string;
  logo?: string;                   // URL
}
```

### **AI Recommendation Data Structure**

```typescript
interface AIRecommendation {
  type: 'buy' | 'sell' | 'hold';
  symbol: string;                  // "NVDA"
  name: string;                    // "NVIDIA Corp."
  confidence: number;              // 85 (percentage)
  reason: string;                  // "Strong momentum in AI sector..."
  targetPrice: number;             // 525
  currentPrice: number;            // 498.60
  potentialGain?: number;          // 5.3 (percentage)
  potentialLoss?: number;          // -3.7 (percentage)
  timestamp: string;               // "2 minutes ago"
}
```

---

## 🔧 Component Communication

### **Parent → Child (Props Down)**

```typescript
// App.tsx → TradeRoomView
<TradeRoomView 
  tradeRoom={selectedTradeRoom}    // Data down
  onBack={() => setSelectedTradeRoom(null)}  // Callback down
/>

// TradeRoomView → TradeRoomSummary
<TradeRoomSummary tradeRoom={tradeRoom} />

// TradeRoomView → Portfolio
<Portfolio tradeRoom={tradeRoom} />

// TradeRoomView → Leaderboard
<Leaderboard tradeRoom={tradeRoom} />

// TradeRoomView → AIRecommendations
<AIRecommendations tradeRoom={tradeRoom} />
```

### **Child → Parent (Events Up)**

```typescript
// TradeRoomView → App (Back navigation)
onBack={() => setSelectedTradeRoom(null)}

// Portfolio → BuyAssetsModal
const [showBuyModal, setShowBuyModal] = useState(false);
<button onClick={() => setShowBuyModal(true)}>Buy Assets</button>

// GameCard → Dashboard → App (Room selection)
onSelect={(game) => setSelectedTradeRoom(game)}
```

---

## 🎨 Rendering Logic

### **Conditional Component Rendering**

```typescript
// In App.tsx
function App() {
  // 1. Login Gate
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }
  
  // 2. Trade Room View
  if (selectedTradeRoom) {
    return (
      <div className="dark">
        <TopBar />
        <TradeRoomView 
          tradeRoom={selectedTradeRoom} 
          onBack={() => setSelectedTradeRoom(null)} 
        />
      </div>
    );
  }
  
  // 3. Dashboard (default)
  return (
    <div className="dark min-h-screen bg-background">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SearchBar />
        <PlayerProfile />
        <CurrentGames onSelectRoom={setSelectedTradeRoom} />
        <AvailableGames />
      </div>
    </div>
  );
}
```

### **Modal Rendering Pattern**

```typescript
// In Portfolio.tsx
export function Portfolio({ tradeRoom }) {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedStockForInfo, setSelectedStockForInfo] = useState<any>(null);
  
  return (
    <>
      {/* Main Component */}
      <div className="gradient-card...">
        {/* Portfolio content */}
        <button onClick={() => setShowBuyModal(true)}>
          Buy Assets
        </button>
      </div>
      
      {/* Conditional Modals */}
      {showBuyModal && (
        <BuyAssetsModal 
          onClose={() => setShowBuyModal(false)}
          cashAvailable={cashBalance}
        />
      )}
      
      {selectedStockForInfo && (
        <StockInfoModal 
          onClose={() => setSelectedStockForInfo(null)}
          asset={selectedStockForInfo}
        />
      )}
    </>
  );
}
```

---

## ⚡ Event Handling

### **Click Events Flow**

```
User Action → Event Handler → State Update → Re-render
```

#### **Example 1: Entering Trade Room**

```typescript
1. User clicks GameCard button
   ↓
2. onClick={() => onSelect && onSelect(game)}
   ↓
3. onSelect={setSelectedTradeRoom} in parent
   ↓
4. setSelectedTradeRoom(game) updates App state
   ↓
5. App re-renders with new state
   ↓
6. Conditional logic shows TradeRoomView
```

#### **Example 2: Opening Buy Modal**

```typescript
1. User clicks "Buy Assets" button in Portfolio
   ↓
2. onClick={() => setShowBuyModal(true)}
   ↓
3. showBuyModal state changes to true
   ↓
4. Portfolio re-renders
   ↓
5. {showBuyModal && <BuyAssetsModal />} condition met
   ↓
6. BuyAssetsModal renders with backdrop
```

#### **Example 3: Back Navigation**

```typescript
1. User clicks "Back to Dashboard" button
   ↓
2. onClick={onBack}
   ↓
3. onBack={() => setSelectedTradeRoom(null)} executes
   ↓
4. App state updated: selectedTradeRoom = null
   ↓
5. App re-renders
   ↓
6. Conditional logic shows Dashboard instead of TradeRoomView
```

---

## 🧩 Component Lifecycle

### **Mount Sequence**

```
1. App mounts
   ↓
2. isLoggedIn check
   ↓
3. selectedTradeRoom check
   ↓
4. TradeRoomView mounts (if selectedTradeRoom exists)
   ↓
5. Child components mount in order:
   - TradeRoomSummary
   - Portfolio
   - AIRecommendations
   - Leaderboard
```

### **Update Sequence**

```
State Change in App
   ↓
React diffing algorithm
   ↓
Re-render affected components
   ↓
Update DOM with minimal changes
```

---

## 🔒 State Immutability Patterns

### **Adding to Arrays**

```typescript
// Adding new notification
setNotifications(prev => [...inviteNotifications, ...prev]);

// Adding new created room
setUserCreatedRooms(prev => [newRoom, ...prev]);
```

### **Updating Objects in Arrays**

```typescript
// Mark notification as read
setNotifications(prev => 
  prev.map(notif => 
    notif.id === notificationId 
      ? { ...notif, read: true } 
      : notif
  )
);
```

### **Setting Single Values**

```typescript
// Simple state updates
setSelectedTradeRoom(game);
setShowBuyModal(true);
setSearchQuery(e.target.value);
```

---

## 📡 Future: API Integration Points

### **Planned API Endpoints**

```typescript
// Trade Room Data
GET    /api/trade-rooms/:id
PUT    /api/trade-rooms/:id
DELETE /api/trade-rooms/:id

// Portfolio Operations
GET    /api/trade-rooms/:id/portfolio
POST   /api/trade-rooms/:id/orders    // Buy/Sell
GET    /api/trade-rooms/:id/holdings

// Leaderboard
GET    /api/trade-rooms/:id/leaderboard

// AI Recommendations
GET    /api/trade-rooms/:id/recommendations

// Real-time Updates
WS     /ws/trade-rooms/:id    // WebSocket for live data
```

---

## 🎯 Performance Optimization Strategies

### **Current Optimizations**

1. **Conditional Rendering**: Only render active view
2. **Component Splitting**: Separate concerns
3. **Lazy State**: Modals only render when needed
4. **Minimal Props**: Pass only required data

### **Future Optimizations**

```typescript
// Memoization
const memoizedValue = useMemo(() => 
  expensiveCalculation(tradeRoom), 
  [tradeRoom]
);

// Callback Memoization
const handleSelect = useCallback((game) => {
  setSelectedTradeRoom(game);
}, []);

// Component Memoization
const MemoizedLeaderboard = memo(Leaderboard);
```

---

## 🐛 Error Handling

### **Current Pattern**

```typescript
// Simple console logging
const handleBuy = () => {
  if (!selectedAsset || !canAfford) return;
  console.log('Buying:', { asset, quantity, totalWithFees });
  onClose();
};
```

### **Recommended Pattern**

```typescript
const handleBuy = async () => {
  try {
    if (!selectedAsset || !canAfford) {
      throw new Error('Invalid purchase conditions');
    }
    
    // API call would go here
    const result = await api.buyAsset({
      symbol: selectedAsset.symbol,
      quantity,
      orderType
    });
    
    // Update local state
    onClose();
    showSuccessToast('Purchase successful!');
    
  } catch (error) {
    console.error('Purchase failed:', error);
    showErrorToast(error.message);
  }
};
```

---

## 📝 Best Practices

### **State Management**
✅ Keep state as close to usage as possible
✅ Lift state only when needed by multiple components
✅ Use controlled components for forms
✅ Maintain single source of truth

### **Component Design**
✅ Single Responsibility Principle
✅ Composable and reusable
✅ Props interface clearly defined
✅ Minimal coupling between components

### **Performance**
✅ Avoid unnecessary re-renders
✅ Use keys properly in lists
✅ Lazy load heavy components
✅ Optimize images and assets

### **Code Quality**
✅ Consistent naming conventions
✅ TypeScript interfaces for type safety
✅ Comments for complex logic
✅ Clean and readable code structure

---

## 🚀 Testing Strategy

### **Unit Tests**
```typescript
// Test component rendering
describe('TradeRoomView', () => {
  it('renders trade room name', () => {
    render(<TradeRoomView tradeRoom={mockRoom} onBack={jest.fn()} />);
    expect(screen.getByText('Tech Giants Challenge')).toBeInTheDocument();
  });
  
  it('calls onBack when back button clicked', () => {
    const onBack = jest.fn();
    render(<TradeRoomView tradeRoom={mockRoom} onBack={onBack} />);
    fireEvent.click(screen.getByText('Back to Dashboard'));
    expect(onBack).toHaveBeenCalled();
  });
});
```

### **Integration Tests**
```typescript
// Test full user flow
it('navigates from dashboard to trade room and back', () => {
  render(<App />);
  // Click login
  // Click game card
  // Verify trade room view
  // Click back button
  // Verify dashboard view
});
```

---

## 📚 Related Documentation

- [trade-room-view-style-guide.md](./trade-room-view-style-guide.md) - UI/UX specifications
- [portfolio-style-guide.md](./portfolio-style-guide.md) - Portfolio component details
- [leaderboard-style-guide.md](./leaderboard-style-guide.md) - Leaderboard specifications
- [ai-recommendations-style-guide.md](./ai-recommendations-style-guide.md) - AI features
- [dashboard-style-guide.md](./dashboard-style-guide.md) - Dashboard architecture

---

**Last Updated**: December 2025  
**Architecture Version**: 1.0  
**Status**: Production Ready
