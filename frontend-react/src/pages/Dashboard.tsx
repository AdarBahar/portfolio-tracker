import { Link } from 'react-router-dom';
import { TrendingUp, Zap, Settings } from 'lucide-react';

export default function Dashboard() {
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
          <h2 className="text-2xl font-bold text-white mb-6">Welcome to React Migration Test</h2>
          <p className="text-muted-foreground mb-8">
            This is a feasibility test for the React migration. All components and frameworks are working correctly.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="card-base p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-success" />
              <div>
                <p className="text-muted-foreground text-sm">Portfolio Value</p>
                <p className="text-2xl font-bold text-white">$125,450.00</p>
              </div>
            </div>
          </div>

          <div className="card-base p-6">
            <div className="flex items-center gap-4">
              <Zap className="w-8 h-8 text-warning" />
              <div>
                <p className="text-muted-foreground text-sm">Total Gain/Loss</p>
                <p className="text-2xl font-bold text-success">+$12,450.00</p>
              </div>
            </div>
          </div>

          <div className="card-base p-6">
            <div className="flex items-center gap-4">
              <Settings className="w-8 h-8 text-primary" />
              <div>
                <p className="text-muted-foreground text-sm">Return %</p>
                <p className="text-2xl font-bold text-primary">+11.0%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/trade-room">
            <div className="card-base p-6 hover:border-primary/50 transition-colors cursor-pointer">
              <h3 className="text-xl font-semibold text-white mb-2">Trade Room</h3>
              <p className="text-muted-foreground mb-4">
                Join trading tournaments and compete with other traders
              </p>
              <button className="btn-primary">Enter Trade Room →</button>
            </div>
          </Link>

          <Link to="/admin">
            <div className="card-base p-6 hover:border-primary/50 transition-colors cursor-pointer">
              <h3 className="text-xl font-semibold text-white mb-2">Admin Panel</h3>
              <p className="text-muted-foreground mb-4">
                Manage users, rake configuration, and promotions
              </p>
              <button className="btn-secondary">Go to Admin →</button>
            </div>
          </Link>
        </div>

        {/* Status Section */}
        <div className="mt-12 card-base p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Migration Status</h3>
          <div className="space-y-2">
            <p className="text-foreground">✅ React + Vite configured</p>
            <p className="text-foreground">✅ Tailwind CSS with design tokens</p>
            <p className="text-foreground">✅ React Router setup</p>
            <p className="text-foreground">✅ React Query configured</p>
            <p className="text-foreground">✅ API client ready</p>
            <p className="text-foreground">✅ Sample pages created</p>
          </div>
        </div>
      </main>
    </div>
  );
}

