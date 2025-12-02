import { useState, useEffect } from 'react';
import { X, Search, TrendingUp, TrendingDown, DollarSign, Info, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import { StockInfoModal } from './StockInfoModal';

interface BuyAssetsModalProps {
  onClose: () => void;
  cashAvailable: number;
}

interface Asset {
  symbol: string;
  name: string;
  type: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  dayHigh: number;
  dayLow: number;
  description: string;
}

export function BuyAssetsModal({ onClose, cashAvailable }: BuyAssetsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [selectedStockForInfo, setSelectedStockForInfo] = useState<Asset | null>(null);

  // Mock assets
  const allAssets: Asset[] = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'Stock',
      currentPrice: 185.20,
      change: 3.45,
      changePercent: 1.90,
      volume: '52.3M',
      marketCap: '$2.89T',
      dayHigh: 186.50,
      dayLow: 183.20,
      description: 'Technology company that designs and manufactures consumer electronics and software.'
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      type: 'Stock',
      currentPrice: 148.90,
      change: 2.15,
      changePercent: 1.47,
      volume: '28.7M',
      marketCap: '$1.87T',
      dayHigh: 149.80,
      dayLow: 147.30,
      description: 'Multinational technology company specializing in Internet services and products.'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      type: 'Stock',
      currentPrice: 368.75,
      change: -1.25,
      changePercent: -0.34,
      volume: '21.4M',
      marketCap: '$2.74T',
      dayHigh: 371.20,
      dayLow: 367.50,
      description: 'Technology corporation that develops computer software and consumer electronics.'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      type: 'Stock',
      currentPrice: 258.30,
      change: 12.80,
      changePercent: 5.21,
      volume: '145.2M',
      marketCap: '$820B',
      dayHigh: 260.40,
      dayLow: 252.10,
      description: 'Electric vehicle and clean energy company.'
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      type: 'Stock',
      currentPrice: 498.60,
      change: 8.90,
      changePercent: 1.82,
      volume: '42.1M',
      marketCap: '$1.23T',
      dayHigh: 502.30,
      dayLow: 495.20,
      description: 'Technology company that designs graphics processing units for gaming and professional markets.'
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      type: 'Stock',
      currentPrice: 178.45,
      change: 2.35,
      changePercent: 1.33,
      volume: '38.6M',
      marketCap: '$1.85T',
      dayHigh: 179.80,
      dayLow: 176.90,
      description: 'E-commerce and cloud computing company.'
    },
    {
      symbol: 'META',
      name: 'Meta Platforms Inc.',
      type: 'Stock',
      currentPrice: 485.30,
      change: 6.75,
      changePercent: 1.41,
      volume: '15.8M',
      marketCap: '$1.24T',
      dayHigh: 488.20,
      dayLow: 481.50,
      description: 'Social media and technology conglomerate.'
    },
    {
      symbol: 'BTC-USD',
      name: 'Bitcoin',
      type: 'Cryptocurrency',
      currentPrice: 42350.00,
      change: 1250.00,
      changePercent: 3.04,
      volume: '$28.5B',
      marketCap: '$830B',
      dayHigh: 42850.00,
      dayLow: 41200.00,
      description: 'Decentralized digital currency without a central bank or single administrator.'
    },
    {
      symbol: 'ETH-USD',
      name: 'Ethereum',
      type: 'Cryptocurrency',
      currentPrice: 2240.50,
      change: 85.30,
      changePercent: 3.96,
      volume: '$15.2B',
      marketCap: '$269B',
      dayHigh: 2265.00,
      dayLow: 2180.00,
      description: 'Decentralized platform for smart contracts and decentralized applications.'
    }
  ];

  const filteredAssets = allAssets.filter(asset =>
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCost = selectedAsset ? selectedAsset.currentPrice * quantity : 0;
  const estimatedFees = totalCost * 0.001; // 0.1% fee
  const totalWithFees = totalCost + estimatedFees;
  const remainingCash = cashAvailable - totalWithFees;
  const canAfford = remainingCash >= 0;

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setSearchQuery(asset.symbol);
    setShowSuggestions(false);
    setLimitPrice(asset.currentPrice.toFixed(2));
  };

  const handleBuy = () => {
    if (!selectedAsset || !canAfford) return;
    console.log('Buying:', { asset: selectedAsset, quantity, orderType, totalWithFees });
    onClose();
  };

  useEffect(() => {
    if (searchQuery && !selectedAsset) {
      setShowSuggestions(true);
    }
  }, [searchQuery, selectedAsset]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl gradient-card rounded-2xl border border-border shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-foreground mb-1">Buy Assets</h2>
            <p className="text-muted-foreground text-sm">Select an asset and enter quantity</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Search */}
            <div>
              <label className="block text-foreground mb-2">Search Asset</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by symbol or name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedAsset(null);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredAssets.length > 0 && !selectedAsset && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl max-h-80 overflow-y-auto z-10">
                    {filteredAssets.map((asset) => (
                      <button
                        key={asset.symbol}
                        onClick={() => handleSelectAsset(asset)}
                        className="w-full p-4 hover:bg-muted/50 transition-colors text-left border-b border-border last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <span className="text-foreground">{asset.symbol}</span>
                            <span className="text-muted-foreground text-sm ml-2">{asset.name}</span>
                          </div>
                          <span className="text-xs px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded">
                            {asset.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-foreground">${asset.currentPrice.toLocaleString()}</span>
                          <span className={asset.changePercent >= 0 ? 'text-success' : 'text-danger'}>
                            {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Asset Details */}
            {selectedAsset && (
              <>
                {/* Asset Info Card */}
                <div className="bg-muted/20 border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-foreground">{selectedAsset.symbol}</h3>
                        <span className="text-xs px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded">
                          {selectedAsset.type}
                        </span>
                        <button
                          onClick={() => setSelectedStockForInfo(selectedAsset)}
                          className="p-1 text-brand-purple hover:bg-brand-purple/10 rounded transition-colors ml-auto"
                          title="Learn about this asset"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-muted-foreground text-sm">{selectedAsset.name}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-foreground text-xl">${selectedAsset.currentPrice.toLocaleString()}</p>
                      <div className={`flex items-center justify-end gap-1 text-sm ${selectedAsset.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                        {selectedAsset.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{selectedAsset.changePercent >= 0 ? '+' : ''}{selectedAsset.change.toFixed(2)} ({selectedAsset.changePercent.toFixed(2)}%)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-3">{selectedAsset.description}</p>

                  {/* Market Stats */}
                  <div className="grid grid-cols-4 gap-3 pt-3 border-t border-border">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Volume</p>
                      <p className="text-foreground text-sm">{selectedAsset.volume}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Market Cap</p>
                      <p className="text-foreground text-sm">{selectedAsset.marketCap}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Day High</p>
                      <p className="text-foreground text-sm">${selectedAsset.dayHigh}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Day Low</p>
                      <p className="text-foreground text-sm">${selectedAsset.dayLow}</p>
                    </div>
                  </div>
                </div>

                {/* Order Type */}
                <div>
                  <label className="block text-foreground mb-2">Order Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setOrderType('market')}
                      className={`p-3 rounded-xl border transition-all ${
                        orderType === 'market'
                          ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                          : 'border-border bg-muted/20 text-muted-foreground hover:border-brand-blue/50'
                      }`}
                    >
                      <p className="mb-1">Market Order</p>
                      <p className="text-xs opacity-70">Execute at current price</p>
                    </button>
                    <button
                      onClick={() => setOrderType('limit')}
                      className={`p-3 rounded-xl border transition-all ${
                        orderType === 'limit'
                          ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                          : 'border-border bg-muted/20 text-muted-foreground hover:border-brand-blue/50'
                      }`}
                    >
                      <p className="mb-1">Limit Order</p>
                      <p className="text-xs opacity-70">Set your own price</p>
                    </button>
                  </div>
                </div>

                {/* Limit Price */}
                {orderType === 'limit' && (
                  <div>
                    <label className="block text-foreground mb-2">Limit Price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-foreground mb-2">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                      Max affordable: {Math.floor(cashAvailable / selectedAsset.currentPrice)} shares
                    </p>
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Fees (0.1%)</span>
                    <span className="text-foreground">${estimatedFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-foreground">Total Cost</span>
                      <span className="text-foreground text-xl">${totalWithFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Remaining Cash</span>
                      <span className={canAfford ? 'text-success' : 'text-danger'}>
                        ${remainingCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warning/Success Message */}
                {!canAfford && (
                  <div className="flex items-start gap-2 p-3 bg-danger/10 border border-danger/30 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-danger">Insufficient Funds</p>
                      <p className="text-danger/80 text-sm">You need ${Math.abs(remainingCash).toLocaleString()} more to complete this purchase.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/10">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-muted hover:bg-border text-foreground rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBuy}
              disabled={!selectedAsset || !canAfford}
              className={`flex-1 py-3 rounded-xl transition-all ${
                selectedAsset && canAfford
                  ? 'gradient-success text-white hover:shadow-lg'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {!selectedAsset ? 'Select an Asset' : !canAfford ? 'Insufficient Funds' : `Buy ${quantity} ${quantity === 1 ? 'Share' : 'Shares'}`}
            </button>
          </div>
        </div>
      </div>

      {/* Stock Info Modal */}
      {selectedStockForInfo && (
        <StockInfoModal 
          onClose={() => setSelectedStockForInfo(null)}
          asset={selectedStockForInfo}
        />
      )}
    </div>
  );
}