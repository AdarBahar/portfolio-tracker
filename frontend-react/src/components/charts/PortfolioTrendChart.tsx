import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PortfolioTrendData } from '@/utils/chartCalculations';
import { formatCurrency } from '@/utils/formatting';

interface PortfolioTrendChartProps {
  data: PortfolioTrendData[];
  isLoading?: boolean;
}

export default function PortfolioTrendChart({ data, isLoading }: PortfolioTrendChartProps) {
  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-background/50 rounded-lg">
        <div className="text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-background/50 rounded-lg">
        <div className="text-muted-foreground">No data available</div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-white/20 rounded p-2 shadow-lg">
          <p className="text-muted-foreground text-xs">{payload[0].payload.date}</p>
          <p className="text-foreground text-sm font-semibold">
            {formatCurrency(payload[0].value)}
          </p>
          {payload[0].payload.gain_loss !== undefined && (
            <p className={payload[0].payload.gain_loss >= 0 ? 'text-success text-sm' : 'text-danger text-sm'}>
              {payload[0].payload.gain_loss >= 0 ? '+' : ''}{formatCurrency(payload[0].payload.gain_loss)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis 
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3B82F6" 
            dot={false}
            strokeWidth={2}
            name="Portfolio Value"
          />
          {data.some(d => d.gain_loss !== undefined) && (
            <Line 
              type="monotone" 
              dataKey="gain_loss" 
              stroke="#10B981" 
              dot={false}
              strokeWidth={2}
              name="Gain/Loss"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

