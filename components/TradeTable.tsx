
import React from 'react';
import { Trade } from '../types';

interface TradeTableProps {
  trades: Trade[];
}

export const TradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="py-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
            <th className="py-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Market</th>
            <th className="py-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Side</th>
            <th className="py-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
            <th className="py-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Price</th>
            <th className="py-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {trades.map((trade) => (
            <tr key={trade.id} className="hover:bg-slate-800/40 transition-colors group">
              <td className="py-4 px-2 text-sm text-slate-400 mono">
                {new Date(trade.timestamp).toLocaleDateString()}
              </td>
              <td className="py-4 px-2 text-sm font-medium text-white max-w-[200px] truncate">
                {trade.market}
              </td>
              <td className="py-4 px-2 text-sm">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  trade.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {trade.side}
                </span>
              </td>
              <td className="py-4 px-2 text-sm text-slate-300">
                {trade.size.toLocaleString()}
              </td>
              <td className="py-4 px-2 text-sm text-slate-300 text-right mono">
                ${trade.price.toFixed(3)}
              </td>
              <td className="py-4 px-2 text-sm text-white font-medium text-right mono">
                ${trade.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
