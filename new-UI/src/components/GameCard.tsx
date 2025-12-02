import { Users, Trophy, Calendar, TrendingUp, DollarSign, Clock, Star, Crown } from 'lucide-react';

interface Game {
  id: number;
  name: string;
  type: string;
  players: number;
  maxPlayers: number;
  rewardStars: number;
  position?: number;
  endDate?: string;
  status?: string;
  portfolio?: number;
  entryFee?: number;
  startDate?: string;
  difficulty?: string;
  isCreator?: boolean;
  timeLeft?: string;
}

interface GameCardProps {
  game: Game;
  isActive: boolean;
  onSelect?: (game: Game) => void;
}

export function GameCard({ game, isActive, onSelect }: GameCardProps) {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-success bg-success/10';
      case 'Intermediate': return 'text-brand-blue bg-brand-blue/10';
      case 'Advanced': return 'text-warning bg-warning/10';
      case 'Expert': return 'text-danger bg-danger/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getPositionColor = (position?: number) => {
    if (!position) return 'text-muted-foreground';
    if (position === 1) return 'text-warning';
    if (position <= 3) return 'text-brand-blue';
    if (position <= 10) return 'text-success';
    return 'text-muted-foreground';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'waiting': return 'bg-warning/10 text-warning';
      case 'active': return 'bg-success/10 text-success';
      case 'ending-soon': return 'bg-danger/10 text-danger';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <div className={`gradient-card backdrop-blur-sm rounded-xl p-4 sm:p-5 border transition-all hover:transform hover:scale-[1.02] hover:shadow-xl ${
      game.isCreator 
        ? 'border-success/50 hover:border-success ring-2 ring-success/20' 
        : 'border-border hover:border-brand-blue/50'
    }`}>
      {/* Creator Badge */}
      {game.isCreator && (
        <div className="flex items-center gap-2 mb-3 px-2 sm:px-3 py-1.5 bg-success/10 border border-success/30 rounded-lg w-fit">
          <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-success flex-shrink-0" />
          <span className="text-success text-xs sm:text-sm">Created by You</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-foreground mb-1 text-base sm:text-lg truncate">{game.name}</h3>
          <p className="text-muted-foreground text-xs sm:text-sm truncate">{game.type}</p>
        </div>
        {game.difficulty && (
          <span className={`px-2 py-1 rounded-lg text-xs flex-shrink-0 ${getDifficultyColor(game.difficulty)}`}>
            {game.difficulty}
          </span>
        )}
        {isActive && game.status === 'ending-soon' && (
          <span className="px-2 py-1 bg-danger/10 text-danger rounded-lg text-xs flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3" />
            <span className="hidden sm:inline">Ending Soon</span>
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Players</span>
          </div>
          <span className="text-foreground">{game.players}/{game.maxPlayers}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="w-4 h-4" />
            <span>Reward Stars</span>
          </div>
          <span className="text-warning flex items-center gap-1">
            <Star className="w-3 h-3 fill-warning" />
            {game.rewardStars.toLocaleString()}
          </span>
        </div>

        {isActive && game.position && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="w-4 h-4" />
              <span>Position</span>
            </div>
            <span className={getPositionColor(game.position)}>#{game.position}</span>
          </div>
        )}

        {isActive && game.portfolio && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Portfolio</span>
            </div>
            <span className="text-brand-purple">${game.portfolio.toLocaleString()}</span>
          </div>
        )}

        {!isActive && game.entryFee && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>Entry Fee</span>
            </div>
            <span className="text-foreground">${game.entryFee}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{isActive ? 'Ends' : 'Starts'}</span>
          </div>
          <span className="text-foreground">
            {new Date(isActive ? game.endDate! : game.startDate!).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-muted/50 rounded-full h-2">
          <div 
            className="gradient-primary h-2 rounded-full transition-all"
            style={{ width: `${(game.players / game.maxPlayers) * 100}%` }}
          />
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => onSelect && onSelect(game)}
        className={`w-full py-2 rounded-lg transition-all hover:shadow-lg text-white ${
          isActive 
            ? 'gradient-primary' 
            : 'bg-success hover:bg-success/90'
        }`}
      >
        {isActive ? 'View Trade Room' : 'Join Trade Room'}
      </button>
    </div>
  );
}