
import React, { useState } from 'react';
import { Trade, AISettings } from '../types';
import { runAnalysis } from '../services/geminiService';

interface AIAnalysisProps {
  trades: Trade[];
  aiSettings: AISettings;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ trades, aiSettings }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await runAnalysis(trades, aiSettings);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setAnalysis(`Failed to perform AI analysis using ${aiSettings.provider}. Please check your configuration.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm sticky top-24">
      <div className="flex items-center space-x-2 mb-4">
        <div className={`w-2 h-2 rounded-full animate-pulse ${aiSettings.provider === 'ollama' ? 'bg-blue-500' : aiSettings.provider === 'opencode' ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
        <h3 className="text-lg font-semibold text-white">
          {aiSettings.provider === 'ollama' ? 'Local AI Strategy' : aiSettings.provider === 'opencode' ? 'OpenCode Strategy' : 'Gemini Strategy Journal'}
        </h3>
      </div>

      <p className="text-slate-400 text-sm mb-6">
        Generate deep insights into this trader's behavior using {aiSettings.provider === 'ollama' ? aiSettings.ollamaModel : aiSettings.provider === 'opencode' ? (aiSettings.opencodeModel || 'OpenCode Zen') : 'Gemini 2.0 Flash'}.
      </p>

      {analysis ? (
        <div className="space-y-4">
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-lg border border-slate-800">
            {analysis.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setAnalysis(null)}
              className="text-xs text-slate-500 hover:text-white transition-colors"
            >
              Clear and start over
            </button>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(analysis);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                  console.error('Failed to copy:', err);
                }
              }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-800"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`w-full text-white font-medium py-3 rounded-lg flex items-center justify-center transition-all ${loading
            ? 'bg-slate-800 text-slate-500'
            : aiSettings.provider === 'ollama'
              ? 'bg-blue-600 hover:bg-blue-500'
              : aiSettings.provider === 'opencode'
                ? 'bg-orange-600 hover:bg-orange-500'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
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
