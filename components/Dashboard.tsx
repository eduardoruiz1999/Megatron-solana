import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { Send, Activity, Map, Search, Terminal, TrendingUp, TrendingDown, Droplets, DollarSign, Globe, Newspaper, Zap } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { TransferInterface } from './TransferInterface';
import { WalletState, PoolData, TradeData, GoogleFinanceState } from '../types';
import { fetchGoogleFinance } from '../services/googleFinanceService';
import { DIAMOND_TOKEN_ADDRESS, DIAMOND_PRICE_USD, SOL_PRICE_USD, EXTERNAL_LINKS, POOL_ADDRESS } from '../constants';

interface DashboardProps {
  wallet: WalletState;
  poolData: PoolData | null;
  chartData: TradeData[];
}

export const Dashboard: React.FC<DashboardProps> = ({ wallet, poolData, chartData }) => {
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [googleData, setGoogleData] = useState<GoogleFinanceState | null>(null);
  
  const loading = !poolData;

  const diamondBalance = wallet.tokens[DIAMOND_TOKEN_ADDRESS] || 0;
  const currentPrice = poolData ? parseFloat(poolData.priceUsd) : DIAMOND_PRICE_USD;
  const priceChange = poolData ? parseFloat(poolData.priceChange24h) : 0;

  // Fetch Google Finance Data
  useEffect(() => {
    const loadGlobalMarkets = async () => {
        const data = await fetchGoogleFinance();
        if (data) setGoogleData(data);
    };
    loadGlobalMarkets();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Transfer Modal */}
      <Modal 
        isOpen={isTransferOpen} 
        onClose={() => setIsTransferOpen(false)} 
        title="INITIATE TRANSFER (MAINNET)"
      >
        <TransferInterface 
          wallet={wallet} 
          onClose={() => setIsTransferOpen(false)}
          onSuccess={() => {/* Ideally refresh balance here */}}
        />
      </Modal>

      {/* Network Status Bar */}
      <div className="flex items-center justify-between text-xs font-mono bg-cyber-dark border border-cyber-gray p-2 rounded">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${poolData ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${poolData ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          </span>
          <span className={poolData ? "text-green-500" : "text-yellow-500"}>
            {poolData ? "MAINNET STREAM: ACTIVE" : "MAINNET STREAM: CONNECTING..."}
          </span>
        </div>
        <div className="flex items-center gap-4">
             <a 
               href={EXTERNAL_LINKS.GOOGLE_FINANCE} 
               target="_blank" 
               rel="noopener noreferrer"
               className={`flex items-center gap-1 hover:text-white transition-colors ${googleData ? 'text-blue-400' : 'text-gray-600'}`}
             >
                <Globe className="w-3 h-3" />
                <span>{googleData ? 'GOOGLE FINANCE: LINKED' : 'GOOGLE FINANCE: SYNCING...'}</span>
             </a>
             <div className="text-gray-500 hidden md:block">
                POOL: {POOL_ADDRESS.slice(0, 6)}...{POOL_ADDRESS.slice(-4)}
            </div>
        </div>
      </div>

      {/* External Data Uplinks */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <a href={EXTERNAL_LINKS.PUMP_FUN} target="_blank" rel="noopener noreferrer" className="block md:col-span-1 col-span-2">
          <Button variant="primary" className="w-full flex items-center justify-center gap-2 text-xs md:text-sm bg-green-500 text-black border-none hover:bg-green-400">
            <Zap className="w-3 h-3 md:w-4 md:h-4 fill-black" /> PUMP.FUN
          </Button>
        </a>
        <a href={EXTERNAL_LINKS.PHOTON} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2 border-cyber-green text-cyber-green hover:bg-cyber-green/10 hover:shadow-[0_0_15px_rgba(0,255,157,0.4)] text-xs md:text-sm">
            <Activity className="w-3 h-3 md:w-4 md:h-4" /> PHOTON
          </Button>
        </a>
        <a href={EXTERNAL_LINKS.BUBBLEMAPS} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2 border-pink-500 text-pink-500 hover:bg-pink-500/10 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] text-xs md:text-sm">
            <Map className="w-3 h-3 md:w-4 md:h-4" /> BUBBLEMAPS
          </Button>
        </a>
        <a href={EXTERNAL_LINKS.SOLSCAN} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2 border-blue-400 text-blue-400 hover:bg-blue-400/10 hover:shadow-[0_0_15px_rgba(96,165,250,0.4)] text-xs md:text-sm">
            <Search className="w-3 h-3 md:w-4 md:h-4" /> SOLSCAN
          </Button>
        </a>
        <a href={EXTERNAL_LINKS.GECKOTERMINAL} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 hover:shadow-[0_0_15px_rgba(250,204,21,0.4)] text-xs md:text-sm">
            <Terminal className="w-3 h-3 md:w-4 md:h-4" /> GECKO
          </Button>
        </a>
      </div>

      {/* Google Finance Global Sentiment Bar */}
      {googleData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {googleData.marketTrends.slice(0, 4).map((trend, idx) => (
                  <div key={idx} className="bg-cyber-gray/30 border border-cyber-gray/50 p-2 rounded flex flex-col items-center justify-center hover:bg-cyber-gray/50 transition-colors">
                      <span className="text-[10px] text-gray-400 font-display tracking-widest uppercase">{trend.title}</span>
                      <div className="flex items-center gap-2 font-mono text-sm">
                          <span className="text-white">{trend.value}</span>
                          <span className={trend.isPositive ? "text-green-400" : "text-red-400"}>
                              {trend.change}
                          </span>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Stats Grid - Live Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="PORTFOLIO VALUE (SOL)">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-display font-bold text-white">
                {wallet.balance.toFixed(3)} <span className="text-sm text-cyber-cyan font-sans">SOL</span>
              </div>
              <div className="mt-2 text-gray-400 text-sm">
                ≈ ${(wallet.balance * SOL_PRICE_USD).toFixed(2)} USD
              </div>
            </div>
            {wallet.connected && (
              <button 
                onClick={() => setIsTransferOpen(true)}
                className="bg-cyber-gray hover:bg-cyber-cyan hover:text-black text-cyber-cyan p-2 rounded transition-all border border-cyber-cyan/30"
                title="Send Funds"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </Card>

        <Card title="TOKEN MARKET METRICS">
          {loading ? (
             <div className="animate-pulse flex flex-col gap-2">
               <div className="h-8 bg-cyber-gray rounded w-3/4"></div>
               <div className="h-4 bg-cyber-gray rounded w-1/2"></div>
             </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-display font-bold text-cyber-cyan">
                  ${currentPrice.toFixed(4)}
                </div>
                <div className={`text-sm font-bold flex items-center ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1"/> : <TrendingDown className="w-4 h-4 mr-1"/>}
                  {Math.abs(priceChange).toFixed(2)}% (24h)
                </div>
              </div>
              <div className="flex flex-col mt-2 gap-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Droplets className="w-3 h-3"/> LIQ:</span>
                  <span className="text-white font-mono">${poolData ? parseFloat(poolData.liquidity).toLocaleString() : '---'}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3"/> VOL:</span>
                  <span className="text-white font-mono">${poolData ? parseFloat(poolData.volume24h).toLocaleString() : '---'}</span>
                </div>
              </div>
            </>
          )}
        </Card>

        <Card title="MARKET CAP / FDV">
           {loading ? (
             <div className="animate-pulse flex flex-col gap-2">
               <div className="h-8 bg-cyber-gray rounded w-3/4"></div>
               <div className="h-4 bg-cyber-gray rounded w-1/2"></div>
             </div>
          ) : (
            <>
              <div className="text-2xl font-display font-bold text-cyber-purple truncate" title={poolData?.fdv}>
                 ${poolData ? parseFloat(poolData.fdv).toLocaleString() : '---'}
              </div>
              <div className="mt-2 text-sm text-gray-400">
                Fully Diluted Valuation
              </div>
              <div className="mt-1 text-xs text-gray-500 font-mono">
                MCAP: ${poolData ? parseFloat(poolData.marketCap).toLocaleString() : '---'}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Charts - Using Real Accumulating Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="LIVE PRICE ACTION">
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
                    <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '10px' }} domain={['auto', 'auto']} />
                    <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#00f3ff' }}
                    itemStyle={{ color: '#00f3ff' }}
                    />
                    <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#00f3ff" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    isAnimationActive={false}
                    />
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500 font-mono text-sm animate-pulse">
                    WAITING FOR FIRST MARKET TICK...
                </div>
            )}
          </div>
        </Card>
        
        <div className="space-y-6">
            <Card title="LIVE VOLUME FEED">
            <div className="h-[120px] w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
                        <XAxis dataKey="time" hide />
                        <YAxis stroke="#6b7280" style={{ fontSize: '10px' }} domain={['auto', 'auto']} />
                        <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#bc13fe' }}
                        cursor={{fill: '#1a1a24'}}
                        />
                        <Bar dataKey="volume" fill="#bc13fe" opacity={0.8} />
                    </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 font-mono text-sm animate-pulse">
                        WAITING FOR VOLUME DATA...
                    </div>
                )}
            </div>
            </Card>

            <Card title="GOOGLE FINANCE NEWS WIRE">
                <div className="relative h-[120px] overflow-hidden">
                    <div className="absolute inset-0 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {googleData && googleData.news.length > 0 ? (
                            googleData.news.map((news, i) => (
                                <div key={i} className="flex flex-col border-b border-cyber-gray/30 pb-2 last:border-0 hover:bg-cyber-gray/20 p-1 rounded transition-colors cursor-default">
                                    <span className="text-white text-xs font-bold truncate">{news.title}</span>
                                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                        <span className="text-cyber-cyan">{news.source}</span>
                                        <span>{news.time}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                               <Newspaper className="w-4 h-4 mr-2" /> ESTABLISHING GOOGLE UPLINK...
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};