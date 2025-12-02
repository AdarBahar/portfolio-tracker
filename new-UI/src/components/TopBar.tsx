import { useState } from 'react';
import { Bell, Mail, Settings, LogOut, User, Check, X } from 'lucide-react';

interface TopBarProps {
  notifications?: any[];
  onMarkNotificationRead?: (id: string) => void;
  onClearNotifications?: () => void;
}

export function TopBar({ notifications = [], onMarkNotificationRead, onClearNotifications }: TopBarProps) {
  const [showInvites, setShowInvites] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const gameInvites = [
    {
      id: 1,
      playerName: 'John Smith',
      invitedBy: 'Sarah Chen',
      gameType: 'Stock Trading',
      rewardStars: 15000,
      startDate: '2025-11-30',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      playerName: 'Emily Davis',
      invitedBy: 'Mike Johnson',
      gameType: 'Cryptocurrency',
      rewardStars: 8000,
      startDate: '2025-12-01',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    {
      id: 3,
      playerName: 'Alex Rodriguez',
      invitedBy: 'Emma Wilson',
      gameType: 'Forex Trading',
      rewardStars: 20000,
      startDate: '2025-12-02',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    }
  ];

  // Combine default invites with new notifications
  const allNotifications = [...notifications, ...gameInvites];
  const unreadCount = notifications.filter(n => !n.read).length + gameInvites.length;

  const handleAccept = (inviteId: number | string) => {
    console.log('Accepted invite:', inviteId);
    if (typeof inviteId === 'string' && onMarkNotificationRead) {
      onMarkNotificationRead(inviteId);
    }
    alert('Invite accepted! You have joined the trade room.');
  };

  const handleDecline = (inviteId: number | string) => {
    console.log('Declined invite:', inviteId);
    if (typeof inviteId === 'string' && onMarkNotificationRead) {
      onMarkNotificationRead(inviteId);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white text-sm sm:text-base">FT</span>
            </div>
            <span className="text-foreground hidden sm:block truncate">Fantasy Trading</span>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Messages */}
            <button className="relative p-2 rounded-lg transition-colors text-muted-foreground hover:text-brand-blue hover:bg-muted">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-blue"></span>
            </button>

            {/* Game Invites */}
            <div className="relative">
              <button 
                onClick={() => setShowInvites(!showInvites)}
                className="relative p-2 rounded-lg transition-colors text-muted-foreground hover:text-brand-blue hover:bg-muted"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-danger rounded-full flex items-center justify-center text-white text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Invites Dropdown */}
              {showInvites && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowInvites(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-screen max-w-md sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-20 max-h-[80vh] overflow-hidden flex flex-col mx-4 sm:mx-0">
                    {/* Header */}
                    <div className="p-3 sm:p-4 border-b border-border gradient-card">
                      <h3 className="text-foreground text-base sm:text-lg">Trade Room Invites</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">You have {unreadCount} pending invitations</p>
                    </div>

                    {/* Invites List */}
                    <div className="overflow-y-auto flex-1">
                      {allNotifications.map((invite) => {
                        // Check if it's a new notification (has type property)
                        const isNewNotification = invite.type === 'invite';
                        const displayData = isNewNotification ? {
                          id: invite.id,
                          gameName: invite.roomName,
                          invitedBy: 'You (Room Creator)',
                          playerName: invite.playerName,
                          gameType: 'New Room',
                          prize: 0,
                          startDate: invite.timestamp,
                          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
                        } : invite;
                        
                        return (
                          <div key={displayData.id} className={`p-3 sm:p-4 border-b border-border hover:bg-muted/50 transition-colors ${isNewNotification && !invite.read ? 'bg-brand-blue/5' : ''}`}>
                            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <img 
                                src={displayData.avatar} 
                                alt={displayData.invitedBy}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-brand-blue/20 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                {isNewNotification ? (
                                  <>
                                    <p className="text-xs sm:text-sm mb-1 text-foreground">
                                      <span className="text-success">Invitation sent to </span>
                                      <span className="text-brand-blue truncate block sm:inline">{displayData.playerName}</span>
                                    </p>
                                    <p className="text-sm sm:text-base text-foreground mb-1 truncate">{displayData.gameName}</p>
                                    <div className="flex items-center gap-2 text-xs flex-wrap">
                                      <span className="px-2 py-0.5 bg-success/10 text-success rounded">Pending</span>
                                      <span className="text-muted-foreground">{formatTimestamp(displayData.startDate)}</span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-xs sm:text-sm mb-1 text-foreground">
                                      <span className="text-brand-blue">{displayData.invitedBy}</span> invited you to
                                    </p>
                                    <p className="text-sm sm:text-base text-foreground mb-1 truncate">{displayData.gameName}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                      <span className="truncate">{displayData.gameType}</span>
                                      <span>•</span>
                                      <span className="text-success">${displayData.prize.toLocaleString()}</span>
                                      <span>•</span>
                                      <span>{formatTimestamp(displayData.startDate)}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons - only for received invites */}
                            {!isNewNotification && (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleAccept(displayData.id)}
                                  className="flex-1 py-2 gradient-primary text-white rounded-lg transition-all hover:shadow-lg text-xs sm:text-sm"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => handleDecline(displayData.id)}
                                  className="flex-1 py-2 bg-muted text-foreground hover:bg-border rounded-lg transition-colors text-xs sm:text-sm"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-border bg-muted/30">
                      <button className="w-full text-center text-brand-blue hover:text-brand-purple text-sm transition-colors">
                        View All Invites
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Settings */}
            <button className="p-2 rounded-lg transition-colors text-muted-foreground hover:text-brand-blue hover:bg-muted">
              <Settings className="w-5 h-5" />
            </button>

            {/* Profile */}
            <div className="relative">
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-muted"
              >
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-blue/50"
                />
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowProfile(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl z-20">
                    <div className="p-3 border-b border-border">
                      <p className="text-foreground">Alex Morgan</p>
                      <p className="text-muted-foreground text-sm">@alexm_trader</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm text-foreground hover:bg-muted">
                        <User className="w-4 h-4" />
                        <span>View Profile</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm text-foreground hover:bg-muted">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm text-danger hover:bg-muted">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}