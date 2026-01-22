
import React, { useState, useEffect } from 'react';
import { AISettings } from '../types';

interface OpenCodeModel {
  id: string;
  name?: string;
  description?: string;
}

interface OpenCodeSettingsProps {
  localSettings: AISettings;
  setLocalSettings: React.Dispatch<React.SetStateAction<AISettings>>;
}

const OpenCodeSettings: React.FC<OpenCodeSettingsProps> = ({ localSettings, setLocalSettings }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [models, setModels] = useState<OpenCodeModel[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = async () => {
    if (!localSettings.opencodeApiKey) {
      setError('Please enter an API key');
      return;
    }

    setIsConnecting(true);
    setError(null);
    setModels(null);

    try {
      const response = await fetch('https://opencode.ai/zen/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localSettings.opencodeApiKey}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your key and try again.');
        }
        throw new Error(`Connection failed: ${response.statusText}`);
      }

      const data = await response.json();
      // Handle different possible response formats
      const modelList: OpenCodeModel[] = Array.isArray(data)
        ? data
        : data.data
          ? data.data
          : data.models
            ? data.models
            : [];

      if (modelList.length === 0) {
        throw new Error('No models available. Please check your account.');
      }

      setModels(modelList);
      setIsConnected(true);

      // Auto-select first model if none selected
      if (!localSettings.opencodeModel && modelList.length > 0) {
        setLocalSettings({ ...localSettings, opencodeModel: modelList[0].id });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">API Key</label>
        <div className="flex gap-2">
          <input
            type="password"
            value={localSettings.opencodeApiKey}
            onChange={(e) => {
              setLocalSettings({ ...localSettings, opencodeApiKey: e.target.value });
              setIsConnected(false);
              setModels(null);
            }}
            placeholder="Enter your OpenCode Zen API Key"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
          <button
            onClick={handleConnect}
            disabled={isConnecting || !localSettings.opencodeApiKey}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 min-w-[90px] justify-center"
          >
            {isConnecting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isConnected ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Connected
              </>
            ) : (
              'Connect'
            )}
          </button>
        </div>
        <p className="text-[10px] text-slate-500">
          Get your API key from <a href="https://opencode.ai/auth" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">opencode.ai/auth</a>
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs animate-in fade-in">
          {error}
        </div>
      )}

      {isConnected && models && models.length > 0 && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Model</label>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {models.length} models available
            </span>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setLocalSettings({ ...localSettings, opencodeModel: model.id })}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-sm ${localSettings.opencodeModel === model.id
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                  : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-300'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{model.name || model.id}</span>
                  {localSettings.opencodeModel === model.id && (
                    <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {model.description && (
                  <span className="text-[10px] text-slate-500 block mt-0.5">{model.description}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isConnected && !error && (
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 text-xs text-center">
          Enter your API key and click <strong>Connect</strong> to see available models
        </div>
      )}
    </div>
  );
};

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
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setLocalSettings({ ...localSettings, provider: 'gemini' })}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${localSettings.provider === 'gemini'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
              >
                <div className="font-bold mb-1 text-sm">Gemini</div>
                <div className="text-[10px] opacity-70">Google Cloud</div>
              </button>
              <button
                onClick={() => setLocalSettings({ ...localSettings, provider: 'ollama' })}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${localSettings.provider === 'ollama'
                  ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
              >
                <div className="font-bold mb-1 text-sm">Ollama</div>
                <div className="text-[10px] opacity-70">Local / Self-hosted</div>
              </button>
              <button
                onClick={() => setLocalSettings({ ...localSettings, provider: 'opencode' })}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${localSettings.provider === 'opencode'
                  ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
              >
                <div className="font-bold mb-1 text-sm">OpenCode</div>
                <div className="text-[10px] opacity-70">Zen Models</div>
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

          {localSettings.provider === 'opencode' && (
            <OpenCodeSettings
              localSettings={localSettings}
              setLocalSettings={setLocalSettings}
            />
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
