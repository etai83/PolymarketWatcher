
# Polymarket Whale Watcher 🐋

An interactive trading dashboard for analyzing "Whale" wallets on Polymarket. This application visualizes trade history, calculates performance metrics, and leverages AI to generate tactical strategy insights.

## Features

*   **Market & Wallet Analysis**: Input a specific Polymarket market and wallet address to simulate/fetch trade history.
*   **Real Data Scraping**: Use the included Python script to pull actual historical trade data from the Polymarket API.
*   **Performance Dashboard**:
    *   Visual PnL (Profit and Loss) charts.
    *   Trade size distribution analysis.
    *   Key metrics: Total Volume, Net PnL, Win Rate.
*   **AI-Powered Strategy Insights**:
    *   Generates a professional trading journal entry based on trade history.
    *   Analyzes conviction, timing, and strategy.
*   **Dual AI Support**:
    *   **Google Gemini API**: Uses the latest Gemini models. Supports custom API keys via Settings.
    *   **Ollama (Local AI)**: Connect to a local LLM instance (e.g., Llama 3, Mistral) for privacy-focused analysis.

## Technologies

*   **Frontend**: React, TypeScript
*   **Styling**: Tailwind CSS
*   **Visualization**: Recharts
*   **Backend/Scripting**: Python (for scraping)
*   **AI Integration**:
    *   `@google/genai` SDK for Gemini.
    *   Standard `fetch` for Ollama API.

## Usage

### 1. Web App

1.  **Start the Application**: Open the web app in your browser.
2.  **Input Data**:
    *   **Target Market**: Enter the name of the prediction market (e.g., "Will Trump win the 2024 Election?").
    *   **Wallet Address**: Enter the wallet address to analyze (e.g., `0x...`).
3.  **Analyze**: Click "Scrape & Analyze Trades".
4.  **View Insights**:
    *   Explore the charts and trade table.
    *   The "Gemini Strategy Journal" (or Local AI Strategy) section on the right provides a text-based analysis.

### 2. Using Real Data (Python Scraper)

To analyze real on-chain data, use the included `scrape_trades.py` script.

**Prerequisites:**
*   Python 3.x
*   `requests` library: `pip install requests`

**Steps:**
1.  Run the script:
    ```bash
    python scrape_trades.py --query "Presidential Election 2024" --user 0xYourWalletAddress --combined-out trades.csv
    ```
2.  Follow the interactive prompts to select the specific markets you are interested in.
3.  The script will generate a `trades.csv` file.
4.  In the web app, click the **File Upload** area (or drag and drop your CSV).
5.  The dashboard will update with the real scraped data and switch to "Real On-Chain" mode.

## Configuration

### AI Settings

Click the **Gear Icon** in the header to open the Settings Modal.

*   **Gemini API**:
    *   Select "Gemini API".
    *   Enter your **Gemini API Key**. (Keys are stored in memory only for the session).
    *   *Note*: Requires a paid key from Google Cloud Console / AI Studio if not using the free tier limits.

*   **Ollama (Local)**:
    *   Select "Ollama".
    *   **Model Name**: e.g., `llama3`, `mistral`, `deepseek-r1`.
    *   **Endpoint**: Default is `http://localhost:11434`.

### Setting up Ollama for Web Access

To allow the web browser to communicate with your local Ollama instance, you must enable CORS.

**Mac/Linux:**
```bash
OLLAMA_ORIGINS="*" ollama serve
```

**Windows (PowerShell):**
```powershell
$env:OLLAMA_ORIGINS="*"; ollama serve
```

## Disclaimer

This tool is for educational and entertainment purposes only. The "scraping" functionality in this demo version utilizes simulated data patterns to demonstrate the visualization and AI capabilities. It does not constitute financial advice.
