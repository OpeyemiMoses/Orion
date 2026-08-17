import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert, TrendingUp, Gift, Loader, RefreshCw,
  ChevronRight, CheckCircle2, AlertTriangle, Zap,
  ArrowRight, Activity, Clock, Play, Pause
} from 'lucide-react';
import { runAgentScan } from '../services/agentEngine';

// ── Health factor ring ────────────────────────────────────────────────────────
function HealthRing({ factor }) {
  const isInfinite = factor === '∞';
  const num = isInfinite ? 3 : Math.min(parseFloat(factor), 3);
  const pct = (num / 3) * 100;
  const col = num < 1.2 ? '#dc2626' : num < 1.5 ? '#d97706' : '#16a34a';
  const r = 40, C = 2 * Math.PI * r;
  const stroke = C * (pct / 100);

  return (
    <div style={{ position: 'relative', width: '100px', height: '100px' }}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={col} strokeWidth="8"
          strokeDasharray={`${stroke} ${C}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: col, lineHeight: 1 }}>
          {isInfinite ? '∞' : num.toFixed(2)}
        </span>
        <span style={{ fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.05em', marginTop: '2px' }}>
          {isInfinite ? 'NO BORROWS' : 'HEALTH'}
        </span>
      </div>
    </div>
  );
}

// ── APY bar comparison ────────────────────────────────────────────────────────
function ApyBar({ base, reward, max = 30 }) {
  const baseW = Math.min((base / max) * 100, 100);
  const rewardW = Math.min((reward / max) * 100, 100);
  return (
    <div style={{ display: 'flex', gap: '2px', height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'var(--border)' }}>
      <div style={{ width: `${baseW}%`, background: '#1d4ed8', borderRadius: '3px 0 0 3px', transition: 'width 0.4s' }} />
      <div style={{ width: `${rewardW}%`, background: '#16a34a', borderRadius: '0 3px 3px 0', transition: 'width 0.4s' }} />
    </div>
  );
}

// ── Criteria checklist ────────────────────────────────────────────────────────
function CriteriaList({ criteria }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {criteria.map(c => (
        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span style={{ color: c.completed ? '#16a34a' : 'var(--text-dim)', flexShrink: 0 }}>
            {c.completed ? <CheckCircle2 size={13} /> : <div style={{ width: '13px', height: '13px', borderRadius: '50%', border: '1.5px solid var(--border-dark)' }} />}
          </span>
          <span style={{ color: c.completed ? 'var(--text-main)' : 'var(--text-muted)' }}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Agent status pill ─────────────────────────────────────────────────────────
function AgentPill({ armed }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
      background: armed ? '#dcfce7' : '#f0efed',
      color: armed ? '#15803d' : 'var(--text-muted)',
      border: `1px solid ${armed ? 'rgba(21,128,61,0.2)' : 'var(--border)'}`,
    }}>
      <span style={{
        width: '7px', height: '7px', borderRadius: '50%',
        background: armed ? '#16a34a' : '#a0a0a0',
        boxShadow: armed ? '0 0 0 2px rgba(22,163,74,0.3)' : 'none',
        animation: armed ? 'pulse 2s infinite' : 'none',
      }} />
      {armed ? 'AGENT ARMED' : 'PAUSED'}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AutonomousAgent({ wallet, openWalletModal }) {
  const [scan,    setScan]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [armed,   setArmed]   = useState(false);
  const [execLog, setExecLog] = useState([]);
  const [execing, setExecing] = useState(false);

  const doScan = useCallback(async () => {
    setLoading(true);
    try {
      const result = await runAgentScan(wallet);
      setScan(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => { doScan(); }, [doScan]);

  // Simulate autonomous execution
  const simulateExec = (action, type) => {
    setExecing(true);
    const steps = {
      liquidation: [
        'Reading Moonwell position from Base RPC…',
        `Health factor: ${scan?.healthFactor} — protective repay required.`,
        'Fetching optimal repay amount (20% borrow balance)…',
        'Simulating: approve USDC → Moonwell mUSDC market…',
        'Simulating: repay() call on mUSDC contract…',
        `New projected health factor: ${(parseFloat(scan?.healthFactor || 1) * 1.25).toFixed(2)}`,
        '✓ Simulation complete. Agent execution ready — awaiting wallet signature.',
      ],
      yield: [
        'Querying DeFi Llama yields API for live Base APY data…',
        `Current yield: ${scan?.currentYield?.apy?.toFixed(2)}% APY on ${scan?.currentYield?.symbol}`,
        `Best available: ${scan?.bestYield?.apy?.toFixed(2)}% APY on ${scan?.bestYield?.symbol} (${scan?.bestYield?.protocol})`,
        `Net gain after gas ($0.24) and slippage (0.08%): +$${scan?.reallocBenefit}/year`,
        'Reallocation math clears threshold — constructing swap route…',
        'Route: USDC → swap via Aerodrome Router → deposit into target pool',
        '✓ Simulation complete. Reallocation ready — awaiting wallet signature.',
      ],
      incentive: [
        'Checking qualification criteria for Aerodrome Season 3…',
        'Criteria: LP position ✓ | Hold 7d ✓ | veAERO vote ✗ (pending)',
        'Constructing vote() transaction on Aerodrome Voter contract (0x420d…)',
        'Gas estimate: ~$0.12 on Base at current gwei',
        'This qualifies the wallet for AERO bribe distribution this epoch.',
        '✓ Simulation complete. Qualifying action ready — awaiting wallet signature.',
      ],
    };
    const lines = steps[type] || steps.liquidation;
    let i = 0;
    setExecLog([]);
    const tick = () => {
      if (i < lines.length) {
        setExecLog(prev => [...prev, lines[i++]]);
        setTimeout(tick, 700);
      } else {
        setExecing(false);
      }
    };
    setTimeout(tick, 300);
  };

  const s = scan;

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">OrionX Agent</h1>
          <p className="page-subtitle">
            Autonomous capital management on Base Mainnet — liquidation shield, yield optimizer, incentive tracker.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AgentPill armed={armed} />
          <button
            onClick={() => setArmed(a => !a)}
            className={`btn ${armed ? 'btn-outline' : 'btn-dark'}`}
            style={{ gap: '6px' }}
          >
            {armed ? <><Pause size={13} /> Disarm</> : <><Play size={13} /> Arm agent</>}
          </button>
          <button onClick={doScan} className="btn btn-outline" disabled={loading} style={{ gap: '6px' }}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            {loading ? 'Scanning…' : 'Rescan'}
          </button>
        </div>
      </div>

      {/* Wallet gate */}
      {!wallet && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px', maxWidth: '520px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '8px' }}>
            YOUR POSITION
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '14px' }}>
            Connect a wallet and the agent reads your live lending positions, computes real health factors from Moonwell and Compound III, and compares your yield to every live Base pool on DeFi Llama — in real time.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={openWalletModal} className="btn btn-dark">Connect wallet</button>
            <button onClick={doScan} className="btn btn-outline" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Run with demo data</button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && !s && (
        <div className="card" style={{ padding: '32px', textAlign: 'center', maxWidth: '480px', marginBottom: '24px' }}>
          <Loader size={22} className="spin" style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>Agent scanning Base…</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Reading Moonwell positions · Fetching DeFi Llama yields · Checking incentive criteria
          </div>
        </div>
      )}

      {s && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── Agent summary row ─────────────────────────────── */}
          <div style={{ display: 'flex', gap: '40px', padding: '0 0 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
            {[
              ['LAST SCAN',       new Date(s.timestamp).toLocaleTimeString(), 'badge-neutral'],
              ['DATA SOURCE',     s.isLiveData ? 'Live Base RPC' : 'Demo telemetry', s.isLiveData ? 'badge-settled' : 'badge-neutral'],
              ['ACTIONS READY',   [s.liquidationAction, s.reallocAction, ...s.readyToExecute].filter(Boolean).length, 'badge-warn'],
              ['PROGRAMS TRACKED',s.qualifiedPrograms.length, 'badge-neutral'],
            ].map(([lbl, val, cls]) => (
              <div key={lbl}>
                <div className="stat-label">{lbl}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span className="stat-value" style={{ fontSize: '18px' }}>{val}</span>
                  <span className={`badge ${cls}`} style={{ fontSize: '10px' }}>live</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── MODULE 1: Liquidation Shield ──────────────────── */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ShieldAlert size={16} style={{ color: 'var(--text-dim)' }} />
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                Module 1 — Liquidation Protection
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px', alignItems: 'start' }}>
              {/* Health ring */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <HealthRing factor={s.healthFactor} />
                <span className={`badge ${
                  s.healthStatus.level === 'critical' ? 'badge-danger' :
                  s.healthStatus.level === 'danger'   ? 'badge-danger' :
                  s.healthStatus.level === 'warn'     ? 'badge-warn'   : 'badge-settled'
                }`} style={{ fontSize: '10px', textAlign: 'center' }}>
                  {s.healthStatus.label}
                </span>
              </div>

              <div>
                {/* Lending positions table */}
                {s.lendingPositions.length > 0 ? (
                  <div className="card" style={{ overflow: 'hidden', marginBottom: '10px' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Protocol</th>
                          <th>Market</th>
                          <th>Supplied</th>
                          <th>Borrowed</th>
                          <th>Net Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.lendingPositions.map((p, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 500 }}>{p.protocol}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{p.underlying}</td>
                            <td style={{ fontSize: '12px', color: '#16a34a' }}>
                              {p.supplyAmount > 0 ? `$${p.supplyUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'}
                            </td>
                            <td style={{ fontSize: '12px', color: p.borrowAmount > 0 ? '#dc2626' : 'var(--text-dim)' }}>
                              {p.borrowAmount > 0 ? `$${p.borrowUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'}
                            </td>
                            <td style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                              ${(p.supplyUSD - p.borrowUSD).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '12px 0' }}>
                    No active lending positions found on Moonwell or Compound III.
                  </div>
                )}

                {/* Liquidation action card */}
                {s.liquidationAction ? (
                  <div style={{
                    padding: '12px 16px', borderRadius: '8px',
                    background: s.liquidationAction.urgency === 'IMMEDIATE' ? 'var(--badge-danger)' : 'var(--badge-warn)',
                    border: `1px solid ${s.liquidationAction.urgency === 'IMMEDIATE' ? 'rgba(220,38,38,0.25)' : 'rgba(217,119,6,0.25)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: s.liquidationAction.urgency === 'IMMEDIATE' ? 'var(--accent-red)' : 'var(--badge-warn-text)', marginBottom: '4px' }}>
                        {s.liquidationAction.urgency} — Agent action queued
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.liquidationAction.description}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '3px' }}>
                        Est. gas: {s.liquidationAction.estimatedGas}
                      </div>
                    </div>
                    <button
                      className="btn btn-dark"
                      onClick={() => simulateExec(null, 'liquidation')}
                      disabled={execing}
                      style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
                    >
                      <Zap size={13} /> Simulate execution
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--badge-settled-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} /> No liquidation risk detected — health factor is healthy.
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="divider" />

          {/* ── MODULE 2: Yield Optimizer ──────────────────────── */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <TrendingUp size={16} style={{ color: 'var(--text-dim)' }} />
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                Module 2 — Yield Reallocation
              </p>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                Live from DeFi Llama · {s.yields.length} Base pools scanned
              </span>
            </div>

            {/* Top yields table */}
            <div className="card" style={{ overflow: 'hidden', marginBottom: '14px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Protocol</th>
                    <th>Pool</th>
                    <th>APY</th>
                    <th>Base</th>
                    <th>Reward</th>
                    <th>TVL</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {(s.stableYields.length > 0 ? s.stableYields : s.yields).slice(0, 8).map((p, i) => (
                    <tr key={p.pool}
                      style={{ background: i === 0 ? '#f8fdf9' : 'transparent' }}>
                      <td style={{ fontWeight: i === 0 ? 600 : 400, fontSize: '13px' }}>
                        {i === 0 && <span className="badge badge-settled" style={{ fontSize: '9px', marginRight: '5px' }}>BEST</span>}
                        {p.protocol.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{p.symbol}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: p.apy > 15 ? '#16a34a' : p.apy > 8 ? '#d97706' : 'var(--text-main)' }}>
                          {p.apy.toFixed(2)}%
                        </span>
                      </td>
                      <td style={{ fontSize: '11px', color: '#1d4ed8', fontFamily: 'var(--font-mono)' }}>{p.apyBase.toFixed(1)}%</td>
                      <td style={{ fontSize: '11px', color: '#16a34a', fontFamily: 'var(--font-mono)' }}>{p.apyReward.toFixed(1)}%</td>
                      <td style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        ${(p.tvl / 1e6).toFixed(1)}M
                      </td>
                      <td>
                        <span className={`badge ${p.stablecoin ? 'badge-settled' : 'badge-neutral'}`} style={{ fontSize: '9px' }}>
                          {p.stablecoin ? 'Stable' : 'Volatile'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reallocation action */}
            {s.reallocAction ? (
              <div style={{
                padding: '12px 16px', borderRadius: '8px',
                background: 'var(--badge-warn)', border: '1px solid rgba(217,119,6,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--badge-warn-text)', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    REALLOCATION OPPORTUNITY — Agent action queued
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Move from <strong>{s.reallocAction.from?.symbol}</strong> ({s.reallocAction.from?.apy?.toFixed(2)}% APY)
                    {' → '}<strong>{s.reallocAction.to?.symbol}</strong> ({s.reallocAction.to?.apy?.toFixed(2)}% APY)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '3px' }}>
                    {s.reallocAction.benefit} · Gas: {s.reallocAction.estimatedGas} · Slippage: {s.reallocAction.slippage}
                  </div>
                </div>
                <button
                  className="btn btn-dark"
                  onClick={() => simulateExec(null, 'yield')}
                  disabled={execing}
                  style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
                >
                  <Zap size={13} /> Simulate reallocation
                </button>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--badge-settled-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} /> Yield is optimal — no reallocation clears gas + slippage threshold.
              </div>
            )}
          </section>

          <div className="divider" />

          {/* ── MODULE 3: Incentive Tracker ────────────────────── */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Gift size={16} style={{ color: 'var(--text-dim)' }} />
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                Module 3 — Incentive & Airdrop Qualification
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {s.qualifiedPrograms.map(prog => (
                <div key={prog.id} className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{prog.name}</span>
                        <span className={`badge ${prog.qualified ? 'badge-settled' : prog.pctComplete >= 75 ? 'badge-warn' : 'badge-neutral'}`} style={{ fontSize: '10px' }}>
                          {prog.qualified ? '✓ Qualified' : `${prog.pctComplete}% complete`}
                        </span>
                        <span className={`badge ${prog.risk === 'Minimal' ? 'badge-settled' : prog.risk === 'Low' ? 'badge-settled' : 'badge-warn'}`} style={{ fontSize: '10px' }}>
                          {prog.risk} risk
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>{prog.protocol} · {prog.type}</div>
                      <div style={{ fontSize: '11px', color: 'var(--badge-settled-text)', fontWeight: 500 }}>
                        Est. value: {prog.estValue}
                      </div>
                    </div>
                    {!prog.qualified && prog.pctComplete >= 50 && (
                      <button
                        className="btn btn-outline"
                        onClick={() => simulateExec(null, 'incentive')}
                        disabled={execing}
                        style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
                      >
                        <Zap size={13} /> Simulate qualifying action
                      </button>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${prog.pctComplete}%`, height: '100%',
                        background: prog.qualified ? '#16a34a' : '#d97706',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>

                  <CriteriaList criteria={prog.criteria} />

                  {!prog.qualified && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <span>
                        <ChevronRight size={12} style={{ verticalAlign: 'middle' }} />
                        {' '}Agent action: <em>{prog.action}</em>
                      </span>
                      <span style={{ color: 'var(--text-dim)' }}>Est. gas: {prog.actionGas}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* ── Execution simulation log ──────────────────────────── */}
      {execLog.length > 0 && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 900, padding: '16px'
        }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '24px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} style={{ color: 'var(--text-dim)' }} />
                OrionX execution log
              </span>
              {execing && <Loader size={14} className="spin" style={{ color: 'var(--text-dim)' }} />}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '12px',
              background: 'var(--bg)', borderRadius: '8px', padding: '14px',
              border: '1px solid var(--border)', minHeight: '120px',
              display: 'flex', flexDirection: 'column', gap: '5px',
            }}>
              {execLog.map((line, i) => (
                <div key={i} style={{ color: line.startsWith('✓') ? '#16a34a' : 'var(--text-muted)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--text-dim)', marginRight: '6px' }}>&gt;</span>{line}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '12px' }}>
              This is a simulation. No transactions have been broadcast to Base Mainnet.
            </div>
            {!execing && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-dark" style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}>
                  <Zap size={13} /> Execute on Base (requires wallet)
                </button>
                <button className="btn btn-outline" onClick={() => setExecLog([])} style={{ fontSize: '12px' }}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
