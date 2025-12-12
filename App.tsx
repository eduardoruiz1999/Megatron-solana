import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SwapInterface } from './components/SwapInterface';
import { ChatInterface } from './components/ChatInterface';
import { Airdrop } from './components/Airdrop';
import { Modal } from './components/ui/Modal';
import { WalletConnect } from './components/WalletConnect';
import { Tab, WalletState, PoolData, TradeData } from './types';
import { INITIAL_WALLET_STATE, DEFAULT_PRIVATE_KEY, POOL_ADDRESS } from './constants';
import { resetConnection, importWallet } from './services/solanaService';
import { fetchPoolData } from './services/geckoService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [wallet, setWallet] = useState<WalletState>(INITIAL_WALLET_STATE);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  
  // Real-time Chart History (Accumulates during session)
  const [chartHistory, setChartHistory] = useState<TradeData[]>([]);

  // Auto-connect on mount using the provided demo key
  useEffect(() => {
    const autoConnect = async () => {
      if (!wallet.connected && DEFAULT_PRIVATE_KEY) {
        try {
          console.log("Initiating Auto-Connection sequence...");
          const connectedWallet = await importWallet(DEFAULT_PRIVATE_KEY);
          setWallet(connectedWallet);
          console.log("Auto-Connection Successful");
        } catch (error) {
          console.error("Auto-Connection failed:", error);
        }
      }
    };
    autoConnect();
  }, []); 

  // Market Data Polling & Chart Accumulation
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPoolData(POOL_ADDRESS);
      if (data) {
        setPoolData(data);
        
        // Add new data point to history
        const now = new Date();
        const timeLabel = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        setChartHistory(prev => {
          const newPoint: TradeData = {
            time: timeLabel,
            price: parseFloat(data.priceUsd),
            volume: parseFloat(data.volume24h)
          };
          // Keep last 50 points to avoid memory issues
          const newHistory = [...prev, newPoint];
          return newHistory.length > 50 ? newHistory.slice(-50) : newHistory;
        });
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 30s
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleWalletConnected = (newWallet: WalletState) => {
    setWallet(newWallet);
    setIsConnectModalOpen(false);
  };

  const handleDisconnect = () => {
    resetConnection();
    setWallet(INITIAL_WALLET_STATE);
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.DASHBOARD:
        return <Dashboard wallet={wallet} poolData={poolData} chartData={chartHistory} />;
      case Tab.SWAP:
        return <SwapInterface wallet={wallet} poolData={poolData} />;
      case Tab.CHAT:
        return <ChatInterface />;
      case Tab.AIRDROP:
        return <Airdrop wallet={wallet} />;
      default:
        return <Dashboard wallet={wallet} poolData={poolData} chartData={chartHistory} />;
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black text-gray-200 font-sans selection:bg-cyber-cyan selection:text-black">
      {/* Background Grid Effect */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1a1a24 1px, transparent 1px),
            linear-gradient(to bottom, #1a1a24 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyber-purple/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Wallet Connection Modal */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        title="SECURE LINK UPLINK"
      >
        <WalletConnect 
          onConnected={handleWalletConnected} 
          onClose={() => setIsConnectModalOpen(false)}
        />
      </Modal>

      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        wallet={wallet}
        onConnect={() => wallet.connected ? handleDisconnect() : setIsConnectModalOpen(true)}
      />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-gray mt-auto py-6 bg-cyber-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center gap-1">
          <span className="text-xs text-gray-600 font-display tracking-widest">
            MEGATRON SOLBOT SYSTEM v1.0.0
          </span>
          <span className="text-[10px] font-mono text-cyber-cyan/60">
             CONNECTED NODE: {wallet.rpcEndpoint || 'OFFLINE'} | MARKET FEED: {poolData ? 'ONLINE' : 'CONNECTING...'}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;