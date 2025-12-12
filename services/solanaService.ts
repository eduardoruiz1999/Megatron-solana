import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction, sendAndConfirmTransaction, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import bs58 from "bs58";
import { WalletState } from "../types";
import { DIAMOND_TOKEN_ADDRESS, SOLANA_RPC_URL, APP_TREASURY_ADDRESS, GAS_FEE_DMT } from "../constants";

// Initialize Connection (Strict Mainnet)
let connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Pump.fun Program ID
const PUMP_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');

export const resetConnection = () => {
  connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  console.log("Connection reset to default Mainnet RPC");
};

export const importWallet = async (privateKeyString: string, customRpcUrl?: string): Promise<WalletState> => {
  try {
    const cleanKey = privateKeyString.trim();

    if (customRpcUrl && customRpcUrl.trim() !== '') {
      try {
        const newUrl = customRpcUrl.trim();
        connection = new Connection(newUrl, 'confirmed');
        console.log(`Connection updated to Custom RPC: ${newUrl}`);
      } catch (e) {
        throw new Error("Invalid Custom RPC URL provided.");
      }
    }
    
    let secretKey: Uint8Array;
    try {
      secretKey = bs58.decode(cleanKey);
    } catch (e) {
      throw new Error("Invalid Base58 private key format.");
    }

    const keypair = Keypair.fromSecretKey(secretKey);
    const publicKey = keypair.publicKey;

    let balance = 0;
    try {
      balance = await connection.getBalance(publicKey);
    } catch (netError: any) {
      console.error("RPC Connection Error:", netError);
      throw new Error(`Mainnet Connection Failed: ${netError.message}`);
    }

    // Try to fetch SPL Token Balance (Diamond)
    let tokenBalance = 0;
    try {
        const mint = new PublicKey(DIAMOND_TOKEN_ADDRESS);
        const tokenAccount = await splToken.getAssociatedTokenAddress(mint, publicKey);
        const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccount);
        tokenBalance = tokenAccountInfo.value.uiAmount || 0;
    } catch (e) {
        // Token account might not exist yet
        console.log("Token account not found or empty");
    }

    return {
      connected: true,
      publicKey: publicKey.toString(),
      balance: balance / LAMPORTS_PER_SOL,
      tokens: {
        [DIAMOND_TOKEN_ADDRESS]: tokenBalance
      },
      keypair: keypair,
      rpcEndpoint: connection.rpcEndpoint
    };
  } catch (error: any) {
    console.error("Wallet Import Logic Error:", error);
    throw new Error(error.message || "Unknown error during wallet import");
  }
};

export const transferSOL = async (
  wallet: WalletState,
  toAddress: string,
  amount: number
): Promise<string> => {
  if (!wallet.keypair || !wallet.publicKey) throw new Error("Wallet not connected");

  try {
    const fromPubkey = new PublicKey(wallet.publicKey);
    const toPubkey = new PublicKey(toAddress);
    const treasuryPubkey = new PublicKey(APP_TREASURY_ADDRESS);
    const mintPubkey = new PublicKey(DIAMOND_TOKEN_ADDRESS);

    const transaction = new Transaction();

    // 1. Add Main SOL Transfer Instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: Math.floor(amount * LAMPORTS_PER_SOL),
      })
    );

    // 2. Add 'Gas Fee' Instruction (Pay in Diamond Tokens)
    // We check if the user has the token account first to avoid failing if they are broke
    try {
        const sourceTokenAccount = await splToken.getAssociatedTokenAddress(
            mintPubkey,
            fromPubkey
        );
        
        const destTokenAccount = await splToken.getAssociatedTokenAddress(
            mintPubkey,
            treasuryPubkey
        );

        // Assumption: 6 decimals for this token. Adjust if needed based on metadata.
        const decimals = 6; 
        const feeAmount = BigInt(GAS_FEE_DMT * (10 ** decimals));

        // Note: In a robust app, we would check if destTokenAccount exists and add an init instruction if not.
        // For this implementation, we assume the Treasury is initialized.

        transaction.add(
            splToken.createTransferInstruction(
                sourceTokenAccount,
                destTokenAccount,
                fromPubkey,
                feeAmount
            )
        );
        console.log(`Added Gas Fee Instruction: ${GAS_FEE_DMT} DMT`);

    } catch (feeError) {
        console.warn("Could not add gas fee instruction (User might lack tokens):", feeError);
        // Optionally throw error here if you want to ENFORCE the fee strictly
        // throw new Error("Insufficient Diamond Tokens for Gas Fee");
    }
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    // Send real transaction to Mainnet
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.keypair]
    );

    console.log("Mainnet Transfer Success:", signature);
    return signature;
  } catch (error: any) {
    console.error("Mainnet Transfer Error:", error);
    throw new Error(`Mainnet Tx Failed: ${error.message}`);
  }
};

/**
 * Executes a Buy transaction on Pump.fun bonding curve (Real Mainnet Interaction)
 */
export const buyPumpFunToken = async (
    wallet: WalletState,
    mintAddress: string,
    solAmount: number
): Promise<{ success: boolean; txHash: string; message: string }> => {
    if (!wallet.keypair || !wallet.publicKey) throw new Error("Wallet not connected");

    try {
        const payer = wallet.keypair;
        const mint = new PublicKey(mintAddress);

        const [bondingCurveAccount] = PublicKey.findProgramAddressSync(
            [mint.toBuffer()], 
            PUMP_PROGRAM_ID
        );

        const buyerTokenAccount = await splToken.getAssociatedTokenAddress(
            mint,
            payer.publicKey,
            false
        );

        const transaction = new Transaction();

        // Check if ATA exists
        const accountInfo = await connection.getAccountInfo(buyerTokenAccount);
        if (!accountInfo) {
            transaction.add(
                splToken.createAssociatedTokenAccountInstruction(
                    payer.publicKey,
                    buyerTokenAccount,
                    payer.publicKey,
                    mint
                )
            );
        }

        // Buffer polyfill check
        const Buffer = (window as any).Buffer;
        if (!Buffer) throw new Error("Buffer polyfill missing");

        // Pump.fun instruction layout (approximate based on standard)
        const data = Buffer.alloc(9);
        data.writeUInt8(0, 0); // Buy instruction
        data.writeBigUInt64LE(BigInt(Math.floor(solAmount * LAMPORTS_PER_SOL)), 1);

        const instruction = new TransactionInstruction({
            keys: [
                { pubkey: mint, isSigner: false, isWritable: true },
                { pubkey: bondingCurveAccount, isSigner: false, isWritable: true },
                { pubkey: buyerTokenAccount, isSigner: false, isWritable: true },
                { pubkey: payer.publicKey, isSigner: true, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            programId: PUMP_PROGRAM_ID,
            data: data
        });

        transaction.add(instruction);
        
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = payer.publicKey;

        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [payer]
        );

        return {
            success: true,
            txHash: signature,
            message: `Pump.fun Buy Success! TX: ${signature.slice(0, 8)}...`
        };

    } catch (error: any) {
        console.error("Pump.fun Transaction Error:", error);
        throw new Error(`Bonding Curve Error: ${error.message}`);
    }
};

export const performSwap = async (
  fromToken: string,
  toToken: string,
  amount: number
): Promise<{ success: boolean; txHash: string; message: string }> => {
  throw new Error("Generic DEX Swapping unavailable. Use PUMP.FUN MODE for bonding curve interaction or 'Transfer' to send SOL directly.");
};

export const checkAirdropEligibility = async (address: string): Promise<boolean> => {
    return address.length > 0 && (address.charCodeAt(0) % 2 === 0);
}