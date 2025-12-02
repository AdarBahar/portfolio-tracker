# New UI Migration: Best Practices & Code Examples

## 1. TypeScript Best Practices

### ❌ AVOID: Using `any` types
```typescript
// Bad - from new-UI/src/App.tsx
const [selectedTradeRoom, setSelectedTradeRoom] = useState<any>(null);
const [userCreatedRooms, setUserCreatedRooms] = useState<any[]>([]);
```

### ✅ DO: Use proper interfaces
```typescript
// Good - create types/index.ts
interface TradeRoom {
  id: number;
  name: string;
  type: 'Stock Trading' | 'Cryptocurrency' | 'Day Trading';
  status: 'active' | 'waiting' | 'ended';
  players: number;
  maxPlayers: number;
  rewardStars: number;
  portfolio: number;
  endDate: string;
}

const [selectedTradeRoom, setSelectedTradeRoom] = useState<TradeRoom | null>(null);
const [userCreatedRooms, setUserCreatedRooms] = useState<TradeRoom[]>([]);
```

---

## 2. Error Handling Best Practices

### ❌ AVOID: No error handling
```typescript
// Bad - from Portfolio.tsx
const holdings = [
  { symbol: 'AAPL', ... },
  // Hardcoded data, no error handling
];
```

### ✅ DO: Add error boundaries and fallbacks
```typescript
// Good - with error handling
import { usePortfolioData } from '@/hooks/usePortfolioData';

export function Portfolio() {
  const { holdings, isLoading, error } = usePortfolioData();

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
        <p className="text-destructive">Failed to load portfolio</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (isLoading) {
    return <PortfolioSkeleton />;
  }

  return <PortfolioContent holdings={holdings} />;
}
```

---

## 3. Form Validation Best Practices

### ❌ AVOID: No validation
```typescript
// Bad - from Login.tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  onLogin(); // No validation!
};
```

### ✅ DO: Add validation with react-hook-form
```typescript
// Good - with validation
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password too short'),
});

export function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

---

## 4. API Integration Best Practices

### ❌ AVOID: Hardcoded mock data
```typescript
// Bad - from CurrentGames.tsx
const currentGames = [
  { id: 1, name: 'Tech Stock Challenge', ... },
  { id: 2, name: 'Crypto Masters', ... },
];
```

### ✅ DO: Use React Query hooks
```typescript
// Good - with API integration
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export function CurrentGames() {
  const { data: games, isLoading, error } = useQuery({
    queryKey: ['bullpens', 'current'],
    queryFn: () => apiClient.get('/api/bullpens?status=active'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) return <GameCardSkeleton />;
  if (error) return <ErrorMessage />;

  return games.map(game => <GameCard key={game.id} game={game} />);
}
```

---

## 5. Component Composition Best Practices

### ❌ AVOID: Large monolithic components
```typescript
// Bad - 500+ lines in one component
export function TradeRoomView() {
  // Portfolio logic
  // Leaderboard logic
  // AI Recommendations logic
  // All mixed together
}
```

### ✅ DO: Break into smaller components
```typescript
// Good - separated concerns
export function TradeRoomView({ tradeRoom }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Portfolio tradeRoom={tradeRoom} />
        <AIRecommendations tradeRoom={tradeRoom} />
      </div>
      <div>
        <Leaderboard tradeRoom={tradeRoom} />
      </div>
    </div>
  );
}
```

---

## 6. Accessibility Best Practices

### ❌ AVOID: Missing ARIA labels
```typescript
// Bad - from TopBar.tsx
<button onClick={handleNotifications}>
  <Bell className="w-5 h-5" />
</button>
```

### ✅ DO: Add ARIA labels
```typescript
// Good - with accessibility
<button
  onClick={handleNotifications}
  aria-label="View notifications"
  aria-expanded={showNotifications}
  aria-haspopup="dialog"
>
  <Bell className="w-5 h-5" />
  {unreadCount > 0 && (
    <span aria-label={`${unreadCount} unread notifications`}>
      {unreadCount}
    </span>
  )}
</button>
```

---

## 7. Performance Best Practices

### ❌ AVOID: Re-rendering expensive components
```typescript
// Bad - GameCard re-renders on every parent render
export function CurrentGames({ games }) {
  return games.map(game => <GameCard game={game} />);
}
```

### ✅ DO: Memoize expensive components
```typescript
// Good - memoized component
const GameCard = React.memo(({ game, onSelect }: Props) => {
  return (
    <div onClick={() => onSelect(game)}>
      {/* Card content */}
    </div>
  );
});

export function CurrentGames({ games }) {
  return games.map(game => <GameCard key={game.id} game={game} />);
}
```

---

## 8. Security Best Practices

### ❌ AVOID: Storing sensitive data in state
```typescript
// Bad - storing token in state
const [token, setToken] = useState(localStorage.getItem('token'));
```

### ✅ DO: Use secure storage
```typescript
// Good - use httpOnly cookies or secure storage
// Store in httpOnly cookie (set by server)
// Access via AuthContext
const { token } = useAuth();
```

---

## 9. Testing Best Practices

### ❌ AVOID: No tests
```typescript
// Bad - no test coverage
export function Portfolio() {
  // No tests
}
```

### ✅ DO: Add unit tests
```typescript
// Good - with tests
import { render, screen } from '@testing-library/react';
import { Portfolio } from './Portfolio';

describe('Portfolio', () => {
  it('displays holdings', () => {
    render(<Portfolio tradeRoom={mockTradeRoom} />);
    expect(screen.getByText('Your Portfolio')).toBeInTheDocument();
  });

  it('shows error when data fails to load', () => {
    render(<Portfolio tradeRoom={null} />);
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });
});
```

---

## 10. Documentation Best Practices

### ❌ AVOID: No documentation
```typescript
// Bad - no comments or docs
export function calculatePortfolioValue(holdings) {
  return holdings.reduce((sum, h) => sum + h.value, 0);
}
```

### ✅ DO: Add clear documentation
```typescript
/**
 * Calculates total portfolio value from holdings
 * @param holdings - Array of holding objects with value property
 * @returns Total portfolio value in USD
 * @example
 * const value = calculatePortfolioValue([
 *   { symbol: 'AAPL', value: 1000 },
 *   { symbol: 'GOOGL', value: 2000 }
 * ]); // Returns 3000
 */
export function calculatePortfolioValue(holdings: Holding[]): number {
  return holdings.reduce((sum, h) => sum + h.value, 0);
}
```

---

## Summary Checklist

When migrating each component:
- [ ] Replace `any` types with proper interfaces
- [ ] Add error handling and error boundaries
- [ ] Add loading states and skeletons
- [ ] Integrate with API endpoints
- [ ] Add form validation
- [ ] Add ARIA labels and accessibility
- [ ] Memoize expensive components
- [ ] Add unit tests
- [ ] Add JSDoc comments
- [ ] Test on mobile devices


