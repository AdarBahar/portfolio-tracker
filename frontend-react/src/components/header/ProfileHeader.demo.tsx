/**
 * ProfileHeader Demo Component
 * Used for development and testing of the ProfileHeader component
 * Shows different states and variations
 */

import { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileHeaderContainer from './ProfileHeaderContainer';
import {
  mockExperiencedUserProfile,
  mockNewUserProfile,
  mockExperiencedUserStats,
  mockNewUserStats,
  mockUserWithLoss,
  mockHighProfitUser,
  mockHighPerformanceStats,
} from '@/mocks/profileHeaderMocks';

export default function ProfileHeaderDemo() {
  const [selectedVariant, setSelectedVariant] = useState<'experienced' | 'new' | 'loss' | 'high'>('experienced');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'mock' | 'api'>('mock');

  const variants = {
    experienced: {
      profile: mockExperiencedUserProfile,
      stats: mockExperiencedUserStats,
      label: 'Experienced User',
    },
    new: {
      profile: mockNewUserProfile,
      stats: mockNewUserStats,
      label: 'New User',
    },
    loss: {
      profile: mockUserWithLoss,
      stats: mockExperiencedUserStats,
      label: 'User with Loss',
    },
    high: {
      profile: mockHighProfitUser,
      stats: mockHighPerformanceStats,
      label: 'High Performer',
    },
  };

  const current = variants[selectedVariant];

  const handleJoinRoom = () => {
    console.log('Join Room clicked');
    alert('Join Room action triggered');
  };

  const handleCreateRoom = () => {
    console.log('Create Room clicked');
    alert('Create Room action triggered');
  };

  const handleViewStats = () => {
    console.log('View Stats clicked');
    alert('View Stats action triggered');
  };

  const handleAvatarUpload = async (file: File) => {
    console.log('Avatar upload:', file.name);
    setIsLoading(true);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    alert(`Avatar uploaded: ${file.name}`);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Profile Header Component
          </h1>
          <p className="text-muted-foreground">
            Development and testing demo for different user states
          </p>
        </div>

        {/* Variant Selector */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {Object.entries(variants).map(([key, variant]) => (
            <button
              key={key}
              onClick={() => setSelectedVariant(key as keyof typeof variants)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${selectedVariant === key
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-foreground hover:border-primary'
                }
              `}
            >
              {variant.label}
            </button>
          ))}
        </div>

        {/* Tab Selector */}
        <div className="mb-8 flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('mock')}
            className={`px-4 py-2 font-medium transition-all border-b-2 ${
              activeTab === 'mock'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Mock Data (Development)
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 font-medium transition-all border-b-2 ${
              activeTab === 'api'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            API Integration (Live)
          </button>
        </div>

        {/* Loading Toggle (only for mock tab) */}
        {activeTab === 'mock' && (
          <div className="mb-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isLoading}
                onChange={(e) => setIsLoading(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-foreground font-medium">Show Loading State</span>
            </label>
          </div>
        )}

        {/* Component Demo */}
        <div className="mb-12">
          {activeTab === 'mock' ? (
            <ProfileHeader
              userProfile={current.profile}
              userStats={current.stats}
              isLoading={isLoading}
              onJoinRoom={handleJoinRoom}
              onCreateRoom={handleCreateRoom}
              onViewStats={handleViewStats}
              onAvatarUpload={handleAvatarUpload}
            />
          ) : (
            <ProfileHeaderContainer
              onJoinRoom={handleJoinRoom}
              onCreateRoom={handleCreateRoom}
              onAvatarUpload={handleAvatarUpload}
            />
          )}
        </div>

        {/* Info Section (only for mock tab) */}
        {activeTab === 'mock' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Profile Data</h3>
              <pre className="text-xs text-muted-foreground overflow-auto bg-background p-4 rounded">
                {JSON.stringify(current.profile, null, 2)}
              </pre>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Stats Data</h3>
              <pre className="text-xs text-muted-foreground overflow-auto bg-background p-4 rounded">
                {JSON.stringify(current.stats, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* API Info Section */}
        {activeTab === 'api' && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-foreground mb-4">API Integration</h3>
            <p className="text-muted-foreground mb-4">
              This tab shows the ProfileHeader component fetching real data from the API endpoint:
            </p>
            <code className="block bg-background p-4 rounded text-xs text-muted-foreground mb-4">
              GET /api/users/profile
            </code>
            <p className="text-sm text-muted-foreground">
              The component uses React Query for caching and automatic refetching.
              Make sure you're logged in to see your actual profile data.
            </p>
          </div>
        )}

        {/* Features List */}
        <div className="mt-12 bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Features</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✅ Three-column responsive layout</li>
            <li>✅ Avatar with upload capability</li>
            <li>✅ Star badge with animation</li>
            <li>✅ Profit indicator with counter animation</li>
            <li>✅ Stat cards with trend indicators</li>
            <li>✅ Empty state for new users</li>
            <li>✅ Loading states</li>
            <li>✅ Light/dark mode support</li>
            <li>✅ Mobile responsive</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

