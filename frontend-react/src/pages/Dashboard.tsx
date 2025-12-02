import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Download, Plus } from 'lucide-react';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { formatCurrency, formatPercent, getGainLossClass } from '@/utils/formatting';
import { calculateSectorAllocation, calculateAssetClassAllocation, calculatePerformanceByHolding } from '@/utils/chartCalculations';
import { PageLayout, PageHeader } from '@/components/layout';
import AnimatedButton from '@/components/ui/AnimatedButton';
import MetricCard from '@/components/dashboard/MetricCard';
import HoldingsTable from '@/components/dashboard/HoldingsTable';
import AddPositionModal from '@/components/dashboard/AddPositionModal';
import SectorAllocationChart from '@/components/charts/SectorAllocationChart';
import AssetClassChart from '@/components/charts/AssetClassChart';
import PerformanceChart from '@/components/charts/PerformanceChart';
import ProfileHeaderContainer from '@/components/header/ProfileHeaderContainer';

export default function Dashboard() {
  const { holdings, metrics, isLoading, error } = usePortfolioData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [notifications, setNotifications] = useState<any[]>([]);
  const [addPositionButtonState, setAddPositionButtonState] = useState<'idle' | 'loading' | 'success'>('idle');

  // Update lastUpdated whenever data changes (not just on mount)
  useEffect(() => {
    if (!isLoading && holdings.length > 0) {
      setLastUpdated(new Date());
    }
  }, [holdings, isLoading]);

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Log error details for debugging (in development only)
    if (import.meta.env.DEV) {
      console.error('Portfolio loading error:', error);
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Unable to load portfolio</p>
          <p className="text-muted-foreground text-sm">
            We encountered an issue loading your portfolio data. Please try refreshing the page or contact support if the problem persists.
          </p>
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
    <PageLayout
      notifications={notifications}
      onMarkNotificationRead={handleMarkNotificationRead}
      onClearNotifications={handleClearNotifications}
    >
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <PageHeader
          title="Fantasy Broker"
          description={`Last updated: ${lastUpdated.toLocaleTimeString()}`}
          action={
            <AnimatedButton
              onClick={() => {
                setAddPositionButtonState('loading');
                setTimeout(() => {
                  setShowAddModal(true);
                  setAddPositionButtonState('idle');
                }, 300);
              }}
              state={addPositionButtonState}
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              loadingText="Opening..."
              successText="Opened!"
              className="w-full sm:w-fit"
            >
              Add Position
            </AnimatedButton>
          }
        />
        {/* Profile Header Section */}
        <div className="mb-8">
          <ProfileHeaderContainer
            onJoinRoom={() => console.log('Join room clicked')}
            onCreateRoom={() => console.log('Create room clicked')}
          />
        </div>

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

        {/* Charts Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Portfolio Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-card backdrop-blur border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Sector Allocation</h3>
              <SectorAllocationChart
                data={calculateSectorAllocation(holdings)}
                isLoading={isLoading}
              />
            </div>
            <div className="bg-card backdrop-blur border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Asset Class Allocation</h3>
              <AssetClassChart
                data={calculateAssetClassAllocation(holdings)}
                isLoading={isLoading}
              />
            </div>
          </div>
          <div className="bg-card backdrop-blur border border-border rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Performance by Holding</h3>
            <PerformanceChart
              data={calculatePerformanceByHolding(holdings)}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Holdings Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Holdings ({holdings.length})</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          <HoldingsTable holdings={holdings} />
        </div>
      </main>

      {/* Add Position Modal */}
      {showAddModal && <AddPositionModal onClose={() => setShowAddModal(false)} />}
    </PageLayout>
  );
}

