import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import { useBullPen } from '@/hooks/useBullPens';
import TradingPanel from '@/components/tradeRoom/TradingPanel';
import PortfolioView from '@/components/tradeRoom/PortfolioView';
import LeaderboardView from '@/components/tradeRoom/LeaderboardView';
import PositionTracker from '@/components/tradeRoom/PositionTracker';
import OrderHistory from '@/components/tradeRoom/OrderHistory';
import SnapshotHistory from '@/components/tradeRoom/SnapshotHistory';
import NotificationCenter from '@/components/tradeRoom/NotificationCenter';
import TopBar from '@/components/dashboard/TopBar';
import { hybridConnectionManager } from '@/services/hybridConnectionManager';
import { STORAGE_KEYS } from '@/lib/api';

type TabType = 'trading' | 'portfolio' | 'leaderboard' | 'positions' | 'orders' | 'history';

export default function BullPenDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('trading');
  const [notifications, setNotifications] = useState<any[]>([]);

  const bullPenId = id ? parseInt(id, 10) : undefined;
  const { data: bullPen, isLoading } = useBullPen(bullPenId);

  const handleMarkNotificationRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Connect to hybrid connection (WebSocket + polling fallback) on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && !hybridConnectionManager.isConnected()) {
      hybridConnectionManager.connect(token)
        .catch(err => console.error('Connection failed:', err));
    }

    // Subscribe to connection changes (for future use if needed)
    const unsubscribe = hybridConnectionManager.onConnectionChange(() => {
      // Connection status changed, but we don't need to show a message
      // since polling fallback is automatic
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Navigate to trade-room if bull pen not found (after loading completes)
  useEffect(() => {
    if (!isLoading && !bullPen) {
      // Use setTimeout to ensure navigation happens after render
      const timer = setTimeout(() => navigate('/trade-room'), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, bullPen, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading bull pen...</p>
        </div>
      </div>
    );
  }

  // Show placeholder while navigating away
  if (!bullPen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Bull pen not found</p>
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <TopBar
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearNotifications={handleClearNotifications}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button & Title */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/trade-room')}
            className="flex items-center gap-2 text-muted-foreground hover:text-[#0BA5EC] mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Trade Rooms</span>
          </button>
          <h1 className="text-foreground mb-2 text-2xl sm:text-3xl font-bold">{bullPen.name}</h1>
          {bullPen.description && (
            <p className="text-muted-foreground text-sm sm:text-base">{bullPen.description}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border overflow-x-auto pb-2">
          {(['trading', 'portfolio', 'positions', 'orders', 'leaderboard', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[#0BA5EC] text-[#0BA5EC]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'positions' ? 'Positions' : tab === 'orders' ? 'Orders' : tab === 'history' ? 'History' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'trading' && bullPenId && (
          <TradingPanel bullPenId={bullPenId} availableCash={bullPen?.startingCash || 0} />
        )}

        {activeTab === 'portfolio' && bullPenId && (
          <PortfolioView bullPenId={bullPenId} cash={bullPen?.startingCash || 0} />
        )}

        {activeTab === 'positions' && bullPenId && (
          <PositionTracker bullPenId={bullPenId} />
        )}

        {activeTab === 'orders' && bullPenId && (
          <OrderHistory bullPenId={bullPenId} limit={50} />
        )}

        {activeTab === 'leaderboard' && bullPenId && (
          <LeaderboardView bullPenId={bullPenId} isHost={bullPen?.hostUserId === parseInt(localStorage.getItem(STORAGE_KEYS.USER) || '0')} />
        )}

        {activeTab === 'history' && bullPenId && (
          <SnapshotHistory bullPenId={bullPenId} limit={20} />
        )}
      </main>

      {/* Notification Center */}
      {bullPenId && <NotificationCenter bullPenId={bullPenId} />}
    </div>
  );
}

