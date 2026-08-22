import React, { useState, useEffect } from 'react';
import {
  Search, ExternalLink, AlertTriangle, CheckCircle2, Loader,
  ShieldAlert, Database, Code2, Globe, GitBranch, AtSign, ArrowLeft,
  Cpu, HeartPulse, LineChart, TrendingUp, AlertOctagon, Eye, ShieldCheck, Activity
} from 'lucide-react';
import { auditProtocol, KNOWN_BASE_PROTOCOLS, fetchLiveProtocolStats } from '../services/protocolAudit';

// ── Health meter bar ──────────────────────────────────────────────────────────
function HealthBar({ score }) {
  const col = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          width: `${score}%`, height: '100%',
          background: col,
          borderRadius: '3px',
          transition: 'width 0.6s ease'
        }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: col, minWidth: '32px' }}>
        {score}
      </span>
    </div>
  );
}

// ── Risk flag row ─────────────────────────────────────────────────────────────
function RiskFlag({ level, text }) {
  const cls = level === 'Critical' ? 'badge-danger' : level === 'High' ? 'badge-danger' : level === 'Medium' ? 'badge-warn' : 'badge-neutral';

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '10px 14px',
      background: level === 'Critical' || level === 'High' ? 'var(--badge-danger)' : level === 'Medium' ? 'var(--badge-warn)' : '#f8f8f7',
      borderRadius: '8px',
      border: `1px solid ${level === 'Critical' || level === 'High' ? 'rgba(220,38,38,0.2)' : level === 'Medium' ? 'rgba(217,119,6,0.2)' : 'var(--border)'}`,
    }}>
      <span className={`badge ${cls}`} style={{ fontSize: '10px', flexShrink: 0, marginTop: '1px' }}>{level}</span>
      <span style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-muted)' }}>{text}</span>
    </div>
  );
}

// ── Interaction verdict banner ────────────────────────────────────────────────
function InteractionVerdict({ signal, reason, color, bg, border, text }) {
  const isSafe = color === 'settled' || color === '#15803d' || (signal && signal.includes('CLEARED'));
  const isWarn = color === 'warn' || color === '#d97706' || (signal && signal.includes('CAUTION'));

  const finalBg = bg || (isSafe ? 'var(--badge-settled)' : isWarn ? 'var(--badge-warn)' : 'var(--badge-danger)');
  const finalBorder = border || (isSafe ? 'rgba(21,128,61,0.2)' : isWarn ? 'rgba(217,119,6,0.25)' : 'rgba(220,38,38,0.25)');
  const finalText = text || (isSafe ? 'var(--badge-settled-text)' : isWarn ? 'var(--badge-warn-text)' : 'var(--badge-danger-text)');
  const Icon = isSafe ? CheckCircle2 : isWarn ? AlertTriangle : ShieldAlert;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      background: finalBg, border: `1px solid ${finalBorder}`,
      padding: '14px 18px', borderRadius: '10px', marginBottom: '24px',
    }}>
      <span style={{ color: finalText, flexShrink: 0, marginTop: '1px' }}>
        <Icon size={18} />
      </span>
      <div>
        <div style={{ fontWeight: 700, fontSize: '13px', color: finalText, marginBottom: '3px', letterSpacing: '0.04em' }}>
          {signal || 'VERDICT READY'}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{reason}</div>
      </div>
    </div>
  );
}

// ── Preset protocol quick-pick ────────────────────────────────────────────────
const FEATURED_PROTOCOLS = [
  '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43', // Aerodrome Router
  '0xedc817a28e8b93b03976fbd4a3ddbc9f7d176c22', // Moonwell mUSDC
  '0xa238dd80c25cedc05e0f0d090854501e78988888', // Aave V3 Base Pool
  '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf', // Compound III USDC
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USD Coin (USDC)
  '0x940181a94a35a4569e4529a3cdfb74e38fd98631', // Aerodrome Token (AERO)
  '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b', // Virtual Protocol (VIRTUAL)
  '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', // Degen (DEGEN)
];

export default function ProtocolAuditor() {
  const [inputAddr, setInputAddr]         = useState('');
  const [result,    setResult]            = useState(null);
  const [loading,   setLoading]           = useState(false);
  const [error,     setError]             = useState('');
  const [featuredStats, setFeaturedStats] = useState({});

  // Fetch live stats for featured protocols on mount
  useEffect(() => {
    let isMounted = true;
    const loadFeaturedStats = async () => {
      const stats = {};
      await Promise.all(
        FEATURED_PROTOCOLS.map(async (addr) => {
          try {
            const data = await fetchLiveProtocolStats(addr);
            if (isMounted && data) {
              stats[addr] = data;
            }
          } catch {}
        })
      );
      if (isMounted) {
        setFeaturedStats(stats);
      }
    };
    loadFeaturedStats();
    return () => { isMounted = false; };
  }, []);

  const runAudit = async (address) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await auditProtocol(address.trim());
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputAddr.trim()) runAudit(inputAddr);
  };

  const r = result;

  return (
    <div>
      {/* ── Page header ─────────────────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Protocol & Token Auditor</h1>
        <p className="page-subtitle">
          Paste any Base ecosystem smart contract or token address. OrionX queries multi-endpoint Base RPCs, multi-explorer verifications, DexScreener liquidity pools, and DeFi Llama live.
        </p>
      </div>

      {/* ── Search bar ──────────────────────────────────────── */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '20px', maxWidth: '620px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            className="input"
            type="text"
            value={inputAddr}
            onChange={e => setInputAddr(e.target.value)}
            placeholder="0x… Base protocol or token contract address"
            style={{ paddingLeft: '32px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
          />
        </div>
        <button type="submit" className="btn btn-dark" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
          {loading ? <><Loader size={13} className="spin" /> Auditing…</> : 'Audit contract'}
        </button>
      </form>

      {/* ── Quick-pick featured protocols ─────────────────── */}
      {!result && !loading && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', margin: 0 }}>
              Base ecosystem — featured protocols & tokens
            </p>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }} /> Live On-Chain Data
            </span>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Protocol / Asset</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Live Metrics</th>
                  <th>Audited</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {FEATURED_PROTOCOLS.map(addr => {
                  const p = KNOWN_BASE_PROTOCOLS[addr];
                  if (!p) return null;
                  const stat = featuredStats[addr];
                  return (
                    <tr key={addr} style={{ cursor: 'pointer' }} onClick={() => { setInputAddr(addr); runAudit(addr); }}>
                      <td style={{ fontWeight: 600 }}>{p.protocol}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.name}</td>
                      <td><span className="badge badge-neutral" style={{ fontSize: '10px' }}>{p.type}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        {stat?.tvl && stat.tvl !== 'N/A' ? (
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{stat.tvl}</span>
                            {stat.marketCap && <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>MCap: {stat.marketCap}</div>}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>Probing…</span>
                        )}
                      </td>
                      <td>
                        {p.audited
                          ? <span className="badge badge-settled" style={{ fontSize: '10px' }}>✓ Audited</span>
                          : <span className="badge badge-warn"    style={{ fontSize: '10px' }}>Unaudited</span>}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-dim)' }}>
                        <span className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: '11px' }}>Audit →</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div style={{ fontSize: '13px', color: 'var(--accent-red)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────── */}
      {loading && (
        <div className="card" style={{ padding: '32px', textAlign: 'center', maxWidth: '480px' }}>
          <Loader size={22} className="spin" style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
          <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>Auditing protocol security…</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Verifying Base contract bytecode · Querying DexScreener & DeFi Llama endpoints · Synthesizing Deep AI reasoning
          </div>
        </div>
      )}

      {/* ── Audit result ────────────────────────────────────── */}
      {r && !loading && (
        <div>
          {/* Back button to search another */}
          <button
            onClick={() => { setResult(null); setInputAddr(''); }}
            className="btn btn-ghost"
            style={{ marginBottom: '16px', padding: '4px 8px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={13} /> Back to featured protocols
          </button>

          {/* Protocol identity header */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '4px' }}>
                  Protocol Security Audit — Base Mainnet
                </p>
                <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '2px' }}>{r.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <span className="badge badge-neutral">{r.type}</span>
                  {r.audited && <span className="badge badge-settled">Audited</span>}
                  {r.sourceVerified && <span className="badge badge-settled">Code Verified</span>}
                  {r.isProxy && <span className="badge badge-warn">Upgradeable Architecture</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="addr" style={{ fontSize: '12px' }}>{r.address}</span>
                  <a href={`https://basescan.org/address/${r.address}`} target="_blank" rel="noreferrer"
                     style={{ color: 'var(--text-dim)', display: 'flex' }}>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
              {r.tvl && r.tvl !== 'N/A' && (
                <div style={{ textAlign: 'right' }}>
                  <div className="stat-label" style={{ letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>
                    {r.dexLiquidity ? 'DEX LIQUIDITY' : 'PROTOCOL TVL'}
                  </div>
                  <div className="stat-value" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>{r.tvl}</div>
                  {r.marketCap && <div className="stat-sub" style={{ color: 'var(--text-dim)', fontSize: '11px', marginTop: '2px' }}>MCap: {r.marketCap}</div>}
                  {r.volume24h && <div className="stat-sub" style={{ color: 'var(--text-dim)', fontSize: '11px' }}>24h Vol: {r.volume24h}</div>}
                  {r.llamaCategory && <div className="stat-sub" style={{ color: 'var(--text-dim)', fontSize: '11px' }}>{r.llamaCategory}</div>}
                </div>
              )}
            </div>
          </div>

          {/* Interaction verdict */}
          <InteractionVerdict {...r.interactionSummary} />

          {/* ── Health score + Stats grid ─────────────────── */}
          <div className="card" style={{ padding: '20px 24px', marginBottom: '20px' }}>
            <div className="responsive-health-grid">
              <div>
                <div className="stat-label" style={{ marginBottom: '8px' }}>Health score</div>
                <HealthBar score={r.healthScore} />
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
                  Derived from verification, independent audits & permissions
                </div>
              </div>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                {[
                  ['Source Code', r.sourceVerified ? 'Verified'   : 'Unverified',    r.sourceVerified ? 'badge-settled' : 'badge-danger'],
                  ['Governance',  r.isProxy        ? 'Upgradeable': 'Immutable',      r.isProxy        ? 'badge-warn'    : 'badge-settled'],
                  ['Audited',     r.audited        ? 'Yes'        : 'Unknown',        r.audited        ? 'badge-settled' : 'badge-warn'],
                  ['Admin Multi-Sig', r.adminMsig  ? 'Yes'        : 'Unknown/No',     r.adminMsig      ? 'badge-settled' : 'badge-neutral'],
                  ['Contract Size', `${r.bytecodeSize.toLocaleString()} B`,          'badge-neutral'],
                ].map(([lbl, val, cls]) => (
                  <div key={lbl}>
                    <div className="stat-label">{lbl}</div>
                    <span className={`badge ${cls}`} style={{ marginTop: '6px', display: 'inline-flex', fontSize: '11px' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Risk Flags ───────────────────────────────────── */}
          {r.riskFlags.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)' }}>
                  Risk flags ({r.riskFlags.length})
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {r.riskFlags.map((flag, i) => <RiskFlag key={i} {...flag} />)}
              </div>
            </div>
          )}

          {r.riskFlags.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--badge-settled)', borderRadius: '8px', marginBottom: '24px', fontSize: '13px', color: 'var(--badge-settled-text)' }}>
              <CheckCircle2 size={16} /> No risk flags detected. This protocol passes all automated checks.
            </div>
          )}

          {/* ── Deep AI Reasoning Intelligence Report ─────────── */}
          {r.deepAiReasoning && (
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Cpu size={18} style={{ color: 'var(--accent-blue)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Deep AI Protocol Reasoning & Intelligence</h3>
                <span className="badge-settled" style={{ fontSize: '10px', marginLeft: 'auto' }}>
                  SYNTHESIZED LIVE
                </span>
              </div>

              {/* 6-Dimensional AI Intelligence Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                {/* 1. Details & Architecture */}
                <div className="card" style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Code2 size={15} style={{ color: 'var(--accent-blue)' }} />
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>1. Details & Architecture</span>
                  </div>
                  <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Verification:</span>
                      <span style={{ fontWeight: 500 }}>{r.deepAiReasoning.architecture.verification}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Proxy Pattern:</span>
                      <span style={{ fontWeight: 500 }}>{r.deepAiReasoning.architecture.proxyPattern}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Governance:</span>
                      <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '170px' }}>{r.deepAiReasoning.architecture.governanceControl}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Timelock Delay:</span>
                      <span style={{ fontWeight: 500 }}>{r.deepAiReasoning.architecture.timelockDelay}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Health & Solvency */}
                <div className="card" style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <HeartPulse size={15} style={{ color: 'var(--accent-green)' }} />
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>2. Health & Solvency</span>
                  </div>
                  <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Solvency Ratio:</span>
                      <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>{r.deepAiReasoning.healthMetrics.solvencyRatio}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Bad Debt Exposure:</span>
                      <span style={{ fontWeight: 500 }}>{r.deepAiReasoning.healthMetrics.badDebtExposure}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Utilization:</span>
                      <span style={{ fontWeight: 500 }}>{r.deepAiReasoning.healthMetrics.utilizationRate}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>TVL Trajectory:</span>
                      <span style={{ fontWeight: 500 }}>{r.deepAiReasoning.healthMetrics.tvlTrajectory}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Price & Liquidity Depth */}
                <div className="card" style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <LineChart size={15} style={{ color: 'var(--accent-purple, #9333ea)' }} />
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>3. Price & Liquidity Depth</span>
                  </div>
                  <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Price Stability:</span>
                      <span style={{ fontWeight: 500 }}>{r.deepAiReasoning.priceLiquidity.priceStability}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>DEX Depth:</span>
                      <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '170px' }}>{r.deepAiReasoning.priceLiquidity.dexDepth}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Oracle Feeds:</span>
                      <span style={{ fontWeight: 500 }}>{r.deepAiReasoning.priceLiquidity.oracleSource}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Market Sentiment & Velocity */}
                <div className="card" style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <TrendingUp size={15} style={{ color: 'var(--accent-orange, #ea580c)' }} />
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>4. Market Sentiment & Velocity</span>
                  </div>
                  <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Sentiment Score:</span>
                      <span style={{ fontWeight: 600 }}>{r.deepAiReasoning.marketSentiment.sentimentScore}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Volume/TVL Ratio:</span>
                      <span style={{ fontWeight: 500 }}>{r.deepAiReasoning.marketSentiment.volumeToTvlRatio}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Whale Dispersion:</span>
                      <span style={{ fontWeight: 500 }}>{r.deepAiReasoning.marketSentiment.whaleConcentration}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exploit Vector Matrix */}
              <div className="card" style={{ padding: '18px 20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <AlertOctagon size={16} style={{ color: 'var(--accent-red)' }} />
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>5. Exploit Vector Assessment Matrix</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  {r.deepAiReasoning.exploitVectors.map((v, i) => (
                    <div key={i} style={{ padding: '10px 12px', background: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{v.vector}</span>
                        <span className={v.risk === 'Critical' ? 'badge-danger' : v.risk === 'Medium' ? 'badge-warn' : 'badge-settled'} style={{ fontSize: '9px' }}>
                          {v.risk}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: 1.4 }}>{v.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical "What to Watch" */}
              <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Eye size={16} style={{ color: 'var(--accent-blue)' }} />
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>6. Actionable Telemetry: "What to Watch"</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {r.deepAiReasoning.whatToWatch.map((item, i) => (
                    <li key={i} style={{ lineHeight: 1.5 }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ── Technical Contract Specs ─────────────────────── */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>Smart contract specifications</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '13px' }}>
              <div>
                <div style={{ color: 'var(--text-dim)', fontSize: '11px', marginBottom: '2px' }}>Compiler version</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{r.compiler}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-dim)', fontSize: '11px', marginBottom: '2px' }}>License</div>
                <div>{r.licenseType}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-dim)', fontSize: '11px', marginBottom: '2px' }}>Audit status</div>
                <div>{r.auditFirms.join(', ') || 'Independent Audited'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-dim)', fontSize: '11px', marginBottom: '2px' }}>Bytecode size</div>
                <div style={{ fontFamily: 'var(--font-mono)' }}>{r.bytecodeSize.toLocaleString()} bytes</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
