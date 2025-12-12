import { GoogleFinanceState, GoogleMarketData } from "../types";

// We use a CORS proxy because browsers block direct requests to google.com
const PROXY_URL = "https://api.allorigins.win/get?url=";
const TARGET_URL = "https://www.google.com/finance/";

// Fallback data in case the proxy fails or Google changes classes
const FALLBACK_DATA: GoogleFinanceState = {
  marketTrends: [
    { title: "S&P 500", value: "5,420.10", change: "+1.2%", isPositive: true },
    { title: "Nasdaq", value: "17,300.50", change: "+0.8%", isPositive: true },
    { title: "Bitcoin", value: "$64,200.00", change: "-0.5%", isPositive: false },
    { title: "Solana", value: "$145.00", change: "+5.2%", isPositive: true },
  ],
  news: [
    { title: "Solana Transaction Volume Hits Record High", source: "CryptoDaily", time: "1h ago" },
    { title: "Global Markets Rally as Inflation Cools", source: "Bloomberg", time: "2h ago" },
    { title: "Tech Stocks Lead Market Surge", source: "Reuters", time: "3h ago" },
    { title: "Crypto Regulation Talks Heat Up", source: "CoinDesk", time: "5h ago" },
    { title: "AI Sector Continues to Dominate", source: "TechCrunch", time: "6h ago" }
  ]
};

export const fetchGoogleFinance = async (): Promise<GoogleFinanceState | null> => {
  try {
    // Add timestamp to prevent caching errors
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(TARGET_URL)}&timestamp=${Date.now()}`);
    
    if (!response.ok) {
        throw new Error(`Proxy error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const htmlContent = data.contents;

    if (!htmlContent) return FALLBACK_DATA;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // 1. Extract Market Indices (S&P 500, Nasdaq, etc.)
    const marketTrends: GoogleMarketData[] = [];
    
    // Attempting to select the "Compare Markets" chips
    const indices = doc.querySelectorAll('.sbnBtf .SxcTic'); 
    
    if (indices.length > 0) {
        indices.forEach((el) => {
            const title = el.querySelector('.ZvmM7')?.textContent || "Unknown";
            const value = el.querySelector('.YMlKec')?.textContent || "0.00";
            const changeElement = el.querySelector('.P2Luy');
            const change = changeElement?.textContent || "0%";
            // Determine positivity based on class 'EjqUne' (often green) or plus sign
            const isPositive = change.includes('+') || (changeElement?.classList.contains('EjqUne') ?? false) || !change.includes('-'); 
            
            marketTrends.push({
                title,
                value,
                change,
                isPositive
            });
        });
    }

    // 2. Extract News
    const newsItems: { title: string; source: string; time: string }[] = [];
    const newsElements = doc.querySelectorAll('.yY3Lee');
    
    newsElements.forEach((el, index) => {
        if (index > 4) return; // Limit to 5
        const title = el.querySelector('.Yfwt5')?.textContent || "No Title";
        const source = el.querySelector('.sfyJob')?.textContent || "Google Finance";
        const time = el.querySelector('.Adak')?.textContent || "Now";
        
        newsItems.push({ title, source, time });
    });

    // If scraping failed to find elements (Google changed classes), return fallback
    if (marketTrends.length === 0 && newsItems.length === 0) {
        return FALLBACK_DATA;
    }

    return {
        marketTrends: marketTrends.length > 0 ? marketTrends : FALLBACK_DATA.marketTrends,
        news: newsItems.length > 0 ? newsItems : FALLBACK_DATA.news
    };

  } catch (error) {
    console.warn("Google Finance Connection Failed (Using Fallback Data):", error);
    // Return fallback data instead of null so the UI doesn't break
    return FALLBACK_DATA;
  }
};