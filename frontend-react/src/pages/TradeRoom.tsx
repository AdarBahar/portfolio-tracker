import { Link } from 'react-router-dom';
import { Users, Trophy, Clock } from 'lucide-react';

export default function TradeRoom() {
  const bullPens = [
    {
      id: 1,
      name: 'Tech Titans Tournament',
      status: 'active',
      participants: 24,
      startingCash: 100000,
      timeRemaining: '5 days',
    },
    {
      id: 2,
      name: 'Crypto Traders Challenge',
      status: 'active',
      participants: 18,
      startingCash: 50000,
      timeRemaining: '3 days',
    },
    {
      id: 3,
      name: 'Dividend Hunters',
      status: 'scheduled',
      participants: 12,
      startingCash: 75000,
      timeRemaining: 'Starts in 2 days',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Fantasy Broker</h1>
            <nav className="flex gap-4">
              <Link to="/dashboard" className="text-foreground hover:text-primary">
                Dashboard
              </Link>
              <Link to="/trade-room" className="text-foreground hover:text-primary">
                Trade Room
              </Link>
              <Link to="/admin" className="text-foreground hover:text-primary">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Trade Rooms</h2>
            <button className="btn-primary">Create New Room</button>
          </div>
          <p className="text-muted-foreground">
            Join trading tournaments and compete with other traders in real-time
          </p>
        </div>

        {/* Bull Pens Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bullPens.map((bullpen) => (
            <div key={bullpen.id} className="card-base p-6 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white mb-2">{bullpen.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${
                  bullpen.status === 'active' 
                    ? 'bg-success/20 text-success' 
                    : 'bg-warning/20 text-warning'
                }`}>
                  {bullpen.status.charAt(0).toUpperCase() + bullpen.status.slice(1)}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{bullpen.participants} participants</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Trophy className="w-4 h-4" />
                  <span>${bullpen.startingCash.toLocaleString()} starting cash</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{bullpen.timeRemaining}</span>
                </div>
              </div>

              <button className="w-full btn-primary">Join Tournament</button>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 card-base p-6">
          <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-primary font-semibold mb-2">1. Create or Join</p>
              <p className="text-muted-foreground">Create a new tournament or join an existing one with an invite code</p>
            </div>
            <div>
              <p className="text-primary font-semibold mb-2">2. Trade</p>
              <p className="text-muted-foreground">Execute trades with virtual currency and build your portfolio</p>
            </div>
            <div>
              <p className="text-primary font-semibold mb-2">3. Compete</p>
              <p className="text-muted-foreground">Climb the leaderboard and win prizes based on your performance</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

