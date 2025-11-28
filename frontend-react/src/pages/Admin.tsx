import { Link } from 'react-router-dom';
import { Users, Settings, BarChart3, Gift } from 'lucide-react';

export default function Admin() {
  const adminSections = [
    {
      id: 1,
      title: 'User Management',
      description: 'Manage users, view details, and handle account issues',
      icon: Users,
      color: 'text-primary',
    },
    {
      id: 2,
      title: 'Rake Configuration',
      description: 'Configure rake fees and collection settings',
      icon: Settings,
      color: 'text-warning',
    },
    {
      id: 3,
      title: 'Analytics',
      description: 'View platform statistics and performance metrics',
      icon: BarChart3,
      color: 'text-success',
    },
    {
      id: 4,
      title: 'Promotions',
      description: 'Create and manage promotional codes and bonuses',
      icon: Gift,
      color: 'text-brand-purple',
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
          <h2 className="text-2xl font-bold text-white mb-2">Admin Panel</h2>
          <p className="text-muted-foreground">
            Manage platform settings, users, and promotions
          </p>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} className="card-base p-6 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-start gap-4 mb-4">
                  <Icon className={`w-8 h-8 ${section.color}`} />
                  <div>
                    <h3 className="text-xl font-semibold text-white">{section.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{section.description}</p>
                  </div>
                </div>
                <button className="btn-secondary w-full">Access →</button>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="card-base p-6 mb-12">
          <h3 className="text-xl font-semibold text-white mb-6">Platform Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-background/50 p-4 rounded-lg">
              <p className="text-muted-foreground text-sm mb-2">Total Users</p>
              <p className="text-2xl font-bold text-white">1,234</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg">
              <p className="text-muted-foreground text-sm mb-2">Active Rooms</p>
              <p className="text-2xl font-bold text-success">42</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg">
              <p className="text-muted-foreground text-sm mb-2">Total Rake Collected</p>
              <p className="text-2xl font-bold text-warning">$45,678.90</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg">
              <p className="text-muted-foreground text-sm mb-2">Active Promotions</p>
              <p className="text-2xl font-bold text-primary">8</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-base p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <p className="text-foreground">User john@example.com joined</p>
              <p className="text-muted-foreground text-sm">2 hours ago</p>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <p className="text-foreground">Room "Tech Titans" completed</p>
              <p className="text-muted-foreground text-sm">5 hours ago</p>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <p className="text-foreground">Promotion code "WELCOME100" created</p>
              <p className="text-muted-foreground text-sm">1 day ago</p>
            </div>
            <div className="flex items-center justify-between py-3">
              <p className="text-foreground">Rake configuration updated</p>
              <p className="text-muted-foreground text-sm">2 days ago</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

