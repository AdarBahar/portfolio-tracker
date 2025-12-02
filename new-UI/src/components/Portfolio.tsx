import { TrendingUp, TrendingDown, DollarSign, Activity, Info } from 'lucide-react';
import { useState } from 'react';
import { BuyAssetsModal } from './BuyAssetsModal';
import { StockInfoModal } from './StockInfoModal';

interface PortfolioProps {
  tradeRoom: any;
}

export function Portfolio({ tradeRoom }: PortfolioProps) {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedStockForInfo, setSelectedStockForInfo] = useState<any>(null);

  const holdings = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 50,
      avgPrice: 178.50,
      currentPrice: 185.20,
      value: 9260,
      change: 3.75,
      changePercent: 3.75,
      logo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=100&fit=crop'
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      shares: 30,
      avgPrice: 142.30,
      currentPrice: 148.90,
      value: 4467,
      change: 4.64,
      changePercent: 4.64,
      logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&h=100&fit=crop'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      shares: 25,
      avgPrice: 372.40,
      currentPrice: 368.75,
      value: 9218.75,
      change: -0.98,
      changePercent: -0.98,
      logo: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=100&h=100&fit=crop'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      shares: 15,
      avgPrice: 245.80,
      currentPrice: 258.30,
      value: 3874.50,
      change: 5.08,
      changePercent: 5.08,
      logo: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=100&h=100&fit=crop'
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      shares: 20,
      avgPrice: 485.20,
      currentPrice: 498.60,
      value: 9972,
      change: 2.76,
      changePercent: 2.76,
      logo: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=100&h=100&fit=crop'
    }
  ];

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
  const cashBalance = tradeRoom.portfolio - totalValue;

  return (
    <>
      <div className="gradient-card backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-border shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="min-w-0">
            <h2 className="text-foreground mb-1 text-lg sm:text-xl">Your Portfolio</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Real-time positions and performance</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-muted-foreground text-xs sm:text-sm">Total Value</p>
            <p className="text-foreground text-xl sm:text-2xl">${tradeRoom.portfolio?.toLocaleString()}</p>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-muted/30 rounded-xl p-3 sm:p-4 border border-border/50">
            <div className="flex items-center gap-1 sm:gap-2 mb-2">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-brand-blue flex-shrink-0" />
              <span className="text-muted-foreground text-xs sm:text-sm truncate">Invested</span>
            </div>
            <p className="text-foreground text-sm sm:text-base truncate">${totalValue.toLocaleString()}</p>
            <p className="text-success text-xs mt-1 truncate">+$892 (2.4%)</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 sm:p-4 border border-border/50">
            <div className="flex items-center gap-1 sm:gap-2 mb-2">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-success flex-shrink-0" />
              <span className="text-muted-foreground text-xs sm:text-sm truncate">Cash</span>
            </div>
            <p className="text-foreground text-sm sm:text-base truncate">${cashBalance.toLocaleString()}</p>
            <p className="text-muted-foreground text-xs mt-1 truncate">Available</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 sm:p-4 border border-border/50">
            <div className="flex items-center gap-1 sm:gap-2 mb-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-brand-purple flex-shrink-0" />
              <span className="text-muted-foreground text-xs sm:text-sm truncate">Day P&L</span>
            </div>
            <p className="text-success text-sm sm:text-base truncate">+$1,245</p>
            <p className="text-success text-xs mt-1 truncate">+5.2%</p>
          </div>
        </div>

        {/* Holdings - Desktop Table View */}
        <div className="hidden lg:block space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground pb-2 border-b border-border">
            <span className="flex-1">Asset</span>
            <span className="w-24 text-right">Shares</span>
            <span className="w-28 text-right">Avg Price</span>
            <span className="w-28 text-right">Value</span>
            <span className="w-24 text-right">Change</span>
            <span className="w-12"></span>
          </div>

          {holdings.map((holding, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors border border-border/30"
            >
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={holding.logo}
                  alt={holding.symbol}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <p className="text-foreground">{holding.symbol}</p>
                  <p className="text-muted-foreground text-sm">{holding.name}</p>
                </div>
              </div>
              <span className="w-24 text-right text-foreground">{holding.shares}</span>
              <span className="w-28 text-right text-foreground">${holding.avgPrice.toFixed(2)}</span>
              <span className="w-28 text-right text-foreground">${holding.value.toLocaleString()}</span>
              <div className="w-24 text-right">
                <div className={`flex items-center justify-end gap-1 ${holding.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                  {holding.changePercent >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm">{Math.abs(holding.changePercent).toFixed(2)}%</span>
                </div>
              </div>
              <div className="w-12 flex justify-end">
                <button
                  onClick={() => setSelectedStockForInfo(holding)}
                  className="p-2 text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                  title="Learn about this stock"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Holdings - Mobile Card View */}
        <div className="lg:hidden space-y-3">
          <div className="text-sm text-muted-foreground pb-2 border-b border-border">
            Holdings
          </div>
          
          {holdings.map((holding, index) => (
            <div
              key={index}
              className="p-3 bg-muted/20 rounded-lg border border-border/30"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={holding.logo}
                  alt={holding.symbol}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate">{holding.symbol}</p>
                  <p className="text-muted-foreground text-xs truncate">{holding.name}</p>
                </div>
                <button
                  onClick={() => setSelectedStockForInfo(holding)}
                  className="p-1.5 text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors flex-shrink-0"
                  title="Learn about this stock"
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className={`flex items-center gap-1 flex-shrink-0 ${holding.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                  {holding.changePercent >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="text-xs">{Math.abs(holding.changePercent).toFixed(2)}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Shares: </span>
                  <span className="text-foreground">{holding.shares}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground">Avg: </span>
                  <span className="text-foreground">${holding.avgPrice.toFixed(2)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Value: </span>
                  <span className="text-foreground">${holding.value.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4 sm:mt-6">
          <button 
            onClick={() => setShowBuyModal(true)}
            className="py-2.5 sm:py-3 gradient-success text-white rounded-lg transition-all hover:shadow-lg text-sm sm:text-base"
          >
            Buy Assets
          </button>
          <button className="py-2.5 sm:py-3 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg transition-all border border-danger text-sm sm:text-base">
            Sell Assets
          </button>
        </div>
      </div>

      {showBuyModal && (
        <BuyAssetsModal 
          onClose={() => setShowBuyModal(false)}
          cashAvailable={cashBalance}
        />
      )}

      {selectedStockForInfo && (
        <StockInfoModal 
          onClose={() => setSelectedStockForInfo(null)}
          asset={selectedStockForInfo}
        />
      )}
    </>
  );
}