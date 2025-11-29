import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import { useBullPen } from '@/hooks/useBullPens';
import TradingPanel from '@/components/tradeRoom/TradingPanel';
import PortfolioView from '@/components/tradeRoom/PortfolioView';
import LeaderboardView from '@/components/tradeRoom/LeaderboardView';
import ThemeToggle from '@/components/header/ThemeToggle';
import UserProfile from '@/components/header/UserProfile';

type TabType = 'trading' | 'portfolio' | 'leaderboard';

export default function BullPenDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('trading');

  const bullPenId = id ? parseInt(id, 10) : undefined;
  const { data: bullPen, isLoading } = useBullPen(bullPenId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!bullPen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Bull pen not found</p>
          <button
            onClick={() => navigate('/trade-room')}
            className="btn-primary"
          >
            Back to Trade Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-800/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/trade-room')}
              className="flex items-center gap-2 text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Trade Rooms
            </button>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserProfile />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">{bullPen.name}</h1>
          {bullPen.description && (
            <p className="text-muted-foreground mt-2">{bullPen.description}</p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          {(['trading', 'portfolio', 'leaderboard'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'trading' && bullPenId && (
          <TradingPanel bullPenId={bullPenId} />
        )}

        {activeTab === 'portfolio' && bullPenId && (
          <PortfolioView bullPenId={bullPenId} />
        )}

        {activeTab === 'leaderboard' && bullPenId && (
          <LeaderboardView bullPenId={bullPenId} />
        )}
      </main>
    </div>
  );
}

