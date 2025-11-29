import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { PerformanceData } from '@/utils/chartCalculations';
import { formatPercent } from '@/utils/formatting';

interface PerformanceChartProps {
  data: PerformanceData[];
  isLoading?: boolean;
}

export default function PerformanceChart({ data, isLoading }: PerformanceChartProps) {
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
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-white/20 rounded p-2 shadow-lg">
          <p className="text-foreground text-sm font-semibold">{data.ticker}</p>
          <p className={data.percent >= 0 ? 'text-success text-sm' : 'text-danger text-sm'}>
            {formatPercent(data.percent)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="ticker" 
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis 
            label={{ value: 'Gain/Loss %', angle: -90, position: 'insideLeft' }}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="percent" fill="#3B82F6" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

