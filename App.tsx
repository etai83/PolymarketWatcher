
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Trade } from './types';
import { fetchWalletTradesOnMarket } from './utils/dataProcessor';

const App: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [marketQuery, setMarketQuery] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleAnalyze = async () => {
    if (!walletAddress || !marketQuery) return;

    setIsAnalyzing(true);
    setHasSearched(true);
    
    try {
      // Simulate the scraping process
      const scrapedTrades = await fetchWalletTradesOnMarket(walletAddress, marketQuery);
      setTrades(scrapedTrades);
    } catch (error) {
      console.error("Failed to fetch trades", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12 flex flex-col">
        {!hasSearched ? (
          <div className="flex-1 flex flex-col items-center justify-center -mt-20">
            <div className="text-center space-y-6 mb-12 max-w-2xl">
              <div className="inline-flex items-center justify-center p-2 bg-emerald-500/10 rounded-full mb-4 ring-1 ring-emerald-500/30">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest px-3">Polymarket Scraper</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                Whale Watcher <span className="text-emerald-500">Trade Analyzer</span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed">
                Enter a specific market and wallet address to scrape historical trade data, normalize positions, and generate AI-powered strategy insights.
              </p>
            </div>
            
            <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Target Market</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-11 p-4 placeholder-slate-600 transition-all"
                      placeholder="e.g. Will Trump win the 2024 Election?"
                      value={marketQuery}
                      onChange={(e) => setMarketQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Wallet Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-11 p-4 placeholder-slate-600 font-mono transition-all"
                      placeholder="0x..."
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!marketQuery || !walletAddress}
                  className="w-full text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:ring-4 focus:ring-emerald-800 font-medium rounded-lg text-sm px-5 py-4 text-center shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                >
                  Scrape & Analyze Trades
                </button>
              </div>
            </div>
            
            <div className="mt-12 flex items-center space-x-8 text-slate-600 text-sm font-medium">
              <span className="flex items-center"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>Live Scraper</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Deep Analytics</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>Gemini 2.0 Flash</span>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {marketQuery}
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400 font-normal border border-slate-700">Polymarket</span>
                </h2>
                <p className="text-slate-400 font-mono text-sm mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Watching: {walletAddress}
                </p>
              </div>
              <button 
                onClick={() => { setHasSearched(false); setTrades([]); }}
                className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 hover:border-slate-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                New Search
              </button>
            </div>
            <Dashboard trades={trades} isAnalyzing={isAnalyzing} />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-sm">
            Polymarket Whale Watcher &copy; 2024 • Powered by Gemini AI • <span className="text-slate-500">Not financial advice</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
