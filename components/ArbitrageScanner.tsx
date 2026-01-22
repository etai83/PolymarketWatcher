import React, { useState } from 'react';
import { scanForArbitrageOpportunities, getAllMarketsWithPrices, ArbitrageOpportunity } from '../utils/arbitrageScanner';

interface ArbitrageScannerProps {
    autoScan?: boolean;
}

export const ArbitrageScanner: React.FC<ArbitrageScannerProps> = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[] | null>(null);
    const [threshold, setThreshold] = useState(0.995);
    const [showAllMarkets, setShowAllMarkets] = useState(false);
    const [allMarkets, setAllMarkets] = useState<ArbitrageOpportunity[]>([]);

    const handleScan = async () => {
        setIsScanning(true);
        try {
            if (showAllMarkets) {
                const results = await getAllMarketsWithPrices();
                setAllMarkets(results);
                setOpportunities([]);
            } else {
                const results = await scanForArbitrageOpportunities(threshold);
                setOpportunities(results);
            }
        } catch (error) {
            console.error('Scan failed:', error);
            setOpportunities([]);
        } finally {
            setIsScanning(false);
        }
    };

    const displayData = showAllMarkets ? allMarkets : (opportunities || []);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Arbitrage Scanner
                </h3>
            </div>

            <div className="mb-4 space-y-3">
                {/* Mode Toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => { setShowAllMarkets(false); setOpportunities(null); }}
                        className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all ${!showAllMarkets
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                    >
                        Find Opportunities
                    </button>
                    <button
                        onClick={() => { setShowAllMarkets(true); setAllMarkets([]); }}
                        className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all ${showAllMarkets
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                    >
                        Show All Markets
                    </button>
                </div>

                {/* Threshold slider - only show for opportunities mode */}
                {!showAllMarkets && (
                    <div>
                        <label className="text-xs text-slate-500 mb-1 block">Threshold (YES + NO must sum below this)</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="range"
                                min="0.90"
                                max="1.00"
                                step="0.005"
                                value={threshold}
                                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                className="flex-1 accent-emerald-500"
                            />
                            <span className="text-xs text-slate-400 w-14">${threshold.toFixed(3)}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-1">
                            Profit if below: ${(1 - threshold).toFixed(3)}/share ({((1 - threshold) * 100).toFixed(2)}%)
                        </p>
                    </div>
                )}
            </div>

            <button
                onClick={handleScan}
                disabled={isScanning}
                className="w-full text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 focus:ring-4 focus:ring-amber-800 font-medium rounded-lg text-sm px-4 py-2.5 text-center shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
                {isScanning ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Scanning Markets...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {showAllMarkets ? 'Load All Markets' : 'Scan for Opportunities'}
                    </>
                )}
            </button>

            {(opportunities !== null || allMarkets.length > 0) && (
                <div className="mt-4">
                    {displayData.length === 0 ? (
                        <div className="text-center py-6 text-slate-500">
                            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs">No arbitrage opportunities found</p>
                            <p className="text-[10px] mt-1 text-slate-600">Markets are correctly priced (YES + NO = $1.00)</p>
                            <p className="text-[10px] mt-1">Try "Show All Markets" to see current prices</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-semibold ${showAllMarkets ? 'text-blue-400' : 'text-emerald-400'}`}>
                                    {displayData.length} Market{displayData.length === 1 ? '' : 's'}
                                </span>
                                {showAllMarkets && (
                                    <span className="text-[10px] text-slate-500">Sorted by sum (lowest first)</span>
                                )}
                            </div>
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                                {displayData.map((opp, idx) => {
                                    const isOpportunity = opp.combinedCost < 1;
                                    return (
                                        <a
                                            key={idx}
                                            href={opp.marketUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`block p-3 rounded-lg border transition-all group ${isOpportunity
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60'
                                                    : 'bg-slate-800/50 border-slate-800 hover:border-slate-600'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <p className="text-xs text-slate-300 group-hover:text-white transition-colors line-clamp-2 flex-1">
                                                    {opp.question}
                                                </p>
                                                <svg className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 text-[10px]">
                                                <div>
                                                    <span className="text-slate-500">YES</span>
                                                    <p className="text-emerald-400 font-mono">${opp.yesPrice.toFixed(3)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">NO</span>
                                                    <p className="text-rose-400 font-mono">${opp.noPrice.toFixed(3)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Sum</span>
                                                    <p className={`font-mono ${opp.combinedCost < 1 ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                                                        ${opp.combinedCost.toFixed(3)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Edge</span>
                                                    <p className={`font-mono ${opp.potentialProfit > 0 ? 'text-emerald-400 font-bold' : opp.potentialProfit < 0 ? 'text-rose-400' : 'text-slate-500'
                                                        }`}>
                                                        {opp.potentialProfit >= 0 ? '+' : ''}{(opp.potentialProfit * 100).toFixed(2)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 text-center">
                                Click a market to view on Polymarket
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
