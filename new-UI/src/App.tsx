import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { PlayerProfile } from './components/PlayerProfile';
import { CurrentGames } from './components/CurrentGames';
import { AvailableGames } from './components/AvailableGames';
import { SearchBar } from './components/SearchBar';
import { TradeRoomView } from './components/TradeRoomView';
import { Login } from './components/Login';
import { CreateRoomModal } from './components/CreateRoomModal';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTradeRoom, setSelectedTradeRoom] = useState<any>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [userCreatedRooms, setUserCreatedRooms] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleCreateRoom = (roomData: any) => {
    console.log('Creating room:', roomData);
    
    // Create a unique room object
    const newRoom = {
      id: Date.now(),
      name: roomData.name,
      type: roomData.type,
      difficulty: roomData.difficulty,
      description: roomData.description,
      currentPlayers: 1,
      maxPlayers: roomData.maxPlayers,
      entryFee: roomData.entryFee,
      rewardStars: roomData.rewardStars,
      startDate: roomData.startDate,
      endDate: roomData.endDate,
      startingBalance: roomData.startingBalance,
      isPrivate: roomData.isPrivate,
      allowInvites: roomData.allowInvites,
      status: 'Waiting',
      creator: 'You',
      timeLeft: calculateTimeLeft(roomData.startDate),
      invitedPlayers: roomData.invitedPlayers
    };
    
    // Add room to user's created rooms
    setUserCreatedRooms(prev => [newRoom, ...prev]);
    
    // Create notifications for invited players (simulated)
    const inviteNotifications = roomData.invitedPlayers.map((player: any) => ({
      id: `invite-${Date.now()}-${player.id}`,
      type: 'invite',
      roomId: newRoom.id,
      roomName: roomData.name,
      playerName: player.name,
      playerId: player.id,
      timestamp: new Date().toISOString(),
      read: false
    }));
    
    setNotifications(prev => [...inviteNotifications, ...prev]);
    
    alert(`Trade room "${roomData.name}" created successfully! ${roomData.invitedPlayers.length} player(s) invited.`);
  };

  const calculateTimeLeft = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffMs = start.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Started';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    return `${diffHours}h`;
  };

  const handleMarkNotificationRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  if (selectedTradeRoom) {
    return (
      <div className="dark">
        <TopBar />
        <TradeRoomView 
          tradeRoom={selectedTradeRoom} 
          onBack={() => setSelectedTradeRoom(null)} 
        />
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background">
      <TopBar 
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearNotifications={handleClearNotifications}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-foreground mb-2 text-2xl sm:text-3xl">Fantasy Trading Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your trade rooms and compete with players worldwide</p>
        </div>

        {/* Search Bar */}
        <SearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          onCreateRoom={() => setShowCreateRoom(true)}
        />

        {/* Player Profile */}
        <PlayerProfile />

        {/* Current Games */}
        <CurrentGames 
          searchQuery={searchQuery} 
          onSelectRoom={setSelectedTradeRoom}
          userCreatedRooms={userCreatedRooms}
        />

        {/* Available Games */}
        <AvailableGames searchQuery={searchQuery} />

        {/* Create Room Modal */}
        {showCreateRoom && (
          <CreateRoomModal
            onClose={() => setShowCreateRoom(false)}
            onCreate={handleCreateRoom}
          />
        )}
      </div>
    </div>
  );
}