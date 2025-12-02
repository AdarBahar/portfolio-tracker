import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Loader } from 'lucide-react';
import { PageLayout, PageHeader } from '@/components/layout';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { useUserDetail, useUserLogs, useGrantStars, useRemoveStars } from '@/hooks/useAdmin';
import { formatCurrency, formatDate } from '@/utils/formatting';
import BudgetStarsAdjustmentPanel from '@/components/admin/BudgetStarsAdjustmentPanel';

// Stars adjustment form component
function StarsAdjustmentForm({ user, onSuccess }: { user: any; onSuccess: () => void }) {
  const [starsAmount, setStarsAmount] = useState('');
  const [starsAction, setStarsAction] = useState<'grant' | 'remove'>('grant');
  const [starsReason, setStarsReason] = useState('');

  const { mutate: grantStars, isPending: grantLoading } = useGrantStars();
  const { mutate: removeStars, isPending: removeLoading } = useRemoveStars();

  const handleAdjustStars = (e: React.FormEvent) => {
    e.preventDefault();
    if (!starsAmount || !starsReason.trim()) return;

    const mutationFn = starsAction === 'grant' ? grantStars : removeStars;
    mutationFn(
      {
        userId: user.id,
        stars: parseInt(starsAmount, 10),
        reason: starsReason,
      },
      {
        onSuccess: () => {
          setStarsAmount('');
          setStarsReason('');
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleAdjustStars} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground">Amount</label>
          <input
            type="number"
            min="0"
            value={starsAmount}
            onChange={(e) => setStarsAmount(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 bg-background border border-white/10 rounded text-foreground text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Action</label>
          <select
            value={starsAction}
            onChange={(e) => setStarsAction(e.target.value as 'grant' | 'remove')}
            className="w-full px-3 py-2 bg-background border border-white/10 rounded text-foreground text-sm"
          >
            <option value="grant">Grant Stars</option>
            <option value="remove">Remove Stars</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Reason</label>
        <input
          type="text"
          value={starsReason}
          onChange={(e) => setStarsReason(e.target.value)}
          placeholder="e.g., Achievement, Correction, Penalty"
          className="w-full px-3 py-2 bg-background border border-white/10 rounded text-foreground text-sm"
        />
      </div>
      <AnimatedButton
        type="submit"
        disabled={!starsAmount || !starsReason.trim()}
        state={grantLoading || removeLoading ? 'loading' : 'idle'}
        variant="primary"
        size="lg"
        className="w-full"
        loadingText="Processing..."
        successText="Updated!"
      >
        {starsAction === 'grant' ? 'Grant' : 'Remove'} {starsAmount || '0'} ⭐
      </AnimatedButton>
    </form>
  );
}

export default function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const userIdNum = userId ? parseInt(userId, 10) : undefined;
  const { data: userDetailData, isLoading, error, refetch } = useUserDetail(userIdNum);
  const { data: logs = [] } = useUserLogs(userIdNum);

  const user = userDetailData?.user || null;
  const budget = userDetailData?.budget || null;
  const tradingRooms = userDetailData?.trading_rooms || [];

  const handleAdjustmentSuccess = () => {
    refetch();
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <PageLayout
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearNotifications={handleClearNotifications}
      >
        <main className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-muted-foreground hover:text-[#0BA5EC] mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Admin</span>
          </button>
          <div className="text-center">
            <p className="text-danger">User not found or error loading user details</p>
          </div>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      notifications={notifications}
      onMarkNotificationRead={handleMarkNotificationRead}
      onClearNotifications={handleClearNotifications}
    >
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-muted-foreground hover:text-[#0BA5EC] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Admin</span>
        </button>

        {/* User Header */}
        <PageHeader
          title={user.name || user.email}
          description={user.email}
          icon={User}
          iconColor="text-[#0BA5EC]"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-card border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
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

            {/* Budget Information */}
            {budget && (
              <div className="bg-card border border-white/10 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Budget</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Balance</p>
                    <p className="text-foreground font-semibold">
                      {formatCurrency(
                        parseFloat(budget.available_balance as any) +
                        parseFloat(budget.locked_balance as any)
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Available</p>
                    <p className="text-success font-semibold">{formatCurrency(parseFloat(budget.available_balance as any))}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Locked</p>
                    <p className="text-warning font-semibold">{formatCurrency(parseFloat(budget.locked_balance as any))}</p>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Adjust Budget</h3>
                  {user && (
                    <BudgetStarsAdjustmentPanel
                      user={user as any}
                      onSuccess={handleAdjustmentSuccess}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Stars Information */}
            <div className="bg-card border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">⭐ Stars</h2>
              <div className="mb-6">
                <p className="text-muted-foreground text-sm">Total Stars</p>
                <p className="text-warning font-semibold text-3xl">{userDetailData?.total_stars || 0}</p>
              </div>
              <div className="border-t border-white/10 pt-6">
                <div className="bg-background/50 p-4 rounded-lg border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Adjust Stars</h3>
                  {user && (
                    <StarsAdjustmentForm user={user as any} onSuccess={handleAdjustmentSuccess} />
                  )}
                </div>
              </div>
            </div>

            {/* Trading Rooms */}
            {tradingRooms.length > 0 && (
              <div className="bg-card border border-white/10 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Trading Rooms ({tradingRooms.length})</h2>
                <div className="space-y-3">
                  {tradingRooms.map((room: any) => (
                    <div key={room.id} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                      <div>
                        <p className="text-foreground font-medium">{room.name}</p>
                        <p className="text-muted-foreground text-sm">State: {room.state} • Role: {room.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground">{formatCurrency(room.cash)}</p>
                        <p className="text-muted-foreground text-xs">{formatDate(room.joined_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Logs */}
            {logs.length > 0 && (
              <div className="bg-card border border-white/10 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Audit Logs ({logs.length})</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3 bg-background/50 rounded-lg text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-foreground font-medium capitalize">
                          {log.event_type ? log.event_type.replace(/_/g, ' ') : 'Unknown Event'}
                        </p>
                        <p className="text-muted-foreground text-xs">{formatDate(log.created_at)}</p>
                      </div>
                      <p className="text-muted-foreground text-xs mb-1">{log.event_category || 'N/A'}</p>
                      <p className="text-foreground text-xs">{log.description || 'No description'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-card border border-white/10 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground text-sm">Status</p>
                  <p className="text-foreground capitalize">{user.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Demo Account</p>
                  <p className="text-foreground">{user.is_demo ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Active Rooms</p>
                  <p className="text-foreground">{tradingRooms.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Audit Logs</p>
                  <p className="text-foreground">{logs.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}

