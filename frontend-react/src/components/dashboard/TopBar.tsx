import { useState } from 'react';
import { Bell, LogOut, Settings, TrendingUp, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/header/ThemeToggle';
import DebugBadge from '@/components/DebugBadge';

interface TopBarProps {
  notifications: any[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
}

export default function TopBar({
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
}: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-foreground font-bold">Fantasy Trading</h1>
              <p className="text-muted-foreground text-xs">Master the Markets</p>
            </div>
            {/* Debug Badge */}
            <div className="ml-4">
              <DebugBadge />
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-muted rounded-lg transition"
              >
                <Bell className="w-5 h-5 text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={onClearNotifications}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No notifications</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`p-2 rounded-lg cursor-pointer transition ${
                            notif.read ? 'bg-muted/30' : 'bg-blue-500/10 border border-blue-500/30'
                          }`}
                          onClick={() => onMarkNotificationRead(notif.id)}
                        >
                          <p className="text-sm text-foreground">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.timestamp}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition"
              >
                {user?.picture && (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-sm text-foreground hidden sm:inline">{user?.name}</span>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full px-4 py-2 text-left text-foreground hover:bg-muted flex items-center gap-2 transition"
                  >
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-destructive hover:bg-destructive/10 flex items-center gap-2 transition border-t border-border"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition"
          >
            {showMobileMenu ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 space-y-2 border-t border-border pt-4">
            <button
              onClick={() => navigate('/profile')}
              className="w-full px-4 py-2 text-left text-foreground hover:bg-muted rounded-lg transition flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Profile Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-destructive hover:bg-destructive/10 rounded-lg transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

