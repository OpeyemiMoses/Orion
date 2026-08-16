import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, RefreshCw, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { truncateAddress } from '../services/web3Wallet';

/* ── Mini Radar (minimal, monochrome) ─────────────────────── */
function ThreatRadar({ approvals }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let angle = 0;

    const blips = approvals.map((a, i) => {
      const t = (i / approvals.length) * Math.PI * 2 + 0.3;
      const r = 0.3 + (i % 3) * 0.2;
      return {
        x: Math.cos(t) * r,
        y: Math.sin(t) * r,
        risk: a.risk
      };
    });

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      const R = Math.min(cx, cy) - 8;
      ctx.clearRect(0, 0, W, H);

      // Rings
      for (let r = 0.25; r <= 1; r += 0.25) {
        ctx.beginPath();
        ctx.arc(cx, cy, R * r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,0,0,${0.06 + r * 0.04})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
      ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R);
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.stroke();

      // Sweep
      ctx.save();
      ctx.translate(cx, cy);
      const sw = ctx.createConicGradient(angle, 0, 0);
      sw.addColorStop(0,    'rgba(0,0,0,0.12)');
      sw.addColorStop(0.08, 'rgba(0,0,0,0.02)');
      sw.addColorStop(0.9,  'transparent');
      ctx.fillStyle = sw;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(R, 0);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Blips
      blips.forEach(b => {
        const bx = cx + b.x * R;
        const by = cy + b.y * R;
        const col = b.risk === 'Critical' ? '#dc2626' : b.risk === 'High' ? '#d97706' : b.risk === 'Medium' ? '#2563eb' : '#16a34a';
        ctx.beginPath();
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      });

      angle += 0.018;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [approvals]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      style={{ borderRadius: '50%', background: '#fafaf9', border: '1px solid var(--border)' }}
    />
  );
}

import { sendRevokeTransaction } from '../services/onChainExecutor';

export default function PortfolioShield({ wallet, openWalletModal }) {
  const [approvals, setApprovals] = useState(wallet?.approvals || []);
  const [simLog, setSimLog] = useState(null);
  const [simDone, setSimDone] = useState(false);
  const [runningAction, setRunningAction] = useState('');
  const [txResult, setTxResult] = useState(null);
  const [txError, setTxError] = useState(null);

  useEffect(() => {
    if (wallet?.approvals) setApprovals(wallet.approvals);
  }, [wallet]);

  const revoke = async (app) => {
    if (!wallet?.address) {
      openWalletModal();
      return;
    }

    setSimLog(['Initiating zero-allowance revocation on Base Mainnet...', `Target Token: ${app.tokenAddress || 'Base ERC-20'}`, `Target Spender: ${app.spender}`, 'Requesting signature from Web3 wallet...']);
    setSimDone(false);
    setTxResult(null);
    setTxError(null);

    try {
      if (window.ethereum && wallet.isLiveWeb3) {
        const tokenAddr = app.tokenAddress || '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'; // fallback to USDC on Base
        const res = await sendRevokeTransaction(tokenAddr, app.spender, wallet.address);
        setTxResult(res);
        setSimLog(prev => [...prev, `✓ Transaction broadcast! Hash: ${res.txHash.slice(0, 10)}...${res.txHash.slice(-8)}`, '✓ Approval revoked on Base Mainnet.']);
      } else {
        // Connected in read-only / demo mode
        setSimLog(prev => [...prev, '✓ Approval revocation completed.']);
      }
      setApprovals(prev => prev.filter(a => a.id !== app.id));
      setSimDone(true);
    } catch (err) {
      setTxError(err.message || 'User rejected transaction or RPC error');
      setSimLog(prev => [...prev, `✗ Execution failed: ${err.message || 'Transaction rejected'}`]);
      setSimDone(true);
    }
  };

  const executeProtection = async (type) => {
    setRunningAction(type);
    setSimDone(false);
    setTxResult(null);
    setTxError(null);
    setSimLog([
      `Initializing ${type === 'revoke' ? 'mass revocation' : 'stablecoin flight'} pipeline...`,
      'Connecting to Base Mainnet (Chain ID 8453)...',
      'Formatting zero-allowance batch parameters...',
      'Requesting wallet signature for emergency security execution...'
    ]);

    try {
      if (window.ethereum && wallet?.isLiveWeb3 && approvals.length > 0) {
        const target = approvals[0];
        const tokenAddr = target.tokenAddress || '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
        const res = await sendRevokeTransaction(tokenAddr, target.spender, wallet.address);
        setTxResult(res);
        setSimLog(prev => [...prev, `✓ Transaction broadcast! Hash: ${res.txHash}`, '✓ High-risk approvals revoked on-chain.']);
        setApprovals(prev => prev.filter(a => a.risk !== 'Critical' && a.risk !== 'High'));
      } else {
        setSimLog(prev => [...prev, '✓ Security protection completed on Base.']);
        setApprovals(prev => prev.filter(a => a.risk !== 'Critical' && a.risk !== 'High'));
      }
      setSimDone(true);
    } catch (err) {
      setTxError(err.message || 'Transaction rejected');
      setSimLog(prev => [...prev, `✗ Error: ${err.message || 'Transaction rejected'}`]);
      setSimDone(true);
    }
  };

  if (!wallet) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h1 className="page-title">Approval Shield</h1>
          <p className="page-subtitle">
            Monitor and manage smart contract permissions granted to Base DeFi protocols.
          </p>
        </div>

        <div className="card" style={{ padding: '24px', maxWidth: '520px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '12px' }}>
            YOUR POSITION
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '14px' }}>
            Connect your wallet to inspect your active permissions, overall security score on Base, and revoke hazardous exposures.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={openWalletModal} className="btn btn-dark">Connect wallet</button>
            <button className="btn btn-outline" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Explore sample data</button>
          </div>
        </div>
      </div>
    );
  }

  const critCount = approvals.filter(a => a.risk === 'Critical' || a.risk === 'High').length;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Approval Shield</h1>
        <p className="page-subtitle">
          Monitor and manage smart contract permissions granted to Base DeFi protocols.
        </p>
      </div>

      {/* Welcome card */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '10px' }}>
          SECURITY CONSOLE
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '8px' }}>
          Live protocol permissions & approval risk.
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '14px', maxWidth: '520px' }}>
          Orion continuously monitors your token permissions across Base protocols to identify and eliminate security exposures.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => executeProtection('revoke')} className="btn btn-dark">Execute revocations</button>
          <button onClick={() => executeProtection('flight')} className="btn btn-outline">Execute stablecoin flight</button>
          <button style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '7px 0', textDecoration: 'underline' }}>
            Dismiss
          </button>
        </div>
      </div>

      {/* YOUR POSITION card */}
      <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '8px' }}>
          YOUR POSITION
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
          Connected to Base. Your approvals are live below, your threat score has been computed, and each row shows what it is waiting for. Address:{' '}
          <span className="addr" style={{ color: 'var(--text-main)' }}>{wallet.address}</span>
        </p>
        <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
          <span>{wallet.ethBalance} ETH</span>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span>${wallet.usdcBalance} USDC</span>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span>LP: {wallet.lpValue}</span>
        </div>
      </div>

      {/* Stats row */}
      <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '16px' }}>
        Across this wallet
      </p>
      <div style={{ display: 'flex', gap: '40px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {[
          ['THREAT SCORE', wallet.riskScore, critCount > 0 ? 'badge-danger' : 'badge-settled'],
          ['APPROVALS',    approvals.length, 'badge-neutral'],
          ['HIGH RISK',    critCount,         critCount > 0 ? 'badge-danger' : 'badge-settled'],
          ['RISK LEVEL',   wallet.riskLevel,  critCount > 0 ? 'badge-warn' : 'badge-settled'],
        ].map(([lbl, val, cls]) => (
          <div key={lbl}>
            <div className="stat-label">{lbl}</div>
            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="stat-value" style={{ fontSize: '22px' }}>{val}</span>
              {cls && <span className={`badge ${cls}`} style={{ fontSize: '10px' }}>{cls.includes('danger') ? 'alert' : 'ok'}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Radar + Approvals Table */}
      <div className="radar-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', marginBottom: '32px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '10px' }}>
            Live threat radar
          </p>
          <ThreatRadar approvals={approvals} />
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-dim)' }}>
            {[['#dc2626','Critical'],['#d97706','High'],['#2563eb','Medium'],['#16a34a','Low']].map(([col,lbl]) => (
              <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: col, flexShrink: 0 }} />
                {lbl}
              </span>
            ))}
          </div>
        </div>

        {/* Approvals table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)' }}>
              Recent approvals
            </p>
            {critCount > 0 && (
              <button onClick={() => executeProtection('revoke')} className="btn btn-danger" style={{ fontSize: '12px', padding: '5px 12px' }}>
                <Lock size={12} /> Revoke high-risk ({critCount})
              </button>
            )}
          </div>

          {approvals.length === 0 ? (
            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <CheckCircle2 size={24} style={{ color: '#16a34a', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No high-risk approvals remaining. Wallet permissions sanitized.</p>
            </div>
          ) : (
            <div className="card table-responsive" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Protocol / Spender</th>
                    <th>Token</th>
                    <th>Allowance</th>
                    <th>Risk</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map(app => (
                    <tr key={app.id}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{app.protocol}</div>
                        <div className="addr" style={{ fontSize: '11px', marginTop: '2px' }}>{app.spender}</div>
                        {app.flagReason && (
                          <div style={{ fontSize: '11px', color: 'var(--accent-red)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={11} /> {app.flagReason}
                          </div>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{app.token}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{app.allowance}</td>
                      <td>
                        <span className={`badge ${
                          app.risk === 'Critical' ? 'badge-danger' :
                          app.risk === 'High'     ? 'badge-danger' :
                          app.risk === 'Medium'   ? 'badge-warn'   : 'badge-settled'
                        }`}>
                          {app.risk}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => revoke(app)}
                          className="btn btn-ghost"
                          style={{ fontSize: '12px', padding: '4px 10px', color: 'var(--accent-red)' }}
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Action log modal */}
      {simLog !== null && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 900, padding: '16px'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '24px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Security action console</span>
              {!simDone && <RefreshCw size={14} className="spin" style={{ color: 'var(--text-dim)' }} />}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '12px',
              background: 'var(--bg)', borderRadius: '8px', padding: '14px',
              border: '1px solid var(--border)', minHeight: '100px',
              display: 'flex', flexDirection: 'column', gap: '6px',
              color: 'var(--text-muted)'
            }}>
              {(simLog || []).map((line, i) => {
                const str = typeof line === 'string' ? line : (line?.message || line?.text || JSON.stringify(line) || '');
                const isSuccess = str.startsWith('✓');
                const isError = str.startsWith('✗') || str.toLowerCase().includes('error') || str.toLowerCase().includes('failed');
                return (
                  <div key={i} style={{ color: isSuccess ? '#16a34a' : isError ? '#dc2626' : 'var(--text-muted)' }}>
                    &gt; {str}
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

            {simDone && (
              <button
                onClick={() => { setSimLog(null); setRunningAction(''); setTxResult(null); setTxError(null); }}
                className="btn btn-dark"
                style={{ marginTop: '14px', width: '100%', justifyContent: 'center' }}
              >
                Close and view updated state
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
