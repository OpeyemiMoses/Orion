import React, { useState } from 'react';
import { Search, ExternalLink, Download, Loader, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ORION_PRESET_AGENTS } from '../services/riskEngine';
import { auditContractAddress } from '../services/web3Wallet';

export default function AgentAuditor() {
  const [selected, setSelected] = useState(null); // null = show preset list
  const [customAddr, setCustomAddr] = useState('');
  const [error, setError] = useState('');
  const [auditing, setAuditing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleAudit = async (e) => {
    e.preventDefault();
    const addr = customAddr.trim();
    if (!addr) return;
    setError('');
    setAuditing(true);
    try {
      const result = await auditContractAddress(addr);
      setSelected(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setAuditing(false);
    }
  };

  const handlePresetSelect = async (agent) => {
    setError('');
    setCustomAddr('');
    setAuditing(true);
    try {
      // Try to get real BaseScan data for preset agent
      const realData = await auditContractAddress(agent.contractAddress);
      // Merge real data over the preset (keep name/description from preset if BaseScan has nothing)
      setSelected({
        ...agent,
        ...realData,
        name: realData.name && realData.name !== 'Unknown' ? realData.name : agent.name,
        description: realData.description || agent.description,
        trustScore: realData.trustScore > 0 ? realData.trustScore : agent.trustScore,
        auditSummary: {
          ...agent.auditSummary,
          ...realData.auditSummary,
          bytecodeStatus: realData.auditSummary.bytecodeStatus,
          permissionRisk: realData.auditSummary.permissionRisk,
          warnings: [...(realData.auditSummary.warnings || []), ...(agent.auditSummary.warnings || [])],
        },
        verifiableBytecode: realData.verifiableBytecode,
      });
    } catch {
      // Fall back to preset data
      setSelected(agent);
    } finally {
      setAuditing(false);
    }
  };

  const handleDownload = () => {
    if (!selected) return;
    setDownloading(true);
    setTimeout(() => {
      const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Orion_Audit_${(selected.name || 'contract').replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, 400);
  };

  const score = selected?.trustScore ?? null;
  const gradeClass = score === null ? '' : score >= 85 ? 'badge-settled' : score >= 65 ? 'badge-warn' : 'badge-danger';
  const grade = score === null ? '' : score >= 85 ? 'A' : score >= 65 ? 'B' : 'C';

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Agent Auditor</h1>
        <p className="page-subtitle">
          Everything on this page is derived from two Base chain RPCs and BaseScan. No value moves from here.
        </p>
      </div>

      {/* ── Audit search bar ─────────────────────────────────────── */}
      <form onSubmit={handleAudit} style={{ display: 'flex', gap: '8px', marginBottom: '28px', maxWidth: '580px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            className="input"
            type="text"
            placeholder="Paste a Base contract address to audit live (0x…)"
            value={customAddr}
            onChange={e => setCustomAddr(e.target.value)}
            style={{ paddingLeft: '32px' }}
          />
        </div>
        <button type="submit" className="btn btn-dark" style={{ whiteSpace: 'nowrap' }} disabled={auditing}>
          {auditing ? <><Loader size={13} className="spin" /> Auditing…</> : 'Audit on-chain'}
        </button>
      </form>

      {error && (
        <div style={{ fontSize: '13px', color: 'var(--accent-red)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* ── Orion Agent Store picker ──────────────────────────────── */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)' }}>
            Orion agent store
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            Click any row to audit live from BaseScan
          </p>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Category</th>
                <th>Contract (Base)</th>
                <th>Upvotes</th>
                <th style={{ textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {ORION_PRESET_AGENTS.map(agent => (
                <tr
                  key={agent.id}
                  style={{ cursor: 'pointer', background: selected?.id === agent.id ? '#fafaf8' : 'transparent' }}
                  onClick={() => handlePresetSelect(agent)}
                >
                  <td style={{ fontWeight: selected?.id === agent.id ? 600 : 400 }}>{agent.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{agent.category}</td>
                  <td>
                    <span className="addr" style={{ fontSize: '11px' }}>
                      {agent.contractAddress.slice(0,10)}…{agent.contractAddress.slice(-6)}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>↑ {agent.upvotes}</td>
                  <td style={{ textAlign: 'right' }}>
                    {auditing && selected?.id === agent.id ? (
                      <Loader size={13} className="spin" style={{ color: 'var(--text-dim)' }} />
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                        {selected?.id === agent.id ? 'Viewing' : 'Open'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Loading state ─────────────────────────────────────────── */}
      {auditing && !selected && (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <Loader size={24} className="spin" style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Fetching contract data from Base RPC & BaseScan…
          </p>
        </div>
      )}

      {/* ── Audit Report ──────────────────────────────────────────── */}
      {selected && !selected.isEOA && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '4px' }}>
                Audit report — {selected.chain}
              </p>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{selected.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="addr" style={{ fontSize: '12px' }}>{selected.contractAddress}</span>
                <a
                  href={`https://basescan.org/address/${selected.contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}
                >
                  <ExternalLink size={12} />
                </a>
              </div>
              {selected.description && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '560px' }}>{selected.description}</p>
              )}
            </div>
            <button onClick={handleDownload} className="btn btn-outline" style={{ fontSize: '12px' }} disabled={downloading}>
              <Download size={13} />
              {downloading ? 'Generating…' : 'Download certificate'}
            </button>
          </div>

          {/* Score row */}
          <div style={{ display: 'flex', gap: '40px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {[
              ['TRUST SCORE',    `${score}/100`,                                                         gradeClass],
              ['GRADE',          `Grade ${grade}`,                                                        gradeClass],
              ['BYTECODE',       selected.verifiableBytecode ? 'Verified' : 'Unverified',                 selected.verifiableBytecode ? 'badge-settled' : 'badge-danger'],
              ['VULNERABILITIES',`${selected.auditSummary.knownVulnerabilities} found`,                   selected.auditSummary.knownVulnerabilities > 0 ? 'badge-danger' : 'badge-settled'],
              ['SIMULATION',     selected.auditSummary.simulationAccuracy,                                'badge-neutral'],
            ].map(([lbl, val, cls]) => (
              <div key={lbl}>
                <div className="stat-label">{lbl}</div>
                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span className="stat-value" style={{ fontSize: '18px' }}>{val}</span>
                  <span className={`badge ${cls}`} style={{ fontSize: '10px' }}>
                    {cls?.includes('danger') ? 'alert' : cls?.includes('settled') ? 'ok' : 'info'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Findings table */}
          <div className="card" style={{ overflow: 'hidden', marginBottom: '16px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Security Dimension</th>
                  <th>Finding</th>
                  <th>Canonical State</th>
                  <th>Verifier</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Bytecode Verification', selected.auditSummary.bytecodeStatus,    selected.verifiableBytecode ? 'badge-settled' : 'badge-danger',  selected.verifiableBytecode ? 'VERIFIED' : 'UNVERIFIED'],
                  ['Permission Risk',       selected.auditSummary.permissionRisk,    selected.auditSummary.permissionRisk?.includes('Low') || selected.auditSummary.permissionRisk?.includes('Zero') ? 'badge-settled' : selected.auditSummary.permissionRisk?.includes('Medium') ? 'badge-warn' : 'badge-danger', 'ANALYSED'],
                  ['Oracle Infrastructure', selected.auditSummary.oracleReliance,    'badge-neutral', 'CHECKED'],
                  ['Sim Accuracy',          selected.auditSummary.simulationAccuracy,'badge-settled', 'RECORDED'],
                  ['Vulnerabilities',       `${selected.auditSummary.knownVulnerabilities} known finding(s)`, selected.auditSummary.knownVulnerabilities === 0 ? 'badge-settled' : 'badge-danger', 'SETTLED_FINAL'],
                ].map(([dim, finding, cls, state]) => (
                  <tr key={dim}>
                    <td style={{ fontWeight: 500, fontSize: '13px' }}>{dim}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '300px' }}>{finding}</td>
                    <td><span className={`badge ${cls}`}>{cls === 'badge-settled' ? 'PASS' : cls === 'badge-danger' ? 'FAIL' : 'INFO'}</span></td>
                    <td><span className="badge badge-final" style={{ fontSize: '10px' }}>{state}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Warnings */}
          {selected.auditSummary.warnings?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '4px' }}>
                Warnings ({selected.auditSummary.warnings.length})
              </p>
              {selected.auditSummary.warnings.map((w, i) => (
                <div key={i} style={{
                  fontSize: '13px', color: 'var(--badge-warn-text)', background: 'var(--badge-warn)',
                  padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(217,119,6,0.2)',
                  display: 'flex', alignItems: 'flex-start', gap: '8px'
                }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} /> {w}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* EOA result */}
      {selected?.isEOA && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={18} style={{ color: 'var(--accent-red)' }} />
            <span style={{ fontWeight: 600 }}>Not a contract</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            <span className="addr">{selected.contractAddress}</span> is an externally owned account (EOA), not a deployed smart contract on Base Mainnet.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!selected && !auditing && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
          Select an agent from the store above, or paste a Base contract address to run a live audit.
        </div>
      )}
    </div>
  );
}
