
export interface Trade {
  id: string;
  timestamp: string;
  market: string;
  side: 'BUY' | 'SELL';
  size: number;
  price: number;
  total: number;
  outcome: string;
}

export interface DashboardStats {
  totalTrades: number;
  totalVolume: number;
  pnl: number;
  winRate: number;
  averageTradeSize: number;
}

export interface AnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  strategy: string;
}

export type AIProvider = 'gemini' | 'ollama';

export interface AISettings {
  provider: AIProvider;
  ollamaModel: string;
  ollamaUrl: string;
  geminiApiKey: string;
}
