
import React from 'react';

type TabName = 'dashboard' | 'markets' | 'watchlist';

interface HeaderProps {
  onOpenSettings: () => void;
  currentTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, currentTab, onTabChange }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Whale Watcher</span>
        </div>

        <nav className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`transition-colors ${currentTab === 'dashboard' ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onTabChange('markets')}
              className={`transition-colors ${currentTab === 'markets' ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              Markets
            </button>
            <button
              onClick={() => onTabChange('watchlist')}
              className={`transition-colors ${currentTab === 'watchlist' ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              Watchlist
            </button>
          </div>
          <div className="h-6 w-px bg-slate-800 mx-2 hidden md:block"></div>

          <button
            onClick={onOpenSettings}
            className="text-slate-400 hover:text-emerald-400 transition-colors p-2 hover:bg-slate-800/50 rounded-lg"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
};
