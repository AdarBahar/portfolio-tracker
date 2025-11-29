import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader, ArrowLeft } from 'lucide-react';
import { useMyBullPens, useAllBullPens } from '@/hooks/useBullPens';
import BullPenCard from '@/components/tradeRoom/BullPenCard';
import CreateBullPenModal from '@/components/tradeRoom/CreateBullPenModal';
import JoinBullPenModal from '@/components/tradeRoom/JoinBullPenModal';
import ThemeToggle from '@/components/header/ThemeToggle';
import UserProfile from '@/components/header/UserProfile';

export default function TradeRoom() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [filterState, setFilterState] = useState<string>('all');

  const { data: myBullPens = [], isLoading: myLoading } = useMyBullPens();
  const { isLoading: allLoading } = useAllBullPens();

  const isLoading = myLoading || allLoading;

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
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-800/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">🎮 Trade Room</h1>
              <p className="text-muted-foreground text-sm">Join trading tournaments and compete with other traders</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Portfolio
              </button>
              <ThemeToggle />
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Trade Rooms</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn-secondary"
              >
                Join Room
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Room
              </button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Join trading tournaments and compete with other traders in real-time
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8">
          {['all', 'active', 'scheduled', 'completed', 'archived'].map((state) => (
            <button
              key={state}
              onClick={() => setFilterState(state)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterState === state
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-card/80'
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
          <div className="card-base p-12 text-center mb-12">
            <p className="text-muted-foreground mb-4">No trade rooms found</p>
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-primary"
            >
              Join a Room
            </button>
          </div>
        )}

        {/* Info Section */}
        <div className="card-base p-6">
          <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-primary font-semibold mb-2">1. Create or Join</p>
              <p className="text-muted-foreground">Create a new tournament or join an existing one with an invite code</p>
            </div>
            <div>
              <p className="text-primary font-semibold mb-2">2. Trade</p>
              <p className="text-muted-foreground">Execute trades with virtual currency and build your portfolio</p>
            </div>
            <div>
              <p className="text-primary font-semibold mb-2">3. Compete</p>
              <p className="text-muted-foreground">Climb the leaderboard and win prizes based on your performance</p>
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

