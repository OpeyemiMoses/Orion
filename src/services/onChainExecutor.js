// ─── On-Chain Transaction Executor ───────────────────────────────────────────
// Broadcasts real on-chain transactions to Base Mainnet (Chain ID 8453)
// Works seamlessly with Wagmi / RainbowKit connectors (MetaMask, Coinbase Wallet, WalletConnect, Rainbow, Rabby, etc.)

import { writeContract, waitForTransactionReceipt, sendTransaction } from '@wagmi/core';
import { erc20Abi } from 'viem';
import { config } from '../wagmiConfig';

export const BASE_CHAIN_ID_HEX = '0x2105'; // 8453
export const BASESCAN_TX_URL   = 'https://basescan.org/tx/';

// ── Standard ERC-20 Revoke (Approve 0) on Base Mainnet ───────────────────────
export async function sendRevokeTransaction(tokenAddress, spenderAddress, userAddress) {
  try {
    // 1. Try Wagmi writeContract (Primary for RainbowKit/Wagmi connectors)
    const hash = await writeContract(config, {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spenderAddress, 0n],
    });

    // Wait for on-chain block receipt
    const receipt = await waitForTransactionReceipt(config, { 
      hash,
      confirmations: 1 
    });

    return {
      txHash: hash,
      receipt,
      basescanUrl: `${BASESCAN_TX_URL}${hash}`,
    };
  } catch (wagmiErr) {
    // 2. Fallback to direct window.ethereum if Wagmi connector was not active
    if (window.ethereum) {
      const cleanSpender = spenderAddress.toLowerCase().replace('0x', '').padStart(64, '0');
      const zeroAmount   = '0'.repeat(64);
      const data         = '0x095ea7b3' + cleanSpender + zeroAmount;

      const txParams = {
        from: userAddress,
        to: tokenAddress,
        data: data,
        value: '0x0',
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      return {
        txHash,
        basescanUrl: `${BASESCAN_TX_URL}${txHash}`,
      };
    }

    throw wagmiErr;
  }
}

// ── Generic On-Chain Transaction Dispatcher ──────────────────────────────────
export async function sendOnChainTx({ from, to, data = '0x', value = '0x0' }) {
  try {
    const hash = await sendTransaction(config, {
      to,
      data,
      value: BigInt(value),
    });

    const receipt = await waitForTransactionReceipt(config, { hash, confirmations: 1 });
    return {
      txHash: hash,
      receipt,
      basescanUrl: `${BASESCAN_TX_URL}${hash}`,
    };
  } catch (wagmiErr) {
    if (window.ethereum) {
      const txParams = { from, to, data, value };
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });
      return {
        txHash,
        basescanUrl: `${BASESCAN_TX_URL}${txHash}`,
      };
    }
    throw wagmiErr;
  }
}

// ── Moonwell / Compound Repay Action ──────────────────────────────────────────
export async function executeMoonwellRepay(mTokenAddress, userAddress, amountWeiHex) {
  const data = '0x0e752702' + amountWeiHex.replace('0x', '').padStart(64, '0');
  return sendOnChainTx({
    from: userAddress,
    to: mTokenAddress,
    data,
    value: '0x0',
  });
}

// ── Token Approval for Yield Reallocation Deposit ────────────────────────────
export async function executeApproveForReallocate(tokenAddress, routerAddress, userAddress) {
  return writeContract(config, {
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'approve',
    args: [routerAddress, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')],
  });
}
