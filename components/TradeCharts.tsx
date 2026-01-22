
import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Trade } from '../types';

interface TradeChartsProps {
  trades: Trade[];
}

export const TradeCharts: React.FC<TradeChartsProps> = ({ trades }) => {
  // Process trades into a time series for PnL
  const chartData = useMemo(() => {
    return trades.slice().reverse().reduce((acc: any[], trade) => {
      const prevPnL = acc.length > 0 ? acc[acc.length - 1].pnl : 0;
      const currentPnL = trade.side === 'SELL' ? prevPnL + (trade.total * 0.1) : prevPnL - (trade.total * 0.02); // Simplified PnL logic
      acc.push({
        time: new Date(trade.timestamp).toLocaleDateString(),
        pnl: parseFloat(currentPnL.toFixed(2)),
        size: trade.size,
        price: trade.price
      });
      return acc;
    }, []);
  }, [trades]);

  // Calculate Distribution Histogram based on USD Value (Total)
  const distributionData = useMemo(() => {
    const buckets = [
      { name: '<$500', count: 0, fill: '#3b82f6', range: 'Small' },       // Blue
      { name: '$500-$2k', count: 0, fill: '#60a5fa', range: 'Medium' },     // Lighter Blue
      { name: '$2k-$5k', count: 0, fill: '#8b5cf6', range: 'Large' },       // Purple
      { name: '>$5k', count: 0, fill: '#d946ef', range: 'Whale' },         // Fuchsia
    ];

    trades.forEach(t => {
      // Use t.total (USD value) not t.size (Shares)
      if (t.total < 500) buckets[0].count++;
      else if (t.total < 2000) buckets[1].count++;
      else if (t.total < 5000) buckets[2].count++;
      else buckets[3].count++;
    });

    return buckets;
  }, [trades]);

  return (
    <div className="space-y-8">
      <div className="h-[300px] w-full">
        <p className="text-xs text-slate-500 mb-2 uppercase font-medium">Estimated PnL Over Time</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              minTickGap={30}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `$${value}`} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ color: '#10b981' }}
            />
            <Area type="monotone" dataKey="pnl" stroke="#10b981" fillOpacity={1} fill="url(#colorPnL)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[250px]">
        <div className="h-full">
          <p className="text-xs text-slate-500 mb-2 uppercase font-medium">Trade Volume Distribution (USD)</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                allowDecimals={false}
              />
              <Tooltip 
                cursor={{fill: '#1e293b'}} 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                itemStyle={{ color: '#cbd5e1' }}
                formatter={(value: number) => [`${value} Trades`, 'Frequency']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 rounded-lg border border-slate-800 p-6 text-center">
           <p className="text-slate-400 text-sm mb-1">Active Markets</p>
           <p className="text-white text-3xl font-bold">1</p>
           <p className="text-emerald-400 text-xs font-mono mt-1 mb-4">Target Specific</p>
           
           <div className="w-full h-px bg-slate-800 my-2"></div>
           
           <div className="flex justify-between w-full mt-2">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase">Avg Size</p>
                <p className="text-white font-mono text-sm">
                  ${Math.round(trades.reduce((a, b) => a + b.total, 0) / (trades.length || 1)).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase">Largest</p>
                <p className="text-white font-mono text-sm">
                  ${Math.round(Math.max(...trades.map(t => t.total), 0)).toLocaleString()}
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
