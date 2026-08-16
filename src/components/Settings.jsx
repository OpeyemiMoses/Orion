import React, { useState } from 'react';
import { RefreshCw, Save, AlertTriangle } from 'lucide-react';

const DEFAULT_SETTINGS = {
  rpcEndpoint:       'https://mainnet.base.org',
  scanBlockRange:    100000,
  autoScanOnConnect: true,
  riskThresholdCritical: 40,
  riskThresholdHigh:     25,
  riskThresholdMedium:   10,
  basescanApiKey:    '',
};

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem('orion_settings') || 'null') || DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s) {
  localStorage.setItem('orion_settings', JSON.stringify(s));
}

export default function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);
  const [testingRpc, setTestingRpc] = useState(false);
  const [rpcStatus, setRpcStatus] = useState(null); // null | 'ok' | 'error'

  const update = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    setSaved(false);
    setRpcStatus(null);
  };

  const testRpc = async () => {
    setTestingRpc(true);
    setRpcStatus(null);
    try {
      const res = await fetch(settings.rpcEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
      });
      const { result } = await res.json();
      if (result) {
        setRpcStatus({ ok: true, block: parseInt(result, 16).toLocaleString() });
      } else {
        setRpcStatus({ ok: false, msg: 'RPC returned no block number' });
      }
    } catch (e) {
      setRpcStatus({ ok: false, msg: e.message });
    } finally {
      setTestingRpc(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">
          Configure the RPC endpoint, approval scan range, and risk score thresholds. Changes are saved to browser local storage.
        </p>
      </div>

      {/* ── RPC Endpoint ─────────────────────────────────────── */}
      <section style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '12px' }}>
          Base RPC endpoint
        </p>
        <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              JSON-RPC URL — used for <code style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>eth_getLogs</code>, <code style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>eth_getBalance</code>, and contract reads.
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="input"
                type="url"
                value={settings.rpcEndpoint}
                onChange={e => update('rpcEndpoint', e.target.value)}
                placeholder="https://mainnet.base.org"
              />
              <button
                onClick={testRpc}
                className="btn btn-outline"
                disabled={testingRpc}
                style={{ whiteSpace: 'nowrap', fontSize: '12px' }}
              >
                {testingRpc ? <><RefreshCw size={12} className="spin" /> Testing…</> : 'Test connection'}
              </button>
            </div>
          </div>

          {rpcStatus && (
            <div style={{
              fontSize: '12px',
              color: rpcStatus.ok ? 'var(--badge-settled-text)' : 'var(--accent-red)',
              background: rpcStatus.ok ? 'var(--badge-settled)' : 'var(--badge-danger)',
              padding: '8px 12px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {rpcStatus.ok
                ? `✓ Connected — latest block #${rpcStatus.block}`
                : `✗ Failed — ${rpcStatus.msg}`}
            </div>
          )}

          <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Alternatives: <code style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>https://base.llamarpc.com</code> or an Alchemy/Infura Base endpoint with an API key for higher rate limits.
          </div>
        </div>
      </section>

      {/* ── Approval Scan Settings ─────────────────────────── */}
      <section style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '12px' }}>
          Approval scanner
        </p>
        <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
              Block scan range
            </label>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              How many recent blocks to scan for <code style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>Approval</code> events.
              Higher = more history but slower. ~100k blocks ≈ 3–4 days on Base.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                min="10000"
                max="500000"
                step="10000"
                value={settings.scanBlockRange}
                onChange={e => update('scanBlockRange', Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, minWidth: '80px' }}>
                {(settings.scanBlockRange / 1000).toFixed(0)}k blocks
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="auto-scan"
              checked={settings.autoScanOnConnect}
              onChange={e => update('autoScanOnConnect', e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor="auto-scan" style={{ fontSize: '13px', cursor: 'pointer' }}>
              Automatically scan approvals when wallet is connected
            </label>
          </div>
        </div>
      </section>

      {/* ── Risk Score Thresholds ─────────────────────────── */}
      <section style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '12px' }}>
          Risk score thresholds
        </p>
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Risk Level</th>
                <th>Points per approval</th>
                <th>Badge</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Critical', 'riskThresholdCritical', 'badge-danger'],
                ['High',     'riskThresholdHigh',     'badge-danger'],
                ['Medium',   'riskThresholdMedium',   'badge-warn'],
              ].map(([label, key, cls]) => (
                <tr key={key}>
                  <td>
                    <span className={`badge ${cls}`}>{label}</span>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings[key]}
                      onChange={e => update(key, Number(e.target.value))}
                      style={{
                        width: '72px',
                        padding: '4px 8px',
                        border: '1px solid var(--border-dark)',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        background: 'var(--bg)',
                        color: 'var(--text-main)',
                      }}
                    />
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    Each <span className={`badge ${cls}`} style={{ fontSize: '10px' }}>{label}</span> approval adds this many points to the threat score
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── BaseScan API Key ─────────────────────────────── */}
      <section style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '12px' }}>
          BaseScan API key (optional)
        </p>
        <div className="card" style={{ padding: '20px 24px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
            Increases rate limits for contract verification lookups in the Agent Auditor. Free API keys are available at{' '}
            <a href="https://basescan.org/apis" target="_blank" rel="noreferrer" style={{ color: 'var(--text-main)' }}>basescan.org/apis</a>.
          </label>
          <input
            className="input"
            type="text"
            placeholder="Leave blank to use anonymous rate-limited access"
            value={settings.basescanApiKey}
            onChange={e => update('basescanApiKey', e.target.value)}
            style={{ maxWidth: '400px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
          />
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>
            The key is stored in browser local storage only — never sent to any server other than BaseScan.
          </p>
        </div>
      </section>

      {/* ── Save / Reset ─────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={handleSave} className="btn btn-dark">
          <Save size={14} /> Save settings
        </button>
        <button onClick={handleReset} className="btn btn-outline" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Reset to defaults
        </button>
        {saved && (
          <span style={{ fontSize: '12px', color: 'var(--badge-settled-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ✓ Saved
          </span>
        )}
      </div>
    </div>
  );
}
