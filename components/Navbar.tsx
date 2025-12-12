import React from 'react';
import { Wallet, Cpu, Menu } from 'lucide-react';
import { Button } from './ui/Button';
import { Tab, WalletState } from '../types';

interface NavbarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  wallet: WalletState;
  onConnect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, wallet, onConnect }) => {
  const navItems = [
    { id: Tab.DASHBOARD, label: 'Dashboard' },
    { id: Tab.SWAP, label: 'Swap' },
    { id: Tab.CHAT, label: 'AI Oracle' },
    { id: Tab.AIRDROP, label: 'Airdrop' },
  ];

  return (
    <nav className="border-b border-cyber-gray bg-cyber-black/90 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-cyber-purple/20 p-2 rounded-lg border border-cyber-purple">
              <Cpu className="h-8 w-8 text-cyber-purple" />
            </div>
            <span className="font-display text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyber-cyan to-cyber-purple">
              MEGATRON SOLBOT
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 font-display text-sm tracking-widest transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'text-cyber-cyan border-b-2 border-cyber-cyan'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wallet Connection */}
          <div>
            <Button 
              variant={wallet.connected ? 'secondary' : 'primary'} 
              onClick={onConnect}
              className="flex items-center gap-2 text-sm py-2 px-4"
            >
              <Wallet className="h-4 w-4" />
              {wallet.connected 
                ? `${wallet.publicKey?.slice(0, 4)}...${wallet.publicKey?.slice(-4)}` 
                : 'CONNECT WALLET'}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};