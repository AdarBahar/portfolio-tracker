import { ArrowLeft } from 'lucide-react';
import { TradeRoomSummary } from './TradeRoomSummary';
import { Portfolio } from './Portfolio';
import { Leaderboard } from './Leaderboard';
import { AIRecommendations } from './AIRecommendations';

interface TradeRoomViewProps {
  tradeRoom: any;
  onBack: () => void;
}

export function TradeRoomView({ tradeRoom, onBack }: TradeRoomViewProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-brand-blue mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Trade Room Title */}
        <div className="mb-6">
          <h1 className="text-foreground mb-2">{tradeRoom.name}</h1>
          <p className="text-muted-foreground">{tradeRoom.type}</p>
        </div>

        {/* Summary Line */}
        <TradeRoomSummary tradeRoom={tradeRoom} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Portfolio & AI Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            <Portfolio tradeRoom={tradeRoom} />
            <AIRecommendations tradeRoom={tradeRoom} />
          </div>

          {/* Right Column - Leaderboard */}
          <div className="lg:col-span-1 space-y-6">
            <Leaderboard tradeRoom={tradeRoom} />
          </div>
        </div>
      </div>
    </div>
  );
}