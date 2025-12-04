# Trade Room Integration Guide

**Purpose**: How to integrate Trade Room with existing Portfolio Tracker infrastructure  
**Date**: December 2, 2025  
**Target**: React + Node.js + MySQL stack

---

## 🔗 INTEGRATION POINTS

### 1. Frontend Integration

#### Dashboard Integration
```typescript
// In DashboardNew.tsx, add Trade Room section
import { TradeRoomCard } from '@/components/trade-room/TradeRoomCard';

// Add to dashboard grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Existing components */}
  {/* Add Trade Room cards */}
  {tradeRooms.map(room => (
    <TradeRoomCard 
      key={room.id} 
      room={room}
      onViewRoom={() => navigate(`/trade-room/${room.id}`)}
    />
  ))}
</div>
```

#### Navigation Integration
```typescript
// In App.tsx Router, add Trade Room route
<Route path="/trade-room/:id" element={<TradeRoomView />} />
<Route path="/trade-rooms" element={<TradeRoomsList />} />
```

#### Theme Integration
```typescript
// Reuse existing gradient-card styling
<div className="gradient-card p-6 rounded-lg">
  {/* Trade Room content */}
</div>

// Use existing theme hook
const { theme } = useTheme();
```

#### Admin Integration
```typescript
// In Admin.tsx, add Trade Room management
<AdminSection title="Trade Rooms">
  <TradeRoomManagement />
</AdminSection>
```

---

### 2. Backend Integration

#### Database Schema
```sql
-- Add to existing schema.mysql.sql
CREATE TABLE bull_pens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  creator_id INT NOT NULL,
  state ENUM('active', 'completed', 'cancelled'),
  start_time TIMESTAMP,
  duration_seconds INT,
  starting_balance DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- Similar for other tables...
```

#### API Routes
```javascript
// In backend/src/routes/tradeRooms.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Reuse existing auth middleware
router.get('/trade-rooms', authenticateToken, async (req, res) => {
  // Implementation
});

router.post('/trade-rooms', authenticateToken, async (req, res) => {
  // Implementation
});

module.exports = router;
```

#### Middleware Reuse
```javascript
// Use existing patterns from backend
const { authenticateToken } = require('../middleware/auth');
const { handleError } = require('../utils/errorHandler');

// Apply to Trade Room routes
router.use(authenticateToken);
router.use(handleError);
```

---

### 3. Authentication Integration

#### Google OAuth
```typescript
// Already configured in Login.tsx
// Trade Room inherits authentication from existing system
// No changes needed - use existing JWT tokens
```

#### Admin Features
```typescript
// Reuse existing admin check
if (user.isAdmin) {
  // Show admin Trade Room management
}
```

---

### 4. Data Integration

#### User Profile
```typescript
// Reuse existing user context
const { user } = useAuth();

// Access user data in Trade Room
const userBalance = user.total_balance;
const userId = user.id;
```

#### Portfolio Data
```typescript
// Reuse existing portfolio hooks
const { holdings } = useUserProfile();

// Use in Trade Room calculations
const portfolioValue = holdings.reduce((sum, h) => sum + h.value, 0);
```

---

### 5. UI Component Reuse

#### Gradient Cards
```typescript
// Existing CSS class - reuse in Trade Room
<div className="gradient-card p-6 rounded-lg border border-border">
  {/* Content */}
</div>
```

#### Theme Toggle
```typescript
// Existing component - already in TopBar
// Trade Room view inherits theme automatically
```

#### Loading States
```typescript
// Reuse existing skeleton pattern
import { ProfileHeaderSkeleton } from '@/components/header/ProfileHeaderSkeleton';

// Use in Trade Room
{isLoading ? <ProfileHeaderSkeleton /> : <TradeRoomContent />}
```

#### Error Handling
```typescript
// Reuse existing error pattern
import { ProfileHeaderError } from '@/components/header/ProfileHeaderError';

// Use in Trade Room
{error ? (
  <ProfileHeaderError error={error} onRetry={refetch} />
) : (
  <TradeRoomContent />
)}
```

---

### 6. State Management

#### React Query Integration
```typescript
// Reuse existing React Query setup
import { useQuery } from '@tanstack/react-query';

const { data: tradeRooms, isLoading } = useQuery({
  queryKey: ['tradeRooms'],
  queryFn: fetchTradeRooms,
});
```

#### Context Integration
```typescript
// Create TradeRoomContext similar to existing patterns
export const TradeRoomContext = createContext();

export const useTradeRoom = () => {
  return useContext(TradeRoomContext);
};
```

---

### 7. API Service Layer

#### Reuse Existing Pattern
```typescript
// In frontend-react/src/services/api.ts
export const tradeRoomAPI = {
  getTradeRooms: () => api.get('/trade-rooms'),
  getTradeRoom: (id) => api.get(`/trade-rooms/${id}`),
  createTradeRoom: (data) => api.post('/trade-rooms', data),
  executeOrder: (roomId, order) => api.post(`/trade-rooms/${roomId}/orders`, order),
};
```

---

### 8. Build & Deployment

#### Frontend Build
```bash
# Existing build process - no changes needed
cd frontend-react
npm run build
# Output: ../react/ folder
```

#### Backend Deployment
```bash
# Existing deployment process
# Add Trade Room routes to backend
# Restart Node.js service
```

#### Database Migration
```bash
# Run migration script
mysql -u user -p database < backend/scripts/trade-room-schema.sql
```

---

## 📋 INTEGRATION CHECKLIST

### Frontend
- [ ] Add Trade Room route to App.tsx
- [ ] Create TradeRoomView component
- [ ] Add Trade Room button to Dashboard
- [ ] Add Trade Room to user menu
- [ ] Integrate with existing theme system
- [ ] Reuse gradient-card styling
- [ ] Use existing error handling patterns
- [ ] Use existing loading state patterns

### Backend
- [ ] Add database tables to schema
- [ ] Create Trade Room API routes
- [ ] Implement order execution endpoint
- [ ] Implement leaderboard calculation
- [ ] Add admin management endpoints
- [ ] Implement scheduled jobs (cron)
- [ ] Add error handling middleware
- [ ] Add authentication checks

### Database
- [ ] Create migration script
- [ ] Add foreign key constraints
- [ ] Create indexes for performance
- [ ] Add RLS policies (if applicable)
- [ ] Test schema with sample data

### Testing
- [ ] Unit tests for components
- [ ] Integration tests for API
- [ ] E2E tests for user flows
- [ ] Mobile responsiveness tests
- [ ] Admin feature tests

---

## 🎯 QUICK START

1. **Create database tables** - Run migration script
2. **Add API routes** - Create /api/trade-rooms/* endpoints
3. **Create React components** - Use existing patterns
4. **Connect to Dashboard** - Add Trade Room button
5. **Test integration** - Verify all connections work

---

## 📚 REFERENCE FILES

- Frontend: `frontend-react/src/`
- Backend: `backend/src/`
- Database: `schema.mysql.sql`
- Existing patterns: `PROJECT_HISTORY.md`


