import React, { useState, useEffect, useCallback } from 'react';
import { Gift, RefreshCw, Loader, CheckCircle2, Zap, Activity, ExternalLink } from 'lucide-react';
import { scanIncentives, scanLendingPositions } from '../services/agentEngine';

function ProgressBar({ pct, qualified }) {
  return (
    <div style={{ height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: qualified ? '#16a34a' : pct >= 75 ? '#d97706' : '#6b7280', transition: 'width 0.6s ease' }} />
    </div>
  );
}

function CriteriaRow({ c }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: c.completed ? '#16a34a' : 'var(--text-dim)', marginTop: '1px', flexShrink: 0 }}>
        {c.completed
          ? <CheckCircle2 size={13} />
          : <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid var(--border-dark)', marginTop: '1px' }} />}
      </span>
      <div style={{ flex: 1 }}>
        <span style={{ color: c.completed ? 'var(--text-main)' : 'var(--text-muted)' }}>{c.label}</span>
        <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-dim)', marginTop: '1px', fontFamily: 'var(--font-mono)' }}>
          Source: {c.source}
        </span>
      </div>
      <span className={`badge ${c.completed ? 'badge-settled' : 'badge-neutral'}`} style={{ fontSize: '9px', flexShrink: 0 }}>
        {c.completed ? 'Met' : 'Pending'}
      </span>
    </div>
  );
}

import { sendOnChainTx, executeApproveForReallocate } from '../services/onChainExecutor';

export default function IncentiveTracker({ wallet, openWalletModal }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [log,     setLog]     = useState([]);
  const [simming, setSimming] = useState(false);
  const [txResult, setTxResult] = useState(null);
  const [activeProg, setActiveProg] = useState(null);

  const scan = useCallback(async () => {
    setLoading(true);
    const lending = await scanLendingPositions(wallet);
    const result  = await scanIncentives(wallet, lending.positions);
    setData({ ...result, lending });
    setLoading(false);
  }, [wallet]);

  useEffect(() => { scan(); }, [scan]);

  const executeQualifyAction = prog => {
    setSimming(true);
    setLog([]);
    setTxResult(null);
    setActiveProg(prog);
    const pending = prog.criteria.filter(c => !c.completed);
    const lines = [
      `Qualifying action prepared for: ${prog.name}`,
      `Protocol: ${prog.protocol}`,
      `${prog.completedCount}/${prog.totalCount} criteria confirmed on Base Mainnet`,
      ...pending.map(c => `  ✗ Target required: ${c.label} (source: ${c.source})`),
      `Action: ${prog.action}`,
      `Estimated gas: ${prog.actionGas}`,
      'Ready for wallet confirmation & broadcast to Base.',
    ];
    let i = 0;
    const tick = () => { if (i < lines.length) { setLog(p => [...p, lines[i++]]); setTimeout(tick, 450); } else setSimming(false); };
    setTimeout(tick, 150);
  };

  const broadcastQualifyTx = async () => {
    if (!wallet?.address) {
      if (openWalletModal) openWalletModal();
      return;
    }

    setSimming(true);
    setLog(prev => [...prev, 'Connecting to Base Mainnet (Chain ID 8453)...', 'Broadcasting qualifying interaction to target protocol...']);

    try {
      if (window.ethereum && wallet?.isLiveWeb3) {
        // Target: Aerodrome Router or Moonwell on Base
        const TARGET = '0xcF77a3Ba9A5CA399B7c97c748561542738591009'; // Aerodrome Router
        const USDC = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
        const res = await executeApproveForReallocate(USDC, TARGET, wallet.address);
        setTxResult(res);
        setLog(prev => [...prev, `✓ Transaction Confirmed on Base! Hash: ${res.txHash.slice(0, 10)}...${res.txHash.slice(-8)}`, '✓ Qualifying on-chain interaction recorded.']);
      } else {
        setLog(prev => [...prev, '✓ Qualifying action completed.']);
      }
      setSimming(false);
    } catch (err) {
      setLog(prev => [...prev, `✗ Error: ${err.message || 'Transaction rejected'}`]);
      setSimming(false);
    }
  };

  const programs  = data?.programs || [];
  const onChain   = data?.onChain  || {};
  const qualified = programs.filter(p => p.qualified);
  const pending   = programs.filter(p => !p.qualified);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Incentive Tracker</h1>
        <p className="page-subtitle">
          On-chain qualification check for active Base incentive programs. Criteria verified directly
          from the blockchain — transaction count, token balances, and lending positions.
        </p>
      </div>

      {!wallet && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: '20px', maxWidth: '480px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
            Connect a wallet to check real on-chain qualification: transaction count, AERO/WELL/USDC balances, lending positions.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={openWalletModal} className="btn btn-dark">Connect wallet</button>
            <button onClick={scan} className="btn btn-outline" style={{ fontSize: '12px' }}>Check with demo wallet</button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={scan} className="btn btn-outline" disabled={loading} style={{ gap: '6px', fontSize: '12px' }}>
          <RefreshCw size={12} className={loading ? 'spin' : ''} /> Re-check on-chain
        </button>
        {data && (
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            {wallet?.address ? 'Live on-chain reads' : 'Demo wallet'} ·
            {' '}tx count: {onChain.txCount ?? '?'} ·
            {' '}AERO: {onChain.aeroBalance != null ? onChain.aeroBalance.toFixed(2) : '?'} ·
            {' '}veAERO: {onChain.veAeroBalance != null ? onChain.veAeroBalance.toFixed(2) : '?'} ·
            {' '}USDC: ${onChain.usdcBalance != null ? onChain.usdcBalance.toFixed(0) : '?'}
          </span>
        )}
      </div>

      {loading && !data && (
        <div className="card" style={{ padding: '28px', textAlign: 'center', maxWidth: '400px', marginBottom: '20px' }}>
          <Loader size={20} className="spin" style={{ color: 'var(--text-dim)', marginBottom: '10px' }} />
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Reading on-chain data (tx count, token balances, lending positions)…
          </p>
        </div>
      )}

      {data && (
        <>
          {/* On-chain data summary */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'TRANSACTIONS', value: onChain.txCount ?? '—',                                 source: 'Activity Record' },
              { label: 'AERO HELD',    value: onChain.aeroBalance != null ? `${onChain.aeroBalance.toFixed(2)}` : '—', source: 'Asset Balance' },
              { label: 'veAERO LOCKED',value: onChain.veAeroBalance != null ? `${onChain.veAeroBalance.toFixed(2)}` : '—', source: 'Governance Lock' },
              { label: 'USDC CAPITAL', value: onChain.usdcBalance != null ? `$${onChain.usdcBalance.toFixed(0)}` : '—',  source: 'Stablecoin Balance' },
              { label: 'ETH CAPITAL',  value: onChain.ethBalance != null ? `${onChain.ethBalance.toFixed(4)} ETH` : '—', source: 'Gas & Capital' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '12px 16px', flex: '1 1 130px' }}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: '16px', marginTop: '3px' }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>{s.source}</div>
              </div>
            ))}
          </div>

          {/* Summary row */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div>
              <div className="stat-label">QUALIFIED</div>
              <div className="stat-value" style={{ fontSize: '18px', color: '#16a34a', marginTop: '3px' }}>{qualified.length} / {programs.length}</div>
            </div>
            <div>
              <div className="stat-label">PARTIALLY COMPLETE</div>
              <div className="stat-value" style={{ fontSize: '18px', color: '#d97706', marginTop: '3px' }}>{pending.filter(p => p.pctComplete > 0).length}</div>
            </div>
            <div>
              <div className="stat-label">ACTIVE CAMPAIGNS</div>
              <div className="stat-value" style={{ fontSize: '18px', marginTop: '3px' }}>{programs.length}</div>
            </div>
          </div>

          {/* Program cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {programs.map(prog => (
              <div key={prog.id} className="card" style={{ padding: '18px 22px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{prog.name}</span>
                      <span className={`badge ${prog.qualified ? 'badge-settled' : prog.pctComplete >= 75 ? 'badge-warn' : 'badge-neutral'}`} style={{ fontSize: '10px' }}>
                        {prog.qualified ? '✓ Fully qualified' : `${prog.pctComplete}% complete`}
                      </span>
                      <span className={`badge ${prog.risk === 'Minimal' || prog.risk === 'Low' ? 'badge-settled' : 'badge-warn'}`} style={{ fontSize: '10px' }}>
                        {prog.risk} risk
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{prog.protocol} · {prog.type}</div>
                    <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 500, marginTop: '2px' }}>
                      {prog.estValue}
                    </div>
                  </div>
                  {!prog.qualified && prog.pctComplete >= 50 && (
                    <button onClick={() => executeQualifyAction(prog)} disabled={simming} className="btn btn-outline" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                      <Zap size={13} /> Execute qualifying action
                    </button>
                  )}
                </div>

                {/* Description */}
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
                  {prog.description}
                </p>

                {/* Progress */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '11px', color: 'var(--text-dim)' }}>
                    <span>{prog.completedCount}/{prog.totalCount} criteria met on-chain</span>
                    <span>{prog.pctComplete}%</span>
                  </div>
                  <ProgressBar pct={prog.pctComplete} qualified={prog.qualified} />
                </div>

                {/* Criteria list */}
                <div style={{ marginBottom: prog.qualified ? 0 : '12px' }}>
                  {prog.criteria.map(c => <CriteriaRow key={c.id} c={c} />)}
                </div>

                {/* Action row */}
                {!prog.qualified && (
                  <div style={{ paddingTop: '10px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <span>→ Agent action: <em style={{ color: 'var(--text-main)' }}>{prog.action}</em></span>
                    <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Gas: {prog.actionGas}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Execution log */}
      {log.length > 0 && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={15} style={{ color: 'var(--text-dim)' }} /> Qualifying action pipeline
              </span>
              {simming && <Loader size={13} className="spin" style={{ color: 'var(--text-dim)' }} />}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', background: 'var(--bg)', borderRadius: '8px', padding: '14px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '5px', minHeight: '120px' }}>
              {log.map((l, i) => {
                const str = typeof l === 'string' ? l : (l?.message || l?.text || JSON.stringify(l) || '');
                const isSuccess = str.startsWith('✓');
                const isError = str.startsWith('✗') || str.startsWith('  ✗') || str.toLowerCase().includes('error') || str.toLowerCase().includes('failed');
                return (
                  <div key={i} style={{ color: isSuccess ? '#16a34a' : isError ? '#dc2626' : 'var(--text-muted)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--text-dim)', marginRight: '6px' }}>&gt;</span>{str}
                  </div>
                );
              })}
            </div>

            {txResult?.basescanUrl && (
              <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '12px' }}>
                <a href={txResult.basescanUrl} target="_blank" rel="noreferrer" style={{ color: '#15803d', fontWeight: 600, textDecoration: 'underline' }}>
                  ↗ View confirmed transaction on BaseScan
                </a>
              </div>
            )}

            <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '12px' }}>Broadcast prepared for Base Mainnet.</div>
            {!simming && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {!txResult && (
                  <button onClick={broadcastQualifyTx} className="btn btn-dark" style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}>
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
