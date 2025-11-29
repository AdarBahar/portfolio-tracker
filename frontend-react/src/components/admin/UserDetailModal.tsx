import React from 'react';
import { X, Loader } from 'lucide-react';
import type { UserDetail } from '@/hooks/useAdmin';
import { formatCurrency, formatDate } from '@/utils/formatting';

interface UserDetailModalProps {
  user: UserDetail | null;
  isLoading: boolean;
  onClose: () => void;
}

export default function UserDetailModal({ user, isLoading, onClose }: UserDetailModalProps): React.ReactElement {
  if (!user && !isLoading) return <></>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-white/10 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <p className="text-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Name</p>
                  <p className="text-foreground">{user.name || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Auth Provider</p>
                  <p className="text-foreground">{user.auth_provider}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Status</p>
                  <p className="text-foreground">{user.is_admin ? 'Admin' : 'User'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Created</p>
                  <p className="text-foreground">{formatDate(user.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Last Login</p>
                  <p className="text-foreground">{user.last_login ? formatDate(user.last_login) : 'Never'}</p>
                </div>
              </div>
            </div>

            {/* Budget Info */}
            <div className="bg-background/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Budget</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Total Balance</p>
                  <p className="text-foreground font-semibold">{formatCurrency(user.budget.total_balance)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Available</p>
                  <p className="text-success font-semibold">{formatCurrency(user.budget.available_balance)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Locked</p>
                  <p className="text-warning font-semibold">{formatCurrency(user.budget.locked_balance)}</p>
                </div>
              </div>
            </div>

            {/* Rooms */}
            {user.rooms && user.rooms.length > 0 && (
              <div className="bg-background/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Active Rooms ({user.rooms.length})</h3>
                <div className="space-y-2">
                  {user.rooms.map((room: any) => (
                    <div key={room.id} className="flex justify-between items-center py-2 border-b border-white/10">
                      <div>
                        <p className="text-foreground">{room.name}</p>
                        <p className="text-muted-foreground text-sm">{room.state}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground">{formatCurrency(room.portfolio_value)}</p>
                        <p className={room.gain_loss >= 0 ? 'text-success text-sm' : 'text-danger text-sm'}>
                          {room.gain_loss >= 0 ? '+' : ''}{formatCurrency(room.gain_loss)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={onClose} className="btn-secondary w-full">
              Close
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

