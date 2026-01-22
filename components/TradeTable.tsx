
import React from 'react';
import { Trade } from '../types';

interface TradeTableProps {
  trades: Trade[];
}

export const TradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  return (
    <div className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
      <table className="w-full text-left border-collapse relative">
        <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm shadow-black/20">
          <tr className="border-b border-slate-800">
            <th className="py-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-900">Date</th>
            <th className="py-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-900">Market</th>
            <th className="py-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-900">Side</th>
            <th className="py-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-900">Size (Shares)</th>
            <th className="py-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right bg-slate-900">Price</th>
            <th className="py-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right bg-slate-900">Total ($)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {trades.map((trade) => (
            <tr key={trade.id} className="hover:bg-slate-800/40 transition-colors group">
              <td className="py-3 px-2 text-sm text-slate-400 mono whitespace-nowrap">
                {new Date(trade.timestamp).toLocaleDateString()} <span className="text-xs text-slate-600">{new Date(trade.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </td>
              <td className="py-3 px-2 text-sm font-medium text-white max-w-[200px] truncate">
                {trade.market}
              </td>
              <td className="py-3 px-2 text-sm">
                <span className={`px-2 py-1 rounded text-xs font-bold border ${
                  trade.side === 'BUY' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {trade.side}
                </span>
              </td>
              <td className="py-3 px-2 text-sm text-slate-300">
                {trade.size.toLocaleString()}
              </td>
              <td className="py-3 px-2 text-sm text-slate-300 text-right mono">
                ${trade.price.toFixed(3)}
              </td>
              <td className="py-3 px-2 text-sm text-white font-medium text-right mono">
                ${trade.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {trades.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          No trades found.
        </div>
      )}
    </div>
  );
};
