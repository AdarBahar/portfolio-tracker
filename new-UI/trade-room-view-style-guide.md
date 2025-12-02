# 🎨 Trade Room View - UI Style Guide

## 📋 Overview
The Trade Room View is the detailed view displayed when a user enters a specific trade room. It shows real-time portfolio management, AI recommendations, leaderboard rankings, and room statistics. This is the main interactive trading interface.

---

## 🎨 Color System

### **Brand Colors**
```css
Primary Blue:     hsl(199, 89%, 48%)  /* #0BA5EC */
Primary Purple:   hsl(262, 83%, 58%)  /* #7C3AED */
```

### **Semantic Colors**
```css
Success:          hsl(142, 76%, 36%)  /* #16A34A - Gains, buy actions */
Warning:          hsl(43, 96%, 56%)   /* #F59E0B - Rankings, stars */
Danger:           hsl(0, 84%, 60%)    /* #EF4444 - Losses, sell actions */
```

### **Background Colors (Dark Mode)**
```css
Background:       hsl(222, 47%, 11%)  /* #0D1829 - Page background */
Card:             hsl(222, 43%, 15%)  /* #152035 - Card surfaces */
Muted:            hsl(222, 43%, 20%)  /* #1C2842 - Muted elements */
Muted/30:         rgba(28, 40, 66, 0.3)
```

### **Text Colors**
```css
Foreground:       hsl(210, 20%, 98%)  /* #F8FAFC */
Muted Foreground: hsl(210, 20%, 65%)  /* #93A3B8 */
```

### **Border Colors**
```css
Border:           hsl(222, 43%, 25%)  /* #243049 */
Border/50:        rgba(36, 48, 73, 0.5)
```

---

## 📐 Typography

### **Font Sizes**
```css
h1 (text-2xl):    24px  /* 1.5rem - Room name */
text-xl:          20px  /* 1.25rem - Section headings */
text-base:        16px  /* 1rem - Default body */
text-sm:          14px  /* 0.875rem - Labels */
text-xs:          12px  /* 0.75rem - Small labels */
```

---

## 🏗️ Page Structure

### **Main Container**
```css
Background:       bg-background
Min Height:       min-h-screen
Max Width:        max-w-7xl mx-auto
Padding:          px-4 py-8
```

---

## 🔙 Back Button

### **Styling**
```css
Display:          flex items-center gap-2
Text Color:       text-muted-foreground
Hover:            text-brand-blue
Margin Bottom:    mb-6
Transition:       transition-colors

/* Icon */
Icon:             ArrowLeft
Size:             w-5 h-5

/* Text */
Content:          "Back to Dashboard"
```

---

## 📄 Page Header

### **Container**
```css
Margin Bottom:    mb-6
```

### **Room Title**
```css
Font Size:        text-2xl (h1 default)
Color:            foreground
Margin Bottom:    mb-2
Content:          {tradeRoom.name}
```

### **Room Type**
```css
Font Size:        text-base
Color:            muted-foreground
Content:          {tradeRoom.type}
```

---

## 📊 Trade Room Summary Component

### **Container**
```css
Background:       gradient-card
Backdrop:         backdrop-blur-sm
Border Radius:    rounded-2xl (16px)
Padding:          p-6 (24px)
Margin Bottom:    mb-6
Border:           border border-border
Shadow:           shadow-lg
```

### **Stats Grid**
```css
Display:          grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6
Gap:              gap-4
```

### **Stat Card**
```css
Background:       bg-muted/30
Border Radius:    rounded-xl (12px)
Padding:          p-4
Border:           border border-border/50
Hover:            border-brand-blue/50
Transition:       transition-colors
```

### **Stat Card Content**
```css
/* Icon & Label Row */
Display:          flex items-center gap-2
Margin Bottom:    mb-2

/* Icon */
Size:             w-4 h-4
Color:            Varies by stat type

/* Label */
Font Size:        text-xs
Color:            muted-foreground

/* Value */
Font Size:        text-base
Color:            Varies by stat type
```

### **Summary Statistics**

#### **1. Your Position**
```css
Icon:             Trophy
Color:            text-warning
Value Format:     "#{position}"
```

#### **2. Portfolio Value**
```css
Icon:             DollarSign
Color:            text-brand-purple
Value Format:     "${amount.toLocaleString()}"
```

#### **3. Daily Change**
```css
Icon:             TrendingUp
Color:            text-success (positive), text-danger (negative)
Value Format:     "+$1,245 (5.2%)"
```

#### **4. Players**
```css
Icon:             Users
Color:            text-brand-blue
Value Format:     "{current}/{max}"
```

#### **5. Reward Stars**
```css
Icon:             Star
Color:            text-warning
Value Format:     "{stars.toLocaleString()}"
```

#### **6. Time Left**
```css
Icon:             Calendar or Clock
Color:            text-muted-foreground
Value Format:     "5 days 14h"
```

---

## 🎯 Main Content Grid Layout

### **Grid Structure**
```css
Display:          grid grid-cols-1 lg:grid-cols-3
Gap:              gap-6
```

### **Left Column (2/3 width on desktop)**
```css
Grid Span:        lg:col-span-2
Space:            space-y-6

/* Contains */
1. Portfolio Component
2. AI Recommendations Component
```

### **Right Column (1/3 width on desktop)**
```css
Grid Span:        lg:col-span-1
Space:            space-y-6

/* Contains */
1. Leaderboard Component
```

---

## 💼 Portfolio Component (in Trade Room)

### **Reference**
See [portfolio-style-guide.md](./portfolio-style-guide.md) for complete specifications.

### **Key Features in Trade Room Context**
- Real-time holdings display
- Buy/Sell asset buttons
- Portfolio summary (Invested, Cash, Day P&L)
- Desktop table view / Mobile card view
- Stock info educational modals

### **Container**
```css
Background:       gradient-card backdrop-blur-sm
Border Radius:    rounded-2xl (16px)
Padding:          p-4 sm:p-6
Border:           border border-border
Shadow:           shadow-lg
```

---

## 🤖 AI Recommendations Component (in Trade Room)

### **Reference**
See [ai-recommendations-style-guide.md](./ai-recommendations-style-guide.md) for complete specifications.

### **Key Features in Trade Room Context**
- Buy/Sell/Hold recommendations
- Confidence scores (percentage)
- Market insights (3 stats)
- Execute order buttons
- Real-time analysis

### **Container**
```css
Background:       gradient-card backdrop-blur-sm
Border Radius:    rounded-2xl (16px)
Padding:          p-6
Border:           border border-border
Shadow:           shadow-lg
```

---

## 🏆 Leaderboard Component (in Trade Room)

### **Reference**
See [leaderboard-style-guide.md](./leaderboard-style-guide.md) for complete specifications.

### **Key Features in Trade Room Context**
- Top 6 players displayed
- Star rewards for top 3
- Current user highlighting
- Sticky positioning (top-24)
- Medal icons for top 3

### **Container**
```css
Background:       gradient-card backdrop-blur-sm
Border Radius:    rounded-2xl (16px)
Padding:          p-6
Border:           border border-border
Shadow:           shadow-lg
Position:         sticky top-24
```

---

## 📱 Responsive Behavior

### **Mobile (< 1024px)**
```css
Layout:           Single column stack
Order:            
  1. Summary
  2. Portfolio
  3. AI Recommendations
  4. Leaderboard (not sticky)
Grid:             grid-cols-1
Summary Stats:    grid-cols-2 (2 columns)
```

### **Tablet (md: 768px - 1023px)**
```css
Layout:           Single column stack
Summary Stats:    grid-cols-3 (3 columns)
```

### **Desktop (lg: 1024px+)**
```css
Layout:           2-column layout
Left:             2/3 width (Portfolio + AI)
Right:            1/3 width (Leaderboard - sticky)
Grid:             grid-cols-3
Summary Stats:    grid-cols-6 (all 6 in one row)
```

---

## 🌈 Gradients

```css
.gradient-card {
  background: linear-gradient(135deg, hsl(222, 43%, 15%) 0%, hsl(222, 43%, 17%) 100%);
}

.gradient-primary {
  background: linear-gradient(135deg, hsl(199, 89%, 48%) 0%, hsl(262, 83%, 58%) 100%);
}

.gradient-success {
  background: linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(142, 76%, 46%) 100%);
}
```

---

## 📏 Spacing System

```css
Gap 2:            8px   (gap-2)
Gap 4:            16px  (gap-4)
Gap 6:            24px  (gap-6)
Margin Bottom 2:  8px   (mb-2)
Margin Bottom 6:  24px  (mb-6)
Padding 4:        16px  (p-4)
Padding 6:        24px  (p-6)
Padding 8:        32px  (py-8)
Space Y 6:        24px  (space-y-6)
```

---

## 🎭 Interactive States

### **Back Button Hover**
```css
Text Color:       text-brand-blue
Transition:       transition-colors
```

### **Summary Stat Card Hover**
```css
Border:           border-brand-blue/50
Transition:       transition-colors
```

### **Component Interactions**
- Portfolio: Buy/Sell buttons open modals
- AI Recommendations: Execute buttons trigger orders
- Leaderboard: View full button expands list
- All components: Interactive hover states

---

## 🔄 Data Flow & State Management

### **TradeRoomView Props**
```typescript
interface TradeRoomViewProps {
  tradeRoom: any;      // Current trade room data
  onBack: () => void;  // Navigate back to dashboard
}
```

### **Trade Room Data Structure**
```typescript
interface TradeRoom {
  id: number;
  name: string;                    // "Tech Giants Challenge"
  type: string;                    // "Stock Trading"
  players: number;                 // 45
  maxPlayers: number;              // 50
  rewardStars: number;             // 5000
  position: number;                // 3
  portfolio: number;               // 24780
  endDate: string;                 // "2025-12-08"
  status: string;                  // "active" | "ending-soon"
  difficulty?: string;             // "Intermediate"
}
```

---

## 🎯 Component Hierarchy

```
TradeRoomView
├── Container (max-w-7xl, px-4, py-8)
│   ├── Back Button
│   ├── Page Header
│   │   ├── Room Title (h1)
│   │   └── Room Type (p)
│   ├── TradeRoomSummary
│   │   └── Stats Grid (6 stats)
│   └── Main Content Grid
│       ├── Left Column (lg:col-span-2)
│       │   ├── Portfolio
│       │   └── AIRecommendations
│       └── Right Column (lg:col-span-1)
│           └── Leaderboard (sticky)
```

---

## 🔀 User Flow & Logic

### **Entry Flow**
1. User clicks "View Trade Room" on GameCard in dashboard
2. `setSelectedTradeRoom(game)` updates state
3. App conditionally renders TradeRoomView
4. TopBar persists across views
5. Trade room data passed as prop

### **Navigation Logic**
```typescript
// In App.tsx
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
```

### **Back Navigation**
1. User clicks "Back to Dashboard" button
2. `onBack()` callback triggers
3. `setSelectedTradeRoom(null)` in parent
4. View returns to main dashboard

---

## 🎮 Interactive Features

### **1. Portfolio Management**
- **View Holdings**: Real-time asset list
- **Buy Assets**: Opens BuyAssetsModal
- **Sell Assets**: Opens sell confirmation (future)
- **Stock Info**: Educational modal per asset

### **2. AI Recommendations**
- **View Recommendations**: Buy/Sell/Hold suggestions
- **Execute Orders**: One-click trade execution
- **Market Insights**: Real-time sentiment display

### **3. Leaderboard Tracking**
- **View Rankings**: Top 6 players visible
- **Current User**: Highlighted in list
- **Star Rewards**: Display for top 3 positions
- **Full View**: Expand to see all players

### **4. Summary Stats**
- **Live Updates**: Real-time data refresh
- **Position Tracking**: Current rank display
- **Time Monitoring**: Countdown to room end
- **Performance**: Daily P&L calculation

---

## 📊 Data Calculations

### **Daily Change Calculation**
```typescript
// Calculated from current portfolio vs previous day
const dailyChange = currentPortfolio - previousDayPortfolio;
const dailyChangePercent = (dailyChange / previousDayPortfolio) * 100;
const displayValue = `${dailyChange >= 0 ? '+' : ''}$${Math.abs(dailyChange).toLocaleString()} (${dailyChangePercent.toFixed(1)}%)`;
```

### **Time Left Calculation**
```typescript
const calculateTimeLeft = (endDate: string) => {
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  
  if (diffMs < 0) return 'Ended';
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;
  
  if (diffDays > 0) return `${diffDays} days ${remainingHours}h`;
  return `${diffHours}h`;
};
```

### **Position Color Logic**
```typescript
const getPositionColor = (position: number) => {
  if (position === 1) return 'text-warning';      // Gold
  if (position <= 3) return 'text-brand-blue';    // Cyan
  if (position <= 10) return 'text-success';      // Green
  return 'text-muted-foreground';                 // Gray
};
```

---

## 🎨 Visual Hierarchy

### **Priority Levels**

#### **1. Critical Info (Always Visible)**
- Room name and type
- Current position and portfolio value
- Back navigation

#### **2. Primary Actions**
- Buy/Sell assets
- Execute AI recommendations
- View stock information

#### **3. Secondary Info**
- Daily change statistics
- Time remaining
- Player count
- Reward stars

#### **4. Supporting Data**
- Leaderboard rankings
- AI confidence scores
- Market insights

---

## ♿ Accessibility

- **Keyboard Navigation**: Full support for all interactive elements
- **Focus States**: Visible rings on all buttons/links
- **Color Contrast**: WCAG AA compliant
- **Semantic HTML**: Proper heading hierarchy (h1 → h2 → h3)
- **Screen Readers**: Descriptive labels for all icons
- **Touch Targets**: Minimum 44×44px on mobile
- **Back Navigation**: Clear exit path

---

## 🔧 Performance Considerations

### **Lazy Loading**
- Components load on-demand
- Images use lazy loading
- Modals render only when open

### **State Management**
- Single source of truth (App.tsx)
- Minimal prop drilling
- Efficient re-renders

### **Responsive Images**
- Avatar images optimized
- Unsplash CDN for fast delivery
- Proper sizing attributes

---

## 📝 Notes

- **Sticky Leaderboard**: Only on desktop (lg:+)
- **TopBar Persistence**: Shown in both dashboard and trade room views
- **Modal Overlays**: Z-index z-50 for modals
- **Gradient Consistency**: All cards use gradient-card background
- **Dark Mode Default**: Application defaults to dark theme
- **Real-time Updates**: Portfolio and stats update live
- **Educational Focus**: Stock info accessible throughout
- **Star System**: Integrated reward display
- **Responsive First**: Mobile experience prioritized
- **Component Reuse**: Same Portfolio/Leaderboard/AI components
- **Clean Exit**: Back button always visible and accessible

---

## 🚀 Future Enhancements

### **Planned Features**
- [ ] Real-time price updates via WebSocket
- [ ] Trade history timeline
- [ ] Portfolio performance charts
- [ ] Chat/messaging between players
- [ ] Achievement notifications
- [ ] Export portfolio report
- [ ] Advanced order types (stop-loss, trailing stop)
- [ ] Mobile app optimizations
- [ ] Dark/Light mode toggle
- [ ] Customizable dashboard layout

---

## 📋 Quick Reference

### **Component Import**
```typescript
import { TradeRoomView } from './components/TradeRoomView';
```

### **Usage Example**
```typescript
<TradeRoomView 
  tradeRoom={{
    id: 1,
    name: "Tech Giants Challenge",
    type: "Stock Trading",
    players: 45,
    maxPlayers: 50,
    position: 3,
    portfolio: 24780,
    rewardStars: 5000,
    endDate: "2025-12-08"
  }}
  onBack={() => navigate('/dashboard')}
/>
```

### **Common Classes**
```css
/* Page Container */
className="min-h-screen bg-background"

/* Content Wrapper */
className="max-w-7xl mx-auto px-4 py-8"

/* Back Button */
className="flex items-center gap-2 text-muted-foreground hover:text-brand-blue mb-6 transition-colors"

/* Summary Card */
className="gradient-card backdrop-blur-sm rounded-2xl p-6 mb-6 border border-border shadow-lg"

/* Main Grid */
className="grid grid-cols-1 lg:grid-cols-3 gap-6"
```

---

**Last Updated**: December 2025  
**Component Location**: `/components/TradeRoomView.tsx`  
**Related Components**: TradeRoomSummary, Portfolio, Leaderboard, AIRecommendations
