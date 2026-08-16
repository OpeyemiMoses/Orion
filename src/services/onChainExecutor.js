// ─── On-Chain Transaction Executor ───────────────────────────────────────────
// Directly interacts with window.ethereum to broadcast real transactions to Base Mainnet (Chain ID 8453 / 0x2105)

export const BASE_CHAIN_ID_HEX = '0x2105'; // 8453
export const BASESCAN_TX_URL   = 'https://basescan.org/tx/';

// ── Ensure wallet is on Base Mainnet ─────────────────────────────────────────
export async function ensureBaseNetwork() {
  if (!window.ethereum) throw new Error('No Web3 wallet (MetaMask, Coinbase Wallet) detected.');

  const currentChain = await window.ethereum.request({ method: 'eth_chainId' });
  if (currentChain.toLowerCase() === BASE_CHAIN_ID_HEX.toLowerCase()) return true;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BASE_CHAIN_ID_HEX }],
    });
    return true;
  } catch (switchError) {
    // Chain not added to wallet yet
    if (switchError.code === 4902 || switchError.message?.includes('Unrecognized chain')) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: BASE_CHAIN_ID_HEX,
          chainName: 'Base Mainnet',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://mainnet.base.org'],
          blockExplorerUrls: ['https://basescan.org'],
        }],
      });
      return true;
    }
    throw switchError;
  }
}

// ── Standard ERC-20 Revoke (Approve 0) ────────────────────────────────────────
// approve(address spender, uint256 amount) -> 0x095ea7b3
export async function sendRevokeTransaction(tokenAddress, spenderAddress, userAddress) {
  await ensureBaseNetwork();
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

// ── Generic On-Chain Transaction Dispatcher ──────────────────────────────────
export async function sendOnChainTx({ from, to, data = '0x', value = '0x0' }) {
  await ensureBaseNetwork();

  const txParams = {
    from,
    to,
    data,
    value,
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

// ── Moonwell / Compound Repay Action ──────────────────────────────────────────
// Moonwell mToken repayBorrow(uint256) -> 0x0e752702
export async function executeMoonwellRepay(mTokenAddress, userAddress, amountWeiHex) {
  await ensureBaseNetwork();
  const data = '0x0e752702' + amountWeiHex.replace('0x', '').padStart(64, '0');
  return sendOnChainTx({
    from: userAddress,
    to: mTokenAddress,
    data,
    value: '0x0',
  });
}

// ── Token Approval for Yield Reallocation Deposit ────────────────────────────
// approve(address spender, uint256 amount) -> approve target pool router
export async function executeApproveForReallocate(tokenAddress, routerAddress, userAddress) {
  await ensureBaseNetwork();
  // Max uint256 or specific amount
  const maxApproval = 'f'.repeat(64);
  const cleanSpender = routerAddress.toLowerCase().replace('0x', '').padStart(64, '0');
  const data = '0x095ea7b3' + cleanSpender + maxApproval;

  return sendOnChainTx({
    from: userAddress,
    to: tokenAddress,
    data,
    value: '0x0',
  });
}
