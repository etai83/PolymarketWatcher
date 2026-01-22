
import { GoogleGenAI } from "@google/genai";
import { Trade } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const runAnalysis = async (trades: Trade[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    if (trades.length === 0) return "No trades available to analyze.";

    const marketName = trades[0].market;
    
    // Create a compact summary of trades for context window efficiency
    // We prioritize the most recent trades
    const tradeSummary = trades.slice(0, 60).map(t => 
      `[${t.timestamp.split('T')[0]}] ${t.side} ${t.size} shares @ $${t.price.toFixed(2)}`
    ).join('\n');

    const prompt = `
      You are an expert crypto quant analyzing a "Whale" wallet on Polymarket.
      
      Target Market: "${marketName}"
      
      Trade History Log (Most recent first):
      ${tradeSummary}

      Based ONLY on this data, provide a tactical analysis:
      1. **Conviction Level**: Based on trade sizes and frequency, how confident is this whale in the outcome?
      2. **Timing Analysis**: Did they buy the dip or FOMO into tops? (Price range is 0.00 to 1.00).
      3. **P&L Estimation**: Are they currently up or down?
      4. **Strategy**: Are they hedging, accumulating, or dumping?
      
      Format the response as a sleek, professional trading journal entry. Use bullet points. Be concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Unable to generate analysis at this time. Please ensure your API key is valid.";
  }
};
