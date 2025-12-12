import React, { useState } from 'react';
import { Gift, CheckCircle, XCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { WalletState } from '../types';
import { checkAirdropEligibility } from '../services/solanaService';

interface AirdropProps {
  wallet: WalletState;
}

export const Airdrop: React.FC<AirdropProps> = ({ wallet }) => {
  const [checking, setChecking] = useState(false);
  const [eligible, setEligible] = useState<boolean | null>(null);

  const handleCheck = async () => {
    if (!wallet.publicKey) return;
    setChecking(true);
    setEligible(null);
    try {
      const result = await checkAirdropEligibility(wallet.publicKey);
      setEligible(result);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-display font-bold text-white tracking-widest">
          SEASON 1 <span className="text-cyber-cyan">AIRDROP</span>
        </h2>
        <p className="text-gray-400">
          Verify your wallet activity to claim pending DIAMOND rewards.
          Snapshots are taken weekly.
        </p>
      </div>

      <Card className="p-8">
        {!wallet.connected ? (
          <div className="py-10">
            <Gift className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-lg">Connect Wallet to Check Eligibility</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 text-xl font-mono text-gray-300">
              Target: <span className="text-cyber-purple">{wallet.publicKey}</span>
            </div>

            {eligible === null && (
               <Button onClick={handleCheck} isLoading={checking} className="w-full md:w-auto min-w-[200px]">
                 CHECK STATUS
               </Button>
            )}

            {eligible === true && (
              <div className="animate-fade-in bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white mb-2">ELIGIBLE!</h3>
                <p className="text-gray-300 mb-4">You have 5,000 DIAMOND pending claim.</p>
                <Button variant="primary">CLAIM TOKENS</Button>
              </div>
            )}

            {eligible === false && (
              <div className="animate-fade-in bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white mb-2">NOT ELIGIBLE</h3>
                <p className="text-gray-300">Try increasing your trading volume on the DIAMOND/SOL pair.</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};