import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader } from 'lucide-react';
import { useMyBullPens, useAllBullPens } from '@/hooks/useBullPens';
import BullPenCard from '@/components/tradeRoom/BullPenCard';
import CreateBullPenModal from '@/components/tradeRoom/CreateBullPenModal';
import JoinBullPenModal from '@/components/tradeRoom/JoinBullPenModal';
import TopBar from '@/components/dashboard/TopBar';

export default function TradeRoom() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [filterState, setFilterState] = useState<string>('all');
  const [notifications, setNotifications] = useState<any[]>([]);

  const { data: myBullPens = [], isLoading: myLoading } = useMyBullPens();
  const { isLoading: allLoading } = useAllBullPens();

  const isLoading = myLoading || allLoading;

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Filter bull pens based on state
  const filteredBullPens = myBullPens.filter((bp: any) => {
    if (filterState === 'all') return true;
    return bp.state === filterState;
  });

  const handleBullPenClick = (bullPenId: number) => {
    navigate(`/trade-room/${bullPenId}`);
  };

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
        {/* Header Section */}
        <div className="gradient-card backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-8 border border-border shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-foreground mb-2 text-2xl sm:text-3xl font-bold">Trade Rooms</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Join trading tournaments and compete with other traders in real-time
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2 bg-[#0BA5EC] hover:bg-[#0BA5EC]/90 text-white rounded-lg transition-all font-medium text-sm hover:shadow-lg"
              >
                Join Room
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#0BA5EC] to-[#7C3AED] hover:shadow-lg text-white rounded-lg transition-all font-medium text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Room
              </button>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'active', 'scheduled', 'completed', 'archived'].map((state) => (
            <button
              key={state}
              onClick={() => setFilterState(state)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filterState === state
                  ? 'bg-gradient-to-r from-[#0BA5EC] to-[#7C3AED] text-white shadow-lg'
                  : 'bg-muted/30 text-foreground hover:bg-muted/50 border border-border/30'
              }`}
            >
              {state.charAt(0).toUpperCase() + state.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {/* Bull Pens Grid */}
        {!isLoading && filteredBullPens.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredBullPens.map((bullPen: any) => (
              <BullPenCard
                key={bullPen.id}
                bullPen={bullPen}
                onClick={() => handleBullPenClick(bullPen.id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredBullPens.length === 0 && (
          <div className="gradient-card backdrop-blur-sm rounded-2xl p-12 text-center mb-12 border border-border shadow-lg">
            <p className="text-muted-foreground mb-4">No trade rooms found</p>
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-[#0BA5EC] to-[#7C3AED] hover:shadow-lg text-white rounded-lg transition-all font-medium"
            >
              Join a Room
            </button>
          </div>
        )}

        {/* Info Section */}
        <div className="gradient-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-lg">
          <h3 className="text-foreground text-xl font-semibold mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
              <p className="text-[#0BA5EC] font-semibold mb-2">1. Create or Join</p>
              <p className="text-muted-foreground text-sm">Create a new tournament or join an existing one with an invite code</p>
            </div>
            <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
              <p className="text-[#7C3AED] font-semibold mb-2">2. Trade</p>
              <p className="text-muted-foreground text-sm">Execute trades with virtual currency and build your portfolio</p>
            </div>
            <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
              <p className="text-[#16A34A] font-semibold mb-2">3. Compete</p>
              <p className="text-muted-foreground text-sm">Climb the leaderboard and win prizes based on your performance</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateBullPenModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            setFilterState('all');
          }}
        />
      )}

      {showJoinModal && (
        <JoinBullPenModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            setShowJoinModal(false);
            setFilterState('all');
          }}
        />
      )}
    </div>
  );
}

