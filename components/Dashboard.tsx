
import React, { useMemo } from 'react';
import { Trade } from '../types';
import { TradeCharts } from './TradeCharts';
import { TradeTable } from './TradeTable';
import { AIAnalysis } from './AIAnalysis';
import { calculateStats } from '../utils/dataProcessor';

interface DashboardProps {
  trades: Trade[];
  isAnalyzing: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ trades, isAnalyzing }) => {
  const stats = useMemo(() => calculateStats(trades), [trades]);

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <p className="text-slate-400 animate-pulse">Scanning the blockchain for whale activity...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Trading Performance</h1>
        <div className="flex space-x-2">
           <button 
             onClick={() => window.print()}
             className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm flex items-center transition-all"
           >
             <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
             Export PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Trades" 
          value={stats.totalTrades.toLocaleString()} 
          icon={<svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth={2}/></svg>}
        />
        <StatCard 
          label="Total Volume" 
          value={`$${stats.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          icon={<svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2}/></svg>}
        />
        <StatCard 
          label="Net PnL" 
          value={`$${stats.pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} 
          isPositive={stats.pnl >= 0}
          icon={<svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeWidth={2}/></svg>}
        />
        <StatCard 
          label="Win Rate" 
          value={`${(stats.winRate * 100).toFixed(1)}%`} 
          icon={<svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2}/></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Portfolio Growth</h3>
            <TradeCharts trades={trades} />
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
            <TradeTable trades={trades} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <AIAnalysis trades={trades} />
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; isPositive?: boolean; icon: React.ReactNode }> = ({ label, value, isPositive, icon }) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center space-x-4 shadow-sm">
    <div className="bg-slate-800/50 p-3 rounded-lg">{icon}</div>
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`text-xl font-bold ${isPositive === undefined ? 'text-white' : isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {value}
      </p>
    </div>
  </div>
);
