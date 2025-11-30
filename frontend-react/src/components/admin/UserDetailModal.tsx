import React, { useState } from 'react';
import { X, Loader, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { UserDetail } from '@/hooks/useAdmin';
import { formatCurrency, formatDate } from '@/utils/formatting';
import BudgetStarsAdjustmentPanel from './BudgetStarsAdjustmentPanel';

interface UserDetailModalProps {
  user: UserDetail | null;
  isLoading: boolean;
  onClose: () => void;
}

export default function UserDetailModal({ user, isLoading, onClose }: UserDetailModalProps): React.ReactElement {
  const navigate = useNavigate();
  const [showAdjustments, setShowAdjustments] = useState(false);

  if (!user && !isLoading) return <></>;

  const handleViewFullDetails = () => {
    if (user?.id) {
      navigate(`/admin/user/${user.id}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card border border-white/10 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">User Details</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-background/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Email</p>
                  <button
                    onClick={handleViewFullDetails}
                    className="text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                  >
                    {user.email}
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Name</p>
                  <p className="text-foreground">{user.name || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Auth Provider</p>
                  <p className="text-foreground capitalize">{user.auth_provider}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Role</p>
                  <p className="text-foreground">{user.is_admin ? '⭐ Admin' : 'User'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Created</p>
                  <p className="text-foreground">{formatDate(user.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Last Login</p>
                  <p className="text-foreground">{user.last_login ? formatDate(user.last_login) : 'Never logged in'}</p>
                </div>
              </div>
            </div>

            {/* Budget Info */}
            {user.budget && (
              <div className="bg-background/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Budget</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Balance</p>
                    <p className="text-foreground font-semibold">{formatCurrency(user.budget.total_balance || 0)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Available</p>
                    <p className="text-success font-semibold">{formatCurrency(user.budget.available_balance || 0)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Locked</p>
                    <p className="text-warning font-semibold">{formatCurrency(user.budget.locked_balance || 0)}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs mt-2">Currency: {user.budget.currency}</p>
              </div>
            )}

            {/* Trading Rooms */}
            {user.trading_rooms && user.trading_rooms.length > 0 && (
              <div className="bg-background/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Trading Rooms ({user.trading_rooms.length})</h3>
                <div className="space-y-2">
                  {user.trading_rooms.map((room) => (
                    <div key={room.id} className="flex justify-between items-center py-2 border-b border-white/10">
                      <div>
                        <p className="text-foreground font-medium">{room.name || 'Unknown Room'}</p>
                        <p className="text-muted-foreground text-sm">
                          State: <span className="capitalize">{room.state}</span> • Role: {room.role}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground text-sm">Cash: {formatCurrency(room.cash || 0)}</p>
                        <p className="text-muted-foreground text-xs">Joined: {formatDate(room.joined_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Adjustments */}
            <div className="bg-background/50 p-4 rounded-lg border border-white/10">
              <button
                onClick={() => setShowAdjustments(!showAdjustments)}
                className="w-full flex items-center justify-between text-lg font-semibold text-white hover:text-primary transition-colors"
              >
                <span>⚙️ Admin Adjustments</span>
                {showAdjustments ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {showAdjustments && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <BudgetStarsAdjustmentPanel user={user} onSuccess={() => setShowAdjustments(false)} />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleViewFullDetails}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Full Details
              </button>
              <button onClick={onClose} className="btn-secondary flex-1">
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

