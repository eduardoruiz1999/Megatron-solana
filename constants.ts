export const SOLANA_RPC_URL = "https://solana-mainnet.g.alchemy.com/v2/1iOs7OGPGZ_iyQJ840Dr0";

export const DIAMOND_TOKEN_ADDRESS = "4AtnF1pPmqABPDQtCogqS2LqDkNtuzMg76yQRjuJpump";
// Keeping the pool address for data reference, though it might differ for the new token
export const POOL_ADDRESS = "8oiVbfQT4ErS1wciaTuJhCSn1EuPn37wThA5MypiBq6K";

// Wallet that collects the Diamond Token fees
export const APP_TREASURY_ADDRESS = "5VqjB57PnrTUSQRoN8skwKtstqPrMFJiZaDGz6BF5FuKhSGSYhbcwPdgKPVNbgtWhi9AkJ8z8HvgaBDzccNHjzE3"; // Using demo pubkey as treasury for example
export const GAS_FEE_DMT = 10; // Amount of Diamond Tokens charged per transaction

export const EXTERNAL_LINKS = {
  PUMP_FUN: "https://pump.fun/coin/4AtnF1pPmqABPDQtCogqS2LqDkNtuzMg76yQRjuJpump",
  PHOTON: "https://photon-sol.tinyastro.io/en/lp/8oiVbfQT4ErS1wciaTuJhCSn1EuPn37wThA5MypiBq6K",
  BUBBLEMAPS: "https://v2.bubblemaps.io/map?address=4AtnF1pPmqABPDQtCogqS2LqDkNtuzMg76yQRjuJpump&chain=solana",
  SOLSCAN: "https://solscan.io/token/4AtnF1pPmqABPDQtCogqS2LqDkNtuzMg76yQRjuJpump",
  GECKOTERMINAL: "https://www.geckoterminal.com/solana/pools/8oiVbfQT4ErS1wciaTuJhCSn1EuPn37wThA5MypiBq6K",
  GOOGLE_FINANCE: "https://www.google.com/finance"
};

// Prices in USD (Fallbacks only, overwritten by live data)
export const DIAMOND_PRICE_USD = 6.00;
export const SOL_PRICE_USD = 145.00;

// Config to force specific market reality (Megatron Logic)
export const MARKET_OVERRIDE = {
    ENABLED: true,
    TARGET_PRICE: 6.00,
    SOL_RATE: 150.0
};

// Demo key provided for auto-connection
export const DEFAULT_PRIVATE_KEY = "5VqjB57PnrTUSQRoN8skwKtstqPrMFJiZaDGz6BF5FuKhSGSYhbcwPdgKPVNbgtWhi9AkJ8z8HvgaBDzccNHjzE3";

export const INITIAL_WALLET_STATE = {
  connected: false,
  publicKey: null,
  balance: 0,
  tokens: {},
  rpcEndpoint: SOLANA_RPC_URL,
};

export const GEMINI_MODEL = "gemini-2.5-flash";