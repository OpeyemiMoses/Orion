import React, { useState } from 'react';
import {
  Search, ExternalLink, AlertTriangle, CheckCircle2, Loader,
  ShieldAlert, Database, Code2, Globe, GitBranch, AtSign, ArrowLeft
} from 'lucide-react';
import { auditProtocol, KNOWN_BASE_PROTOCOLS } from '../services/protocolAudit';

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
  const icon = level === 'Critical' || level === 'High'
    ? <AlertTriangle size={13} />
    : <AlertTriangle size={13} style={{ opacity: 0.6 }} />;

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
  '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf', // Compound III USDC
  '0x8f44fd754285aa6a2b8b9ed6f8245c6371390316', // Seamless Protocol
  '0x2626664c2601f8477d34190c138804968853b018', // Uniswap V3
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
  '0x940181a94a35a4569e4529a3cdfb74e38fd98631', // AERO
];

export default function ProtocolAuditor() {
  const [inputAddr, setInputAddr]   = useState('');
  const [result,    setResult]      = useState(null);
  const [loading,   setLoading]     = useState(false);
  const [error,     setError]       = useState('');

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
        <h1 className="page-title">Protocol Auditor</h1>
        <p className="page-subtitle">
          Paste any Base ecosystem contract address. Orion reads multi-endpoint Base RPCs, BaseScan, and DeFi Llama.
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
            placeholder="0x… Base contract address"
            style={{ paddingLeft: '32px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
          />
        </div>
        <button type="submit" className="btn btn-dark" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
          {loading ? <><Loader size={13} className="spin" /> Auditing…</> : 'Audit protocol'}
        </button>
      </form>

      {/* ── Quick-pick featured protocols ─────────────────── */}
      {!result && !loading && (
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '10px' }}>
            Base ecosystem — featured protocols
          </p>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Protocol</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Audited</th>
                  <th style={{ textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {FEATURED_PROTOCOLS.map(addr => {
                  const p = KNOWN_BASE_PROTOCOLS[addr];
                  if (!p) return null;
                  return (
                    <tr key={addr} style={{ cursor: 'pointer' }} onClick={() => { setInputAddr(addr); runAudit(addr); }}>
                      <td style={{ fontWeight: 600 }}>{p.protocol}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.name}</td>
                      <td><span className="badge badge-neutral" style={{ fontSize: '10px' }}>{p.type}</span></td>
                      <td>
                        {p.audited
                          ? <span className="badge badge-settled" style={{ fontSize: '10px' }}>✓ Audited</span>
                          : <span className="badge badge-warn"    style={{ fontSize: '10px' }}>Unaudited</span>}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-dim)' }}>Open</td>
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
            Verifying Base contract security · Checking independent audit firms · Querying DeFi Llama TVL
          </div>
        </div>
      )}

      {/* ── Standard wallet result ───────────────────────────── */}
      {r?.isEOA && (
        <div style={{ maxWidth: '560px' }}>
          <button
            onClick={() => { setResult(null); setInputAddr(''); }}
            className="btn btn-outline"
            style={{ marginBottom: '16px', gap: '6px', fontSize: '12px' }}
          >
            <ArrowLeft size={13} /> Back to featured protocols
          </button>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} style={{ color: 'var(--accent-red)' }} /> Personal Wallet Address
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              <span className="addr">{r.address}</span> is a personal wallet account, not a protocol smart contract on Base.
            </p>
          </div>
        </div>
      )}

      {/* ── Full audit report ────────────────────────────────── */}
      {r && !r.isEOA && (
        <div>
          {/* Back button */}
          <button
            onClick={() => { setResult(null); setInputAddr(''); }}
            className="btn btn-outline"
            style={{ marginBottom: '16px', gap: '6px', fontSize: '12px' }}
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
              {r.tvl && (
                <div style={{ textAlign: 'right' }}>
                  <div className="stat-label">TVL (DeFi Llama)</div>
                  <div className="stat-value" style={{ fontSize: '24px' }}>{r.tvl}</div>
                  {r.llamaCategory && <div className="stat-sub">{r.llamaCategory}</div>}
                </div>
              )}
            </div>
          </div>

          {/* Interaction verdict */}
          <InteractionVerdict {...r.interactionSummary} />

          {/* ── Health score + Stats grid ─────────────────── */}
          <div className="card" style={{ padding: '20px 24px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px', alignItems: 'center' }}>
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

          {/* ── Detailed breakdown table ──────────────────────── */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '12px' }}>
              Audit details
            </p>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dimension</th>
                    <th>Finding</th>
                    <th>Canonical State</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Protocol name',     r.name,                                          r.sourceVerified ? 'badge-settled' : 'badge-neutral', 'BaseScan'],
                    ['Protocol type',     r.type,                                          'badge-neutral',                                       'Bytecode analysis'],
                    ['Contract address',  `${r.address.slice(0,14)}…${r.address.slice(-6)}`, 'badge-neutral',                                    'Base RPC'],
                    ['Source code',       r.sourceVerified ? `Verified (${r.compiler})` : 'Not published', r.sourceVerified ? 'badge-settled' : 'badge-danger', 'BaseScan'],
                    ['License',          r.licenseType || 'Not specified',                'badge-neutral',                                       'BaseScan'],
                    ['Proxy pattern',     r.isProxy ? `EIP-1967 upgradeable (impl: ${r.implementationAddress?.slice(0,10)}…)` : 'Not a proxy — immutable bytecode', r.isProxy ? 'badge-warn' : 'badge-settled', 'Base RPC'],
                    ['Audit history',     r.auditFirms.length > 0 ? r.auditFirms.join(', ') : 'No audits on record', r.audited ? 'badge-settled' : 'badge-warn', 'Protocol data'],
                    ['Security msig',     r.adminMsig ? 'Multi-sig admin key confirmed' : 'Not confirmed', r.adminMsig ? 'badge-settled' : 'badge-neutral', 'Protocol data'],
                    ['Bytecode size',     `${r.bytecodeSize.toLocaleString()} bytes`,      'badge-neutral',                                       'Base RPC'],
                    ['Launch date',       r.launched || 'Unknown',                         'badge-neutral',                                       'Protocol data'],
                  ].map(([dim, val, cls, src]) => (
                    <tr key={dim}>
                      <td style={{ fontWeight: 500, fontSize: '13px', whiteSpace: 'nowrap' }}>{dim}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{val}</td>
                      <td><span className={`badge ${cls}`} style={{ fontSize: '10px' }}>{cls === 'badge-settled' ? 'PASS' : cls === 'badge-danger' ? 'FAIL' : 'INFO'}</span></td>
                      <td style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{src}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Protocol description ──────────────────────── */}
          {r.description && (
            <div className="card" style={{ padding: '20px 24px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Database size={14} style={{ color: 'var(--text-dim)' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)' }}>
                  Protocol overview
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '12px' }}>
                {r.description}
              </p>
              {/* External links */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px' }}>
                {r.llamaUrl && (
                  <a href={r.llamaUrl} target="_blank" rel="noreferrer"
                     style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    <Globe size={12} /> Website
                  </a>
                )}
                {r.llamaTwitter && (
                  <a href={`https://twitter.com/${r.llamaTwitter.replace('@','')}`} target="_blank" rel="noreferrer"
                     style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    <AtSign size={12} /> {r.llamaTwitter}
                  </a>
                )}
                {r.llamaGithub?.length > 0 && (
                  <a href={`https://github.com/${r.llamaGithub[0]}`} target="_blank" rel="noreferrer"
                     style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    <GitBranch size={12} /> GitHub
                  </a>
                )}
                {r.llamaAuditLinks?.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noreferrer"
                     style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    <Code2 size={12} /> Audit report {i + 1}
                  </a>
                ))}
                <a href={`https://basescan.org/address/${r.address}`} target="_blank" rel="noreferrer"
                   style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                  <ExternalLink size={12} /> BaseScan
                </a>
              </div>
            </div>
          )}

          {/* ── DeFi Llama chain deployment ───────────────── */}
          {r.chains && r.chains.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '10px' }}>
                Deployed chains (DeFi Llama)
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {r.chains.map(chain => (
                  <span key={chain} className={`badge ${chain === 'Base' ? 'badge-settled' : 'badge-neutral'}`} style={{ fontSize: '11px' }}>
                    {chain}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
