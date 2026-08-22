import React, { useState, useEffect } from 'react';
import { 
  Shield, 
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
  ChevronRight
} from 'lucide-react';
import { truncateAddress } from '../services/web3Wallet';

export default function Header({ currentView, setCurrentView, wallet, openWalletModal }) {
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

  return (
    <>
      <header style={{
        height: '48px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(12px, 3vw, 20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '12px'
      }}>
        {/* Brand */}
        <div
          onClick={() => handleNavClick('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none' }}
        >
          <img
            src="/logo.png"
            alt="OrionX"
            style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
          />
          <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em' }}>
            OrionX
          </span>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

          {wallet ? (
            <button
              onClick={openWalletModal}
              className="btn btn-outline header-wallet-btn"
              style={{ gap: '6px', padding: '5px 10px' }}
            >
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: '#16a34a', flexShrink: 0
              }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                {truncateAddress(wallet.address)}
              </span>
            </button>
          ) : (
            <button 
              onClick={openWalletModal} 
              className="btn btn-dark header-wallet-btn" 
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Connect wallet
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="btn btn-ghost header-mobile-toggle"
            aria-label="Toggle navigation menu"
            style={{
              padding: '6px 8px',
              color: 'var(--text-main)',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px'
            }}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 998,
            animation: 'fadeIn 0.2s ease forwards'
          }}
        />
      )}

      {/* ── Mobile Navigation Drawer ──────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-drawer"
          style={{
            position: 'fixed',
            top: '48px',
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            padding: '20px 16px 24px 16px',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            animation: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Section: Main Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', padding: '0 8px 6px 8px' }}>
              Navigation
            </div>

            {[
              { id: 'landing', label: 'Overview', icon: Globe, desc: 'Landing Page & Ecosystem Features' },
              { id: 'dashboard', label: 'Shield Console', icon: LayoutDashboard, desc: 'Autonomous Defense & Agent Modules' },
              { id: 'docs', label: 'Documentation', icon: BookOpen, desc: 'Technical Architecture & API Reference' },
              { id: 'help', label: 'Help Centre', icon: HelpCircle, desc: 'Step-by-Step Guides & FAQs' },
            ].map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '8px',
                    background: isActive ? 'var(--bg-secondary)' : 'transparent',
                    border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: isActive ? 'var(--text-main)' : 'var(--bg)',
                      color: isActive ? 'var(--bg)' : 'var(--text-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border)'
                    }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: isActive ? 700 : 500, color: 'var(--text-main)' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} />
                </button>
              );
            })}
          </div>

          {/* Section: Mobile Wallet & Telemetry */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', padding: '0 8px' }}>
              Account & Network
            </div>

            {wallet ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
                    {truncateAddress(wallet.address)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openWalletModal();
                  }}
                  className="btn btn-outline"
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  Manage
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openWalletModal();
                }}
                className="btn btn-dark"
                style={{ width: '100%', padding: '10px', fontSize: '13px', justifyContent: 'center' }}
              >
                Connect Web3 Wallet
              </button>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-dim)' }}>Network:</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>Base Mainnet (8453)</span>
            </div>
          </div>

          {/* Section: External Community & Bot Links */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <a
              href="https://t.me/OrionXSentinelBot"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ fontSize: '12px', padding: '8px 10px', justifyContent: 'center', gap: '6px' }}
            >
              <Send size={13} /> Telegram Bot
            </a>
            <a
              href="https://github.com/OpeyemiMoses/Orion"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ fontSize: '12px', padding: '8px 10px', justifyContent: 'center', gap: '6px' }}
            >
              <ExternalLink size={13} /> GitHub Repo
            </a>
          </div>
        </div>
      )}
    </>
  );
}

