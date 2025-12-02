# Codebase Patterns Guide - Trade Room Implementation

**Purpose**: Document existing patterns to reuse in Trade Room feature  
**Date**: December 2, 2025  
**Stack**: React + Node.js + MySQL

---

## 🏗️ BACKEND PATTERNS

### 1. Controller Pattern
**Location**: `backend/src/controllers/`

```javascript
// Example: bullPensController.js
const db = require('../db');
const { ApiError } = require('../utils/apiError');

exports.getBullPens = async (req, res, next) => {
  try {
    const query = 'SELECT * FROM bull_pens WHERE host_user_id = ?';
    const [rooms] = await db.query(query, [req.user.id]);
    res.json(rooms);
  } catch (error) {
    next(new ApiError(500, 'Failed to fetch bull pens', error));
  }
};
```

**Pattern**: Try-catch with ApiError, database queries, response handling

### 2. Routes Pattern
**Location**: `backend/src/routes/`

```javascript
// Example: bullPensRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../utils/authMiddleware');
const controller = require('../controllers/bullPensController');

router.get('/', authenticateToken, controller.getBullPens);
router.post('/', authenticateToken, controller.createBullPen);
router.get('/:id', authenticateToken, controller.getBullPenById);

module.exports = router;
```

**Pattern**: Express router with middleware, controller methods

### 3. Middleware Pattern
**Location**: `backend/src/utils/`

```javascript
// Example: authMiddleware.js
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

**Pattern**: Middleware for authentication, authorization, validation

### 4. Service Pattern
**Location**: `backend/src/services/`

```javascript
// Example: budgetService.js
exports.addBudget = async (userId, amount, reason) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // Complex business logic
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  }
};
```

**Pattern**: Business logic, transactions, error handling

### 5. Database Pattern
**Location**: `backend/src/db.js`

```javascript
// Connection pool pattern
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const query = util.promisify(pool.query).bind(pool);
```

**Pattern**: Connection pooling, promisified queries

### 6. Error Handling Pattern
**Location**: `backend/src/utils/apiError.js`

```javascript
class ApiError extends Error {
  constructor(statusCode, message, originalError) {
    super(message);
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

// Usage in routes
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message });
});
```

**Pattern**: Custom error class, centralized error handling

### 7. Audit Logging Pattern
**Location**: `backend/src/utils/auditLog.js`

```javascript
exports.logEvent = async (userId, eventType, description, metadata) => {
  const query = `
    INSERT INTO user_audit_log 
    (user_id, event_type, event_category, description, meta, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;
  await db.query(query, [userId, eventType, category, description, JSON.stringify(metadata)]);
};
```

**Pattern**: Immutable audit trail, JSON metadata

---

## 🎨 FRONTEND PATTERNS

### 1. Component Pattern
**Location**: `frontend-react/src/components/`

```typescript
// Example: TradeRoomCard.tsx
interface TradeRoomCardProps {
  room: TradeRoom;
  onViewRoom: () => void;
}

export const TradeRoomCard: React.FC<TradeRoomCardProps> = ({ room, onViewRoom }) => {
  return (
    <div className="gradient-card p-6 rounded-lg">
      {/* Component content */}
    </div>
  );
};
```

**Pattern**: TypeScript interfaces, functional components, props

### 2. Custom Hooks Pattern
**Location**: `frontend-react/src/hooks/`

```typescript
// Example: useUserProfile.ts
export const useUserProfile = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await fetch('/api/users/profile');
      return response.json();
    }
  });
  
  return { data, isLoading, error };
};
```

**Pattern**: React Query, custom hooks, data fetching

### 3. Context Pattern
**Location**: `frontend-react/src/contexts/`

```typescript
// Example: ThemeContext.tsx
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

**Pattern**: Context API, custom hooks, provider pattern

### 4. API Service Pattern
**Location**: `frontend-react/src/services/`

```typescript
// Example: api.ts
const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const tradeRoomAPI = {
  getTradeRooms: () => api.get('/trade-rooms'),
  createTradeRoom: (data) => api.post('/trade-rooms', data),
};
```

**Pattern**: Axios instance, interceptors, API methods

### 5. State Management Pattern
**Location**: `frontend-react/src/`

```typescript
// Example: App.tsx
const [selectedTradeRoom, setSelectedTradeRoom] = useState<TradeRoom | null>(null);
const [isLoading, setIsLoading] = useState(false);

// Conditional rendering
if (!isLoggedIn) return <Login />;
if (selectedTradeRoom) return <TradeRoomView room={selectedTradeRoom} />;
return <Dashboard />;
```

**Pattern**: useState, conditional rendering, prop drilling

### 6. Error Handling Pattern
**Location**: `frontend-react/src/components/`

```typescript
// Example: ProfileHeaderError.tsx
interface ErrorProps {
  error: Error;
  onRetry: () => void;
}

export const ProfileHeaderError: React.FC<ErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="error-container">
      <p>{error.message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  );
};
```

**Pattern**: Error boundaries, retry logic, user feedback

### 7. Loading State Pattern
**Location**: `frontend-react/src/components/`

```typescript
// Example: ProfileHeaderSkeleton.tsx
export const ProfileHeaderSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-300 rounded"></div>
    </div>
  );
};
```

**Pattern**: Skeleton screens, loading indicators, animations

---

## 🗄️ DATABASE PATTERNS

### 1. Table Structure Pattern
```sql
CREATE TABLE example_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  
  CONSTRAINT fk_example_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT chk_example_status CHECK (status IN ('active', 'inactive')),
  INDEX idx_example_user_id (user_id),
  INDEX idx_example_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Pattern**: Auto-increment, timestamps, soft deletes, constraints, indexes

### 2. Foreign Key Pattern
```sql
CONSTRAINT fk_table_name_column
  FOREIGN KEY (column_id)
  REFERENCES referenced_table(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE
```

**Pattern**: Referential integrity, cascade operations

### 3. Audit Trail Pattern
```sql
CREATE TABLE audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_type VARCHAR(100),
  previous_values JSON,
  new_values JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Pattern**: Immutable logs, JSON metadata, timestamps

---

## 🔄 INTEGRATION PATTERNS

### 1. API Integration
- Use existing `api.ts` service layer
- Add new endpoints to `tradeRoomAPI` object
- Reuse authentication middleware
- Follow existing error handling

### 2. State Integration
- Use React Context for global state
- Use React Query for server state
- Use useState for local component state
- Avoid prop drilling with context

### 3. Styling Integration
- Use existing `.gradient-card` CSS class
- Use Tailwind CSS utilities
- Use CSS variables for theme colors
- Follow existing responsive breakpoints

### 4. Authentication Integration
- Use existing JWT token system
- Use `authenticateToken` middleware
- Store token in localStorage
- Refresh token on expiry

---

## ✅ CHECKLIST FOR TRADE ROOM

- [ ] Follow controller/routes/service pattern
- [ ] Use existing error handling (ApiError)
- [ ] Use existing audit logging
- [ ] Use React Query for data fetching
- [ ] Use TypeScript interfaces
- [ ] Use existing theme system
- [ ] Use existing gradient-card styling
- [ ] Use existing authentication middleware
- [ ] Follow existing naming conventions
- [ ] Add proper indexes to database tables


