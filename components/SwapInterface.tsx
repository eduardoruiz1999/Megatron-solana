import React, { useState } from 'react';
import { ArrowDownUp, RefreshCw, Zap, Activity } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { WalletState, PoolData } from '../types';
import { performSwap, buyPumpFunToken } from '../services/solanaService';
import { DIAMOND_TOKEN_ADDRESS, SOL_PRICE_USD, DIAMOND_PRICE_USD } from '../constants';

interface SwapProps {
  wallet: WalletState;
  poolData: PoolData | null;
}

export const SwapInterface: React.FC<SwapProps> = ({ wallet, poolData }) => {
  const [fromAmount, setFromAmount] = useState<string>('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapDirection, setSwapDirection] = useState<'SOL_TO_DIAMOND' | 'DIAMOND_TO_SOL'>('SOL_TO_DIAMOND');
  const [status, setStatus] = useState<string | null>(null);
  const [isPumpFunMode, setIsPumpFunMode] = useState(true); // Default to Real Mode

  // Dynamic Rate Calculation
  // Use live price from poolData if available, otherwise fallback to constant
  const livePrice = poolData ? parseFloat(poolData.priceUsd) : DIAMOND_PRICE_USD;
  const RATE = SOL_PRICE_USD / livePrice;

  const handleSwap = async () => {
    if (!wallet.connected) {
      setStatus("Error: Wallet not connected");
      return;
    }
    
    setIsSwapping(true);
    setStatus(null);

    const fromToken = swapDirection === 'SOL_TO_DIAMOND' ? 'SOL' : 'DIAMOND';
    const toToken = swapDirection === 'SOL_TO_DIAMOND' ? 'DIAMOND' : 'SOL';

    try {
      let result;
      
      // If Pump.fun Mode is active AND we are buying (SOL -> Token)
      if (isPumpFunMode && swapDirection === 'SOL_TO_DIAMOND') {
          // Use real Pump.fun interaction
          result = await buyPumpFunToken(
              wallet, 
              DIAMOND_TOKEN_ADDRESS, 
              parseFloat(fromAmount)
          );
      } else {
          // Attempt generic swap (will fail as per new solanaService logic unless updated later)
          result = await performSwap(fromToken, toToken, parseFloat(fromAmount));
      }

      setStatus(result.message);
      setFromAmount('');
    } catch (error: any) {
      console.error(error);
      setStatus(`Execution Failed: ${error.message}`);
    } finally {
      setIsSwapping(false);
    }
  };

  const estimatedOutput = fromAmount 
    ? (swapDirection === 'SOL_TO_DIAMOND' 
        ? parseFloat(fromAmount) * RATE 
        : parseFloat(fromAmount) / RATE).toFixed(4)
    : '0.00';

  return (
    <div className="max-w-xl mx-auto">
      <Card title="REAL-TIME DEX INTERFACE">
        <div className="space-y-4">

          {/* Mode Toggle & Status */}
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex items-center justify-between bg-cyber-dark p-2 rounded border border-cyber-gray">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                <Zap className={`w-4 h-4 ${isPumpFunMode ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                <span className="font-display">PUMP.FUN BONDING</span>
                </div>
                <button 
                onClick={() => setIsPumpFunMode(!isPumpFunMode)}
                className={`relative w-10 h-5 rounded-full transition-colors ${isPumpFunMode ? 'bg-cyber-cyan' : 'bg-gray-700'}`}
                >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${isPumpFunMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>
            
            {/* Live Data Indicator */}
            <div className="flex items-center justify-end gap-2 text-[10px] font-mono">
                <span className={`w-1.5 h-1.5 rounded-full ${poolData ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                <span className={poolData ? 'text-green-500' : 'text-yellow-500'}>
                    {poolData ? `MAINNET FEED: $${livePrice.toFixed(4)}` : 'ESTIMATING...'}
                </span>
            </div>
          </div>

          {/* FROM */}
          <div className="bg-cyber-black p-4 border border-cyber-gray rounded-lg">
            <div className="flex justify-between mb-2 text-sm text-gray-400">
              <span>PAYING</span>
              <span>BAL: {swapDirection === 'SOL_TO_DIAMOND' ? wallet.balance.toFixed(4) : (wallet.tokens['DIAMOND'] || 0)}</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.00"
                className="bg-transparent text-2xl font-bold w-full focus:outline-none text-white font-mono"
              />
              <div className="flex items-center gap-2 bg-cyber-gray px-3 py-1 rounded border border-cyber-cyan/30 text-cyber-cyan font-bold">
                 {swapDirection === 'SOL_TO_DIAMOND' ? 'SOL' : 'DIAMOND'}
              </div>
            </div>
          </div>

          {/* SWAP ICON */}
          <div className="flex justify-center -my-2 relative z-10">
            <button 
              onClick={() => setSwapDirection(prev => prev === 'SOL_TO_DIAMOND' ? 'DIAMOND_TO_SOL' : 'SOL_TO_DIAMOND')}
              className="bg-cyber-purple p-2 rounded-full hover:shadow-[0_0_15px_rgba(188,19,254,0.6)] transition-all"
            >
              <ArrowDownUp className="text-white h-5 w-5" />
            </button>
          </div>

          {/* TO */}
          <div className="bg-cyber-black p-4 border border-cyber-gray rounded-lg">
            <div className="flex justify-between mb-2 text-sm text-gray-400">
              <span>RECEIVING (EST)</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-2xl font-bold w-full text-gray-300 font-mono">
                 {estimatedOutput}
               </div>
               <div className="flex items-center gap-2 bg-cyber-gray px-3 py-1 rounded border border-cyber-purple/30 text-cyber-purple font-bold">
                 {swapDirection === 'SOL_TO_DIAMOND' ? 'DIAMOND' : 'SOL'}
              </div>
            </div>
          </div>

          {/* Price Info */}
          <div className="flex justify-between text-xs text-gray-500 font-mono border-t border-cyber-gray/30 pt-3 mt-1">
            <span>Exchange Rate</span>
            <span className="text-cyber-cyan">
                {isPumpFunMode ? 'DYNAMIC BONDING CURVE' : `1 SOL ≈ ${RATE.toFixed(2)} DIAMOND`}
            </span>
          </div>
          
          <div className="text-[10px] text-red-500/80 font-mono text-center">
            ⚠ WARNING: MAINNET TRANSACTIONS ARE IRREVERSIBLE.
          </div>

          {/* Action */}
          <Button 
            className="w-full mt-4" 
            onClick={handleSwap} 
            isLoading={isSwapping}
            disabled={!fromAmount || parseFloat(fromAmount) <= 0}
          >
            {wallet.connected 
                ? (isPumpFunMode && swapDirection === 'SOL_TO_DIAMOND' ? 'BUY ON PUMP.FUN' : 'INITIATE SWAP') 
                : 'CONNECT WALLET'}
          </Button>

          {status && (
            <div className={`text-center p-3 rounded bg-opacity-20 text-xs font-mono break-all ${status.includes('Error') || status.includes('Failed') ? 'bg-red-500 text-red-300' : 'bg-green-500 text-green-300'}`}>
              {status}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};