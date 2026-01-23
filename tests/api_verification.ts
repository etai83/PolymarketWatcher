
import { testMarketConnection, fetchWalletTradesOnMarket } from '../utils/dataProcessor';

async function main() {
  console.log("Running API verification...");

  // Test 1: Search for a known market
  const query = "Trump";
  console.log(`Testing market search with query: "${query}"`);

  try {
    const isConnected = await testMarketConnection(query);
    if (isConnected) {
      console.log("✅ Market search successful (testMarketConnection returned true)");
    } else {
      console.error("❌ Market search failed (testMarketConnection returned false)");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error during market search:", error);
    process.exit(1);
  }

  // Test 2: Try to fetch trades (which uses search internally)
  // We need a dummy wallet, but we are just testing if it crashes or returns empty
  // fetchWalletTradesOnMarket calls searchMarkets -> fetchActivity
  // We expect it to find the market, but maybe find no activity for a dummy wallet

  const dummyWallet = "0x0000000000000000000000000000000000000000";
  console.log(`Testing fetchWalletTradesOnMarket with wallet: ${dummyWallet}`);

  try {
    const trades = await fetchWalletTradesOnMarket(dummyWallet, query);
    console.log(`✅ Fetched ${trades.length} trades (expected 0 for dummy wallet, but successful execution)`);
  } catch (error) {
      // It might fail if fetchActivity fails or if search fails
      console.error("❌ Error during fetchWalletTradesOnMarket:", error);
      process.exit(1);
  }

  console.log("All verifications passed!");
}

main();
