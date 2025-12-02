import { useState } from 'react';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { usePlaceOrder } from '@/hooks/useBullPenOrders';
import { useMarketData } from '@/hooks/useMarketData';
import { formatCurrency } from '@/utils/formatting';

interface TradingPanelProps {
  bullPenId: number;
  availableCash?: number;
}

interface ValidationError {
  field: string;
  message: string;
}

export default function TradingPanel({ bullPenId, availableCash = 0 }: TradingPanelProps) {
  const [symbol, setSymbol] = useState('');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [type, setType] = useState<'market' | 'limit'>('market');
  const [qty, setQty] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const { data: marketData, isLoading: priceLoading } = useMarketData(symbol || undefined);
  const { mutate: placeOrder, isPending } = usePlaceOrder(bullPenId);

  const validateOrder = (): boolean => {
    const newErrors: ValidationError[] = [];

    if (!symbol) newErrors.push({ field: 'symbol', message: 'Symbol is required' });
    if (!qty || Number(qty) <= 0) newErrors.push({ field: 'qty', message: 'Quantity must be greater than 0' });
    if (type === 'limit' && (!limitPrice || Number(limitPrice) <= 0)) {
      newErrors.push({ field: 'limitPrice', message: 'Limit price must be greater than 0' });
    }

    const currentPrice = marketData?.price || 0;
    const estimatedTotal = Number(qty) * (type === 'limit' ? Number(limitPrice) : currentPrice);

    if (side === 'buy' && estimatedTotal > availableCash) {
      newErrors.push({ field: 'qty', message: `Insufficient cash. Need ${formatCurrency(estimatedTotal)}, have ${formatCurrency(availableCash)}` });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateOrder()) return;

    const orderData = {
      symbol: symbol.toUpperCase(),
      side,
      type,
      qty: Number(qty),
      ...(type === 'limit' && limitPrice && { limitPrice: Number(limitPrice) }),
    };

    placeOrder(orderData, {
      onSuccess: () => {
        setSuccessMessage(`Order placed successfully!`);
        setSymbol('');
        setQty('');
        setLimitPrice('');
        setSide('buy');
        setType('market');
        setErrors([]);
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error: any) => {
        setErrors([{ field: 'submit', message: error.message || 'Failed to place order' }]);
      },
    });
  };

  const currentPrice = marketData?.price || 0;
  const estimatedTotal = Number(qty) * currentPrice;

  return (
    <div className="card-base p-6 max-w-md">
      <h2 className="text-2xl font-bold text-white mb-6">Place Order</h2>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-md flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-success" />
          <p className="text-sm text-success">{successMessage}</p>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mb-4 space-y-2">
          {errors.map((error, idx) => (
            <div key={idx} className="p-3 bg-destructive/10 border border-destructive/30 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Available Cash */}
      {availableCash > 0 && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-md">
          <p className="text-xs text-muted-foreground">Available Cash</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(availableCash)}</p>
        </div>
      )}

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

