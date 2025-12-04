import { useState } from 'react';
import { Bell, LogOut, Settings, TrendingUp, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/header/ThemeToggle';
import DebugBadge from '@/components/DebugBadge';
import StagingBadge from '@/components/StagingBadge';

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
    <header className="border-b border-border gradient-card-header backdrop-blur-sm sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0BA5EC] to-[#7C3AED] rounded-lg flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-foreground font-bold text-base">Fantasy Trading</h1>
              <p className="text-muted-foreground text-xs">Master the Markets</p>
            </div>
            {/* Staging Badge */}
            <div className="ml-4">
              <StagingBadge />
            </div>
            {/* Debug Badge */}
            <div className="ml-2">
              <DebugBadge />
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-muted-foreground hover:text-[#0BA5EC] hover:bg-muted rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 gradient-card backdrop-blur-sm rounded-xl shadow-2xl p-4 max-h-96 overflow-y-auto border border-border">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                    <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={onClearNotifications}
                        className="text-xs text-muted-foreground hover:text-[#0BA5EC] transition-colors"
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
                          className={`p-3 rounded-lg cursor-pointer transition ${
                            notif.read ? 'bg-muted/30' : 'bg-[#0BA5EC]/10 border border-[#0BA5EC]/30'
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
                <div className="absolute right-0 mt-2 w-56 gradient-card backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-border">
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full px-4 py-3 text-left text-foreground hover:bg-muted/50 flex items-center gap-3 transition-colors text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </button>
                  {user?.isAdmin && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="w-full px-4 py-3 text-left text-[#7C3AED] hover:bg-[#7C3AED]/10 flex items-center gap-3 transition-colors border-t border-border text-sm"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Page
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className={`w-full px-4 py-3 text-left text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center gap-3 transition-colors text-sm ${
                      user?.isAdmin ? 'border-t border-border' : 'border-t border-border'
                    }`}
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
              className="w-full px-4 py-3 text-left text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-3 text-sm"
            >
              <Settings className="w-4 h-4" />
              Profile Settings
            </button>
            {user?.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="w-full px-4 py-3 text-left text-[#7C3AED] hover:bg-[#7C3AED]/10 rounded-lg transition-colors flex items-center gap-3 text-sm"
              >
                <Shield className="w-4 h-4" />
                Admin Page
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors flex items-center gap-3 text-sm"
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

