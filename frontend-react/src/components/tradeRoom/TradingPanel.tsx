import { useState } from 'react';
import { Loader } from 'lucide-react';
import { usePlaceOrder } from '@/hooks/useBullPenOrders';
import { useMarketData } from '@/hooks/useMarketData';
import { formatCurrency } from '@/utils/formatting';

interface TradingPanelProps {
  bullPenId: number;
}

export default function TradingPanel({ bullPenId }: TradingPanelProps) {
  const [symbol, setSymbol] = useState('');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [type, setType] = useState<'market' | 'limit'>('market');
  const [qty, setQty] = useState('');
  const [limitPrice, setLimitPrice] = useState('');

  const { data: marketData, isLoading: priceLoading } = useMarketData(symbol || undefined);
  const { mutate: placeOrder, isPending } = usePlaceOrder(bullPenId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!symbol || !qty) {
      alert('Please fill in all required fields');
      return;
    }

    const orderData = {
      symbol: symbol.toUpperCase(),
      side,
      type,
      qty: Number(qty),
      ...(type === 'limit' && limitPrice && { limitPrice: Number(limitPrice) }),
    };

    placeOrder(orderData, {
      onSuccess: () => {
        setSymbol('');
        setQty('');
        setLimitPrice('');
        setSide('buy');
        setType('market');
      },
    });
  };

  const currentPrice = marketData?.price || 0;
  const estimatedTotal = Number(qty) * currentPrice;

  return (
    <div className="card-base p-6 max-w-md">
      <h2 className="text-2xl font-bold text-white mb-6">Place Order</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Symbol */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Symbol *
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., AAPL"
            className="w-full px-3 py-2 bg-background border border-white/10 rounded-md text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* Current Price */}
        {symbol && (
          <div className="p-3 bg-background border border-white/10 rounded-md">
            <div className="text-sm text-muted-foreground">Current Price</div>
            <div className="text-2xl font-bold text-white">
              {priceLoading ? (
                <Loader className="w-6 h-6 animate-spin" />
              ) : (
                formatCurrency(currentPrice)
              )}
            </div>
          </div>
        )}

        {/* Side */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Side *
          </label>
          <div className="flex gap-2">
            {(['buy', 'sell'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={`flex-1 px-3 py-2 rounded-md font-medium transition-colors ${
                  side === s
                    ? s === 'buy'
                      ? 'bg-success text-white'
                      : 'bg-destructive text-white'
                    : 'bg-card border border-white/10 text-foreground hover:bg-card/80'
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Order Type *
          </label>
          <div className="flex gap-2">
            {(['market', 'limit'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 px-3 py-2 rounded-md font-medium transition-colors ${
                  type === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-white/10 text-foreground hover:bg-card/80'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Quantity *
          </label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="0"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 bg-background border border-white/10 rounded-md text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* Limit Price */}
        {type === 'limit' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Limit Price *
            </label>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 bg-background border border-white/10 rounded-md text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
        )}

        {/* Estimated Total */}
        {qty && currentPrice > 0 && (
          <div className="p-3 bg-background border border-white/10 rounded-md">
            <div className="text-sm text-muted-foreground">Estimated Total</div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(estimatedTotal)}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || !symbol || !qty}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
        >
          {isPending && <Loader className="w-4 h-4 animate-spin" />}
          Place Order
        </button>
      </form>
    </div>
  );
}

