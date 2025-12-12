import { PoolData } from "../types";
import { MARKET_OVERRIDE } from "../constants";

export const fetchPoolData = async (poolAddress: string): Promise<PoolData | null> => {
  try {
    // GeckoTerminal API Endpoint for Solana Pools
    const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolAddress}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Gecko API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const attrs = data.data.attributes;

    let priceUsd = parseFloat(attrs.base_token_price_usd);
    let marketCap = parseFloat(attrs.market_cap_usd || '0');
    let fdv = parseFloat(attrs.fdv_usd || '0');

    // Apply Megatron Market Override if enabled
    // This aligns with the Python script logic provided to force a price of $6.00
    if (MARKET_OVERRIDE.ENABLED) {
        const originalPrice = priceUsd || 0.053881; // Fallback to a known low if API returns 0
        const newPrice = MARKET_OVERRIDE.TARGET_PRICE;
        const ratio = newPrice / originalPrice;

        priceUsd = newPrice;
        
        // Adjust MCAP and FDV by the ratio
        if (marketCap > 0) marketCap = marketCap * ratio;
        else marketCap = 3880.78 * ratio; // Fallback from script

        if (fdv > 0) fdv = fdv * ratio;
        else fdv = marketCap; // Fallback
    }

    return {
      priceUsd: priceUsd.toString(),
      priceChange24h: attrs.price_change_percentage.h24, // Keep original volatility trend
      volume24h: attrs.volume_usd.h24,
      liquidity: attrs.reserve_in_usd,
      marketCap: marketCap.toString(),
      fdv: fdv.toString(),
      pairName: attrs.name
    };
  } catch (e) {
    console.error("GeckoTerminal Data Uplink Failed:", e);
    // Return mock data if API fails to ensure UI continuity in "Megatron Mode"
    if (MARKET_OVERRIDE.ENABLED) {
        return {
            priceUsd: MARKET_OVERRIDE.TARGET_PRICE.toString(),
            priceChange24h: "12.5",
            volume24h: "450000",
            liquidity: "85000",
            marketCap: (3880.78 * (MARKET_OVERRIDE.TARGET_PRICE / 0.053881)).toString(),
            fdv: (3880.78 * (MARKET_OVERRIDE.TARGET_PRICE / 0.053881)).toString(),
            pairName: "DMT / SOL"
        };
    }
    return null;
  }
};