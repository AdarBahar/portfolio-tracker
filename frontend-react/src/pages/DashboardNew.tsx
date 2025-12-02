import { useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMyBullPens, useAllBullPens } from '@/hooks/useBullPens';
import TopBar from '@/components/dashboard/TopBar';
import PlayerProfile from '@/components/dashboard/PlayerProfile';
import CurrentGames from '@/components/dashboard/CurrentGames';
import AvailableGames from '@/components/dashboard/AvailableGames';
import SearchBar from '@/components/dashboard/SearchBar';
import CreateRoomModal from '@/components/dashboard/CreateRoomModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function DashboardNew() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch user profile and stats
  const { data: profileData, isLoading: profileLoading, error: profileError } = useUserProfile();

  // Fetch user's bull pens
  const { data: myBullPens = [], isLoading: myBullPensLoading } = useMyBullPens();

  // Fetch all available bull pens
  const { data: allBullPens = [], isLoading: allBullPensLoading } = useAllBullPens();

  const isLoading = profileLoading || myBullPensLoading || allBullPensLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load dashboard</p>
          <p className="text-muted-foreground text-sm">Please try refreshing the page</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="dark min-h-screen bg-background">
        {/* Top Bar */}
        <TopBar
          notifications={notifications}
          onMarkNotificationRead={(id) => {
            setNotifications(prev =>
              prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
          }}
          onClearNotifications={() => setNotifications([])}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="gradient-card backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-8 border border-border shadow-lg">
            <h1 className="text-foreground mb-2 text-2xl sm:text-3xl font-bold">Fantasy Trading Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your trade rooms and compete with players worldwide
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCreateRoom={() => setShowCreateRoom(true)}
          />

          {/* Player Profile */}
          {profileData && <PlayerProfile profile={profileData.profile} stats={profileData.stats} />}

          {/* Current Games */}
          <CurrentGames
            searchQuery={searchQuery}
            bullPens={myBullPens}
            isLoading={myBullPensLoading}
          />

          {/* Available Games */}
          <AvailableGames
            searchQuery={searchQuery}
            bullPens={allBullPens}
            isLoading={allBullPensLoading}
          />

          {/* Create Room Modal */}
          {showCreateRoom && (
            <CreateRoomModal
              onClose={() => setShowCreateRoom(false)}
              onCreate={(roomData) => {
                console.log('Creating room:', roomData);
                setShowCreateRoom(false);
                // Refetch bull pens after creation
              }}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

