import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert,
  TrendingUp,
  Gift,
  ScanSearch,
  Cpu, 
  ArrowRight, 
  Menu, 
  X, 
  BookOpen, 
  HelpCircle, 
  LayoutDashboard, 
  Send, 
  Globe, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Settings as SettingsIcon
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { truncateAddress } from '../services/web3Wallet';

const MODULES = [
  { id: 'shield',      label: 'Approval Shield',          icon: Shield,       group: 'agent', desc: 'Scan & revoke unverified token spenders' },
  { id: 'liquidation', label: 'Liquidation Shield',        icon: ShieldAlert,  group: 'agent', desc: 'Real-time multi-market solvency & health factor' },
  { id: 'yield',       label: 'Yield Optimizer',           icon: TrendingUp,   group: 'agent', desc: 'Live Base pools from DeFi Llama (> $100k TVL)' },
  { id: 'incentive',   label: 'Incentive Tracker',         icon: Gift,         group: 'agent', desc: 'On-chain milestone & reward eligibility audit' },
  { id: 'protocol',    label: 'Protocol & Token Auditor',   icon: ScanSearch,   group: 'tools', desc: 'Deep AI & bytecode intelligence on Base' },
  { id: 'telegram',    label: 'Telegram Sentinel',         icon: Send,         group: 'tools', desc: '24/7 autonomous daemon & push notifications' },
];

export default function Header({ currentView, setCurrentView, activeTab, setActiveTab, wallet, openWalletModal }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const handleModuleClick = (moduleId) => {
    if (setActiveTab) setActiveTab(moduleId);
    setCurrentView('dashboard');
    setIsMobileMenuOpen(false);
  };

  const currentModule = MODULES.find(m => m.id === activeTab) || (activeTab === 'settings' ? { label: 'Settings', icon: SettingsIcon } : MODULES[1]);
  const CurrentModuleIcon = currentModule?.icon || ShieldAlert;

  return (
    <>
      <header style={{
        height: '48px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(10px, 3vw, 20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '8px'
      }}>
        {/* Left: Brand + Latched Active Module Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div
            onClick={() => handleNavClick('landing')}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', textDecoration: 'none', flexShrink: 0 }}
          >
            <img
              src="/logo.png"
              alt="OrionX"
              style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
            />
            <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em' }}>
              OrionX
            </span>
          </div>

          {/* Latched Active Module Selector (Visible when in Console) */}
          {currentView === 'dashboard' && (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="header-active-module-pill"
              title="Tap to switch modules"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: '16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                maxWidth: '180px'
              }}
            >
              <CurrentModuleIcon size={13} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }}>
                {currentModule?.label}
              </span>
              <ChevronDown size={11} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
            </button>
          )}
        </div>

        {/* Center nav links (Desktop) */}
        <nav className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => handleNavClick('landing')}
            className="btn btn-ghost"
            style={{
              fontWeight: currentView === 'landing' ? 600 : 400,
              color: currentView === 'landing' ? 'var(--text-main)' : 'var(--text-muted)',
              padding: '5px 10px',
              fontSize: '13px'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => handleNavClick('dashboard')}
            className="btn btn-ghost"
            style={{
              fontWeight: currentView === 'dashboard' ? 600 : 400,
              color: currentView === 'dashboard' ? 'var(--text-main)' : 'var(--text-muted)',
              padding: '5px 10px',
              fontSize: '13px'
            }}
          >
            Shield Console
          </button>
          <button
            onClick={() => handleNavClick('docs')}
            className="btn btn-ghost"
            style={{
              fontWeight: currentView === 'docs' ? 600 : 400,
              color: currentView === 'docs' ? 'var(--text-main)' : 'var(--text-muted)',
              padding: '5px 10px',
              fontSize: '13px'
            }}
          >
            Documentation
          </button>
          <button
            onClick={() => handleNavClick('help')}
            className="btn btn-ghost"
            style={{
              fontWeight: currentView === 'help' ? 600 : 400,
              color: currentView === 'help' ? 'var(--text-main)' : 'var(--text-muted)',
              padding: '5px 10px',
              fontSize: '13px'
            }}
          >
            Help Centre
          </button>
        </nav>

        {/* Right: Network + GitHub + Wallet + Mobile Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span className="header-network-label" style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Base Mainnet</span>

          <a
            href="https://github.com/OpeyemiMoses/Orion"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost header-github-btn"
            style={{ padding: '6px 8px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center' }}
            title="GitHub Repository"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* RainbowKit Connect Button */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== 'loading';
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus || authenticationStatus === 'authenticated');

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="btn btn-dark header-wallet-btn"
                          style={{ padding: '5px 10px', fontSize: '11px' }}
                        >
                          Connect
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="btn btn-danger header-wallet-btn"
                          style={{ padding: '4px 8px', fontSize: '11px', background: '#dc2626', color: '#fff' }}
                        >
                          Wrong network
                        </button>
                      );
                    }

                    return (
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="btn btn-outline header-wallet-btn"
                        style={{ gap: '4px', padding: '4px 8px' }}
                        title="Wallet Connected • Tap to manage"
                      >
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: '#16a34a', flexShrink: 0
                        }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                          {account.displayName}
                        </span>
                      </button>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="btn btn-ghost header-mobile-toggle"
            aria-label="Toggle navigation menu"
            style={{
              padding: '5px 6px',
              color: 'var(--text-main)',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px'
            }}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Menu Backdrop Overlay ───────────────────────── */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="mobile-menu-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 998,
            animation: 'fadeIn 0.2s ease forwards'
          }}
        />
      )}

      {/* ── Mobile Navigation Drawer (Slide in from Left/Top) ──── */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-drawer"
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
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.png" alt="OrionX" style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--border)' }} />
              <span style={{ fontWeight: 700, fontSize: '14px' }}>OrionX Navigation</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn btn-ghost"
              style={{ padding: '4px 6px', color: 'var(--text-muted)' }}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Section: Agent Modules */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', padding: '0 8px 6px 8px' }}>
                Agent Modules
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {MODULES.filter(m => m.group === 'agent').map(({ id, label, icon: Icon, desc }) => {
                  const isActive = currentView === 'dashboard' && activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleModuleClick(id)}
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
                {MODULES.filter(m => m.group === 'tools').map(({ id, label, icon: Icon, desc }) => {
                  const isActive = currentView === 'dashboard' && activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleModuleClick(id)}
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

            {/* Section: Global Pages */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', padding: '0 8px 6px 8px' }}>
                Global Views & Support
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <button
                  onClick={() => handleNavClick('landing')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: currentView === 'landing' ? 'var(--bg-secondary)' : 'transparent',
                    border: currentView === 'landing' ? '1px solid var(--border)' : '1px solid transparent',
                    color: currentView === 'landing' ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    width: '100%'
                  }}
                >
                  <Globe size={14} style={{ color: 'var(--text-dim)' }} /> Overview (Home)
                </button>
                <button
                  onClick={() => handleNavClick('docs')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: currentView === 'docs' ? 'var(--bg-secondary)' : 'transparent',
                    border: currentView === 'docs' ? '1px solid var(--border)' : '1px solid transparent',
                    color: currentView === 'docs' ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    width: '100%'
                  }}
                >
                  <BookOpen size={14} style={{ color: 'var(--text-dim)' }} /> Documentation
                </button>
                <button
                  onClick={() => handleNavClick('help')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: currentView === 'help' ? 'var(--bg-secondary)' : 'transparent',
                    border: currentView === 'help' ? '1px solid var(--border)' : '1px solid transparent',
                    color: currentView === 'help' ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    width: '100%'
                  }}
                >
                  <HelpCircle size={14} style={{ color: 'var(--text-dim)' }} /> Help Centre
                </button>
                <button
                  onClick={() => handleModuleClick('settings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: currentView === 'dashboard' && activeTab === 'settings' ? 'var(--bg-secondary)' : 'transparent',
                    border: currentView === 'dashboard' && activeTab === 'settings' ? '1px solid var(--border)' : '1px solid transparent',
                    color: currentView === 'dashboard' && activeTab === 'settings' ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    width: '100%'
                  }}
                >
                  <SettingsIcon size={14} style={{ color: 'var(--text-dim)' }} /> System Settings
                </button>
              </div>
            </div>
          </div>

          {/* Drawer Footer: Community Links */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--bg-secondary)' }}>
            <a
              href="https://t.me/OrionXSentinelBot"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center', gap: '4px' }}
            >
              <Send size={12} /> Telegram Bot
            </a>
            <a
              href="https://github.com/OpeyemiMoses/Orion"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center', gap: '4px' }}
            >
              <ExternalLink size={12} /> GitHub
            </a>
          </div>
        </div>
      )}
    </>
  );
}

