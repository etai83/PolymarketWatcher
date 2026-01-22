
import React, { useState, useEffect } from 'react';
import { AISettings, AIProvider } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSave: (settings: AISettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AISettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl transform transition-all">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Analysis Configuration
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Provider</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setLocalSettings({ ...localSettings, provider: 'gemini' })}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                  localSettings.provider === 'gemini'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <div className="font-bold mb-1">Gemini API</div>
                <div className="text-xs opacity-70">Google Cloud</div>
              </button>
              <button
                onClick={() => setLocalSettings({ ...localSettings, provider: 'ollama' })}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                  localSettings.provider === 'ollama'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <div className="font-bold mb-1">Ollama</div>
                <div className="text-xs opacity-70">Local / Self-hosted</div>
              </button>
            </div>
          </div>

          {localSettings.provider === 'gemini' && (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">API Key</label>
                <input
                  type="password"
                  value={localSettings.geminiApiKey}
                  onChange={(e) => setLocalSettings({ ...localSettings, geminiApiKey: e.target.value })}
                  placeholder="Enter your Gemini API Key"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500">
                  Your key is used for this session and not stored on any server.
                </p>
              </div>
            </div>
          )}

          {localSettings.provider === 'ollama' && (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model Name</label>
                <input
                  type="text"
                  value={localSettings.ollamaModel}
                  onChange={(e) => setLocalSettings({ ...localSettings, ollamaModel: e.target.value })}
                  placeholder="e.g. llama3, mistral, deepseek-r1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ollama Endpoint</label>
                <input
                  type="text"
                  value={localSettings.ollamaUrl}
                  onChange={(e) => setLocalSettings({ ...localSettings, ollamaUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500">
                  Note: Ensure your Ollama instance allows CORS if running from a browser (OLLAMA_ORIGINS="*").
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
