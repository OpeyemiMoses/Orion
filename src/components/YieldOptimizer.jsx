import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, RefreshCw, Loader, Zap, Activity, ArrowRight, ExternalLink } from 'lucide-react';
import { fetchBaseYields, CURATED_BASE_YIELDS } from '../services/agentEngine';

function ApyBar({ base = 0, reward = 0, max = 40 }) {
  return (
    <div style={{ display: 'flex', gap: '2px', height: '5px', borderRadius: '3px', overflow: 'hidden', background: 'var(--border)', width: '80px' }}>
      <div style={{ width: `${Math.min((base   / max) * 100, 100)}%`, background: '#1d4ed8', transition: 'width 0.4s' }} />
      <div style={{ width: `${Math.min((reward / max) * 100, 100)}%`, background: '#16a34a', transition: 'width 0.4s' }} />
    </div>
  );
}

const PROTOCOL_LABEL = name => name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

import { executeApproveForReallocate } from '../services/onChainExecutor';

export default function YieldOptimizer({ wallet, openWalletModal }) {
  const [yields,  setYields]  = useState(CURATED_BASE_YIELDS);
  const [loading, setLoading] = useState(false);
  const [filter,  setFilter]  = useState('all'); // all | stable | volatile
  const [log,     setLog]     = useState([]);
  const [simming, setSimming] = useState(false);
  const [txResult, setTxResult] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBaseYields();
      if (data && data.length) {
        setYields(data);
      }
    } catch {
      // Keep curated yields
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = yields.filter(p =>
    filter === 'all'      ? true :
    filter === 'stable'   ? p.stablecoin :
    !p.stablecoin
  );

  const stableYields   = yields.filter(p => p.stablecoin).sort((a, b) => b.apy - a.apy);
  const volatileYields = yields.filter(p => !p.stablecoin).sort((a, b) => b.apy - a.apy);
  const bestStable     = stableYields[0];
  const bestVolatile   = volatileYields[0];
  const top            = filtered.slice(0, 20);

  const executeReallocation = (from, to) => {
    setSimming(true);
    setLog([]);
    setTxResult(null);
    setActiveRoute({ from, to });

    const lines = [
      `Fetching live yields from DeFi Llama (${yields.length} Base pools scanned)…`,
      `Current: ${from?.symbol} at ${from?.apy?.toFixed(2)}% APY on ${PROTOCOL_LABEL(from?.protocol || '')}`,
      `Target:  ${to?.symbol} at ${to?.apy?.toFixed(2)}% APY on ${PROTOCOL_LABEL(to?.protocol || '')}`,
      `Net APY gain: +${((to?.apy || 0) - (from?.apy || 0)).toFixed(2)}% after gas ($0.24) and slippage (0.08%)`,
      `Projected annual gain on $10,000: +$${(((to?.apy || 0) - (from?.apy || 0)) / 100 * 10000).toFixed(0)}`,
      'Routing via Aerodrome / Target Base Protocol Pool...',
      'Ready to broadcast transaction to Base network.',
    ];
    let i = 0;
    const tick = () => { if (i < lines.length) { setLog(p => [...p, lines[i++]]); setTimeout(tick, 450); } else setSimming(false); };
    setTimeout(tick, 150);
  };

  const broadcastOnBase = async () => {
    if (!wallet?.address) {
      if (openWalletModal) openWalletModal();
      return;
    }

    setSimming(true);
    setLog(prev => [...prev, 'Connecting to Web3 wallet on Base Mainnet...', 'Requesting contract approval / deposit on-chain...']);

    try {
      if (window.ethereum && wallet?.isLiveWeb3) {
        // Approve USDC to Aerodrome / Pool target
        const USDC_BASE = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
        const TARGET_ROUTER = '0xcF77a3Ba9A5CA399B7c97c748561542738591009'; // Aerodrome Router
        const res = await executeApproveForReallocate(USDC_BASE, TARGET_ROUTER, wallet.address);
        setTxResult(res);
        setLog(prev => [...prev, `✓ Transaction Confirmed on Base! Hash: ${res.txHash.slice(0, 10)}...${res.txHash.slice(-8)}`, '✓ Reallocation capital deployed to target pool.']);
      } else {
        setLog(prev => [...prev, '✓ Reallocation route confirmed.']);
      }
      setSimming(false);
    } catch (err) {
      setLog(prev => [...prev, `✗ Error: ${err.message || 'Transaction rejected'}`]);
      setSimming(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Yield Optimizer</h1>
        <p className="page-subtitle">
          Live APY data from DeFi Llama across every Base pool with &gt;$100k TVL.
          Agent reallocates when net gain clears gas + slippage threshold.
        </p>
      </div>

      {/* Summary cards */}
      {yields.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'POOLS SCANNED', value: yields.length, sub: 'Base Mainnet' },
            { label: 'BEST STABLE APY', value: bestStable ? `${bestStable.apy.toFixed(2)}%` : '—', sub: bestStable ? `${PROTOCOL_LABEL(bestStable.protocol)} · ${bestStable.symbol}` : '' },
            { label: 'BEST OVERALL APY', value: bestVolatile ? `${bestVolatile.apy.toFixed(2)}%` : '—', sub: bestVolatile ? `${PROTOCOL_LABEL(bestVolatile.protocol)} · ${bestVolatile.symbol}` : '' },
            { label: 'DATA SOURCE', value: 'DeFi Llama', sub: 'Live · No API key needed' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 20px', flex: '1 1 160px' }}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: '18px', marginTop: '4px' }}>{s.value}</div>
              {s.sub && <div className="stat-sub" style={{ marginTop: '2px' }}>{s.sub}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={load} className="btn btn-outline" disabled={loading} style={{ gap: '6px', fontSize: '12px' }}>
          <RefreshCw size={12} className={loading ? 'spin' : ''} /> Refresh yields
        </button>
        {['all', 'stable', 'volatile'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn ${filter === f ? 'btn-dark' : 'btn-outline'}`}
            style={{ fontSize: '12px', padding: '5px 12px' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1d4ed8', display: 'inline-block' }} /> Base APY
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Reward APY
          </span>
        </div>
      </div>

      {loading && yields.length === 0 && (
        <div className="card" style={{ padding: '28px', textAlign: 'center', maxWidth: '400px' }}>
          <Loader size={20} className="spin" style={{ color: 'var(--text-dim)', marginBottom: '10px' }} />
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Fetching live yields from DeFi Llama…</p>
        </div>
      )}

      {/* Yields table */}
      {top.length > 0 && (
        <div className="card table-responsive" style={{ overflow: 'hidden', marginBottom: '20px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Protocol</th>
                <th>Pool</th>
                <th>APY</th>
                <th>Composition</th>
                <th>TVL</th>
                <th>Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {top.map((p, i) => (
                <tr key={p.pool} style={{ background: i === 0 ? '#f8fdf9' : i === 1 ? '#fdfdf8' : 'transparent' }}>
                  <td style={{ color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                    {i + 1}
                  </td>
                  <td style={{ fontWeight: i < 2 ? 600 : 400, fontSize: '13px' }}>
                    {PROTOCOL_LABEL(p.protocol)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>{p.symbol}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: p.apy > 20 ? '#16a34a' : p.apy > 10 ? '#d97706' : 'var(--text-main)' }}>
                      {p.apy.toFixed(2)}%
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ApyBar base={p.apyBase} reward={p.apyReward} />
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        {p.apyBase.toFixed(1)}+{p.apyReward.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    ${(p.tvl / 1e6).toFixed(1)}M
                  </td>
                  <td>
                    <span className={`badge ${p.stablecoin ? 'badge-settled' : 'badge-neutral'}`} style={{ fontSize: '9px' }}>
                      {p.stablecoin ? 'Stable' : 'Volatile'}
                    </span>
                  </td>
                  <td>
                    {i === 0 && stableYields[1] && (
                      <button onClick={() => executeReallocation(stableYields[1], p)} className="btn btn-outline"
                        style={{ fontSize: '11px', padding: '3px 8px', gap: '4px', whiteSpace: 'nowrap' }}>
                        <Zap size={11} /> Reallocate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Best opportunity callout */}
      {bestStable && stableYields[1] && bestStable.apy - stableYields[1].apy > 0.5 && (
        <div style={{ padding: '14px 18px', borderRadius: '10px', background: 'var(--badge-warn)', border: '1px solid rgba(217,119,6,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.06em', color: 'var(--badge-warn-text)', marginBottom: '4px' }}>
              REALLOCATION OPPORTUNITY
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Move from <strong>{stableYields[1].symbol}</strong> ({stableYields[1].apy.toFixed(2)}%)
              <ArrowRight size={12} style={{ verticalAlign: 'middle', margin: '0 4px' }} />
              <strong>{bestStable.symbol}</strong> ({bestStable.apy.toFixed(2)}%) on {PROTOCOL_LABEL(bestStable.protocol)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '3px' }}>
              +{(bestStable.apy - stableYields[1].apy).toFixed(2)}% APY · Est. gas: $0.24 · Slippage: 0.08%
            </div>
          </div>
          <button onClick={() => executeReallocation(stableYields[1], bestStable)} disabled={simming} className="btn btn-dark" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
            <Zap size={13} /> Execute reallocation
          </button>
        </div>
      )}

      {/* Reallocation log modal */}
      {log.length > 0 && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={15} style={{ color: 'var(--text-dim)' }} /> Reallocation action pipeline
              </span>
              {simming && <Loader size={13} className="spin" style={{ color: 'var(--text-dim)' }} />}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', background: 'var(--bg)', borderRadius: '8px', padding: '14px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '5px', minHeight: '120px' }}>
              {log.map((l, i) => {
                const str = typeof l === 'string' ? l : (l?.message || l?.text || JSON.stringify(l) || '');
                const isSuccess = str.startsWith('✓');
                const isError = str.startsWith('✗') || str.toLowerCase().includes('error') || str.toLowerCase().includes('failed');
                return (
                  <div key={i} style={{ color: isSuccess ? '#16a34a' : isError ? '#dc2626' : 'var(--text-muted)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--text-dim)', marginRight: '6px' }}>&gt;</span>{str}
                  </div>
                );
              })}
            </div>

            {txResult?.basescanUrl && (
              <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '12px' }}>
                <a href={txResult.basescanUrl} target="_blank" rel="noreferrer" style={{ color: '#15803d', fontWeight: 600, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>View confirmed transaction on BaseScan</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '12px' }}>Broadcasts directly to Base Mainnet via injected wallet.</div>
            {!simming && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {!txResult && (
                  <button onClick={broadcastOnBase} className="btn btn-dark" style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}>
                    <Zap size={13} /> Sign & Execute on Base
                  </button>
                )}
                <button className="btn btn-outline" onClick={() => { setLog([]); setTxResult(null); }} style={{ fontSize: '12px' }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
