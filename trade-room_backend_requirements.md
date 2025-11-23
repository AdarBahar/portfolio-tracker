# Trade Room Backend Requirements

## Overview
This document outlines the complete data model, business logic, and API requirements for the Trade Room (Bull Pen) system - a competitive stock trading game where players compete in timed rooms with virtual cash.

## Core Entities & Tables

### 1. Trade Rooms (bull_pens)
A Trade Room is a competitive trading session where players trade stocks with virtual cash.

**Fields:**
- `id` (UUID, PK)
- `name` (TEXT) - Display name of the room
- `description` (TEXT, nullable) - Optional description
- `host_user_id` (UUID, FK → profiles.id) - Creator of the room
- `state` (ENUM: draft, scheduled, active, completed, archived)
- `start_time` (TIMESTAMP) - When trading begins
- `duration_sec` (INTEGER) - Trading period duration in seconds
- `max_players` (INTEGER, default: 10) - Maximum participants
- `starting_cash` (DECIMAL) - Initial cash for each player
- `allow_fractional` (BOOLEAN, default: false) - Allow fractional shares
- `approval_required` (BOOLEAN, default: false) - Host must approve joins
- `invite_code` (TEXT, unique, nullable) - Optional code for joining
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Business Rules:**
- Only the host can modify room settings before it becomes active
- Once active, settings are locked
- Rooms automatically transition from scheduled → active at start_time
- Rooms automatically transition from active → completed after duration_sec
- Invite codes are auto-generated if approval_required is true

### 2. Memberships (bull_pen_memberships)
Tracks player participation in Trade Rooms.

**Fields:**
- `id` (UUID, PK)
- `bull_pen_id` (UUID, FK → bull_pens.id)
- `user_id` (UUID, FK → profiles.id)
- `role` (ENUM: host, player)
- `status` (ENUM: pending, active, kicked, left)
- `cash` (DECIMAL) - Current available cash balance
- `joined_at` (TIMESTAMP)

**Business Rules:**
- Host is automatically created as active member when room is created
- Players start with cash = bull_pens.starting_cash
- Only one membership per user per room
- Status transitions: pending → active (on approval) or pending → kicked (if rejected)
- Players can only trade when status = active and room state = active

### 3. Positions (positions)
Tracks stock holdings for each player in a room.

**Fields:**
- `id` (UUID, PK)
- `bull_pen_id` (UUID, FK → bull_pens.id)
- `user_id` (UUID, FK → profiles.id)
- `symbol` (TEXT) - Stock ticker symbol
- `qty` (DECIMAL) - Number of shares held
- `avg_cost` (DECIMAL) - Average purchase price per share
- `created_at` (TIMESTAMP) - When position was first opened
- `updated_at` (TIMESTAMP)

**Business Rules:**
- Positions are created when a buy order is filled
- avg_cost is calculated as weighted average across all buy orders
- When qty reaches 0 after sells, the position can be deleted or marked inactive
- Portfolio value = SUM(qty × current_price) for all positions + cash

### 4. Orders (orders)
Records all trading activity in a room.

**Fields:**
- `id` (UUID, PK)
- `bull_pen_id` (UUID, FK → bull_pens.id)
- `user_id` (UUID, FK → profiles.id)
- `symbol` (TEXT) - Stock ticker
- `side` (ENUM: buy, sell)
- `type` (ENUM: market, limit)
- `qty` (DECIMAL) - Requested quantity
- `filled_qty` (DECIMAL) - Actually filled quantity
- `limit_price` (DECIMAL, nullable) - For limit orders
- `avg_fill_price` (DECIMAL, nullable) - Actual execution price
- `status` (ENUM: new, partially_filled, filled, cancelled, rejected)
- `rejection_reason` (TEXT, nullable)
- `placed_at` (TIMESTAMP) - When order was submitted
- `filled_at` (TIMESTAMP, nullable) - When fully filled
- `server_ts` (TIMESTAMP) - Server processing time
- `feed_ts` (TIMESTAMP, nullable) - Market data timestamp

**Business Rules:**
- Market orders execute immediately at current market price
- Buy orders require sufficient cash: qty × price ≤ available cash
- Sell orders require sufficient shares: qty ≤ position.qty
- Filled orders update positions and cash atomically
- Orders can only be placed when room state = active

### 5. Leaderboard Snapshots (leaderboard_snapshots)
Periodic rankings of player performance in a room.

**Fields:**
- `id` (UUID, PK)
- `bull_pen_id` (UUID, FK → bull_pens.id)
- `user_id` (UUID, FK → profiles.id)
- `snapshot_at` (TIMESTAMP)
- `rank` (INTEGER, nullable) - Position in leaderboard
- `portfolio_value` (DECIMAL) - Total value (cash + positions)
- `pnl_abs` (DECIMAL) - Profit/Loss in dollars
- `pnl_pct` (DECIMAL) - Profit/Loss percentage
- `last_trade_at` (TIMESTAMP, nullable) - Most recent order timestamp

**Business Rules:**
- Snapshots are generated periodically (e.g., every 5 minutes) while room is active
- Rankings are based on portfolio_value descending
- pnl_abs = portfolio_value - starting_cash
- pnl_pct = (portfolio_value - starting_cash) / starting_cash × 100
- Final snapshot is captured when room transitions to completed

### 6. Market Data (market_data)
Cached stock price information.

**Fields:**
- `symbol` (TEXT, PK) - Stock ticker
- `current_price` (DECIMAL)
- `company_name` (TEXT, nullable)
- `change_percent` (DECIMAL, nullable) - Daily change percentage
- `last_updated` (TIMESTAMP)

**Business Rules:**
- Updated by edge function on-demand or via scheduled job
- Stale data (>15 minutes old) triggers refresh
- Used as price source for order execution and portfolio valuation

## Key Workflows

### Creating a Room
1. User creates room with settings (name, start_time, duration, cash, etc.)
2. Room created in 'draft' state
3. Host membership auto-created with role='host', status='active'
4. If approval_required=true, generate unique invite_code
5. Room can be edited by host while in draft state
6. Host transitions room to 'scheduled' when ready

### Joining a Room
1. User finds room by browse/search or enters invite_code
2. If approval_required=false: membership created with status='active'
3. If approval_required=true: membership created with status='pending'
4. Host can approve/reject pending memberships
5. On approval: status → 'active', cash set to starting_cash

### Placing an Order
1. Verify room state='active' and membership status='active'
2. Fetch current market price for symbol
3. For buy orders: check cash ≥ qty × price
4. For sell orders: check position exists and qty ≤ position.qty
5. Create order record with status='new'
6. Execute order:
   - For market buy: deduct cash, create/update position
   - For market sell: add cash, update/delete position
7. Update order status to 'filled', set avg_fill_price and filled_at
8. Return confirmation with new cash balance and position

### Leaderboard Updates
1. Scheduled job runs every 5 minutes during active rooms
2. For each active room:
   - Calculate each player's portfolio value (cash + position values)
   - Calculate P&L metrics
   - Rank players by portfolio_value descending
   - Insert snapshot records with current timestamp

### Room State Transitions
- `draft → scheduled`: Manual by host when settings finalized
- `scheduled → active`: Automatic at start_time (background job)
- `active → completed`: Automatic at start_time + duration_sec
- `completed → archived`: Manual by host (cleanup old rooms)

## Security & Access Control (RLS Policies)

### bull_pens
- SELECT: Anyone can view non-draft rooms
- INSERT: Authenticated users can create
- UPDATE: Only host can update their own rooms in draft/scheduled state
- DELETE: Only host can delete their own draft rooms

### bull_pen_memberships
- SELECT: Members of a room can view all memberships for that room
- INSERT: Authenticated users can join (creates pending/active based on approval_required)
- UPDATE: Host can update status (approve/kick); players can update own status to 'left'
- DELETE: No direct deletes (use status changes)

### positions
- SELECT: Users can view their own positions; room members can view all positions in their room
- INSERT/UPDATE/DELETE: Only via execute-order edge function (not direct)

### orders
- SELECT: Users can view their own orders; room members can view all orders in their room
- INSERT: Users can create orders for rooms they're active in
- UPDATE: Only via execute-order edge function for status changes
- DELETE: Not allowed (orders are immutable records)

### leaderboard_snapshots
- SELECT: Room members can view snapshots for their room
- INSERT/UPDATE/DELETE: Only via backend jobs/functions

### market_data
- SELECT: Anyone (public price data)
- INSERT/UPDATE: Only via edge functions
- DELETE: Only via cleanup jobs

## Required Edge Functions

### 1. execute-order
**Input:** 
```typescript
{
  bull_pen_id: string,
  symbol: string,
  side: 'buy' | 'sell',
  type: 'market' | 'limit',
  qty: number,
  limit_price?: number
}
```

**Process:**
1. Verify user is active member of room
2. Verify room is in active state
3. Fetch current market price (from market_data or external API)
4. Validate order constraints (cash for buys, shares for sells)
5. Create order record
6. Execute atomic transaction:
   - Update membership.cash
   - Create/update/delete position
   - Update order status to filled
7. Return success with new balances

**Output:**
```typescript
{
  order_id: string,
  status: 'filled' | 'rejected',
  fill_price: number,
  new_cash: number,
  new_position?: { qty: number, avg_cost: number },
  rejection_reason?: string
}
```

### 2. get-stock-recommendations
**Input:**
```typescript
{
  bull_pen_id?: string,
  count?: number
}
```

**Process:**
1. Fetch current market data for popular symbols
2. Use AI (Lovable AI with gemini-2.5-flash) to analyze trends and generate recommendations
3. Return ranked list with buy/sell/hold signals and reasoning

**Output:**
```typescript
{
  recommendations: [{
    symbol: string,
    company_name: string,
    action: 'buy' | 'sell' | 'hold',
    confidence: number,
    reasoning: string,
    current_price: number,
    target_price?: number
  }]
}
```

### 3. fetch-stock-prices
**Input:**
```typescript
{
  symbols: string[]
}
```

**Process:**
1. Call Finnhub API for each symbol
2. Update market_data table with current prices
3. Return price data

**Output:**
```typescript
{
  [symbol: string]: {
    current_price: number,
    change_percent: number,
    last_updated: timestamp
  }
}
```

### 4. fetch-historical-prices
**Input:**
```typescript
{
  symbol: string,
  days?: number
}
```

**Process:**
1. Fetch historical daily prices from Finnhub
2. Return time series data for charting

**Output:**
```typescript
{
  symbol: string,
  prices: [{
    date: string,
    close: number
  }]
}
```

## Database Functions

### generate_invite_code()
- Returns: Random 6-character alphanumeric code
- Used when creating rooms with approval_required=true
- Must be unique across active rooms

### user_is_bullpen_member(bullpen_id, user_id)
- Returns: Boolean
- Checks if user has an active membership in the specified room
- Used in RLS policies

## Indexes for Performance
- bull_pens: (state, start_time)
- bull_pen_memberships: (bull_pen_id, user_id, status)
- positions: (bull_pen_id, user_id, symbol)
- orders: (bull_pen_id, user_id, placed_at DESC)
- leaderboard_snapshots: (bull_pen_id, snapshot_at DESC)

## Scheduled Jobs

### Room State Manager (runs every minute)
- Find rooms where state='scheduled' AND start_time ≤ now()
- Transition to state='active'
- Find rooms where state='active' AND start_time + duration_sec ≤ now()
- Transition to state='completed'

### Leaderboard Updater (runs every 5 minutes)
- Find all rooms where state='active'
- For each room, calculate and insert leaderboard_snapshots

### Market Data Refresher (runs every 15 minutes during market hours)
- Fetch and update prices for all symbols currently held in active positions
- Update symbols tracked in active rooms

## API Error Codes
- 400: Invalid request (bad parameters)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (authenticated but not authorized)
- 404: Resource not found
- 409: Conflict (e.g., insufficient funds, insufficient shares)
- 500: Internal server error

## Notes
- All monetary values use DECIMAL type for precision
- All timestamps use TIMESTAMP WITH TIME ZONE
- Currency precision: 2 decimal places for USD, 4 for share prices
- Stock symbols are uppercase, validated against external API
- WebSocket subscriptions enable real-time updates for positions and leaderboard
