import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Download, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { formatCurrency, formatPercent, getGainLossClass } from '@/utils/formatting';
import MetricCard from '@/components/dashboard/MetricCard';
import HoldingsTable from '@/components/dashboard/HoldingsTable';
import AddPositionModal from '@/components/dashboard/AddPositionModal';

export default function Dashboard() {
  const { logout } = useAuth();
  const { holdings, metrics, isLoading, error } = usePortfolioData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [lastUpdated] = useState(new Date());

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading portfolio</p>
          <p className="text-muted-foreground text-sm">{String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-800/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Fantasy Broker</h1>
              <p className="text-muted-foreground text-sm">Last updated: {lastUpdated.toLocaleTimeString()}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                Add Position
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Total Portfolio Value"
            value={formatCurrency(metrics.totalValue)}
            icon={<DollarSign className="w-6 h-6" />}
            trend={metrics.totalGainPercent}
          />
          <MetricCard
            label="Total Gain/Loss"
            value={formatCurrency(metrics.totalGain)}
            subtext={formatPercent(metrics.totalGainPercent)}
            icon={metrics.totalGain >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            className={getGainLossClass(metrics.totalGain)}
          />
          <MetricCard
            label="Dividend Income YTD"
            value={formatCurrency(metrics.dividendIncome)}
            icon={<Calendar className="w-6 h-6" />}
          />
          <MetricCard
            label="Today's Change"
            value={formatCurrency(metrics.todayChange)}
            subtext={formatPercent(metrics.todayChangePercent)}
            icon={<TrendingUp className="w-6 h-6" />}
            className={getGainLossClass(metrics.todayChange)}
          />
        </div>

        {/* Holdings Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Holdings ({holdings.length})</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          <HoldingsTable holdings={holdings} />
        </div>
      </main>

      {/* Add Position Modal */}
      {showAddModal && <AddPositionModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

