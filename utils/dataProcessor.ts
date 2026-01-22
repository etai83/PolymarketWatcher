
import { Trade, DashboardStats } from '../types';

const SEARCH_URL = "https://gamma-api.polymarket.com/public-search";
const ACTIVITY_URL = "https://data-api.polymarket.com/activity";

interface PolymarketMarket {
  id: string;
  conditionId: string;
  question: string;
  slug: string;
  eventTitle: string;
}

interface ActivityItem {
  id: string;
  timestamp: number;
  type: string;
  side: string;
  size: number;
  price: number;
  usdcSize: number;
  outcome: string;
  transactionHash: string;
  market?: string;
  conditionId?: string;
  // User profile fields that might be present
  name?: string;
  pseudonym?: string;
  profileImage?: string;
}

/**
 * Searches for markets on Polymarket
 */
const searchMarkets = async (query: string): Promise<PolymarketMarket[]> => {
  try {
    const response = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    
    const markets: PolymarketMarket[] = [];
    if (data.events) {
      for (const event of data.events) {
        if (event.markets) {
          for (const market of event.markets) {
            markets.push({
              id: market.id,
              conditionId: market.conditionId,
              question: market.question,
              slug: market.slug,
              eventTitle: event.title
            });
          }
        }
      }
    }
    return markets;
  } catch (error) {
    console.error("Error searching markets:", error);
    return [];
  }
};

/**
 * Fetches activity for a user on a specific market
 */
const fetchActivity = async (wallet: string, conditionId?: string): Promise<ActivityItem[]> => {
  try {
    const params = new URLSearchParams({
      limit: '50',
      sortBy: 'TIMESTAMP',
      sortDirection: 'DESC',
      user: wallet
    });
    
    if (conditionId) {
      params.append('market', conditionId);
    }

    const response = await fetch(`${ACTIVITY_URL}?${params.toString()}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    // Handle different response structures as seen in python script
    let items: ActivityItem[] = [];
    if (Array.isArray(data)) {
        items = data;
    } else if (Array.isArray(data.activity)) {
        items = data.activity;
    } else if (Array.isArray(data.data)) {
        items = data.data;
    } else if (Array.isArray(data.items)) {
        items = data.items;
    } else if (Array.isArray(data.result)) {
        items = data.result;
    }

    return items;
  } catch (error) {
    console.error("Error fetching activity:", error);
    return [];
  }
};

export const testMarketConnection = async (query: string): Promise<boolean> => {
  try {
    const markets = await searchMarkets(query);
    return markets.length > 0;
  } catch (e) {
    return false;
  }
};

export const testWalletConnection = async (wallet: string): Promise<boolean> => {
  try {
    // Attempt to fetch general activity for the user (no specific market)
    // If it returns an array (even empty), the connection is good.
    const activity = await fetchActivity(wallet);
    return Array.isArray(activity);
  } catch (e) {
    return false;
  }
};

export const fetchUserActiveMarkets = async (wallet: string): Promise<{ markets: { id: string, title: string }[], username?: string, profileImage?: string }> => {
  try {
    const activity = await fetchActivity(wallet);
    const marketInfoMap = new Map<string, string>(); // Map of conditionId -> market name
    
    let username: string | undefined;
    let profileImage: string | undefined;

    // First pass: collect market IDs and any available names from activity
    activity.forEach(item => {
      const marketId = item.conditionId || item.market;
      if (marketId) {
        // Store the market name if we have it and don't already have a name for this ID
        // Activity items might include a 'title' or 'marketTitle' or similar field
        const activityItem = item as any;
        const marketName = activityItem.marketTitle || activityItem.marketQuestion || activityItem.title || activityItem.question;
        if (!marketInfoMap.has(marketId)) {
          marketInfoMap.set(marketId, marketName || '');
        } else if (marketName && !marketInfoMap.get(marketId)) {
          // Update if we now have a name but didn't before
          marketInfoMap.set(marketId, marketName);
        }
      }
      // Try to grab user info from any item that has it
      if (!username && (item.name || item.pseudonym)) {
          username = item.name || item.pseudonym;
      }
      if (!profileImage && item.profileImage) {
          profileImage = item.profileImage;
      }
    });

    const idsToFetch = Array.from(marketInfoMap.keys()).slice(0, 10);
    let marketsData: { id: string, title: string }[] = [];

    if (idsToFetch.length > 0) {
      try {
        const response = await fetch(`${SEARCH_URL.replace('/public-search', '/markets')}?condition_id=${idsToFetch.join(',')}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            marketsData = data.map((m: any) => ({
              id: m.conditionId, // Use conditionId as ID for consistency
              title: m.question || m.title || m.marketTitle || 'Unknown Market'
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch market details", err);
      }
      
      // If API fetch failed or returned empty/partial data, use activity-derived names as fallback
      if (marketsData.length === 0) {
        marketsData = idsToFetch.map(id => ({ 
          id, 
          title: marketInfoMap.get(id) || 'Unknown Market'
        }));
      } else {
        // Fill in any missing markets from the API response using activity data
        const fetchedIds = new Set(marketsData.map(m => m.id));
        idsToFetch.forEach(id => {
          if (!fetchedIds.has(id)) {
            marketsData.push({
              id,
              title: marketInfoMap.get(id) || 'Unknown Market'
            });
          }
        });
      }
    }
    
    return {
        markets: marketsData,
        username,
        profileImage
    };
  } catch (error) {
    console.error("Failed to fetch user active markets", error);
    return { markets: [] };
  }
};

/**
 * Fetches real trades from Polymarket for a given wallet and market
 */
export const fetchWalletTradesOnMarket = async (wallet: string, marketQuery: string): Promise<Trade[]> => {
  try {
    // 1. Search for the market
    const markets = await searchMarkets(marketQuery);
    
    if (markets.length === 0) {
      console.warn("No markets found for query:", marketQuery);
      return [];
    }

    // Default to the first result for now
    // In a future update, we could allow the user to select from multiple matches
    const targetMarket = markets[0];
    
    // 2. Fetch activity
    const activities = await fetchActivity(wallet, targetMarket.conditionId);
    
    // 3. Map to Trade objects
    return activities.map(item => {
        const side = item.side ? item.side.toUpperCase() : 'BUY'; // Default/Fallback
        const size = item.size || 0;
        const price = item.price || 0;
        
        return {
            id: item.transactionHash || item.id || Math.random().toString(),
            timestamp: new Date(item.timestamp * 1000).toISOString(),
            market: targetMarket.question,
            side: (side === 'BUY' || side === 'SELL') ? side as 'BUY' | 'SELL' : 'BUY',
            size: size,
            price: price,
            total: item.usdcSize || (size * price),
            outcome: item.outcome || 'Unknown'
        };
    });

  } catch (error) {
    console.error("Failed to fetch wallet trades:", error);
    throw error;
  }
};

/**
 * Parses CSV data generated by scrape_trades.py
 */
export const processCsvData = (csvText: string): Trade[] => {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const getIdx = (name: string) => headers.indexOf(name);
  
  const idxTimestamp = getIdx('timestampIso');
  const idxMarket = getIdx('marketQuestion');
  const idxSide = getIdx('side');
  const idxSize = getIdx('size');
  const idxPrice = getIdx('price');
  const idxUsdc = getIdx('usdcSize');
  const idxOutcome = getIdx('outcome');
  const idxHash = getIdx('transactionHash');

  const trades: Trade[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV parsing with quotes
    const values: string[] = [];
    let currentVal = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentVal);
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal);

    const clean = (val: string | undefined) => val ? val.replace(/^"|"$/g, '').replace(/""/g, '"').trim() : '';

    const timestamp = clean(values[idxTimestamp]);
    if (!timestamp) continue;

    const size = parseFloat(clean(values[idxSize]) || '0');
    const price = parseFloat(clean(values[idxPrice]) || '0');
    const usdc = parseFloat(clean(values[idxUsdc]) || '0');
    const rawSide = clean(values[idxSide]).toUpperCase();
    const side = (rawSide === 'BUY' || rawSide === 'SELL') ? rawSide : 'BUY';

    trades.push({
      id: clean(values[idxHash]) || `csv-${i}`,
      timestamp: timestamp,
      market: clean(values[idxMarket]) || 'Unknown Market',
      side: side,
      size: size,
      price: price,
      total: usdc > 0 ? usdc : (size * price), // Prefer USDC size if available
      outcome: clean(values[idxOutcome]) || 'Unknown'
    });
  }

  return trades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const calculateStats = (trades: Trade[]): DashboardStats => {
  const totalVolume = trades.reduce((sum, t) => sum + t.total, 0);
  const buyVolume = trades.filter(t => t.side === 'BUY').reduce((sum, t) => sum + t.total, 0);
  const sellVolume = trades.filter(t => t.side === 'SELL').reduce((sum, t) => sum + t.total, 0);
  
  // Simple Net Cash Flow (Realized)
  const pnl = sellVolume - buyVolume;

  // Win rate is difficult to calculate without knowing the market outcome or current price for open positions.
  // We'll leave it as a placeholder or based on explicit 'WIN' outcome if available in the future.
  const winningTrades = 0; 

  return {
    totalTrades: trades.length,
    totalVolume,
    pnl,
    winRate: 0, // Placeholder
    averageTradeSize: trades.length > 0 ? totalVolume / trades.length : 0
  };
};
