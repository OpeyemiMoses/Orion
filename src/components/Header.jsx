import React from 'react';
import { Shield, Cpu, ArrowRight } from 'lucide-react';
import { truncateAddress } from '../services/web3Wallet';

export default function Header({ currentView, setCurrentView, wallet, openWalletModal }) {
  return (
    <header style={{
      height: '48px',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      gap: '16px'
    }}>
      {/* Brand */}
      <div
        onClick={() => setCurrentView('landing')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none' }}
      >
        <Shield size={16} strokeWidth={2.5} />
        <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '-0.01em' }}>
          Orion
        </span>
      </div>

      {/* Center nav links (top bar nav like Conduit) */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={() => setCurrentView('landing')}
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
          onClick={() => setCurrentView('dashboard')}
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
      </nav>

      {/* Right: Network + Wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="header-network-label" style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Base Mainnet</span>

        {wallet ? (
          <button
            onClick={openWalletModal}
            className="btn btn-outline"
            style={{ gap: '6px' }}
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
          <button onClick={openWalletModal} className="btn btn-dark btn-lg" style={{ padding: '7px 14px', fontSize: '13px' }}>
            Connect wallet
          </button>
        )}
      </div>
    </header>
  );
}
