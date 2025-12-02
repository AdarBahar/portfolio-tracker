import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LeaderboardView from '../LeaderboardView';
import PortfolioView from '../PortfolioView';
import PositionTracker from '../PositionTracker';
import OrderHistory from '../OrderHistory';
import TradingPanel from '../TradingPanel';

// Mock hooks
vi.mock('@/hooks/useLeaderboard', () => ({
  useLeaderboard: () => ({
    data: {
      leaderboard: [
        { userId: 1, rank: 1, portfolioValue: 11000, cash: 1000, pnlAbs: 1000, pnlPct: 10, userName: 'User1', userEmail: 'user1@test.com', stars: 5 },
        { userId: 2, rank: 2, portfolioValue: 10500, cash: 500, pnlAbs: 500, pnlPct: 5, userName: 'User2', userEmail: 'user2@test.com', stars: 3 },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useLeaderboardSnapshot', () => ({
  useLeaderboardSnapshot: () => ({
    data: {
      entries: [
        { userId: 1, rank: 1, portfolioValue: 11000, cash: 1000, pnlAbs: 1000, pnlPct: 10, snapshotAt: new Date().toISOString() },
      ],
    },
    isLoading: false,
  }),
  useLeaderboardSnapshotHistory: () => ({
    data: [],
    isLoading: false,
  }),
  useCreateLeaderboardSnapshot: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useBullPenOrders', () => ({
  usePositions: () => ({
    data: [
      { id: 1, symbol: 'AAPL', qty: 10, avgCost: 150, currentPrice: 155 },
      { id: 2, symbol: 'GOOGL', qty: 5, avgCost: 2800, currentPrice: 2850 },
    ],
    isLoading: false,
    refetch: vi.fn(),
  }),
  useBullPenOrders: () => ({
    data: [
      { id: 1, symbol: 'AAPL', side: 'buy', type: 'market', qty: 10, price: 150, status: 'executed', placedAt: new Date().toISOString() },
    ],
    isLoading: false,
  }),
  usePlaceOrder: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useMarketData', () => ({
  useMarketData: () => ({
    data: { price: 155 },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/usePositionTracking', () => ({
  useUserPositions: () => ({
    data: [
      { id: 1, symbol: 'AAPL', qty: 10, avgCost: 150, currentPrice: 155, marketValue: 1550, unrealizedPnl: 50, unrealizedPnlPct: 3.33 },
    ],
    isLoading: false,
  }),
  usePositionStats: () => ({
    totalPositions: 1,
    winners: 1,
    losers: 0,
    breakeven: 0,
    totalMarketValue: 1550,
    totalCost: 1500,
    largestWinner: 50,
    largestLoser: 0,
  }),
  formatPosition: (pos: any) => ({
    symbol: pos.symbol,
    qty: pos.qty.toFixed(2),
    avgCost: `$${pos.avgCost.toFixed(2)}`,
    currentPrice: `$${pos.currentPrice.toFixed(2)}`,
    marketValue: `$${pos.marketValue.toFixed(2)}`,
    pnl: `$${pos.unrealizedPnl.toFixed(2)}`,
    pnlPct: `${pos.unrealizedPnlPct.toFixed(2)}%`,
    pnlColor: 'text-success',
  }),
}));

vi.mock('@/services/websocketService', () => ({
  websocketService: {
    isConnected: () => true,
    on: () => () => {},
    onConnectionChange: () => () => {},
  },
}));

const queryClient = new QueryClient();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('Trade Room Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders LeaderboardView with entries', () => {
    renderWithProviders(<LeaderboardView bullPenId={1} />);
    expect(screen.getByText('User1')).toBeInTheDocument();
    expect(screen.getByText('User2')).toBeInTheDocument();
  });

  it('renders PortfolioView with positions', () => {
    renderWithProviders(<PortfolioView bullPenId={1} cash={1000} />);
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('GOOGL')).toBeInTheDocument();
  });

  it('renders PositionTracker with stats', () => {
    renderWithProviders(<PositionTracker bullPenId={1} />);
    expect(screen.getByText('Total Positions')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders OrderHistory with orders', () => {
    renderWithProviders(<OrderHistory bullPenId={1} />);
    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });

  it('renders TradingPanel with form', () => {
    renderWithProviders(<TradingPanel bullPenId={1} availableCash={10000} />);
    expect(screen.getByText('Place Order')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., AAPL')).toBeInTheDocument();
  });
});

