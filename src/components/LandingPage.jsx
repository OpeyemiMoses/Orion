import React from 'react';
import { ArrowRight, ShieldAlert, TrendingUp, Gift, ScanSearch } from 'lucide-react';

/* ── 3D Dashboard Mockup ─────────────────────────────────────── */
function DashboardMockup() {
  return (
    <div className="mockup-3d">
      <div className="mockup-3d-inner">
        {/* Browser chrome */}
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fca5a5' }} />
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fde68a' }} />
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#bbf7d0' }} />
          <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginLeft: 8, fontFamily: 'var(--font-mono)' }}>
            orionsentinel.app
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '9px', color: '#16a34a', fontWeight: 600 }}>● LIVE</span>
        </div>

        {/* App shell */}
        <div style={{ display: 'flex', height: '270px' }}>
          {/* Sidebar */}
          <div style={{ width: '110px', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', padding: '10px 0', fontSize: '10px', flexShrink: 0 }}>
            <div style={{ padding: '3px 10px 6px', fontSize: '8px', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 600 }}>AGENT MODULES</div>
            {[
              ['Approval Shield', false],
              ['Liquidation Shield', true],
              ['Yield Optimizer', false],
              ['Incentive Tracker', false],
            ].map(([item, active]) => (
              <div key={item} style={{ padding: '5px 10px', color: active ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: active ? 600 : 400, background: active ? '#ebebea' : 'none' }}>
                {item}
              </div>
            ))}
            <div style={{ padding: '3px 10px 6px', fontSize: '8px', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 600, marginTop: 6 }}>TOOLS</div>
            {['Protocol Auditor', 'Settings'].map(item => (
              <div key={item} style={{ padding: '5px 10px', color: 'var(--text-dim)' }}>{item}</div>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '12px', overflow: 'hidden' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '1px' }}>Liquidation Shield</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Moonwell · Compound III · Aave V3 · Seamless
            </div>

            {/* Health factor ring (simplified) */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
                <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="22" cy="22" r="17" fill="none" stroke="var(--border)" strokeWidth="4" />
                  <circle cx="22" cy="22" r="17" fill="none" stroke="#16a34a" strokeWidth="4" strokeDasharray="78 107" strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700, color: '#16a34a' }}>2.1</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', color: 'var(--text-dim)', marginBottom: '2px' }}>HEALTH FACTOR</div>
                <span style={{ fontSize: '8px', background: '#dcfce7', color: '#15803d', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>SAFE</span>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '8px', color: 'var(--text-dim)' }}>
                <div>Supplied: <span style={{ color: '#16a34a' }}>$11,360</span></div>
                <div>Borrowed: <span style={{ color: '#dc2626' }}>$3,200</span></div>
              </div>
            </div>

            {/* Protocol rows */}
            {[
              ['Moonwell', 'mUSDC', '$8,000', '$3,200', 'SAFE'],
              ['Aave V3',  'Multi', '$3,360', '$0',    'SAFE'],
            ].map(([proto, market, supplied, borrowed, status]) => (
              <div key={proto} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid var(--border)', fontSize: '9px' }}>
                <span style={{ fontWeight: 600 }}>{proto}</span>
                <span style={{ color: 'var(--text-dim)' }}>{market}</span>
                <span style={{ color: '#16a34a' }}>{supplied}</span>
                <span style={{ color: borrowed === '$0' ? 'var(--text-dim)' : '#dc2626' }}>{borrowed}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage({ onLaunchApp, openWalletModal }) {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(20px, 4vw, 48px)' }}>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="hero-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 460px)',
        alignItems: 'center',
        gap: 'clamp(32px, 5vw, 64px)',
        padding: 'clamp(48px, 8vw, 96px) 0 clamp(48px, 6vw, 72px)',
      }}>
        {/* Left */}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '20px' }}>
            Base Network · Autonomous DeFi Agent
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 3.8vw, 3.4rem)',
            fontWeight: 400, lineHeight: 1.12,
            color: 'var(--text-main)', marginBottom: '24px', letterSpacing: '-0.025em'
          }}>
            Your DeFi capital on Base,<br />managed autonomously.
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '32px', maxWidth: '400px' }}>
            OrionSentinel protects against liquidation, chases the best yield across every Base protocol,
            and qualifies your wallet for active incentive programs — without ever custodying your keys.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={onLaunchApp} className="btn btn-dark btn-lg" style={{ gap: '8px' }}>
              Launch app <ArrowRight size={14} />
            </button>
            <button onClick={openWalletModal} className="btn btn-outline btn-lg">
              Connect wallet
            </button>
          </div>
        </div>

        {/* Right: 3D Mockup */}
        <div style={{ minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
          <DashboardMockup />
        </div>
      </section>

      <div className="divider" />

      {/* ── THREE MODULES ──────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px, 6vw, 72px) 0' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '12px' }}>
          Three autonomous modules
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', fontWeight: 400, marginBottom: '8px', letterSpacing: '-0.01em' }}>
          Every dimension of DeFi risk, covered.
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '40px', maxWidth: '480px' }}>
          Real on-chain reads from Moonwell, Compound III, Aave V3, Seamless, and DeFi Llama. Every decision derived from verifiable data.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          {[
            {
              icon: ShieldAlert,
              title: 'Liquidation Shield',
              desc: 'Monitors lending health factor across Moonwell, Compound III, Aave V3, and Seamless Protocol. Queues protective repays before liquidation.',
              features: ['Real-time health factor ring', 'Multi-protocol position table', 'Protective repay execution', 'On-chain data only'],
            },
            {
              icon: TrendingUp,
              title: 'Yield Optimizer',
              desc: 'Scans every Base pool via DeFi Llama and moves idle capital when the net APY gain clears gas + slippage. No guesswork.',
              features: ['Live APY from DeFi Llama', 'Base + Reward APY breakdown', 'Gas-adjusted net benefit calc', 'Stable vs volatile filter'],
            },
            {
              icon: Gift,
              title: 'Incentive Tracker',
              desc: 'Evaluates activity history, asset holdings, and market participation to verify eligibility for active Base ecosystem reward programs.',
              features: ['Aerodrome LP Rewards', 'Base Onchain Summer II', 'Moonwell Reward Program', 'Extra Finance Program'],
            },
          ].map(({ icon: Icon, title, desc, features }) => (
            <div key={title} style={{ background: 'var(--bg-card)', padding: 'clamp(24px, 3vw, 36px) clamp(20px, 3vw, 28px)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Icon size={17} style={{ color: 'var(--text-dim)' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 400, marginBottom: '10px', letterSpacing: '-0.01em' }}>{title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '20px' }}>{desc}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-dim)', flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ── PROTOCOL AUDITOR callout ───────────────────────── */}
      <section style={{ padding: 'clamp(40px, 6vw, 72px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <ScanSearch size={16} style={{ color: 'var(--text-dim)' }} />
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>
                Protocol Auditor
              </p>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 2.2vw, 1.85rem)', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '10px' }}>
              Audit any Base protocol before you interact.
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: '520px' }}>
              Paste any protocol contract address to inspect verification status, independent audits, total liquidity (TVL), governance architecture, and clear risk flags.
            </p>
          </div>
          <button onClick={onLaunchApp} className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
            Open auditor <ArrowRight size={13} />
          </button>
        </div>
      </section>

      <div className="divider" />

      {/* ── FOOTER CTA ─────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px, 6vw, 72px) 0 clamp(48px, 8vw, 80px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 400, marginBottom: '8px' }}>Start monitoring</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
            Connect your wallet and activate live shield telemetry on Base. OrionSentinel never sees your private key.
          </p>
          <button onClick={onLaunchApp} className="btn btn-dark">Launch app</button>
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 400, marginBottom: '8px' }}>Audit a protocol</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
            Paste any Base contract address to get a full risk assessment before you approve, deposit, or interact.
          </p>
          <button onClick={onLaunchApp} className="btn btn-outline">Protocol auditor</button>
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 400, marginBottom: '8px' }}>Built for Base</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
            All data flows through Base Mainnet RPC and DeFi Llama — no proprietary indexer, no database, fully verifiable.
          </p>
          <button onClick={onLaunchApp} className="btn btn-outline">View source data</button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <div className="divider" />
      <footer style={{ padding: 'clamp(24px, 4vw, 36px) 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>OrionSentinel</span>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Built for Orion Agents Hackathon · Base Mainnet · {new Date().getFullYear()}</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['GitHub', 'Base Explorer', 'DeFi Llama'].map(l => (
            <span key={l} style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
