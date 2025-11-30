import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import ThemeToggle from '@/components/header/ThemeToggle';
import UserProfile from '@/components/header/UserProfile';
import { useUserDetail, useUserLogs } from '@/hooks/useAdmin';
import { formatCurrency, formatDate } from '@/utils/formatting';

export default function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const userIdNum = userId ? parseInt(userId, 10) : undefined;
  const { data: userDetailData, isLoading, error } = useUserDetail(userIdNum);
  const { data: logs = [] } = useUserLogs(userIdNum);

  const user = userDetailData?.user || null;
  const budget = userDetailData?.budget || null;
  const tradingRooms = userDetailData?.trading_rooms || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-white/10 bg-slate-800/50 backdrop-blur">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-primary hover:text-primary/80"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Admin
              </button>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <UserProfile />
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-danger">User not found or error loading user details</p>
          </div>
        </main>
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
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </button>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserProfile />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">{user.name || user.email}</h1>
          <p className="text-muted-foreground mt-2">{user.email}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
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
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Balance</p>
                    <p className="text-foreground font-semibold">{formatCurrency((budget.available_balance || 0) + (budget.locked_balance || 0))}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Available</p>
                    <p className="text-success font-semibold">{formatCurrency(budget.available_balance || 0)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Locked</p>
                    <p className="text-warning font-semibold">{formatCurrency(budget.locked_balance || 0)}</p>
                  </div>
                </div>
              </div>
            )}

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
    </div>
  );
}

