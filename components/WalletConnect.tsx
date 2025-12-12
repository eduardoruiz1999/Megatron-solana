import React, { useState } from 'react';
import { ShieldAlert, Key, Globe, ChevronDown, ChevronUp, Server } from 'lucide-react';
import { Button } from './ui/Button';
import { importWallet } from '../services/solanaService';
import { WalletState } from '../types';
import { SOLANA_RPC_URL } from '../constants';

interface WalletConnectProps {
  onConnected: (wallet: WalletState) => void;
  onClose: () => void;
}

const NETWORKS = [
  { id: 'mainnet-beta', name: 'Mainnet (Alchemy)', url: SOLANA_RPC_URL },
  { id: 'mainnet-ankr', name: 'Mainnet (Ankr)', url: 'https://rpc.ankr.com/solana' },
  { id: 'devnet', name: 'Devnet', url: 'https://api.devnet.solana.com' },
  { id: 'testnet', name: 'Testnet', url: 'https://api.testnet.solana.com' },
  { id: 'custom', name: 'Custom RPC', url: '' },
];

export const WalletConnect: React.FC<WalletConnectProps> = ({ onConnected, onClose }) => {
  const [privateKey, setPrivateKey] = useState('');
  const [selectedNetworkId, setSelectedNetworkId] = useState(NETWORKS[0].id);
  const [customRpcUrl, setCustomRpcUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let finalRpcUrl = '';
      const selectedNet = NETWORKS.find(n => n.id === selectedNetworkId);
      
      if (selectedNetworkId === 'custom') {
        finalRpcUrl = customRpcUrl;
      } else if (selectedNet) {
        finalRpcUrl = selectedNet.url;
      }

      // Pass rpcUrl if provided, otherwise undefined
      const wallet = await importWallet(privateKey, finalRpcUrl || undefined);
      onConnected(wallet);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to import wallet. Check your key and network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-cyber-red/10 border border-cyber-red/30 p-4 rounded text-sm text-cyber-red flex gap-3 items-start">
        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
        <p>
          WARNING: You are entering a private key directly. 
          Use only for testing or with ephemeral wallets. 
          Keys are processed locally in memory.
        </p>
      </div>

      <form onSubmit={handleImport} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-gray-400 mb-2">PRIVATE KEY (BASE58)</label>
          <div className="relative">
            <input
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="w-full bg-cyber-black border border-cyber-gray p-3 pl-10 text-white focus:border-cyber-cyan focus:outline-none font-mono text-sm rounded transition-all focus:shadow-[0_0_10px_rgba(0,243,255,0.2)]"
              placeholder="Enter your private key..."
              required
            />
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div>
          <button 
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-display tracking-widest text-cyber-cyan hover:text-white transition-colors"
          >
            {showAdvanced ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
            NETWORK CONFIGURATION
          </button>
        </div>

        {/* Advanced Settings Content */}
        {showAdvanced && (
          <div className="animate-fade-in space-y-3 p-3 bg-cyber-gray/30 rounded border border-cyber-gray/50">
            
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-2">SELECT NETWORK</label>
              <div className="grid grid-cols-1 gap-2">
                <select
                  value={selectedNetworkId}
                  onChange={(e) => setSelectedNetworkId(e.target.value)}
                  className="w-full bg-cyber-black border border-cyber-gray p-3 text-white focus:border-cyber-purple focus:outline-none font-mono text-sm rounded cursor-pointer appearance-none"
                >
                  {NETWORKS.map(net => (
                    <option key={net.id} value={net.id}>{net.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedNetworkId === 'custom' && (
              <div className="animate-fade-in">
                <label className="block text-xs font-mono text-gray-400 mb-2">CUSTOM RPC URL</label>
                <div className="relative">
                  <input
                    type="text"
                    value={customRpcUrl}
                    onChange={(e) => setCustomRpcUrl(e.target.value)}
                    className="w-full bg-cyber-black border border-cyber-gray p-3 pl-10 text-white focus:border-cyber-purple focus:outline-none font-mono text-sm rounded placeholder-gray-600"
                    placeholder="https://..."
                  />
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
              <Server className="w-3 h-3" />
              <span>
                {selectedNetworkId === 'custom' 
                  ? 'Using Custom Endpoint' 
                  : NETWORKS.find(n => n.id === selectedNetworkId)?.url}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-400 text-xs text-center font-mono break-words p-2 bg-red-900/10 rounded border border-red-900/30">
            [{error}]
          </div>
        )}

        <Button 
          type="submit" 
          isLoading={isLoading} 
          className="w-full"
          disabled={!privateKey}
        >
          ACCESS MAINFRAME
        </Button>
      </form>
    </div>
  );
};