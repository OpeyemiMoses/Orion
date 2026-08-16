// ─── Autonomous Agent Engine v2 ──────────────────────────────────────────────
// Real data sources:
//   - Base RPC: Moonwell, Compound III, Aave V3, Seamless Protocol position reads
//   - DeFi Llama Yields API: live APY across all Base pools
//   - Base RPC: on-chain incentive criteria (tx count, token balances, LP holdings)

const BASE_RPC     = import.meta.env.VITE_BASE_RPC_URL || 'https://mainnet.base.org';
const LLAMA_YIELDS = 'https://yields.llama.fi/pools';

// ── Protocol addresses on Base Mainnet ───────────────────────────────────────
const PROTOCOLS = {
  // ── Moonwell (Compound V2 fork) ──
  moonwell: {
    name: 'Moonwell',
    comptroller: '0xfbb21d0380bee3312b33c4353c8936a0f13ef26c',
    markets: {
      mUSDC:  { address: '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22', symbol: 'USDC',   decimals: 6,  priceUSD: 1    },
      mUSDbC: { address: '0x703843C3379b52F9FF486c9f5892218d2a065cC8', symbol: 'USDbC',  decimals: 6,  priceUSD: 1    },
      mETH:   { address: '0x628ff693426583D9a7FB391E54366292F509D457', symbol: 'WETH',   decimals: 18, priceUSD: 2800 },
      mcbETH: { address: '0x3bf93770f2d4a799c0cc25431371b4b9c9cbf61f', symbol: 'cbETH',  decimals: 18, priceUSD: 2900 },
      mwBTC:  { address: '0x92b42c66840C7AD907b4BF74879FF3eF7c529473', symbol: 'cbBTC',  decimals: 8,  priceUSD: 60000},
      mDAI:   { address: '0x73b06D8d18De422E269645eaCe15400DE7462417', symbol: 'DAI',    decimals: 18, priceUSD: 1    },
    },
  },
  // ── Compound III (single USDC market) ──
  compoundIII: {
    name: 'Compound III',
    usdc: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf',
    // Supported collateral assets
    collateral: {
      WETH:  { address: '0x4200000000000000000000000000000000000006', decimals: 18, priceUSD: 2800 },
      cbETH: { address: '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22', decimals: 18, priceUSD: 2900 },
      cbBTC: { address: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', decimals: 8,  priceUSD: 60000},
    },
  },
  // ── Aave V3 (getUserAccountData = one call for full position) ──
  aaveV3: {
    name: 'Aave V3',
    pool: '0xa238dd80c259a72e81d7e4664a9801593f98d1c5',
  },
  // ── Seamless Protocol (Aave V3 fork on Base) ──
  seamless: {
    name: 'Seamless Protocol',
    pool: '0x8f9b4525681f3ea6e43b8e0a57bff5265c3c702d',
  },
};

// ── Governance / incentive tokens ────────────────────────────────────────────
const TOKENS = {
  AERO:   '0x940181a94a35a4569e4529a3cdfb74e38fd98631',
  veAERO: '0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4',
  WELL:   '0xff8adec2221f9f4d8dfbafa6b9a297d17603493d',
  USDC:   '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  WETH:   '0x4200000000000000000000000000000000000006',
};

// ── RPC helpers ───────────────────────────────────────────────────────────────
async function rpc(method, params) {
  const res = await fetch(BASE_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const { result, error } = await res.json();
  if (error) throw new Error(error.message);
  return result;
}

async function call(to, data) {
  try {
    const r = await rpc('eth_call', [{ to, data }, 'latest']);
    return r && r !== '0x' ? r : null;
  } catch { return null; }
}

function pad(addr) { return addr.slice(2).padStart(64, '0'); }
function decodeUint(hex, slot = 0) {
  if (!hex) return 0n;
  return BigInt('0x' + hex.slice(2 + slot * 64, 2 + (slot + 1) * 64));
}

// ── ERC-20 balanceOf ──────────────────────────────────────────────────────────
async function balanceOf(token, wallet) {
  const r = await call(token, '0x70a08231' + pad(wallet));
  return r ? BigInt('0x' + r.slice(2)) : 0n;
}

// ── Moonwell: read all markets for a wallet ───────────────────────────────────
async function readMoonwell(wallet) {
  const positions = [];
  for (const [symbol, market] of Object.entries(PROTOCOLS.moonwell.markets)) {
    try {
      // getAccountSnapshot(address) → (error, mTokenBalance, borrowBalance, exchangeRate)
      const r = await call(market.address, '0xc37f68e2' + pad(wallet));
      if (!r) continue;
      const err     = Number(decodeUint(r, 0));
      const mBal    = decodeUint(r, 1);
      const borrow  = decodeUint(r, 2);
      const exRate  = decodeUint(r, 3);
      if (err !== 0) continue;

      const scale   = BigInt(10 ** market.decimals);
      const supplied = (mBal * exRate) / (BigInt(1e18) * scale);
      const supplyAmt = Number(supplied);
      const borrowAmt = Number(borrow) / 10 ** market.decimals;
      if (supplyAmt < 0.0001 && borrowAmt < 0.0001) continue;

      positions.push({
        protocol: 'Moonwell',
        market:   symbol,
        asset:    market.symbol,
        supplyAmt,
        borrowAmt,
        supplyUSD: supplyAmt * market.priceUSD,
        borrowUSD: borrowAmt * market.priceUSD,
        ltv: 0.8,
      });
    } catch { /* skip */ }
  }
  return positions;
}

// ── Compound III: borrow + collateral for a wallet ────────────────────────────
async function readCompoundIII(wallet) {
  try {
    const comet = PROTOCOLS.compoundIII.usdc;
    // borrowBalanceOf(address) → 0x374c49b4
    const borrowHex = await call(comet, '0x374c49b4' + pad(wallet));
    const borrowUSD = borrowHex ? Number(BigInt('0x' + borrowHex.slice(2))) / 1e6 : 0;

    let supplyUSD = 0;
    for (const [sym, col] of Object.entries(PROTOCOLS.compoundIII.collateral)) {
      // collateralBalanceOf(address, asset) → 0xd1e4b3f6
      const r = await call(comet, '0xd1e4b3f6' + pad(wallet) + pad(col.address));
      if (r) {
        const amt = Number(BigInt('0x' + r.slice(2))) / 10 ** col.decimals;
        supplyUSD += amt * col.priceUSD;
      }
    }

    if (borrowUSD < 0.01 && supplyUSD < 0.01) return null;
    return {
      protocol: 'Compound III',
      market: 'USDC Market',
      asset: 'USDC',
      supplyAmt: 0,
      borrowAmt: borrowUSD,
      supplyUSD,
      borrowUSD,
      ltv: 0.8,
    };
  } catch { return null; }
}

// ── Aave V3 / Seamless: getUserAccountData (one call) ─────────────────────────
async function readAaveStyle(wallet, protocolKey) {
  const proto = PROTOCOLS[protocolKey];
  try {
    // getUserAccountData(address) → 0xbf92857c
    // returns: totalCollateralBase, totalDebtBase, availableBorrowsBase,
    //          currentLiquidationThreshold, ltv, healthFactor  (all 8-decimal USD or 18-decimal ratio)
    const r = await call(proto.pool, '0xbf92857c' + pad(wallet));
    if (!r || r === '0x') return null;
    const collateral  = Number(decodeUint(r, 0)) / 1e8; // USD, 8 decimals
    const debt        = Number(decodeUint(r, 1)) / 1e8;
    const hf          = Number(decodeUint(r, 5)) / 1e18;
    if (collateral < 0.01 && debt < 0.01) return null;
    return {
      protocol: proto.name,
      market: 'Multi-asset',
      asset: 'Various',
      supplyAmt: 0,
      borrowAmt: debt,
      supplyUSD: collateral,
      borrowUSD: debt,
      healthFactor: isFinite(hf) ? hf : null,
      ltv: 0.8,
    };
  } catch { return null; }
}

// ── Compute health factor from all positions ──────────────────────────────────
export function computeHealthFactor(positions) {
  // Use Aave-provided HF if available (most accurate)
  const aavePos = positions.find(p => p.healthFactor !== undefined);
  if (aavePos?.healthFactor) return aavePos.healthFactor;
  const weighted = positions.reduce((s, p) => s + p.supplyUSD * (p.ltv || 0.8), 0);
  const debt     = positions.reduce((s, p) => s + p.borrowUSD, 0);
  return debt > 0 ? weighted / debt : Infinity;
}

// ── On-chain incentive qualification checks ───────────────────────────────────
async function checkIncentiveCriteria(wallet) {
  const checks = {};
  try {
    // Tx count — proxy for on-chain activity breadth
    const txCountHex = await rpc('eth_getTransactionCount', [wallet, 'latest']);
    checks.txCount = txCountHex ? parseInt(txCountHex, 16) : 0;
    checks.swap_5    = checks.txCount >= 5;
    checks.interact3 = checks.txCount >= 15;

    // ETH balance
    const ethHex = await rpc('eth_getBalance', [wallet, 'latest']);
    checks.ethBalance = ethHex ? Number(BigInt(ethHex)) / 1e18 : 0;
    checks.bridge_in  = checks.ethBalance > 0.01; // likely bridged in

    // AERO token balance
    const aeroBal = await balanceOf(TOKENS.AERO, wallet);
    checks.aeroBalance = Number(aeroBal) / 1e18;
    checks.holds_aero  = checks.aeroBalance > 0.01;

    // veAERO balance (locked AERO = has voted / participating in governance)
    const veAeroBal = await balanceOf(TOKENS.veAERO, wallet);
    checks.veAeroBalance = Number(veAeroBal) / 1e18;
    checks.vote_aero     = checks.veAeroBalance > 0;

    // WELL balance (Moonwell governance)
    const wellBal = await balanceOf(TOKENS.WELL, wallet);
    checks.wellBalance = Number(wellBal) / 1e18;

    // USDC balance (has stablecoin to supply)
    const usdcBal = await balanceOf(TOKENS.USDC, wallet);
    checks.usdcBalance = Number(usdcBal) / 1e6;
    checks.supply_500  = checks.usdcBalance >= 500;
  } catch { /* partial data is fine */ }
  return checks;
}

// ── Known Base incentive programs ─────────────────────────────────────────────
export function buildIncentivePrograms(onChain, lendingPositions) {
  const hasBorrow = lendingPositions.some(p => p.borrowAmt > 0);
  const hasLend   = lendingPositions.some(p => p.supplyUSD >= 500);

  return [
    {
      id: 'aero-season3',
      name: 'Aerodrome Season 3 LP Incentives',
      protocol: 'Aerodrome Finance',
      type: 'LP Incentive',
      status: 'active',
      description: 'Provide liquidity in a veAERO-voted pool and hold for ≥ 7 days to earn AERO rewards this epoch.',
      estValue: '$120–$500/week per $10k deployed',
      actionGas: '~$0.12',
      risk: 'Low',
      criteria: [
        { id: 'holds_aero', label: 'Hold AERO tokens in wallet',        completed: onChain.holds_aero  ?? false, source: 'Token Holdings' },
        { id: 'vote_aero',  label: 'veAERO governance vote active',      completed: onChain.vote_aero   ?? false, source: 'Governance Participation' },
        { id: 'bridge_in',  label: 'ETH balance > 0.01 (active capital)', completed: onChain.bridge_in   ?? false, source: 'Wallet Balance' },
      ],
      action: 'Lock AERO & participate in Aerodrome voting',
    },
    {
      id: 'base-onchain-summer',
      name: 'Base Onchain Summer II',
      protocol: 'Base Ecosystem',
      type: 'Activity Campaign',
      status: 'active',
      description: 'Complete on-chain activity milestones. Wallet shows breadth across DeFi, NFT, and payment primitives.',
      estValue: 'Priority tier for ecosystem rewards',
      actionGas: '~$0.04',
      risk: 'Minimal',
      criteria: [
        { id: 'swap_5',    label: '≥ 5 transactions completed on Base', completed: onChain.swap_5    ?? false, source: 'Activity History' },
        { id: 'bridge_in', label: 'ETH balance > 0.01 ETH',             completed: onChain.bridge_in ?? false, source: 'Wallet Balance' },
        { id: 'interact3', label: '≥ 15 transactions across protocols', completed: onChain.interact3 ?? false, source: 'Ecosystem Breadth' },
      ],
      action: 'Execute swap on Aerodrome to satisfy milestone',
    },
    {
      id: 'moonwell-galaxy',
      name: 'Moonwell WELL Incentives',
      protocol: 'Moonwell',
      type: 'Lending Incentive',
      status: 'active',
      description: 'Supply ≥ $500 to any Moonwell market to earn WELL token rewards on top of base lending APY.',
      estValue: 'WELL tokens + boosted supply APY',
      actionGas: '~$0.08',
      risk: 'Low',
      criteria: [
        { id: 'supply_500', label: 'USDC balance ≥ $500 ready to supply', completed: onChain.supply_500 ?? false, source: 'Available Liquidity' },
        { id: 'has_lend',   label: 'Active lending position on Moonwell', completed: hasLend,                    source: 'Lending Market' },
        { id: 'borrow_any', label: 'Active borrow balance in any market', completed: hasBorrow,                  source: 'Lending Market' },
      ],
      action: 'Supply USDC to Moonwell lending market',
    },
    {
      id: 'extra-fi-points',
      name: 'Extra Finance Points Program',
      protocol: 'Extra Finance',
      type: 'Ecosystem Points',
      status: 'active',
      description: 'Earn points via yield farming on Base. Points convert to EXTRA governance tokens.',
      estValue: 'Token allocation at launch',
      actionGas: '~$0.15',
      risk: 'Medium',
      criteria: [
        { id: 'supply_500', label: 'USDC balance ≥ $500 (collateral)', completed: onChain.supply_500 ?? false, source: 'Available Liquidity' },
        { id: 'interact3',  label: '≥ 15 established transactions',    completed: onChain.interact3 ?? false, source: 'Activity History' },
      ],
      action: 'Open leveraged position on Extra Finance',
    },
  ].map(prog => {
    const done = prog.criteria.filter(c => c.completed).length;
    return {
      ...prog,
      completedCount: done,
      totalCount: prog.criteria.length,
      pctComplete: Math.round((done / prog.criteria.length) * 100),
      qualified: done === prog.criteria.length,
    };
  });
}

// ── DeFi Llama yields ─────────────────────────────────────────────────────────
export async function fetchBaseYields() {
  try {
    const res = await fetch(LLAMA_YIELDS);
    if (!res.ok) throw new Error('DeFi Llama unavailable');
    const { data } = await res.json();
    return data
      .filter(p => p.chain === 'Base' && p.apy > 0 && p.tvlUsd > 100_000)
      .map(p => ({
        pool: p.pool, protocol: p.project, symbol: p.symbol,
        apy: p.apy, apyBase: p.apyBase || 0, apyReward: p.apyReward || 0,
        tvl: p.tvlUsd, stablecoin: !!p.stablecoin, ilRisk: p.ilRisk,
        apyPct7d: p.apyPct7D,
      }))
      .sort((a, b) => b.tvl - a.tvl);
  } catch {
    return DEMO_YIELDS;
  }
}

const DEMO_YIELDS = [
  { pool: 'd1', protocol: 'aerodrome-finance', symbol: 'USDC/ETH',  apy: 18.4, apyBase: 4.2, apyReward: 14.2, tvl: 82e6,  stablecoin: false },
  { pool: 'd2', protocol: 'moonwell',          symbol: 'USDC',      apy: 8.42, apyBase: 5.1, apyReward: 3.32, tvl: 52e6,  stablecoin: true  },
  { pool: 'd3', protocol: 'compound-v3',       symbol: 'USDC',      apy: 6.91, apyBase: 6.91,apyReward: 0,    tvl: 29e6,  stablecoin: true  },
  { pool: 'd4', protocol: 'aerodrome-finance', symbol: 'USDC/AERO', apy: 31.2, apyBase: 6.1, apyReward: 25.1, tvl: 18e6,  stablecoin: false },
  { pool: 'd5', protocol: 'extra-finance',     symbol: 'ETH/USDC 2x',apy:22.4, apyBase: 8.1, apyReward: 14.3, tvl: 12e6, stablecoin: false },
  { pool: 'd6', protocol: 'aave-v3',          symbol: 'USDC',       apy: 7.3,  apyBase: 7.3, apyReward: 0,    tvl: 45e6,  stablecoin: true  },
  { pool: 'd7', protocol: 'morpho',           symbol: 'USDC',       apy: 9.1,  apyBase: 9.1, apyReward: 0,    tvl: 22e6,  stablecoin: true  },
  { pool: 'd8', protocol: 'beefy-finance',    symbol: 'USDC-AERO',  apy: 17.8, apyBase: 5.5, apyReward: 12.3, tvl: 8.5e6, stablecoin: false },
];

// ── Main scan: lending positions across ALL protocols ─────────────────────────
export async function scanLendingPositions(wallet) {
  if (!wallet?.address) {
    return { positions: DEMO_POSITIONS, healthFactor: 2.1, isDemo: true };
  }

  const [moonwell, compoundIII, aave, seamless] = await Promise.allSettled([
    readMoonwell(wallet.address),
    readCompoundIII(wallet.address),
    readAaveStyle(wallet.address, 'aaveV3'),
    readAaveStyle(wallet.address, 'seamless'),
  ]);

  const all = [
    ...(moonwell.status    === 'fulfilled' ? moonwell.value    : []),
    ...(compoundIII.status === 'fulfilled' && compoundIII.value ? [compoundIII.value] : []),
    ...(aave.status        === 'fulfilled' && aave.value        ? [aave.value]        : []),
    ...(seamless.status    === 'fulfilled' && seamless.value    ? [seamless.value]    : []),
  ];

  const hf = computeHealthFactor(all);
  return {
    positions: all,
    healthFactor: isFinite(hf) ? hf : null,
    isDemo: false,
  };
}

// ── Main scan: incentive qualification ───────────────────────────────────────
export async function scanIncentives(wallet, lendingPositions = []) {
  const onChain = wallet?.address
    ? await checkIncentiveCriteria(wallet.address)
    : {};
  const programs = buildIncentivePrograms(onChain, lendingPositions);
  return { programs, onChain };
}

const DEMO_POSITIONS = [
  { protocol: 'Moonwell', market: 'mUSDC', asset: 'USDC', supplyAmt: 8000, supplyUSD: 8000, borrowAmt: 3200, borrowUSD: 3200, ltv: 0.82 },
  { protocol: 'Moonwell', market: 'mETH',  asset: 'WETH', supplyAmt: 1.2,  supplyUSD: 3360, borrowAmt: 0,    borrowUSD: 0,    ltv: 0.8 },
];
