
import React, { useState } from 'react';
import { Trade } from '../types';
import { runAnalysis } from '../services/geminiService';

interface AIAnalysisProps {
  trades: Trade[];
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ trades }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await runAnalysis(trades);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setAnalysis("Failed to perform AI analysis. Please check your API key configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm sticky top-24">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <h3 className="text-lg font-semibold text-white">AI Strategy Journal</h3>
      </div>
      
      <p className="text-slate-400 text-sm mb-6">
        Generate deep insights into this trader's behavior. Did they sell too early? What is their most effective niche?
      </p>

      {analysis ? (
        <div className="space-y-4">
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-lg border border-slate-800">
            {analysis.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
          <button 
            onClick={() => setAnalysis(null)}
            className="text-xs text-slate-500 hover:text-white transition-colors"
          >
            Clear and start over
          </button>
        </div>
      ) : (
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium py-3 rounded-lg flex items-center justify-center transition-all"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Thinking...
            </>
          ) : (
            'Generate Strategy Insight'
          )}
        </button>
      )}

      <div className="mt-8 border-t border-slate-800 pt-6">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Prompt Suggestions</h4>
        <div className="space-y-2">
          {['What is their win rate?', 'Did they sell too early?', 'Analyze risk management'].map(p => (
            <button 
              key={p}
              onClick={handleAnalyze}
              className="block w-full text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              "{p}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
