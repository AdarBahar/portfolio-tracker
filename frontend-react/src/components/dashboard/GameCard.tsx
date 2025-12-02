import { Users, DollarSign, Clock, TrendingUp } from 'lucide-react';
import type { BullPen } from '@/hooks/useBullPens';

interface GameCardProps {
  bullPen: BullPen;
  onJoin?: () => void;
  onView?: () => void;
  isJoined?: boolean;
}

export default function GameCard({
  bullPen,
  onJoin,
  onView,
  isJoined = false,
}: GameCardProps) {
  const getStateColor = (state: string) => {
    switch (state) {
      case 'active':
        return 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30';
      case 'scheduled':
        return 'bg-[#0BA5EC]/10 text-[#0BA5EC] border-[#0BA5EC]/30';
      case 'completed':
        return 'bg-[#93A3B8]/10 text-[#93A3B8] border-[#93A3B8]/30';
      default:
        return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const durationHours = Math.floor(bullPen.durationSec / 3600);
  const durationDays = Math.floor(durationHours / 24);

  return (
    <div className="gradient-card backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-border shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-foreground font-semibold text-base sm:text-lg truncate">{bullPen.name}</h3>
          {bullPen.description && (
            <p className="text-muted-foreground text-xs sm:text-sm truncate mt-1">{bullPen.description}</p>
          )}
        </div>
        <span
          className={`ml-2 px-2 sm:px-3 py-1 rounded-lg text-xs font-medium border whitespace-nowrap ${getStateColor(
            bullPen.state
          )}`}
        >
          {bullPen.state.charAt(0).toUpperCase() + bullPen.state.slice(1)}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3 mb-4">
        {/* Starting Cash */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
            <span className="text-muted-foreground">Starting Cash</span>
          </div>
          <p className="text-foreground font-semibold">
            ${bullPen.startingCash.toLocaleString()}
          </p>
        </div>

        {/* Duration */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0BA5EC] flex-shrink-0" />
            <span className="text-muted-foreground">Duration</span>
          </div>
          <p className="text-foreground font-semibold">
            {durationDays > 0 ? `${durationDays}d` : `${durationHours}h`}
          </p>
        </div>

        {/* Max Players */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
            <span className="text-muted-foreground">Max Players</span>
          </div>
          <p className="text-foreground font-semibold">{bullPen.maxPlayers}</p>
        </div>

        {/* Start Date */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
            <span className="text-muted-foreground">Starts</span>
          </div>
          <p className="text-foreground font-semibold">
            {formatDate(bullPen.startTime)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {isJoined ? (
          <button
            onClick={onView}
            className="flex-1 py-2 bg-gradient-to-r from-[#0BA5EC] to-[#7C3AED] hover:shadow-lg text-white rounded-lg transition-all font-medium text-sm"
          >
            View Room
          </button>
        ) : (
          <button
            onClick={onJoin}
            className="flex-1 py-2 bg-[#16A34A] hover:bg-[#16A34A]/90 hover:shadow-lg text-white rounded-lg transition-all font-medium text-sm"
          >
            Join Room
          </button>
        )}
      </div>
    </div>
  );
}

