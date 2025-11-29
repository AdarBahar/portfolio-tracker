import { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { useJoinBullPen, useAllBullPens } from '@/hooks/useBullPens';

interface JoinBullPenModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function JoinBullPenModal({ onClose, onSuccess }: JoinBullPenModalProps) {
  const [selectedBullPenId, setSelectedBullPenId] = useState<number | null>(null);
  const [inviteCode, setInviteCode] = useState('');

  const { data: allBullPens = [], isLoading: bullPensLoading } = useAllBullPens();
  const { mutate: joinBullPen, isPending } = useJoinBullPen();

  const handleJoin = () => {
    if (selectedBullPenId) {
      joinBullPen(selectedBullPenId, {
        onSuccess,
      });
    }
  };

  // Filter to show only active and scheduled rooms
  const availableBullPens = allBullPens.filter((bp: any) => ['active', 'scheduled'].includes(bp.state));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-white/10 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Join Trade Room</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Available Rooms */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Available Rooms
            </label>

            {bullPensLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : availableBullPens && availableBullPens.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(availableBullPens as any[]).map((bp: any) => (
                  <button
                    key={bp.id}
                    onClick={() => setSelectedBullPenId(bp.id)}
                    className={`w-full p-3 rounded-md border text-left transition-colors ${
                      selectedBullPenId === bp.id
                        ? 'bg-primary/20 border-primary text-white'
                        : 'bg-background border-white/10 text-foreground hover:border-white/20'
                    }`}
                  >
                    <div className="font-medium">{bp.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {bp.state} • ${Number(bp.startingCash).toLocaleString()} starting cash
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No available rooms to join</p>
            )}
          </div>

          {/* Invite Code */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Or enter invite code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 bg-background border border-white/10 rounded-md text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
              placeholder="Enter invite code"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-card border border-white/10 text-foreground rounded-md hover:bg-card/80"
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={!selectedBullPenId || isPending}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader className="w-4 h-4 animate-spin" />}
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

