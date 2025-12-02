import { Trophy, Users, Calendar, TrendingUp, DollarSign, Clock, Star } from 'lucide-react';

interface TradeRoomSummaryProps {
  tradeRoom: any;
}

export function TradeRoomSummary({ tradeRoom }: TradeRoomSummaryProps) {
  const summaryStats = [
    {
      icon: Trophy,
      label: 'Your Position',
      value: `#${tradeRoom.position}`,
      color: 'text-warning'
    },
    {
      icon: DollarSign,
      label: 'Portfolio Value',
      value: `$${tradeRoom.portfolio?.toLocaleString()}`,
      color: 'text-brand-purple'
    },
    {
      icon: TrendingUp,
      label: 'Daily Change',
      value: '+$1,245 (5.2%)',
      color: 'text-success'
    },
    {
      icon: Users,
      label: 'Players',
      value: `${tradeRoom.players}/${tradeRoom.maxPlayers}`,
      color: 'text-brand-blue'
    },
    {
      icon: Star,
      label: 'Reward Stars',
      value: `${tradeRoom.rewardStars?.toLocaleString() || '0'}`,
      color: 'text-warning'
    },
    {
      icon: Calendar,
      label: 'Time Left',
      value: '5 days 14h',
      color: 'text-muted-foreground'
    }
  ];

  return (
    <div className="gradient-card backdrop-blur-sm rounded-2xl p-6 mb-6 border border-border shadow-lg">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-muted/30 rounded-xl p-4 border border-border/50 hover:border-brand-blue/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-muted-foreground text-xs">{stat.label}</span>
              </div>
              <p className={stat.color}>{stat.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}