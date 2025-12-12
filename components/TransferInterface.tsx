import React, { useState } from 'react';
import { Send, ArrowRight, Fuel } from 'lucide-react';
import { Button } from './ui/Button';
import { transferSOL } from '../services/solanaService';
import { WalletState } from '../types';
import { GAS_FEE_DMT } from '../constants';

interface TransferInterfaceProps {
  wallet: WalletState;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransferInterface: React.FC<TransferInterfaceProps> = ({ wallet, onClose, onSuccess }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'error' | 'success', msg: string} | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setIsLoading(true);

    try {
      const signature = await transferSOL(wallet, recipient, parseFloat(amount));
      setStatus({ type: 'success', msg: `Transfer Successful! TX: ${signature.slice(0, 8)}...` });
      setAmount('');
      setRecipient('');
      // Refresh wallet logic would go here
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || "Transaction Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="space-y-4">
      <div className="bg-cyber-gray/50 p-3 rounded border border-cyber-gray mb-4">
        <div className="text-xs text-gray-400 mb-1">AVAILABLE BALANCE</div>
        <div className="text-xl font-bold text-cyber-cyan">{wallet.balance.toFixed(4)} SOL</div>
      </div>

      <div>
        <label className="block text-xs font-mono text-gray-400 mb-2">RECIPIENT ADDRESS</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full bg-cyber-black border border-cyber-gray p-3 text-white focus:border-cyber-purple focus:outline-none font-mono text-sm rounded"
          placeholder="Solana Address..."
          required
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-gray-400 mb-2">AMOUNT (SOL)</label>
        <input
          type="number"
          step="0.000000001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-cyber-black border border-cyber-gray p-3 text-white focus:border-cyber-purple focus:outline-none font-mono text-sm rounded"
          placeholder="0.00"
          required
        />
      </div>

      <div className="flex items-center gap-2 p-3 bg-cyber-purple/10 border border-cyber-purple/30 rounded text-xs text-cyber-purple">
        <Fuel className="w-4 h-4" />
        <span>GAS FEE: {GAS_FEE_DMT} DIAMOND TOKENS (Auto-deducted)</span>
      </div>

      {status && (
        <div className={`text-xs text-center font-mono p-2 rounded ${
          status.type === 'error' ? 'text-red-400 bg-red-900/20' : 'text-green-400 bg-green-900/20'
        }`}>
          {status.msg}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          CANCEL
        </Button>
        <Button type="submit" isLoading={isLoading} className="flex-1">
          SEND FUNDS
        </Button>
      </div>
    </form>
  );
};