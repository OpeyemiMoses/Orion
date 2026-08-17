import React, { useState, useEffect, useCallback } from 'react';
import { Send, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Bell, Settings, Radio, ExternalLink, RefreshCw, Cpu, Activity, Lock, Unlink, LogOut } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function TelegramSentinel({ wallet, openWalletModal }) {
  const [botStatus, setBotStatus] = useState(null);
  const [daemonLogs, setDaemonLogs] = useState([]);
  const [isBound, setIsBound] = useState(false);
  const [manualChatId, setManualChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [testAlertSent, setTestAlertSent] = useState(false);
  const [preferences, setPreferences] = useState({
    liquidationAlerts: true,
    yieldAlerts: true,
    incentiveAlerts: true,
    securityAlerts: true,
    healthThreshold: 1.5,
  });

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/telegram/status`);
      if (res.ok) {
        const data = await res.json();
        setBotStatus(data);
      }
    } catch { /* ignore */ }

    try {
      const logRes = await fetch(`${BACKEND_URL}/api/daemon/logs`);
      if (logRes.ok) {
        const logData = await logRes.json();
        setDaemonLogs(logData.logs || []);
      }
    } catch { /* ignore */ }

    if (wallet?.address) {
      try {
        const prefRes = await fetch(`${BACKEND_URL}/api/telegram/preferences/${wallet.address}`);
        if (prefRes.ok) {
          const prefData = await prefRes.json();
          setIsBound(!!prefData.isBound);
          if (prefData.subscriptions?.[0]?.preferences) {
            setPreferences(prefData.subscriptions[0].preferences);
          }
        }
      } catch { /* ignore */ }
    }
  }, [wallet?.address]);

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 8000);
    return () => clearInterval(timer);
  }, [fetchStatus]);

  const botUsername = botStatus?.botUsername || 'OrionXSentinelBot';
  const telegramDeepLink = `https://t.me/${botUsername}?start=bind_${wallet?.address || ''}`;

  const handleManualBind = async (e) => {
    e.preventDefault();
    if (!manualChatId || !wallet?.address) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/telegram/bind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: manualChatId,
          walletAddress: wallet.address,
        }),
      });
      if (res.ok) {
        setIsBound(true);
        setManualChatId('');
        fetchStatus();
      }
    } catch (err) {
      console.warn('Manual bind failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePreference = async (key) => {
    const next = { ...preferences, [key]: !preferences[key] };
    setPreferences(next);

    if (wallet?.address && isBound) {
      try {
        await fetch(`${BACKEND_URL}/api/telegram/preferences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: manualChatId || wallet.address,
            preferences: next,
          }),
        });
      } catch { /* ignore */ }
    }
  };

  const handleSendTestAlert = async () => {
    if (!wallet?.address) {
      if (openWalletModal) openWalletModal();
      return;
    }
    setTestAlertSent(true);
    try {
      await fetch(`${BACKEND_URL}/api/telegram/test-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet.address,
          type: 'liquidation',
          message: 'This is a live test notification from your OrionX Always-On Sentinel.',
        }),
      });
    } catch { /* ignore */ }
    setTimeout(() => setTestAlertSent(false), 4000);
  };

  const handleUnbind = async () => {
    if (!wallet?.address) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/telegram/unbind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: wallet.address }),
      });
      if (res.ok) {
        setIsBound(false);
        fetchStatus();
      }
    } catch (err) {
      console.warn('Unbind failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Always-On Telegram Sentinel</h1>
          <span className="badge-settled" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
            <Radio size={11} className="spin" /> 24/7 DAEMON ACTIVE
          </span>
        </div>
        <p className="page-subtitle">
          Bound your Base wallet to Telegram to receive instant push alerts when you are away from the dashboard.
          Run full protocol audits, check positions, and reallocate yields directly via Telegram bot commands.
        </p>
      </div>

      {/* ── Status Banner Cards ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div className="stat-label">SENTINEL DAEMON</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>Always-On Active</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Continuous 60s Base telemetry
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div className="stat-label">TELEGRAM BINDING</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isBound ? '#16a34a' : '#eab308', display: 'inline-block' }} />
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
              {isBound ? 'Wallet Bound' : 'Pending Connect'}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
            {wallet?.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Connect wallet to pair'}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div className="stat-label">ACTIVE SUBSCRIBERS</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
            {botStatus?.subscribersCount ?? 1} Wallets
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Protected non-custodially
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div className="stat-label">AI PROTOCOL REASONING</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={15} style={{ color: 'var(--accent-blue)' }} /> Enabled on Bot
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
            <code>/audit &lt;address&gt;</code> available 24/7
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px', marginBottom: '24px', alignItems: 'start' }}>
        {/* ── Left Column: Pairing & Test Alert ──────────────── */}
        {isBound ? (
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ShieldCheck size={18} style={{ color: '#16a34a' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Wallet Connected to Telegram</h3>
              <span className="badge-settled" style={{ marginLeft: 'auto', fontSize: '10px' }}>ACTIVE</span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
              Your Base wallet is securely paired with <b>@{botUsername}</b>. The 24/7 Sentinel daemon actively monitors your lending safety and sends push alerts.
            </p>

            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Bound Base Address
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                {wallet?.address || '0x...'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                Instant push alerts enabled on Telegram
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleSendTestAlert}
                className="btn btn-outline"
                disabled={testAlertSent}
                style={{ justifyContent: 'center', gap: '6px', fontSize: '13px' }}
              >
                {testAlertSent ? <><CheckCircle2 size={14} style={{ color: '#16a34a' }} /> Test Alert Dispatched to Telegram!</> : <><Bell size={14} /> Send Live Test Alert</>}
              </button>

              <button
                onClick={handleUnbind}
                disabled={loading}
                className="btn"
                style={{
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  background: 'rgba(220, 38, 38, 0.08)',
                  color: 'var(--accent-red)',
                  border: '1px solid rgba(220, 38, 38, 0.25)',
                }}
              >
                <Unlink size={14} /> {loading ? 'Disconnecting…' : 'Unbind Wallet / Disconnect Telegram'}
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Send size={18} style={{ color: 'var(--accent-blue)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Connect Telegram Bot</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              Click below to launch <b>@{botUsername}</b> in Telegram. Your active wallet address will be paired automatically so you receive instant push notifications.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <a
                href={telegramDeepLink}
                target="_blank"
                rel="noreferrer"
                className="btn btn-dark btn-lg"
                style={{ justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
              >
                <Send size={15} /> 1-Click Connect on Telegram <ExternalLink size={13} />
              </a>

              <button
                onClick={handleSendTestAlert}
                className="btn btn-outline"
                disabled={testAlertSent}
                style={{ justifyContent: 'center', gap: '6px', fontSize: '13px' }}
              >
                {testAlertSent ? <><CheckCircle2 size={14} style={{ color: '#16a34a' }} /> Test Alert Dispatched to Telegram!</> : <><Bell size={14} /> Send Live Test Alert</>}
              </button>
            </div>

            <div className="divider" style={{ margin: '18px 0' }} />

            {/* Manual Chat ID Link Form */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Manual Pair (Enter Telegram Chat ID)
              </span>
              <form onSubmit={handleManualBind} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. 123456789"
                  value={manualChatId}
                  onChange={e => setManualChatId(e.target.value)}
                  className="input"
                  style={{ fontSize: '12px' }}
                />
                <button type="submit" className="btn btn-outline" disabled={loading || !manualChatId} style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>
                  {loading ? 'Pairing…' : 'Pair Wallet'}
                </button>
              </form>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px', display: 'block' }}>
                Tip: Send <code>/start</code> to @{botUsername} to view your Chat ID.
              </span>
            </div>
          </div>
        )}

        {/* ── Right Column: Notification Preferences ─────────── */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Settings size={18} style={{ color: 'var(--text-dim)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Push Notification Preferences</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
            Configure which on-chain telemetry triggers dispatch push alerts to your Telegram chat.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              {
                id: 'liquidationAlerts',
                title: 'Liquidation Shield Alert',
                desc: 'Push immediately when aggregate Health Factor drops below 1.50.',
                active: preferences.liquidationAlerts,
              },
              {
                id: 'yieldAlerts',
                title: 'High-Yield Rebalancing Opportunity',
                desc: 'Alert when a verified Base pool offers >3% net gain over current APY.',
                active: preferences.yieldAlerts,
              },
              {
                id: 'incentiveAlerts',
                title: 'Ecosystem Incentive Qualification',
                desc: 'Notify when 1 step away from completing active Base reward campaigns.',
                active: preferences.incentiveAlerts,
              },
              {
                id: 'securityAlerts',
                title: 'Smart Contract Security & Approvals',
                desc: 'Warn if an approved protocol undergoes emergency proxy or owner changes.',
                active: preferences.securityAlerts,
              },
            ].map(pref => (
              <div
                key={pref.id}
                onClick={() => handleTogglePreference(pref.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {pref.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {pref.desc}
                  </div>
                </div>
                <div style={{
                  width: 36, height: 20, borderRadius: 10,
                  background: pref.active ? '#16a34a' : '#d4d4d4',
                  position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                  marginLeft: 12,
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: 2,
                    left: pref.active ? 18 : 2,
                    transition: 'left 0.2s',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Interactive Telegram Bot Command Cheatsheet ───────── */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>Interactive Telegram Bot Commands</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
          You can interact with OrionX anytime directly inside Telegram:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {[
            { cmd: '/status', desc: 'Live aggregate Health Factor, collateral, and debt breakdown across Moonwell/Compound/Aave.' },
            { cmd: '/yields', desc: 'Top Base Mainnet pools with net-gain APY calculations and reallocation routes.' },
            { cmd: '/incentives', desc: 'Evaluation of qualification criteria for Aerodrome, Moonwell, and Base Onchain Summer.' },
            { cmd: '/audit <address>', desc: 'Deep AI protocol reasoning analyzing Details, Health, Price, Market Sentiment, and Risk.' },
            { cmd: '/bind <address>', desc: 'Bind or switch the active Base wallet monitored by the sentinel daemon.' },
            { cmd: '/settings', desc: 'Inspect active alert thresholds and notification settings.' },
          ].map(c => (
            <div key={c.cmd} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px' }}>
              <code style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-blue)' }}>{c.cmd}</code>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                {c.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Live Sentinel Daemon Telemetry Feed ───────────────── */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} style={{ color: 'var(--text-dim)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Live Sentinel Daemon Telemetry Feed</h3>
          </div>
          <button onClick={fetchStatus} className="btn btn-outline" style={{ fontSize: '11px', padding: '4px 8px', gap: '4px' }}>
            <RefreshCw size={11} /> Refresh
          </button>
        </div>

        <div style={{
          background: 'var(--bg)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          padding: '14px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          maxHeight: '220px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          {daemonLogs.length === 0 ? (
            <span style={{ color: 'var(--text-dim)' }}>Initializing 24/7 background telemetry cycle...</span>
          ) : (
            daemonLogs.map((entry, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>
                  [{new Date(entry.timestamp).toLocaleTimeString()}]
                </span>
                <span style={{
                  color: entry.level === 'error' ? 'var(--accent-red)' : entry.level === 'warn' ? '#d97706' : 'var(--text-muted)'
                }}>
                  {entry.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
