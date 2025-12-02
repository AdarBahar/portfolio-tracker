import { useState } from 'react';
import { X, DollarSign, Users, Calendar, Trophy, Info, Search, UserPlus, UserMinus, Lock, Globe } from 'lucide-react';

interface CreateRoomModalProps {
  onClose: () => void;
  onCreate: (roomData: any) => void;
}

interface Player {
  id: number;
  name: string;
  username: string;
  avatar: string;
  rank: number;
  winRate: number;
}

export function CreateRoomModal({ onClose, onCreate }: CreateRoomModalProps) {
  const [step, setStep] = useState(1);
  
  // Room Details
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('Stock Trading');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [description, setDescription] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(20);
  const [entryFee, setEntryFee] = useState(50);
  const [rewardStars, setRewardStars] = useState(1000);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startingBalance, setStartingBalance] = useState(10000);
  
  // Invite Settings
  const [allowInvites, setAllowInvites] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

  // Mock available players
  const availablePlayers: Player[] = [
    {
      id: 1,
      name: 'Sarah Chen',
      username: '@sarahc_trades',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      rank: 45,
      winRate: 68.5
    },
    {
      id: 2,
      name: 'Mike Johnson',
      username: '@mikej_trader',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      rank: 120,
      winRate: 61.2
    },
    {
      id: 3,
      name: 'Emma Wilson',
      username: '@emmaw_invest',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      rank: 89,
      winRate: 64.8
    },
    {
      id: 4,
      name: 'David Lee',
      username: '@davidl_stocks',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      rank: 210,
      winRate: 58.3
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      username: '@lisaa_trade',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      rank: 156,
      winRate: 59.7
    },
    {
      id: 6,
      name: 'James Smith',
      username: '@jamessmith',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      rank: 78,
      winRate: 65.9
    }
  ];

  const filteredPlayers = availablePlayers.filter(player =>
    !selectedPlayers.find(p => p.id === player.id) &&
    (player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     player.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const roomTypes = ['Stock Trading', 'Cryptocurrency', 'Forex Trading', 'Options Trading', 'Multi-Asset', 'Day Trading'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const handleAddPlayer = (player: Player) => {
    setSelectedPlayers([...selectedPlayers, player]);
    setSearchQuery('');
  };

  const handleRemovePlayer = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  const handleCreate = () => {
    const roomData = {
      name: roomName,
      type: roomType,
      difficulty,
      description,
      maxPlayers,
      entryFee,
      rewardStars,
      startDate,
      endDate,
      startingBalance,
      isPrivate,
      allowInvites,
      invitedPlayers: selectedPlayers
    };
    onCreate(roomData);
    onClose();
  };

  const canProceed = step === 1 
    ? roomName && roomType && startDate && endDate
    : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl gradient-card rounded-2xl border border-border shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <div className="min-w-0 flex-1">
            <h2 className="text-foreground mb-1 text-lg sm:text-xl truncate">Create Trade Room</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {step === 1 ? 'Set up room details and rules' : 'Invite players to join your room'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-2 rounded-full transition-all ${step >= 1 ? 'gradient-primary' : 'bg-muted'}`} />
            <div className={`flex-1 h-2 rounded-full transition-all ${step >= 2 ? 'gradient-primary' : 'bg-muted'}`} />
          </div>
          <div className="flex justify-between mt-2 text-xs sm:text-sm">
            <span className={step >= 1 ? 'text-brand-blue' : 'text-muted-foreground'}>Room Details</span>
            <span className={step >= 2 ? 'text-brand-blue' : 'text-muted-foreground'}>Invitations</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Privacy Toggle at Top */}
              <div className="flex items-center justify-between p-4 gradient-card border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  {isPrivate ? (
                    <Lock className="w-5 h-5 text-brand-blue" />
                  ) : (
                    <Globe className="w-5 h-5 text-success" />
                  )}
                  <div>
                    <p className="text-foreground">{isPrivate ? 'Private Room' : 'Public Room'}</p>
                    <p className="text-muted-foreground text-sm">
                      {isPrivate ? 'Only invited players can join' : 'Anyone can discover and join'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                    isPrivate ? 'bg-brand-blue' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      isPrivate ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-foreground mb-2">Room Name *</label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Enter room name"
                    required
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>

                <div>
                  <label className="block text-foreground mb-2">Room Type *</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  >
                    {roomTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-foreground mb-2">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  >
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-foreground mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your trade room..."
                    rows={3}
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 resize-none"
                  />
                </div>
              </div>

              {/* Room Settings */}
              <div className="bg-muted/20 border border-border rounded-xl p-4">
                <h3 className="text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-blue" />
                  Room Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground mb-2">Max Players</label>
                    <input
                      type="number"
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                      min="2"
                      max="200"
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>

                  <div>
                    <label className="block text-foreground mb-2">Starting Balance</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        value={startingBalance}
                        onChange={(e) => setStartingBalance(parseInt(e.target.value))}
                        min="1000"
                        step="1000"
                        className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Settings */}
              <div className="bg-muted/20 border border-border rounded-xl p-4">
                <h3 className="text-foreground mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" />
                  Financial Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground mb-2">Entry Fee</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        value={entryFee}
                        onChange={(e) => setEntryFee(parseInt(e.target.value))}
                        min="0"
                        step="10"
                        className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-foreground mb-2">Reward Stars</label>
                    <div className="relative">
                      <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        value={rewardStars}
                        onChange={(e) => setRewardStars(parseInt(e.target.value))}
                        min="0"
                        step="100"
                        className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-start gap-2 p-3 bg-brand-blue/10 border border-brand-blue/30 rounded-lg">
                  <Info className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                  <p className="text-brand-blue text-sm">
                    Players earn reward stars based on their performance and ranking in this room
                  </p>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-muted/20 border border-border rounded-xl p-4">
                <h3 className="text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-purple" />
                  Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground mb-2">Start Date *</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>

                  <div>
                    <label className="block text-foreground mb-2">End Date *</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>
              </div>

              {/* Allow Player Invites - Only show if private */}
              {isPrivate && (
                <div className="bg-muted/20 border border-border rounded-xl p-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-foreground">Allow Player Invites</p>
                      <p className="text-muted-foreground text-sm">Let participants invite their friends</p>
                    </div>
                    <button
                      onClick={() => setAllowInvites(!allowInvites)}
                      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                        allowInvites ? 'bg-brand-blue' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          allowInvites ? 'translate-x-8' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search Players */}
              <div>
                <label className="block text-foreground mb-2">Search Players</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or username..."
                    className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
              </div>

              {/* Selected Players */}
              {selectedPlayers.length > 0 && (
                <div>
                  <h3 className="text-foreground mb-3">Invited Players ({selectedPlayers.length})</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedPlayers.map(player => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-brand-blue/10 border border-brand-blue/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <img
                            src={player.avatar}
                            alt={player.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-foreground">{player.name}</p>
                            <p className="text-muted-foreground text-sm">{player.username}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemovePlayer(player.id)}
                          className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Players */}
              <div>
                <h3 className="text-foreground mb-3">Available Players</h3>
                {filteredPlayers.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredPlayers.map(player => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-lg hover:bg-muted/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <img
                            src={player.avatar}
                            alt={player.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-foreground">{player.name}</p>
                            <p className="text-muted-foreground text-sm">{player.username}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span>Rank #{player.rank}</span>
                              <span>•</span>
                              <span className="text-success">{player.winRate}% Win Rate</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddPlayer(player)}
                          className="p-2 gradient-primary text-white rounded-lg transition-all hover:shadow-lg"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    {searchQuery ? 'No players found' : 'All players have been invited'}
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-2 p-4 bg-brand-purple/10 border border-brand-purple/30 rounded-xl">
                <Info className="w-5 h-5 text-brand-purple flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-brand-purple">Invitation Information</p>
                  <p className="text-brand-purple/80 text-sm mt-1">
                    Invited players will receive a notification and can accept or decline to join your trade room. 
                    You can also skip this step and invite players later.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-border bg-muted/10">
          <div className="flex flex-col sm:flex-row gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-4 sm:px-6 py-3 bg-muted hover:bg-border text-foreground rounded-xl transition-colors text-sm sm:text-base order-3 sm:order-1"
              >
                Back
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-muted hover:bg-border text-foreground rounded-xl transition-colors text-sm sm:text-base order-2"
            >
              Cancel
            </button>
            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                disabled={!canProceed}
                className={`flex-1 py-3 rounded-xl transition-all text-sm sm:text-base order-1 sm:order-3 ${
                  canProceed
                    ? 'gradient-primary text-white hover:shadow-lg'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                <span className="hidden sm:inline">Next: Invite Players</span>
                <span className="sm:hidden">Next</span>
              </button>
            ) : (
              <button
                onClick={handleCreate}
                className="flex-1 py-3 gradient-success text-white rounded-xl hover:shadow-lg transition-all text-sm sm:text-base order-1 sm:order-3"
              >
                <span className="hidden sm:inline">
                  Create Room {selectedPlayers.length > 0 && `& Invite ${selectedPlayers.length}`}
                </span>
                <span className="sm:hidden">
                  Create{selectedPlayers.length > 0 && ` (${selectedPlayers.length})`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}