import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  TrendingUp, 
  Gift, 
  ScanSearch, 
  Send, 
  Settings as SettingsIcon, 
  ArrowLeft, 
  BookOpen, 
  HelpCircle,
  Menu,
  X,
  ChevronRight,
  Globe,
  LayoutDashboard
} from 'lucide-react';
import PortfolioShield  from './PortfolioShield';
import LiquidationShield from './LiquidationShield';
import YieldOptimizer   from './YieldOptimizer';
import IncentiveTracker from './IncentiveTracker';
import ProtocolAuditor  from './ProtocolAuditor';
import TelegramSentinel from './TelegramSentinel';
import Settings         from './Settings';

const NAV = [
  { id: 'shield',      label: 'Approval Shield',    icon: Shield,       group: 'agent', desc: 'Scan & revoke unverified token spenders' },
  { id: 'liquidation', label: 'Liquidation Shield',  icon: ShieldAlert,  group: 'agent', desc: 'Real-time multi-market solvency & health factor' },
  { id: 'yield',       label: 'Yield Optimizer',     icon: TrendingUp,   group: 'agent', desc: 'Live Base pools from DeFi Llama (> $100k TVL)' },
  { id: 'incentive',   label: 'Incentive Tracker',   icon: Gift,         group: 'agent', desc: 'On-chain milestone & reward eligibility audit' },
  { id: 'protocol',    label: 'Protocol & Token Auditor', icon: ScanSearch,   group: 'tools', desc: 'Deep AI & bytecode intelligence on Base' },
  { id: 'telegram',    label: 'Telegram Sentinel',   icon: Send,         group: 'tools', desc: '24/7 autonomous daemon & push notifications' },
];

export default function Dashboard({ wallet, openWalletModal, setCurrentView }) {
  const [tab, setTab] = useState('liquidation');
  const [history, setHistory] = useState(['liquidation']);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleNavigate = (newTab) => {
    setIsDrawerOpen(false); // Auto-close drawer on selection
    if (newTab === tab) return;
    setHistory(prev => [...prev, newTab]);
    setTab(newTab);
  };

  const handleBack = () => {
    if (history.length > 1) {
      const nextHistory = [...history];
      nextHistory.pop(); // remove current
      const prevTab = nextHistory[nextHistory.length - 1];
      setHistory(nextHistory);
      setTab(prevTab);
    } else {
      if (setCurrentView) setCurrentView('landing');
    }
  };

  const currentNav = NAV.find(n => n.id === tab) || (tab === 'settings' ? { label: 'Settings', icon: SettingsIcon } : null);
  const CurrentIcon = currentNav?.icon || ShieldAlert;
  const prevNavId = history.length > 1 ? history[history.length - 2] : null;
  const prevNav = prevNavId ? (NAV.find(n => n.id === prevNavId) || (prevNavId === 'settings' ? { label: 'Settings' } : null)) : null;

  return (
    <div className="app-layout">
      {/* ── Desktop Permanent Sidebar ─────────────────── */}
      <aside className="sidebar desktop-sidebar">
        <div className="sidebar-section-label">Agent Modules</div>
        {NAV.filter(n => n.group === 'agent').map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => handleNavigate(id)} className={`sidebar-link ${tab === id ? 'active' : ''}`}>
            <Icon size={14} />{label}
          </button>
        ))}

        <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '4px' }}>
          <div className="sidebar-section-label">Tools</div>
          {NAV.filter(n => n.group === 'tools').map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => handleNavigate(id)} className={`sidebar-link ${tab === id ? 'active' : ''}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '4px' }}>
          <div className="sidebar-section-label">System & Support</div>
          <button onClick={() => handleNavigate('settings')} className={`sidebar-link ${tab === 'settings' ? 'active' : ''}`}>
            <SettingsIcon size={14} />Settings
          </button>
          <button onClick={() => setCurrentView?.('docs')} className="sidebar-link">
            <BookOpen size={14} />Documentation
          </button>
          <button onClick={() => setCurrentView?.('help')} className="sidebar-link">
            <HelpCircle size={14} />Help Centre
          </button>
        </div>
      </aside>

      {/* ── Mobile In-App Active Bar (Clean & Compact) ─────── */}
      <div className="mobile-in-app-bar">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="mobile-active-module-pill"
          aria-label="Open module menu"
        >
          <div className="pill-icon-wrapper">
            <CurrentIcon size={15} />
          </div>
          <span className="pill-title">{currentNav?.label}</span>
          <Menu size={15} style={{ color: 'var(--text-dim)', marginLeft: '4px' }} />
        </button>

        <button
          onClick={handleBack}
          className="btn btn-outline mobile-back-btn"
          style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }}
        >
          <ArrowLeft size={12} />
          <span>{prevNav ? prevNav.label.slice(0, 10) + '…' : 'Overview'}</span>
        </button>
      </div>

      {/* ── Mobile Side Drawer Backdrop Overlay ──────────── */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="mobile-drawer-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 998,
            animation: 'fadeIn 0.2s ease forwards'
          }}
        />
      )}

      {/* ── Mobile Side Drawer Sheet (Slide in from Left) ─── */}
      {isDrawerOpen && (
        <div
          className="mobile-side-drawer"
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            width: 'min(320px, 86vw)',
            background: 'var(--bg-card)',
            borderRight: '1px solid var(--border)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '10px 0 35px rgba(0, 0, 0, 0.5)',
            animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Drawer Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.png" alt="OrionX" style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--border)' }} />
              <span style={{ fontWeight: 700, fontSize: '14px' }}>OrionX Shield Console</span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="btn btn-ghost"
              style={{ padding: '4px 6px', color: 'var(--text-muted)' }}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Scrollable Nav List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Section: Agent Modules */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', padding: '0 8px 6px 8px' }}>
                Agent Modules
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {NAV.filter(n => n.group === 'agent').map(({ id, label, icon: Icon, desc }) => {
                  const isActive = tab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleNavigate(id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 10px',
                        borderRadius: '8px',
                        background: isActive ? 'var(--bg-secondary)' : 'transparent',
                        border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                        color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: isActive ? 'var(--text-main)' : 'var(--bg)',
                          color: isActive ? 'var(--bg)' : 'var(--text-dim)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border)'
                        }}>
                          <Icon size={14} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: isActive ? 700 : 500, color: 'var(--text-main)' }}>
                            {label}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '1px' }}>
                            {desc}
                          </div>
                        </div>
                      </div>
                      {isActive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-blue)' }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section: Tools */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', padding: '0 8px 6px 8px' }}>
                Tools & Telemetry
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {NAV.filter(n => n.group === 'tools').map(({ id, label, icon: Icon, desc }) => {
                  const isActive = tab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleNavigate(id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 10px',
                        borderRadius: '8px',
                        background: isActive ? 'var(--bg-secondary)' : 'transparent',
                        border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                        color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: isActive ? 'var(--text-main)' : 'var(--bg)',
                          color: isActive ? 'var(--bg)' : 'var(--text-dim)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border)'
                        }}>
                          <Icon size={14} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: isActive ? 700 : 500, color: 'var(--text-main)' }}>
                            {label}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '1px' }}>
                            {desc}
                          </div>
                        </div>
                      </div>
                      {isActive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-blue)' }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section: Global Navigation & Settings */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', padding: '0 8px 6px 8px' }}>
                System & Global Pages
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <button
                  onClick={() => handleNavigate('settings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: tab === 'settings' ? 'var(--bg-secondary)' : 'transparent',
                    border: tab === 'settings' ? '1px solid var(--border)' : '1px solid transparent',
                    color: tab === 'settings' ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    width: '100%'
                  }}
                >
                  <SettingsIcon size={14} style={{ color: 'var(--text-dim)' }} /> Settings
                </button>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setCurrentView?.('docs');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    width: '100%'
                  }}
                >
                  <BookOpen size={14} style={{ color: 'var(--text-dim)' }} /> Documentation
                </button>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setCurrentView?.('help');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    width: '100%'
                  }}
                >
                  <HelpCircle size={14} style={{ color: 'var(--text-dim)' }} /> Help Centre
                </button>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setCurrentView?.('landing');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    width: '100%'
                  }}
                >
                  <Globe size={14} style={{ color: 'var(--text-dim)' }} /> Back to Overview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Dashboard Content Area ───────────────── */}
      <main className="main-content">
        {/* Navigation Breadcrumb Bar (Desktop) */}
        <div className="desktop-breadcrumb-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleBack}
            className="btn btn-outline"
            style={{ padding: '5px 10px', fontSize: '12px', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={13} />
            <span>Back{prevNav ? ` (${prevNav.label})` : ''}</span>
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Base Mainnet • {currentNav?.label}
          </span>
        </div>

        <div key={tab} className="rise-in">
          {tab === 'shield'      && <PortfolioShield   wallet={wallet} openWalletModal={openWalletModal} />}
          {tab === 'liquidation' && <LiquidationShield wallet={wallet} openWalletModal={openWalletModal} />}
          {tab === 'yield'       && <YieldOptimizer    wallet={wallet} openWalletModal={openWalletModal} />}
          {tab === 'incentive'   && <IncentiveTracker  wallet={wallet} openWalletModal={openWalletModal} />}
          {tab === 'protocol'    && <ProtocolAuditor />}
          {tab === 'telegram'    && <TelegramSentinel  wallet={wallet} openWalletModal={openWalletModal} />}
          {tab === 'settings'    && <Settings />}
        </div>
      </main>
    </div>
  );
}

