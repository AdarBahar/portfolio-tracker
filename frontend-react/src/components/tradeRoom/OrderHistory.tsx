import { useState } from 'react';
import { Loader, ChevronDown } from 'lucide-react';
import { useOrders } from '@/hooks/useBullPenOrders';
import { formatCurrency } from '@/utils/formatting';

interface OrderHistoryProps {
  bullPenId: number;
  limit?: number;
}

interface Order {
  id: number;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  qty: number;
  price: number;
  executedPrice?: number;
  status: 'pending' | 'executed' | 'cancelled';
  placedAt: string;
  executedAt?: string;
  pnl?: number;
}

export default function OrderHistory({ bullPenId }: OrderHistoryProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [filterSide, setFilterSide] = useState<'all' | 'buy' | 'sell'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'executed' | 'cancelled'>('all');

  const { data: orders = [], isLoading } = useOrders(bullPenId, false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter((order: Order) => {
    if (filterSide !== 'all' && order.side !== filterSide) return false;
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;
    return true;
  });

  if (filteredOrders.length === 0) {
    return (
      <div className="card-base p-12 text-center">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1">
          {(['all', 'buy', 'sell'] as const).map(side => (
            <button
              key={side}
              onClick={() => setFilterSide(side)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filterSide === side
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white/10 text-muted-foreground hover:bg-white/20'
              }`}
            >
              {side === 'all' ? 'All' : side.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          {(['all', 'pending', 'executed', 'cancelled'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filterStatus === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white/10 text-muted-foreground hover:bg-white/20'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-2">
        {filteredOrders.map((order: Order) => {
          const isExpanded = expandedOrderId === order.id;
          const statusColor = order.status === 'executed' ? 'text-success' : order.status === 'cancelled' ? 'text-destructive' : 'text-warning';
          const sideColor = order.side === 'buy' ? 'text-success' : 'text-destructive';

          return (
            <div key={order.id} className="card-base overflow-hidden">
              <button
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-foreground">{order.symbol}</span>
                    <span className={`text-sm font-medium ${sideColor}`}>{order.side.toUpperCase()}</span>
                    <span className={`text-sm font-medium ${statusColor}`}>{order.status}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.qty} @ {formatCurrency(order.price)} • {new Date(order.placedAt).toLocaleTimeString()}
                  </div>
                </div>

                <div className="text-right mr-2">
                  <div className="font-semibold text-foreground">{formatCurrency(order.qty * order.price)}</div>
                  {order.pnl !== undefined && (
                    <div className={`text-sm ${order.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {order.pnl >= 0 ? '+' : ''}{formatCurrency(order.pnl)}
                    </div>
                  )}
                </div>

                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-white/10 p-4 bg-white/5">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Order Type</p>
                      <p className="text-foreground font-medium">{order.type.toUpperCase()}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Quantity</p>
                      <p className="text-foreground font-medium">{order.qty}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Placed At</p>
                      <p className="text-foreground font-medium">{new Date(order.placedAt).toLocaleString()}</p>
                    </div>

                    {order.executedAt && (
                      <div>
                        <p className="text-muted-foreground mb-1">Executed At</p>
                        <p className="text-foreground font-medium">{new Date(order.executedAt).toLocaleString()}</p>
                      </div>
                    )}

                    {order.executedPrice && (
                      <div>
                        <p className="text-muted-foreground mb-1">Executed Price</p>
                        <p className="text-foreground font-medium">{formatCurrency(order.executedPrice)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

