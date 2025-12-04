# Fantasy Trader - UI Flow Documentation

## Overview

Fantasy Trader (BullPen) is a competitive stock trading simulation platform where users can create and join trading tournaments, execute trades with virtual currency, and compete on leaderboards.

---

## Application Architecture

### Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Lovable Cloud (Supabase)
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM
- **UI Components**: Shadcn/ui components

---

## User Flow Diagram

```
Landing Page (/)
    ├─→ Auth Page (/auth) [Unauthenticated]
    │   ├─→ Sign Up
    │   └─→ Sign In
    │
    └─→ Dashboard (/dashboard) [Authenticated]
        ├─→ View Active BullPens
        ├─→ Create New BullPen
        └─→ Join Existing BullPen
            │
            └─→ BullPen Detail (/bullpen/:id) [Active Tournament]
                ├─→ Trading Panel
                │   ├─→ Stock Trading
                │   ├─→ Option Trading
                │   └─→ ETF Trading
                │
                ├─→ Portfolio View
                │   ├─→ Current Positions
                │   ├─→ P&L Tracking
                │   └─→ Performance Metrics
                │
                ├─→ Leaderboard
                │   ├─→ Ranking
                │   ├─→ Portfolio Values
                │   └─→ Returns Comparison
                │
                └─→ AI Recommendations
                    ├─→ Generate Recommendations
                    └─→ View Analysis
```

---

## Page Flows

### 1. Landing Page (`/`)

**Purpose**: First touchpoint for visitors, introduces the platform

**Components**:
- Hero section with value proposition
- Feature highlights
- Call-to-action buttons
- Navigation to Auth

**User Actions**:
- Click "Get Started" → Navigate to `/auth`
- Click "Sign In" → Navigate to `/auth`

**Authentication Check**:
- If authenticated → Redirect to `/dashboard`
- If not authenticated → Show landing content

---

### 2. Authentication Page (`/auth`)

**Purpose**: User registration and login

**Features**:
- Email/password authentication
- Auto-confirm email signups (no verification required)
- Profile creation on first sign-up

**Form Fields**:
- Email (required)
- Password (required)
- Full Name (sign-up only)

**User Actions**:
- Sign Up → Creates profile → Redirects to `/dashboard`
- Sign In → Authenticates → Redirects to `/dashboard`

**Validation**:
- Email format validation
- Password strength requirements
- Error handling for duplicate accounts

---

### 3. Dashboard Page (`/dashboard`)

**Purpose**: Central hub for viewing and managing BullPens

**Layout Sections**:

#### Header
- Welcome message with user's name
- Quick stats overview
- Navigation controls

#### BullPen List
- Active tournaments user is participating in
- BullPen cards showing:
  - Tournament name
  - Status (draft, scheduled, active, completed, archived)
  - Start time and duration
  - Participant count
  - Starting cash amount

#### Action Buttons
- **Create BullPen**: Opens creation dialog
- **Join BullPen**: Opens join dialog

**User Actions**:
1. **View BullPen Details**: Click on card → Navigate to `/bullpen/:id`
2. **Create New Tournament**: Click "Create" → Opens modal
3. **Join Existing Tournament**: Click "Join" → Opens modal with invite code input

---

### 4. Create BullPen Dialog

**Purpose**: Configure and launch a new trading tournament

**Form Fields**:
- **Name**: Tournament identifier (required)
- **Description**: Optional details
- **Start Time**: When tournament begins
- **Duration**: Length in seconds (default: 1 week)
- **Starting Cash**: Virtual money per participant (default: $100,000)
- **Max Players**: Participant limit (default: 50)
- **Allow Fractional Shares**: Boolean (default: true)
- **Approval Required**: Host must approve participants (default: false)

**Validation**:
- Start time must be in the future
- Duration must be positive
- Starting cash must be > 0

**User Actions**:
- Submit → Creates BullPen → Generates invite code → Redirects to BullPen page

---

### 5. Join BullPen Dialog

**Purpose**: Join existing tournament with invite code

**Form Fields**:
- **Invite Code**: 6-digit code (required)

**Process**:
1. User enters invite code
2. System validates code
3. Creates membership record
4. If approval required → Status: "pending"
5. If no approval required → Status: "active"

**User Actions**:
- Submit → Creates membership → Redirects to BullPen page (if approved)
- Cancel → Closes dialog

---

### 6. BullPen Detail Page (`/bullpen/:id`)

**Purpose**: Main trading interface and tournament dashboard

**Access Control**:
- User must be an active member
- Tournament must exist
- Redirects to dashboard if unauthorized

#### Layout Structure

```
┌─────────────────────────────────────────┐
│         Header (BullPenHeader)          │
│  - Tournament name                      │
│  - Time remaining / Status              │
│  - Invite code (host only)             │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Portfolio Summary               │
│  - Cash balance                         │
│  - Portfolio value                      │
│  - Total return                         │
│  - Rank                                 │
└─────────────────────────────────────────┘
┌──────────────┬──────────────────────────┐
│   Trading    │      Portfolio           │
│    Panel     │      Positions           │
│              │                          │
└──────────────┴──────────────────────────┘
┌─────────────────────────────────────────┐
│           Leaderboard                   │
└─────────────────────────────────────────┘
```

---

### 7. Trading Panel Component

**Purpose**: Execute buy/sell orders for stocks, options, and ETFs

#### Instrument Type Selection
- **Stock**: Direct equity trading
- **Option**: Call/put options trading
- **ETF**: Exchange-traded fund trading

#### Trading Form

**Common Fields**:
- Symbol (ticker)
- Quantity (supports fractional shares)
- Order Type (market/limit)
- Limit Price (if limit order)

**Option-Specific Fields**:
- Option Type (call/put)
- Strike Price
- Expiration Date (loaded from Finnhub option chain)

#### Price Display
- Real-time price from market data cache
- Price per share
- Estimated total cost
- Available cash indicator

#### Features
1. **Symbol Lookup**: 
   - Type symbol → Auto-fetch price from database
   - If option selected → Loads available expiration dates from Finnhub

2. **Option Chain Integration**:
   - Link to Yahoo Finance option chain
   - Auto-populated expiration dates from Finnhub API
   - Manual entry fallback if API unavailable

3. **Order Validation**:
   - Sufficient funds check (buy orders)
   - Quantity validation
   - Price availability check

4. **Order Execution Flow**:
   ```
   1. User clicks Buy/Sell
   2. Confirmation dialog appears
   3. User confirms
   4. Order inserted into database (status: "new")
   5. execute-order edge function called
   6. Price fetched from Finnhub
   7. Position updated/created
   8. Cash balance adjusted
   9. Order marked as "filled"
   10. Success toast displayed
   11. Form reset
   ```

**User Actions**:
- Enter trade details → Click Buy/Sell → Confirm → Order executed
- Click "Update Prices" → Refreshes market data for top stocks

---

### 8. Portfolio Component

**Purpose**: Display current positions and performance

#### Position Cards

Each position shows:
- Symbol and company name
- Quantity owned
- Average cost per share
- Current market price
- Unrealized P&L ($ and %)
- Position value
- For options: Type, strike, expiration

#### Calculations
- **Position Value**: `quantity × current_price`
- **Unrealized P&L**: `(current_price - avg_cost) × quantity`
- **P&L %**: `((current_price - avg_cost) / avg_cost) × 100`

#### Actions
- View all positions in grid layout
- Real-time price updates
- Color-coded P&L (green profit, red loss)

---

### 9. Leaderboard Component

**Purpose**: Display tournament rankings and competition status

#### Leaderboard Table Columns
- **Rank**: Current standing (1st, 2nd, 3rd, etc.)
- **Player**: User's full name
- **Portfolio Value**: Total account value (cash + positions)
- **Return**: P&L percentage
- **P&L**: Absolute dollar gain/loss
- **Last Trade**: Timestamp of most recent trade

#### Ranking Logic
- Sorted by portfolio value (descending)
- Automatically updated on each trade
- Current user highlighted
- Medal icons for top 3 positions

#### Real-time Updates
- Fetches from `leaderboard_snapshots` table
- Updates when any member places a trade
- Shows live competition status

---

### 10. AI Recommendations Dialog

**Purpose**: Generate AI-powered stock recommendations

#### Features
- Uses Lovable AI (Gemini Flash 2.5)
- Analyzes market data from database
- Provides buy/hold/watch recommendations

#### Recommendation Format

Each recommendation includes:
- **Symbol**: Stock ticker
- **Action**: buy, hold, watch
- **Target Price**: Suggested entry point
- **Quantity**: Recommended shares
- **Risk Level**: low, medium, high
- **Rationale**: Brief explanation
- **Detailed Rationale**: In-depth analysis
- **Potential Return**: Expected gain percentage

#### User Flow
1. Click "Get Recommendations" button
2. Loading indicator shown
3. AI analyzes top 10 stocks from market data
4. Results displayed in modal
5. User can review and decide on trades

---

## State Management

### Authentication State
- Managed via Supabase Auth
- Session persisted in browser
- Auto-refresh on token expiry

### BullPen State
- Fetched on page load
- Real-time updates via Supabase queries
- Cached with React Query

### Portfolio State
- Real-time position tracking
- Automatic recalculation on price updates
- Optimistic UI updates

### Market Data State
- Cached in `market_data` table
- Updated via `fetch-stock-prices` edge function
- Manual refresh available

---

## Edge Functions

### 1. `execute-order`
**Purpose**: Process buy/sell orders

**Flow**:
1. Validate order exists and belongs to user
2. Verify tournament is active
3. Fetch current price from Finnhub (uses previous close if market closed)
4. Check sufficient funds (buy) or position (sell)
5. Calculate execution price
6. Update/create position record
7. Adjust cash balance
8. Mark order as filled
9. Return execution details

### 2. `fetch-stock-prices`
**Purpose**: Update market data cache

**Process**:
1. Accepts array of stock symbols
2. Fetches quote data from Finnhub API
3. Uses previous close when markets closed
4. Fetches company profile for name
5. Upserts into `market_data` table
6. Rate-limited to 60 calls/minute

### 3. `fetch-option-chain`
**Purpose**: Get available option expiration dates

**Process**:
1. Accepts stock symbol
2. Calls Finnhub option chain API
3. Returns array of expiration timestamps
4. Frontend filters and validates dates

### 4. `get-stock-recommendations`
**Purpose**: Generate AI trading recommendations

**Process**:
1. Accepts market data array
2. Sends to Lovable AI (Gemini)
3. AI analyzes fundamentals, technicals, trends
4. Returns structured recommendations
5. Includes rationale and risk assessment

### 5. `fetch-historical-prices`
**Purpose**: Get historical OHLCV data for charting

**Process**:
1. Accepts symbol and date range
2. Fetches from Finnhub candle API
3. Returns time series data
4. Used for price charts and analysis

---

## Data Models

### BullPen
```typescript
{
  id: uuid
  name: string
  description?: string
  host_user_id: uuid
  start_time: timestamp
  duration_sec: number
  starting_cash: number
  state: 'draft' | 'scheduled' | 'active' | 'completed' | 'archived'
  max_players: number
  allow_fractional: boolean
  approval_required: boolean
  invite_code: string
}
```

### Position
```typescript
{
  id: uuid
  bull_pen_id: uuid
  user_id: uuid
  symbol: string
  qty: number
  avg_cost: number
  instrument_type: 'stock' | 'option' | 'etf'
  option_type?: 'call' | 'put'
  strike_price?: number
  expiration_date?: date
}
```

### Order
```typescript
{
  id: uuid
  bull_pen_id: uuid
  user_id: uuid
  symbol: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit'
  qty: number
  limit_price?: number
  status: 'new' | 'filled' | 'rejected' | 'cancelled'
  avg_fill_price?: number
  filled_qty: number
  instrument_type: 'stock' | 'option' | 'etf'
  option_type?: 'call' | 'put'
  strike_price?: number
  expiration_date?: date
}
```

---

## Error Handling

### Common Error Scenarios

1. **Authentication Errors**
   - Expired session → Redirect to auth
   - Invalid credentials → Show error toast

2. **Trading Errors**
   - Insufficient funds → Prevent order submission
   - Invalid symbol → Show price unavailable
   - Market closed → Use previous close price
   - API failure → Show error toast

3. **Network Errors**
   - Connection lost → Show retry option
   - Timeout → Display timeout message

4. **Validation Errors**
   - Invalid form data → Show field-level errors
   - Missing required fields → Highlight errors

---

## Performance Optimizations

### Caching Strategy
- Market data cached in database
- React Query caches API responses
- Minimize redundant API calls

### Lazy Loading
- Pages loaded on demand via React Router
- Components code-split automatically

### Optimistic Updates
- UI updates immediately on user actions
- Reverts on error
- Provides responsive feel

---

## Security Considerations

### Row Level Security (RLS)
- Users can only see their own memberships
- BullPen data restricted to members
- Orders validated against user permissions

### Authentication
- Supabase JWT tokens
- Auto-confirm email (development mode)
- Session management

### API Keys
- Finnhub API key stored as secret
- Never exposed to client
- Used only in edge functions

---

## Mobile Responsiveness

### Responsive Design
- Tailwind CSS breakpoints
- Mobile-first approach
- Touch-friendly controls

### Mobile Layout Adjustments
- Stacked layout on small screens
- Collapsible sections
- Bottom navigation
- Simplified charts

---

## Future Enhancements

### Planned Features
- [ ] Real-time price streaming
- [ ] Advanced charting with TradingView
- [ ] Social features (chat, comments)
- [ ] Portfolio analytics dashboard
- [ ] Options Greeks display
- [ ] Saved watchlists
- [ ] Trading strategy builder
- [ ] Push notifications
- [ ] Dark/light theme toggle
- [ ] Export trade history

---

## API Dependencies

### External APIs
1. **Finnhub API**
   - Stock quotes
   - Company profiles
   - Historical data
   - Option chains
   - Rate limit: 60 calls/minute (free tier)

2. **Lovable AI**
   - Stock recommendations
   - Market analysis
   - Natural language generation

---

## Troubleshooting

### Common Issues

1. **Price Not Loading**
   - Check market data cache
   - Click "Update Prices"
   - Verify symbol exists

2. **Order Failed**
   - Check available cash
   - Verify tournament is active
   - Check console for errors

3. **Leaderboard Not Updating**
   - Ensure trades are completing
   - Check leaderboard_snapshots table
   - Refresh page

4. **Option Chain Not Loading**
   - Verify symbol is valid
   - Check Finnhub API status
   - Use manual date entry fallback

---

## Development Guidelines

### Code Standards
- TypeScript for type safety
- Component-based architecture
- Consistent naming conventions
- Comprehensive error handling

### Best Practices
- Keep components small and focused
- Use custom hooks for reusable logic
- Implement proper loading states
- Provide user feedback for actions
- Test edge cases

---

## Glossary

**BullPen**: A trading tournament/competition instance

**Position**: An owned quantity of a security

**P&L**: Profit and Loss

**Market Order**: Order executed at current market price

**Limit Order**: Order executed only at specified price or better

**Instrument Type**: Category of tradeable asset (stock, option, ETF)

**Strike Price**: Price at which option can be exercised

**Option Chain**: List of available option contracts for a stock

**Fractional Shares**: Ability to trade partial shares

---

## Support Resources

- [Lovable Documentation](https://docs.lovable.dev/)
- [Finnhub API Docs](https://finnhub.io/docs/api)
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Docs](https://reactrouter.com/)

---

*Last Updated: 2025-11-24*
