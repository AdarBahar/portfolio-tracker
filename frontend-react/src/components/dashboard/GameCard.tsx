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
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'completed':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
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
    <div className="gradient-card backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-border shadow-lg hover:shadow-xl transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-foreground font-semibold text-lg truncate">{bullPen.name}</h3>
          {bullPen.description && (
            <p className="text-muted-foreground text-sm truncate mt-1">{bullPen.description}</p>
          )}
        </div>
        <span
          className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStateColor(
            bullPen.state
          )}`}
        >
          {bullPen.state.charAt(0).toUpperCase() + bullPen.state.slice(1)}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Starting Cash */}
        <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
          <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Starting Cash</p>
            <p className="text-foreground font-semibold text-sm truncate">
              ${bullPen.startingCash.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
          <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Duration</p>
            <p className="text-foreground font-semibold text-sm truncate">
              {durationDays > 0 ? `${durationDays}d` : `${durationHours}h`}
            </p>
          </div>
        </div>

        {/* Max Players */}
        <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
          <Users className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Max Players</p>
            <p className="text-foreground font-semibold text-sm">{bullPen.maxPlayers}</p>
          </div>
        </div>

        {/* Start Date */}
        <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
          <TrendingUp className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Starts</p>
            <p className="text-foreground font-semibold text-sm truncate">
              {formatDate(bullPen.startTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {isJoined ? (
          <button
            onClick={onView}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium text-sm"
          >
            View Room
          </button>
        ) : (
          <button
            onClick={onJoin}
            className="flex-1 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg text-white rounded-lg transition-all font-medium text-sm"
          >
            Join Room
          </button>
        )}
      </div>
    </div>
  );
}

