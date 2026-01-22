/**
 * Arbitrage Scanner Service
 * Scans Polymarket markets for opportunities where YES + NO prices sum to less than $1.00
 */

const MARKETS_URL = "https://gamma-api.polymarket.com/markets";

export interface ArbitrageOpportunity {
    question: string;
    slug: string;
    yesPrice: number;
    noPrice: number;
    combinedCost: number;
    potentialProfit: number;
    marketUrl: string;
    volume24hr: number;
}

interface MarketData {
    id: string;
    question: string;
    slug: string;
    outcomePrices: string; // JSON array string like '["0.5", "0.5"]'
    outcomes: string; // JSON array string like '["Yes", "No"]'
    active: boolean;
    closed: boolean;
    volume24hr: number;
    liquidityNum: number;
    events?: Array<{ slug: string }>;
}

/**
 * Parse outcome prices from the API response
 * Returns [yesPrice, noPrice] or null if parsing fails
 */
const parseOutcomePrices = (outcomePrices: string, outcomes: string): [number, number] | null => {
    try {
        const prices = JSON.parse(outcomePrices) as string[];
        const outcomeNames = JSON.parse(outcomes) as string[];

        if (prices.length < 2 || outcomeNames.length < 2) {
            return null;
        }

        // Find Yes/No indices - typically Yes is first, No is second
        let yesIndex = outcomeNames.findIndex(o => o.toLowerCase() === 'yes');
        let noIndex = outcomeNames.findIndex(o => o.toLowerCase() === 'no');

        // Default to 0 and 1 if not found
        if (yesIndex === -1) yesIndex = 0;
        if (noIndex === -1) noIndex = 1;

        const yesPrice = parseFloat(prices[yesIndex]);
        const noPrice = parseFloat(prices[noIndex]);

        if (isNaN(yesPrice) || isNaN(noPrice)) {
            return null;
        }

        return [yesPrice, noPrice];
    } catch {
        return null;
    }
};

/**
 * Scan for arbitrage opportunities
 * @param threshold - Maximum combined cost (default 0.995 = 0.5% profit)
 * @returns Array of arbitrage opportunities sorted by profit potential
 */
export const scanForArbitrageOpportunities = async (
    threshold: number = 0.995
): Promise<ArbitrageOpportunity[]> => {
    try {
        const params = new URLSearchParams({
            active: 'true',
            closed: 'false',
            limit: '200',
        });

        const response = await fetch(`${MARKETS_URL}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch markets');
        }

        const markets: MarketData[] = await response.json();
        const opportunities: ArbitrageOpportunity[] = [];

        console.log(`Scanning ${markets.length} markets for arbitrage (threshold: ${threshold})...`);

        for (const market of markets) {
            if (market.closed || !market.active) continue;

            const prices = parseOutcomePrices(market.outcomePrices, market.outcomes);
            if (!prices) continue;

            const [yesPrice, noPrice] = prices;

            // Skip if prices are 0 (market not active)
            if (yesPrice === 0 && noPrice === 0) continue;

            const combinedCost = yesPrice + noPrice;

            // Check if this is an arbitrage opportunity
            if (combinedCost < threshold && combinedCost > 0.5) {
                const eventSlug = market.events?.[0]?.slug || market.slug;

                opportunities.push({
                    question: market.question,
                    slug: market.slug,
                    yesPrice,
                    noPrice,
                    combinedCost,
                    potentialProfit: 1 - combinedCost,
                    marketUrl: `https://polymarket.com/event/${eventSlug}`,
                    volume24hr: market.volume24hr || 0,
                });
            }
        }

        console.log(`Found ${opportunities.length} opportunities below threshold ${threshold}`);

        return opportunities.sort((a, b) => b.potentialProfit - a.potentialProfit);
    } catch (error) {
        console.error('Error scanning for arbitrage opportunities:', error);
        return [];
    }
};

/**
 * Get all markets with their current prices for display
 * Shows markets sorted by how close they are to arbitrage opportunity
 */
export const getAllMarketsWithPrices = async (): Promise<ArbitrageOpportunity[]> => {
    try {
        const params = new URLSearchParams({
            active: 'true',
            closed: 'false',
            limit: '100',
        });

        const response = await fetch(`${MARKETS_URL}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch markets');
        }

        const markets: MarketData[] = await response.json();
        const results: ArbitrageOpportunity[] = [];

        for (const market of markets) {
            if (market.closed || !market.active) continue;

            const prices = parseOutcomePrices(market.outcomePrices, market.outcomes);
            if (!prices) continue;

            const [yesPrice, noPrice] = prices;
            if (yesPrice === 0 && noPrice === 0) continue;

            const combinedCost = yesPrice + noPrice;
            const eventSlug = market.events?.[0]?.slug || market.slug;

            results.push({
                question: market.question,
                slug: market.slug,
                yesPrice,
                noPrice,
                combinedCost,
                potentialProfit: 1 - combinedCost,
                marketUrl: `https://polymarket.com/event/${eventSlug}`,
                volume24hr: market.volume24hr || 0,
            });
        }

        // Sort by combined cost (lowest first = best opportunities)
        return results.sort((a, b) => a.combinedCost - b.combinedCost);
    } catch (error) {
        console.error('Error fetching markets:', error);
        return [];
    }
};
