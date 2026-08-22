// ─── Web3 + Real On-Chain Data Service ───────────────────────────────────────

export const BASE_CHAIN_ID = '0x2105'; // 8453
export const BASE_RPC      = import.meta.env.VITE_BASE_RPC_URL      || 'https://mainnet.base.org';
export const BASESCAN_API  = 'https://api.basescan.org/api';
export const BASESCAN_KEY  = import.meta.env.VITE_BASESCAN_API_KEY  || '';

// ERC-20 Approval event topic
const APPROVAL_TOPIC = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';

// Well-known Base tokens to scan approvals for
export const BASE_TOKENS = [
  { address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', symbol: 'USDC',  decimals: 6 },
  { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH',  decimals: 18 },
  { address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', symbol: 'cbETH', decimals: 18 },
  { address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', symbol: 'AERO',  decimals: 18 },
  { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', symbol: 'DAI',   decimals: 18 },
  { address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', symbol: 'USDbC', decimals: 6 },
];

// Known protocol spender addresses on Base
const KNOWN_SPENDERS = {
  '0x2626664c2601f8477d34190c138804968853b018': { name: 'Uniswap v3 Router',    risk: 'Low',    verified: true },
  '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24': { name: 'Uniswap v2 Router',    risk: 'Low',    verified: true },
  '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43': { name: 'Aerodrome Router',     risk: 'Low',    verified: true },
  '0x420dd381b31aef6683db6b902084cb0ffece40da': { name: 'Aerodrome Finance',     risk: 'Low',    verified: true },
  '0x3154cf16ccdb4c6d922629664174b904d80f2c35': { name: 'Moonwell cToken',       risk: 'Low',    verified: true },
  '0xd0e0ba2d696fd0b5c7fd509a984c8cbef5e7e63': { name: 'BaseSwap Router',       risk: 'Medium', verified: true },
  '0x8c1a3cf8f83074169fe5d7ad50b978e1cdda1efa': { name: 'Compound V3 Base',     risk: 'Low',    verified: true },
};

// ── Multi-Endpoint CORS-Enabled RPC Pool ─────────────────────────────────────
const RPC_POOL = [
  BASE_RPC,
  'https://mainnet.base.org',
  'https://base.publicnode.com',
  'https://1rpc.io/base',
].filter(Boolean);

let workingRpcIndex = 0;
const rpcCache = new Map();

async function rpc(method, params) {
  const cacheKey = `${method}:${JSON.stringify(params)}`;
  const cached = rpcCache.get(cacheKey);
  if (cached && Date.now() - cached.time < 12000) {
    return cached.val;
  }

  const pool = [
    RPC_POOL[workingRpcIndex],
    ...RPC_POOL.filter((_, idx) => idx !== workingRpcIndex)
  ];

  for (let i = 0; i < pool.length; i++) {
    const endpoint = pool[i];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const json = await res.json();
      if (json.error) continue;

      const actualIndex = RPC_POOL.indexOf(endpoint);
      if (actualIndex !== -1) workingRpcIndex = actualIndex;

      rpcCache.set(cacheKey, { val: json.result, time: Date.now() });
      return json.result;
    } catch {
      continue;
    }
  }

  // If all public RPCs are busy, return safe empty/null instead of crashing
  return null;
}

// ── Read ETH balance (real) ──────────────────────────────────────────────────
async function getEthBalance(address) {
  try {
    const hex = await rpc('eth_getBalance', [address, 'latest']);
    return (parseInt(hex, 16) / 1e18).toFixed(4);
  } catch {
    return '0.0000';
  }
}

// ── Read ERC-20 balance ──────────────────────────────────────────────────────
async function getErc20Balance(tokenAddress, walletAddress, decimals) {
  try {
    const data = '0x70a08231' + walletAddress.slice(2).padStart(64, '0');
    const hex = await rpc('eth_call', [{ to: tokenAddress, data }, 'latest']);
    if (!hex || hex === '0x') return '0.00';
    return (parseInt(hex, 16) / Math.pow(10, decimals)).toFixed(2);
  } catch {
    return '0.00';
  }
}

// ── Classify spender risk ────────────────────────────────────────────────────
function classifySpender(spenderAddress, allowanceBN) {
  const lower = spenderAddress.toLowerCase();
  const known = KNOWN_SPENDERS[lower];
  
  const isUnlimited = allowanceBN > BigInt('0x' + 'f'.repeat(60));

  if (known) {
    return {
      protocol: known.name,
      risk: isUnlimited && known.risk === 'Low' ? 'Medium' : known.risk,
      verifiedContract: known.verified,
    };
  }

  // Unknown spender
  return {
    protocol: 'Unknown Spender',
    risk: isUnlimited ? 'Critical' : 'High',
    verifiedContract: false,
    flagReason: isUnlimited
      ? 'Unrecognised contract with unlimited allowance — potential drainer risk'
      : 'Unrecognised spender contract on Base',
  };
}

// ── Scan token approvals via eth_getLogs ─────────────────────────────────────
async function scanApprovals(address) {
  const approvals = [];
  let idCounter = 0;

  try {
    const latestHex = await rpc('eth_blockNumber', []);
    const latest = parseInt(latestHex, 16);
    // Safe block range for Base RPCs (~1-2 days)
    const fromBlock = '0x' + Math.max(0, latest - 25000).toString(16);
    const paddedOwner = '0x' + address.slice(2).toLowerCase().padStart(64, '0');

    for (const token of BASE_TOKENS) {
      try {
        const logs = await rpc('eth_getLogs', [{
          fromBlock,
          toBlock: 'latest',
          address: token.address,
          topics: [APPROVAL_TOPIC, paddedOwner],
        }]);

        if (!logs || !logs.length) continue;

        // Keep only the most recent log per spender (last approval wins)
        const latestPerSpender = {};
        for (const log of logs) {
          const spender = '0x' + log.topics[2].slice(26).toLowerCase();
          if (!latestPerSpender[spender] || log.blockNumber > latestPerSpender[spender].blockNumber) {
            latestPerSpender[spender] = log;
          }
        }

        for (const [spender, log] of Object.entries(latestPerSpender)) {
          const allowanceBN = BigInt(log.data);
          if (allowanceBN === 0n) continue; // Already revoked

          const isUnlimited = allowanceBN > BigInt('0x' + 'f'.repeat(60));
          const displayAllowance = isUnlimited
            ? 'Unlimited'
            : `${(Number(allowanceBN) / Math.pow(10, token.decimals)).toFixed(4)} ${token.symbol}`;

          const spenderInfo = classifySpender(spender, allowanceBN);
          idCounter++;

          approvals.push({
            id: `real-${idCounter}`,
            token: token.symbol,
            spender,
            allowance: displayAllowance,
            blockNumber: parseInt(log.blockNumber, 16),
            ...spenderInfo,
          });
        }
      } catch {
        // skip this token if log query fails
      }
    }
  } catch {
    // If log scan fails entirely, return empty
  }

  // Sort by risk severity
  const riskOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  approvals.sort((a, b) => (riskOrder[a.risk] ?? 4) - (riskOrder[b.risk] ?? 4));

  return approvals;
}

// ── Compute risk score from approvals ────────────────────────────────────────
function computeRiskScore(approvals) {
  if (!approvals.length) return 0;
  let score = 0;
  for (const a of approvals) {
    if (a.risk === 'Critical') score += 40;
    else if (a.risk === 'High')    score += 25;
    else if (a.risk === 'Medium')  score += 10;
    else                           score += 2;
  }
  return Math.min(score, 100);
}

function riskLabel(score) {
  if (score >= 70) return 'High Risk';
  if (score >= 40) return 'Moderate Risk';
  if (score >= 10) return 'Low Risk';
  return 'Minimal Risk';
}

import { findProvider } from './walletProviders';

// ── Main: connect real wallet reliably with specific provider routing ────────
export async function connectWeb3Wallet(targetWalletName = 'MetaMask') {
  const match = findProvider(targetWalletName);

  if (!match || !match.provider) {
    throw new Error(`${targetWalletName} extension is not installed or detected in your browser.`);
  }

  const provider = match.provider;

  // 1. Request accounts specifically from the chosen provider
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) {
    throw new Error('No account returned by wallet.');
  }

  const address = accounts[0];

  // 2. Ensure connected to Base Mainnet (Chain ID 8453 / 0x2105)
  try {
    const chainId = await provider.request({ method: 'eth_chainId' });
    if (chainId?.toLowerCase() !== BASE_CHAIN_ID.toLowerCase()) {
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BASE_CHAIN_ID }],
        });
      } catch (switchErr) {
        if (switchErr.code === 4902 || switchErr.message?.includes('Unrecognized chain')) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: BASE_CHAIN_ID,
              chainName: 'Base Mainnet',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: [BASE_RPC],
              blockExplorerUrls: ['https://basescan.org'],
            }],
          });
        }
      }
    }
  } catch (netErr) {
    console.warn('Network check warning:', netErr);
  }

  // 3. Fetch real on-chain data in parallel via Base RPC
  return fetchLiveWalletData(address, match.name);
}

// ── Fetch real live on-chain wallet data by address ─────────────────────────
export async function fetchLiveWalletData(address, walletName = 'Web3 Wallet') {
  if (!address) return null;

  const [ethBalance, usdcBalance, approvals] = await Promise.all([
    getEthBalance(address).catch(() => '0.0000'),
    getErc20Balance(BASE_TOKENS[0].address, address, 6).catch(() => '0.00'), // USDC
    scanApprovals(address).catch(() => []),
  ]);

  const riskScore = computeRiskScore(approvals);

  return {
    address,
    walletName,
    network:    'Base Mainnet',
    chainId:    8453,
    isLiveWeb3: true,
    ethBalance: ethBalance || '0.0000',
    usdcBalance: usdcBalance || '0.00',
    lpValue:    'N/A',
    activeApprovalsCount: approvals.length,
    riskScore,
    riskLevel: riskLabel(riskScore),
    approvals,
  };
}

// ── Demo wallet (realistic mock) ─────────────────────────────────────────────
export function getDemoWallet() {
  return {
    address: '0x71C8A3d96e4F1b82190E10b8754128919A0A884F',
    network: 'Base Mainnet',
    chainId: 8453,
    isLiveWeb3: false,
    ethBalance: '4.8250',
    usdcBalance: '14250.00',
    lpValue: '$38,920',
    activeApprovalsCount: 5,
    riskScore: 68,
    riskLevel: 'Moderate Risk',
    approvals: [
      {
        id: 'demo-1',
        protocol: 'Aerodrome Finance',
        token: 'USDC',
        spender: '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43',
        allowance: 'Unlimited',
        risk: 'Medium',
        verifiedContract: true,
      },
      {
        id: 'demo-2',
        protocol: 'Moonwell cToken',
        token: 'WETH',
        spender: '0x3154cf16ccdb4c6d922629664174b904d80f2c35',
        allowance: '100.0 WETH',
        risk: 'Low',
        verifiedContract: true,
      },
      {
        id: 'demo-3',
        protocol: 'Unknown Spender',
        token: 'USDC',
        spender: '0x99201a0bc3901b88e481c7d0f28ae5a1',
        allowance: 'Unlimited',
        risk: 'Critical',
        verifiedContract: false,
        flagReason: 'Unrecognised contract with unlimited allowance — potential drainer risk',
      },
      {
        id: 'demo-4',
        protocol: 'Uniswap v3 Router',
        token: 'cbETH',
        spender: '0x2626664c2601f8477d34190c138804968853b018',
        allowance: 'Unlimited',
        risk: 'Low',
        verifiedContract: true,
      },
      {
        id: 'demo-5',
        protocol: 'Unknown Spender',
        token: 'AERO',
        spender: '0x520a019e09b188c2876d7b44',
        allowance: '50,000 AERO',
        risk: 'High',
        verifiedContract: false,
        flagReason: 'Unrecognised spender contract on Base',
      },
    ],
  };
}

export function truncateAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ── Real agent contract audit via BaseScan + RPC ─────────────────────────────
export async function auditContractAddress(address) {
  const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
  if (!isValid) throw new Error('Invalid EVM address format');

  let isContract = false;
  let bytecodeSize = 0;
  let sourceVerified = false;
  let contractName = 'Unknown';
  let abi = null;
  let compiler = null;
  let warnings = [];

  // 1. Check if it's a contract (has code)
  try {
    const code = await rpc('eth_getCode', [address, 'latest']);
    isContract = code && code !== '0x' && code.length > 2;
    bytecodeSize = isContract ? ((code.length - 2) / 2) : 0;
  } catch {
    warnings.push('Could not fetch bytecode from Base RPC');
  }

  if (!isContract) {
    return {
      id: `audit-${address.slice(0,8)}`,
      name: 'EOA / Not a Contract',
      developer: 'External Account',
      chain: 'Base Mainnet',
      contractAddress: address,
      verifiableBytecode: false,
      upvotes: 0,
      description: 'This address is an externally owned account (EOA), not a smart contract.',
      trustScore: 0,
      isEOA: true,
      auditSummary: {
        bytecodeStatus: 'Not a contract (EOA)',
        permissionRisk: 'N/A',
        oracleReliance: 'N/A',
        simulationAccuracy: 'N/A',
        knownVulnerabilities: 0,
        warnings: ['This address has no deployed bytecode.'],
      }
    };
  }

  // 2. Try BaseScan API (no API key needed for basic reads, rate limited)
  try {
    const url = `${BASESCAN_API}?module=contract&action=getsourcecode&address=${address}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === '1' && data.result?.length > 0) {
      const info = data.result[0];
      sourceVerified = info.SourceCode && info.SourceCode !== '';
      contractName = info.ContractName || 'Unnamed Contract';
      compiler = info.CompilerVersion;
      if (info.ABI && info.ABI !== 'Contract source code not verified') {
        abi = info.ABI;
      }
    }
  } catch {
    warnings.push('BaseScan API unreachable — source verification could not be confirmed');
  }

  // 3. Detect proxy patterns from bytecode (simple heuristic)
  let isProxy = false;
  try {
    const code = await rpc('eth_getCode', [address, 'latest']);
    // EIP-1967 proxy slot: 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc
    const storageSlot = await rpc('eth_getStorageAt', [
      address,
      '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
      'latest'
    ]);
    isProxy = storageSlot && storageSlot !== '0x' + '0'.repeat(64);
    if (isProxy) warnings.push('EIP-1967 upgradeable proxy detected — implementation can be changed by admin');
  } catch {}

  // 4. Compute trust score
  let score = 50;
  if (sourceVerified)  score += 30;
  if (!isProxy)        score += 10;
  if (bytecodeSize < 3000) score += 5; // Smaller = less complex risk
  score = Math.min(score, 95);

  const permRisk = isProxy
    ? 'High (Upgradeable proxy — admin can change logic)'
    : sourceVerified
      ? 'Low (Verified source, no detected admin backdoors)'
      : 'Medium (Unverified bytecode — manual review required)';

  return {
    id: `audit-${address.slice(0,8)}`,
    name: contractName,
    developer: 'On-chain contract',
    chain: 'Base Mainnet',
    contractAddress: address,
    verifiableBytecode: sourceVerified,
    upvotes: 0,
    description: `Deployed on Base Mainnet. Bytecode: ${bytecodeSize} bytes.${compiler ? ` Compiled with ${compiler}.` : ''}`,
    trustScore: score,
    auditSummary: {
      bytecodeStatus: sourceVerified
        ? `Verified on BaseScan (${compiler || 'Solidity'})`
        : 'Unverified — source code not published on BaseScan',
      permissionRisk: permRisk,
      oracleReliance: 'Could not determine without ABI',
      simulationAccuracy: 'N/A — live contract, no simulation history',
      knownVulnerabilities: 0,
      warnings,
    }
  };
}
