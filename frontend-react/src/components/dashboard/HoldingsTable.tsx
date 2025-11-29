import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Trash2, Edit2, Info } from 'lucide-react';
import type { Holding } from '@/utils/calculations';
import { calculateHoldingMetrics } from '@/utils/calculations';
import { formatCurrency, formatPercent } from '@/utils/formatting';

interface HoldingsTableProps {
  holdings: Holding[];
}

type SortKey = keyof Holding | 'currentValue' | 'gainLoss' | 'gainLossPercent';
type SortOrder = 'asc' | 'desc';

export default function HoldingsTable({ holdings }: HoldingsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('ticker');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  const sectors = useMemo(() => {
    const unique = new Set(holdings.map((h) => h.sector));
    return Array.from(unique).sort();
  }, [holdings]);

  const filteredAndSorted = useMemo(() => {
    let filtered = holdings.filter((holding) => {
      const matchesSearch =
        holding.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        holding.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = selectedSector === 'all' || holding.sector === selectedSector;
      return matchesSearch && matchesSector;
    });

    return filtered.sort((a, b) => {
      let aVal: any = a[sortKey as keyof Holding];
      let bVal: any = b[sortKey as keyof Holding];

      // Handle computed values
      if (sortKey === 'currentValue' || sortKey === 'gainLoss' || sortKey === 'gainLossPercent') {
        const aMetrics = calculateHoldingMetrics(a);
        const bMetrics = calculateHoldingMetrics(b);

        if (sortKey === 'currentValue') {
          aVal = aMetrics.currentValue;
          bVal = bMetrics.currentValue;
        } else if (sortKey === 'gainLoss') {
          aVal = aMetrics.gainLoss;
          bVal = bMetrics.gainLoss;
        } else if (sortKey === 'gainLossPercent') {
          aVal = aMetrics.gainLossPercent;
          bVal = bMetrics.gainLossPercent;
        }
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [holdings, searchTerm, selectedSector, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <div className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ticker or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedSector('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              selectedSector === 'all'
                ? 'bg-primary text-white'
                : 'bg-slate-700 text-muted-foreground hover:text-white'
            }`}
          >
            All
          </button>
          {sectors.map((sector) => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedSector === sector
                  ? 'bg-primary text-white'
                  : 'bg-slate-700 text-muted-foreground hover:text-white'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                <button
                  onClick={() => handleSort('ticker')}
                  className="flex items-center gap-2 hover:text-white transition"
                >
                  Ticker
                  <SortIcon column="ticker" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 hover:text-white transition"
                >
                  Company
                  <SortIcon column="name" />
                </button>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Shares</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Purchase Price</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Current Price</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Current Value</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Gain/Loss</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">%</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Sector</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((holding) => {
              const metrics = calculateHoldingMetrics(holding);
              const gainLossClass = metrics.gainLoss >= 0 ? 'text-green-500' : 'text-red-500';

              return (
                <tr key={holding.id} className="border-b border-white/10 hover:bg-slate-700/50 transition">
                  <td className="px-4 py-3 font-semibold text-white">{holding.ticker}</td>
                  <td className="px-4 py-3 text-muted-foreground">{holding.name}</td>
                  <td className="px-4 py-3 text-right text-white">{Number(holding.shares).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-white">{formatCurrency(Number(holding.purchase_price))}</td>
                  <td className="px-4 py-3 text-right text-white">{formatCurrency(Number(holding.current_price))}</td>
                  <td className="px-4 py-3 text-right text-white font-semibold">{formatCurrency(metrics.currentValue)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${gainLossClass}`}>
                    {formatCurrency(metrics.gainLoss)}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${gainLossClass}`}>
                    {formatPercent(metrics.gainLossPercent)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{holding.sector}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 hover:bg-slate-600 rounded transition" title="Info">
                        <Info className="w-4 h-4 text-muted-foreground hover:text-white" />
                      </button>
                      <button className="p-1 hover:bg-slate-600 rounded transition" title="Edit">
                        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-white" />
                      </button>
                      <button className="p-1 hover:bg-slate-600 rounded transition" title="Delete">
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No holdings found</p>
        </div>
      )}
    </div>
  );
}

