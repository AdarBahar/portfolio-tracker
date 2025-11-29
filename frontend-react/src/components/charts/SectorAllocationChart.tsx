import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import type { SectorData } from '@/utils/chartCalculations';
import { formatCurrency } from '@/utils/formatting';

interface SectorAllocationChartProps {
  data: SectorData[];
  isLoading?: boolean;
}

export default function SectorAllocationChart({ data, isLoading }: SectorAllocationChartProps) {
  if (isLoading) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-background/50 rounded-lg">
        <div className="text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-background/50 rounded-lg">
        <div className="text-muted-foreground">No data available</div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-white/20 rounded p-2 shadow-lg">
          <p className="text-foreground text-sm font-semibold">{data.name}</p>
          <p className="text-success text-sm">{formatCurrency(data.value)}</p>
          <p className="text-muted-foreground text-xs">
            {((data.value / data.total) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <div style={{ width: '100%', height: '320px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithTotal}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }: any) => {
              const total = dataWithTotal.reduce((sum, item) => sum + item.value, 0);
              return `${name}: ${((value / total) * 100).toFixed(0)}%`;
            }}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {dataWithTotal.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

