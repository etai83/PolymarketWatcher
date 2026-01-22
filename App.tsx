
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SettingsModal } from './components/SettingsModal';
import { FileUploader } from './components/FileUploader';
import { Trade, AISettings } from './types';
import { fetchWalletTradesOnMarket, processCsvData, testMarketConnection, testWalletConnection, fetchUserActiveMarkets } from './utils/dataProcessor';

const App: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [marketQuery, setMarketQuery] = useState<string>('');
  const [userMarkets, setUserMarkets] = useState<{ id: string; title: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [errors, setErrors] = useState<{ wallet?: string; market?: string }>({});
  const [connectionStatus, setConnectionStatus] = useState<{
    market: 'idle' | 'testing' | 'connected' | 'failed';
    wallet: 'idle' | 'testing' | 'connected' | 'failed'
  }>({ market: 'idle', wallet: 'idle' });
  const [walletTestLoading, setWalletTestLoading] = useState(false);
  const [walletTestMarkets, setWalletTestMarkets] = useState<{ id: string; title: string }[] | null>(null);
  const [walletTestUsername, setWalletTestUsername] = useState<string | undefined>(undefined);
  const [walletTestProfileImage, setWalletTestProfileImage] = useState<string | undefined>(undefined);
  const [selectedMarketConditionId, setSelectedMarketConditionId] = useState<string | null>(null);

  // Settings State
  const [aiSettings, setAiSettings] = useState<AISettings>({
    provider: 'gemini',
    ollamaModel: 'llama3',
    ollamaUrl: 'http://localhost:11434',
    geminiApiKey: ''
  });

  const validateInputs = (): boolean => {
    const newErrors: { wallet?: string; market?: string } = {};
    let isValid = true;

    if (!marketQuery.trim()) {
      newErrors.market = "Target Market is required.";
      isValid = false;
    } else if (marketQuery.length < 3) {
      newErrors.market = "Market name must be at least 3 characters.";
      isValid = false;
    }

    // Strict Ethereum address validation
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletAddress.trim()) {
      newErrors.wallet = "Wallet address is required.";
      isValid = false;
    } else if (!walletRegex.test(walletAddress)) {
      newErrors.wallet = "Invalid Ethereum address. Must start with '0x' followed by 40 hex characters.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleTestWallet = async () => {
    // Basic validation for wallet existence before testing
    if (!walletAddress.trim()) {
      setErrors(prev => ({ ...prev, wallet: "Wallet address is required for testing." }));
      return;
    }

    setWalletTestLoading(true);
    setWalletTestMarkets(null);
    setWalletTestUsername(undefined);
    setWalletTestProfileImage(undefined);
    // Clear previous wallet errors
    setErrors(prev => ({ ...prev, wallet: undefined }));

    try {
      const result = await fetchUserActiveMarkets(walletAddress);
      setWalletTestMarkets(result.markets);
      setWalletTestUsername(result.username);
      setWalletTestProfileImage(result.profileImage);
    } catch (e) {
      console.error(e);
      setErrors(prev => ({ ...prev, wallet: "Connection test failed." }));
    } finally {
      setWalletTestLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!validateInputs()) return;

    setIsAnalyzing(true);
    setHasSearched(true);
    setConnectionStatus({ market: 'testing', wallet: 'testing' });

    try {
      // 1. Test Connections
      // If we have a conditionId (selected from verified markets), market is already validated
      const [isMarketConnected, isWalletConnected] = await Promise.all([
        selectedMarketConditionId ? Promise.resolve(true) : testMarketConnection(marketQuery),
        testWalletConnection(walletAddress)
      ]);

      setConnectionStatus({
        market: isMarketConnected ? 'connected' : 'failed',
        wallet: isWalletConnected ? 'connected' : 'failed'
      });

      if (!isMarketConnected || !isWalletConnected) {
        // Keep analyzing true for a moment so user sees the failure, then maybe stop?
        // Or just show the failure state in the dashboard area.
        // Let's keep isAnalyzing true but show the error state in the render.
        return;
      }

      // 2. Fetch Trades if connections are good
      // Pass conditionId directly if available (for closed/expired markets not in search)
      const scrapedTrades = await fetchWalletTradesOnMarket(walletAddress, marketQuery, selectedMarketConditionId || undefined);
      setTrades(scrapedTrades);

      // 3. Fetch User Active Markets
      const activeMarketsResult = await fetchUserActiveMarkets(walletAddress);
      setUserMarkets(activeMarketsResult.markets);

      setIsSimulated(false);
      setIsAnalyzing(false); // Done analyzing
    } catch (error) {
      console.error("Failed to fetch trades", error);
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const parsedTrades = processCsvData(text);
        if (parsedTrades.length > 0) {
          setTrades(parsedTrades);
          // Try to infer context from the first trade
          setMarketQuery(parsedTrades[0].market);
          setWalletAddress('Scraped Data');
          setIsSimulated(false); // Real data
          setHasSearched(true);
        }
      }
      setIsAnalyzing(false);
    };
    reader.readAsText(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  // Clear error when user types
  const handleMarketChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarketQuery(e.target.value);
    if (errors.market) setErrors(prev => ({ ...prev, market: undefined }));
    // Clear pre-selected conditionId since user is typing manually
    if (selectedMarketConditionId) setSelectedMarketConditionId(null);
  };

  const handleWalletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value);
    if (errors.wallet) setErrors(prev => ({ ...prev, wallet: undefined }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      <Header onOpenSettings={() => setShowSettings(true)} />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={aiSettings}
        onSave={setAiSettings}
      />

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

              <div className="space-y-6 mt-8">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Target Market</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className={`h-5 w-5 ${errors.market ? 'text-rose-500' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className={`w-full bg-slate-950 border text-white text-sm rounded-lg focus:ring-2 block w-full pl-11 p-4 placeholder-slate-600 transition-all ${errors.market
                        ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
                        : 'border-slate-800 focus:ring-emerald-500 focus:border-emerald-500'
                        }`}
                      placeholder="e.g. Will Trump win the 2024 Election?"
                      value={marketQuery}
                      onChange={handleMarketChange}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  {errors.market && <p className="text-xs text-rose-500 ml-1">{errors.market}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Wallet Address</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className={`h-5 w-5 ${errors.wallet ? 'text-rose-500' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        className={`w-full bg-slate-950 border text-white text-sm rounded-lg focus:ring-2 block w-full pl-11 p-4 placeholder-slate-600 font-mono transition-all ${errors.wallet
                          ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
                          : 'border-slate-800 focus:ring-emerald-500 focus:border-emerald-500'
                          }`}
                        placeholder="0x..."
                        value={walletAddress}
                        onChange={handleWalletChange}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    <button
                      onClick={handleTestWallet}
                      disabled={walletTestLoading || !walletAddress}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                    >
                      {walletTestLoading ? (
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Test"
                      )}
                    </button>
                  </div>
                  {walletTestMarkets && (
                    <div className="mt-2 p-3 bg-slate-900 border border-slate-800 rounded-lg animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {walletTestProfileImage ? (
                            <img src={walletTestProfileImage} alt="Profile" className="w-8 h-8 rounded-full border border-slate-700" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Verified
                              </span>
                            </div>
                            <p className="text-sm font-bold text-white leading-none mt-0.5">{walletTestUsername || "Unknown User"}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 bg-slate-950/50 px-2 py-1 rounded border border-slate-800/50">{walletTestMarkets.length} Active Markets</span>
                      </div>

                      <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {walletTestMarkets.map(m => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setMarketQuery(m.title);
                              setSelectedMarketConditionId(m.id);
                              setErrors(prev => ({ ...prev, market: undefined }));
                            }}
                            className={`text-[10px] font-mono truncate px-2 py-1.5 rounded border cursor-pointer transition-all ${selectedMarketConditionId === m.id
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                              : 'bg-slate-950/50 border-slate-800/50 text-slate-400 hover:bg-slate-800/50 hover:border-slate-700 hover:text-slate-300'
                              }`}
                            title={`Click to select: ${m.title}`}
                          >
                            {selectedMarketConditionId === m.id && <span className="mr-1">✓</span>}
                            {m.title}
                          </div>
                        ))}
                        {walletTestMarkets.length === 0 && <p className="text-xs text-slate-500 italic">No recent activity found.</p>}
                      </div>
                      {walletTestMarkets.length > 0 && <p className="text-[10px] text-slate-500 mt-2 text-center">Click a market to select it</p>}
                    </div>
                  )}
                  {errors.wallet && <p className="text-xs text-rose-500 ml-1">{errors.wallet}</p>}
                </div>

                <button
                  onClick={handleAnalyze}
                  className="w-full text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:ring-4 focus:ring-emerald-800 font-medium rounded-lg text-sm px-5 py-4 text-center shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                >
                  Scrape & Analyze Trades
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-slate-900 text-xs text-slate-500">OR</span>
                  </div>
                </div>

                <FileUploader onUpload={handleFileUpload} />
              </div>
            </div>

            <div className="mt-12 flex items-center space-x-8 text-slate-600 text-sm font-medium">
              <span className="flex items-center"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>Live Scraper</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Deep Analytics</span>
              <span className="flex items-center"><span className={`w-2 h-2 rounded-full mr-2 ${aiSettings.provider === 'ollama' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>{aiSettings.provider === 'ollama' ? 'Local AI' : 'Gemini 2.0 Flash'}</span>
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
                <div className="mt-1 flex items-center gap-3">
                  <p className="text-slate-400 font-mono text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Watching: {walletAddress}
                  </p>
                  {isSimulated ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wide">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      Simulated Data
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Real On-Chain
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setHasSearched(false); setTrades([]); setErrors({}); setMarketQuery(''); setWalletAddress(''); setSelectedMarketConditionId(null); setWalletTestMarkets(null); }}
                className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 hover:border-slate-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                New Search
              </button>
            </div>
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <div className="space-y-4 w-full max-w-md">

                  {/* Connection Steps */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Market Connection</span>
                      {connectionStatus.market === 'testing' && <span className="text-xs text-blue-400 animate-pulse">Checking...</span>}
                      {connectionStatus.market === 'connected' && <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Connected</span>}
                      {connectionStatus.market === 'failed' && <span className="text-xs text-rose-500 font-bold flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Not Found</span>}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Wallet Connection</span>
                      {connectionStatus.wallet === 'testing' && <span className="text-xs text-blue-400 animate-pulse">Checking...</span>}
                      {connectionStatus.wallet === 'connected' && <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Connected</span>}
                      {connectionStatus.wallet === 'failed' && <span className="text-xs text-rose-500 font-bold flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Failed</span>}
                    </div>
                  </div>

                  {(connectionStatus.market === 'failed' || connectionStatus.wallet === 'failed') && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded text-xs text-center">
                      Connection failed. Please check your inputs and try again.
                      <button
                        onClick={() => { setIsAnalyzing(false); setHasSearched(false); }}
                        className="block mx-auto mt-2 text-white bg-rose-600 hover:bg-rose-500 px-3 py-1 rounded transition-colors"
                      >
                        Go Back
                      </button>
                    </div>
                  )}

                  {connectionStatus.market === 'connected' && connectionStatus.wallet === 'connected' && (
                    <p className="text-slate-400 text-sm text-center animate-pulse">Scanning the blockchain for whale activity...</p>
                  )}
                </div>
              </div>
            ) : (
              <Dashboard trades={trades} isAnalyzing={isAnalyzing} aiSettings={aiSettings} userMarkets={userMarkets} />
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-sm">
            Polymarket Whale Watcher &copy; 2024 • Powered by {aiSettings.provider === 'gemini' ? 'Gemini AI' : 'Ollama'} • <span className="text-slate-500">Not financial advice</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
