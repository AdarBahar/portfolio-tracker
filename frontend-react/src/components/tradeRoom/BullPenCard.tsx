import { Users, Trophy, Clock } from 'lucide-react';
import type { BullPen } from '@/hooks/useBullPens';
import { formatTimeRemaining, getStatusBadgeClass } from '@/utils/tradeRoomCalculations';
import { formatCurrency, formatDate } from '@/utils/formatting';

interface BullPenCardProps {
  bullPen: BullPen;
  participantCount?: number;
  onClick?: () => void;
}

export default function BullPenCard({ bullPen, participantCount = 0, onClick }: BullPenCardProps) {
  const timeRemaining = formatTimeRemaining(bullPen.startTime, bullPen.durationSec);
  const statusClass = getStatusBadgeClass(bullPen.state);

  return (
    <div
      onClick={onClick}
      className="card-base p-6 hover:border-primary/50 transition-colors cursor-pointer"
    >
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white mb-2">{bullPen.name}</h3>
        <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${statusClass}`}>
          {bullPen.state.charAt(0).toUpperCase() + bullPen.state.slice(1)}
        </span>
      </div>

      {bullPen.description && (
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{bullPen.description}</p>
      )}

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{participantCount} participants</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Trophy className="w-4 h-4" />
          <span>{formatCurrency(Number(bullPen.startingCash))} starting cash</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{timeRemaining}</span>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Started: {formatDate(bullPen.startTime)}
      </div>
    </div>
  );
}

