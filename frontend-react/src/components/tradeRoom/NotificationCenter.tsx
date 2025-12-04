import { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info, Bell } from 'lucide-react';
import { hybridConnectionManager } from '@/services/hybridConnectionManager';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationCenterProps {
  bullPenId: number;
}

export default function NotificationCenter({ bullPenId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!hybridConnectionManager.isConnected()) return;

    // Subscribe to various events
    const unsubscribers = [
      hybridConnectionManager.on('order_executed', (data) => {
        addNotification({
          type: 'success',
          title: 'Order Executed',
          message: `${data.side.toUpperCase()} ${data.qty} ${data.symbol} @ ${data.price}`,
        });
      }),

      hybridConnectionManager.on('order_failed', (data) => {
        addNotification({
          type: 'error',
          title: 'Order Failed',
          message: data.reason || 'Order could not be executed',
        });
      }),

      hybridConnectionManager.on('room_state_changed', (data) => {
        addNotification({
          type: 'info',
          title: 'Room State Changed',
          message: `Room is now ${data.state}`,
        });
      }),

      hybridConnectionManager.on('leaderboard_updated', (data) => {
        addNotification({
          type: 'info',
          title: 'Leaderboard Updated',
          message: `Your rank: #${data.rank}`,
        });
      }),

      hybridConnectionManager.on('position_closed', (data) => {
        addNotification({
          type: 'success',
          title: 'Position Closed',
          message: `${data.symbol}: ${data.pnl >= 0 ? '+' : ''}$${data.pnl.toFixed(2)}`,
        });
      }),
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [bullPenId]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Info className="w-4 h-4 text-info" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success/10 border-success/30';
      case 'error':
        return 'bg-destructive/10 border-destructive/30';
      case 'warning':
        return 'bg-warning/10 border-warning/30';
      default:
        return 'bg-info/10 border-info/30';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-full bg-primary hover:bg-primary/90 transition-colors mb-4"
      >
        <Bell className="w-5 h-5 text-primary-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 max-h-96 bg-card border border-white/10 rounded-lg shadow-lg overflow-y-auto">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-semibold text-foreground">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border flex items-start gap-3 ${getBackgroundColor(notification.type)}`}
                >
                  {getIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 break-words">{notification.message}</p>
                  </div>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toast Notifications */}
      <div className="space-y-2">
        {notifications.slice(0, 3).map(notification => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border flex items-start gap-3 animate-in fade-in slide-in-from-right ${getBackgroundColor(notification.type)}`}
          >
            {getIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">{notification.title}</p>
              <p className="text-xs text-muted-foreground mt-1 break-words">{notification.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

