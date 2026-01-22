
import { GoogleGenAI } from "@google/genai";
import { Trade, AISettings } from "../types";

export const runAnalysis = async (trades: Trade[], settings: AISettings): Promise<string> => {
  if (trades.length === 0) return "No trades available to analyze.";
  
  const marketName = trades[0].market;
  
  // Create a compact summary of trades
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

  try {
    if (settings.provider === 'ollama') {
      return runOllamaAnalysis(prompt, settings);
    } else {
      return runGeminiAnalysis(prompt, settings.geminiApiKey);
    }
  } catch (error) {
    console.error("AI analysis error:", error);
    throw error;
  }
};

const runGeminiAnalysis = async (prompt: string, apiKey: string): Promise<string> => {
  const finalKey = apiKey || process.env.API_KEY || '';
  if (!finalKey) {
     return "Please provide a Gemini API Key in settings or configure the environment variable.";
  }
  
  const ai = new GoogleGenAI({ apiKey: finalKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text || "No analysis generated.";
};

const runOllamaAnalysis = async (prompt: string, settings: AISettings): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch(`${settings.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.ollamaModel,
        prompt: prompt,
        stream: false,
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || "No response from Ollama.";
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
