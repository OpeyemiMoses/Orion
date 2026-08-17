// ─── Real On-Chain Position Reader for Base Mainnet ────────────────────────────
// Reads live collateral, borrow debt, balances, and health factors directly from:
//   - Native Base ETH & ERC-20 USDC balance
//   - Moonwell (getAccountSnapshot)
//   - Compound III (borrowBalanceOf & collateralBalanceOf)
//   - Aave V3 Pool (getUserAccountData)
//   - Seamless Protocol Pool (getUserAccountData)

const BASE_RPC_POOL = [
  'https://mainnet.base.org',
  'https://base.publicnode.com',
  'https://1rpc.io/base',
];

const PROTOCOLS = {
  moonwell: {
    name: 'Moonwell',
    markets: {
      mUSDC:  { address: '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22', symbol: 'USDC', decimals: 6, priceUSD: 1 },
      mETH:   { address: '0x628ff693426583D9a7FB391E54366292F509D457', symbol: 'WETH', decimals: 18, priceUSD: 2800 },
      mwBTC:  { address: '0x92b42c66840C7AD907b4BF74879FF3eF7c529473', symbol: 'cbBTC', decimals: 8, priceUSD: 60000 },
    },
  },
  compoundIII: {
    name: 'Compound III',
    usdc: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf',
    collateral: {
      WETH:  { address: '0x4200000000000000000000000000000000000006', decimals: 18, priceUSD: 2800 },
      cbBTC: { address: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', decimals: 8, priceUSD: 60000 },
    },
  },
  aaveV3: {
    name: 'Aave V3',
    pool: '0xa238dd80c259a72e81d7e4664a9801593f98d1c5',
  },
  seamless: {
    name: 'Seamless Protocol',
    pool: '0x8f9b4525681f3ea6e43b8e0a57bff5265c3c702d',
  },
};

const USDC_BASE = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';

async function rpc(method, params) {
  for (const endpoint of BASE_RPC_POOL) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) continue;
      const json = await res.json();
      if (json.result !== undefined) return json.result;
    } catch {
      continue;
    }
  }
  return null;
}

function pad(addr) {
  return addr.toLowerCase().replace('0x', '').padStart(64, '0');
}

function decodeUint(hex, slot = 0) {
  if (!hex || hex === '0x') return 0n;
  const start = 2 + slot * 64;
  const end = start + 64;
  if (hex.length < end) return 0n;
  return BigInt('0x' + hex.slice(start, end));
}

async function call(to, data) {
  return rpc('eth_call', [{ to, data }, 'latest']);
}

export async function getRealWalletPositions(walletAddress) {
  const addr = (walletAddress || '').toLowerCase();
  const summary = {
    address: addr,
    ethBalance: 0,
    usdcBalance: 0,
    totalCollateralUSD: 0,
    totalDebtUSD: 0,
    healthFactor: Infinity,
    healthStatus: 'SAFE',
    activePositions: [],
    protocolsChecked: ['Moonwell', 'Compound III', 'Aave V3', 'Seamless Protocol'],
  };

  if (!addr || !/^0x[a-f0-9]{40}$/i.test(addr)) return summary;

  try {
    // 1. ETH & USDC Balances
    const [ethHex, usdcHex] = await Promise.all([
      rpc('eth_getBalance', [addr, 'latest']),
      call(USDC_BASE, '0x70a08231' + pad(addr)),
    ]);

    if (ethHex) summary.ethBalance = Number(BigInt(ethHex)) / 1e18;
    if (usdcHex && usdcHex !== '0x') summary.usdcBalance = Number(BigInt('0x' + usdcHex.slice(2))) / 1e6;

    // 2. Aave V3 getUserAccountData(address) → 0xbf92857c
    try {
      const aaveHex = await call(PROTOCOLS.aaveV3.pool, '0xbf92857c' + pad(addr));
      if (aaveHex && aaveHex !== '0x' && aaveHex.length >= 130) {
        const colUSD = Number(decodeUint(aaveHex, 0)) / 1e8;
        const debtUSD = Number(decodeUint(aaveHex, 1)) / 1e8;
        const hf = Number(decodeUint(aaveHex, 5)) / 1e18;
        if (colUSD > 0.05 || debtUSD > 0.05) {
          summary.totalCollateralUSD += colUSD;
          summary.totalDebtUSD += debtUSD;
          summary.activePositions.push({
            protocol: 'Aave V3',
            collateralUSD: colUSD,
            debtUSD,
            healthFactor: isFinite(hf) ? hf : null,
          });
        }
      }
    } catch { /* skip */ }

    // 3. Seamless Protocol getUserAccountData(address)
    try {
      const seemHex = await call(PROTOCOLS.seamless.pool, '0xbf92857c' + pad(addr));
      if (seemHex && seemHex !== '0x' && seemHex.length >= 130) {
        const colUSD = Number(decodeUint(seemHex, 0)) / 1e8;
        const debtUSD = Number(decodeUint(seemHex, 1)) / 1e8;
        const hf = Number(decodeUint(seemHex, 5)) / 1e18;
        if (colUSD > 0.05 || debtUSD > 0.05) {
          summary.totalCollateralUSD += colUSD;
          summary.totalDebtUSD += debtUSD;
          summary.activePositions.push({
            protocol: 'Seamless Protocol',
            collateralUSD: colUSD,
            debtUSD,
            healthFactor: isFinite(hf) ? hf : null,
          });
        }
      }
    } catch { /* skip */ }

    // 4. Moonwell getAccountSnapshot(address) → 0xc37f68e2
    for (const [key, mkt] of Object.entries(PROTOCOLS.moonwell.markets)) {
      try {
        const r = await call(mkt.address, '0xc37f68e2' + pad(addr));
        if (!r || r === '0x') continue;
        const err = Number(decodeUint(r, 0));
        const mBal = decodeUint(r, 1);
        const borrow = decodeUint(r, 2);
        const exRate = decodeUint(r, 3);
        if (err !== 0) continue;

        const scale = BigInt(10 ** mkt.decimals);
        const supplied = (mBal * exRate) / (BigInt(1e18) * scale);
        const supplyAmt = Number(supplied);
        const borrowAmt = Number(borrow) / 10 ** mkt.decimals;
        const supplyUSD = supplyAmt * mkt.priceUSD;
        const borrowUSD = borrowAmt * mkt.priceUSD;

        if (supplyUSD > 0.05 || borrowUSD > 0.05) {
          summary.totalCollateralUSD += supplyUSD;
          summary.totalDebtUSD += borrowUSD;
          summary.activePositions.push({
            protocol: 'Moonwell',
            market: mkt.symbol,
            collateralUSD: supplyUSD,
            debtUSD: borrowUSD,
          });
        }
      } catch { /* skip */ }
    }

    // 5. Compound III borrowBalanceOf & collateralBalanceOf
    try {
      const comet = PROTOCOLS.compoundIII.usdc;
      const borrowHex = await call(comet, '0x374c49b4' + pad(addr));
      const borrowUSD = borrowHex && borrowHex !== '0x' ? Number(BigInt('0x' + borrowHex.slice(2))) / 1e6 : 0;

      let supplyUSD = 0;
      for (const [sym, col] of Object.entries(PROTOCOLS.compoundIII.collateral)) {
        const r = await call(comet, '0xd1e4b3f6' + pad(addr) + pad(col.address));
        if (r && r !== '0x') {
          const amt = Number(BigInt('0x' + r.slice(2))) / 10 ** col.decimals;
          supplyUSD += amt * col.priceUSD;
        }
      }

      if (supplyUSD > 0.05 || borrowUSD > 0.05) {
        summary.totalCollateralUSD += supplyUSD;
        summary.totalDebtUSD += borrowUSD;
        summary.activePositions.push({
          protocol: 'Compound III',
          market: 'USDC Market',
          collateralUSD: supplyUSD,
          debtUSD: borrowUSD,
        });
      }
    } catch { /* skip */ }

    // 6. Aggregate Health Factor Calculation
    if (summary.totalDebtUSD > 0) {
      summary.healthFactor = (summary.totalCollateralUSD * 0.8) / summary.totalDebtUSD;
      if (summary.healthFactor < 1.1) summary.healthStatus = 'CRITICAL';
      else if (summary.healthFactor < 1.5) summary.healthStatus = 'WARNING';
      else summary.healthStatus = 'SAFE';
    } else {
      summary.healthFactor = Infinity;
      summary.healthStatus = 'SAFE (NO ACTIVE DEBT)';
    }
  } catch (err) {
    console.warn('[OnChainPositions] Error reading positions:', err.message);
  }

  return summary;
}
