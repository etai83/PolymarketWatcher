
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

  // Calculate Distribution Histogram
  const distributionData = useMemo(() => {
    const buckets = [
      { name: '<$500', count: 0, fill: '#3b82f6' },      // Blue
      { name: '$500-1k', count: 0, fill: '#60a5fa' },     // Lighter Blue
      { name: '$1k-2k', count: 0, fill: '#8b5cf6' },      // Purple
      { name: '>$2k', count: 0, fill: '#d946ef' },       // Fuchsia
    ];

    trades.forEach(t => {
      if (t.size < 500) buckets[0].count++;
      else if (t.size < 1000) buckets[1].count++;
      else if (t.size < 2000) buckets[2].count++;
      else buckets[3].count++;
    });

    return buckets;
  }, [trades]);

  return (
    <div className="space-y-8">
      <div className="h-[300px] w-full">
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
          <p className="text-xs text-slate-500 mb-2 uppercase font-medium">Trade Size Distribution</p>
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
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 rounded-lg border border-slate-800">
           <p className="text-slate-400 text-sm">Market Breakdown</p>
           <p className="text-white text-3xl font-bold mt-1">12 Markets</p>
           <p className="text-xs text-slate-500 mt-2">Active in Politics, Sports, & Crypto</p>
        </div>
      </div>
    </div>
  );
};
