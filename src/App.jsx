import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Documentation from './components/Documentation';
import HelpCenter from './components/HelpCenter';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal, useAccountModal } from '@rainbow-me/rainbowkit';
import { fetchLiveWalletData } from './services/web3Wallet';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard' | 'docs' | 'help'
  const [activeTab, setActiveTab] = useState('liquidation'); // 'shield' | 'liquidation' | 'yield' | 'incentive' | 'protocol' | 'telegram' | 'settings'
  const [liveWalletData, setLiveWalletData] = useState(null);

  const { address, isConnected, chain, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();

  // Fetch real on-chain wallet data as soon as wallet connects via Wagmi / RainbowKit
  useEffect(() => {
    if (isConnected && address) {
      fetchLiveWalletData(address, connector?.name || 'Web3 Wallet')
        .then(data => {
          if (data) setLiveWalletData(data);
        })
        .catch(console.error);
    } else {
      setLiveWalletData(null);
    }
  }, [isConnected, address, connector]);

  // Sync active wallet (strictly derived from connected Web3 account)
  const activeWallet = isConnected && address
    ? {
        address,
        chainId: chain?.id || 8453,
        chainName: chain?.name || 'Base',
        isLiveWeb3: true,
        providerName: connector?.name || 'Web3 Wallet',
        status: 'connected',
        ...(liveWalletData || {}),
      }
    : null;

  const handleOpenWalletModal = () => {
    if (isConnected) {
      if (openAccountModal) {
        openAccountModal();
      } else if (openConnectModal) {
        openConnectModal();
      }
    } else {
      if (openConnectModal) {
        openConnectModal();
      }
    }
  };

  const handleLaunchApp = () => {
    setCurrentView('dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Background Side Watermark */}
      <img
        src="/orion-beam.png"
        className="side-watermark"
        alt=""
      />

      {/* App Navigation Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wallet={activeWallet}
        openWalletModal={handleOpenWalletModal}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {currentView === 'landing' && (
          <LandingPage
            onLaunchApp={handleLaunchApp}
            openWalletModal={handleOpenWalletModal}
            setCurrentView={setCurrentView}
          />
        )}
        {currentView === 'dashboard' && (
          <Dashboard
            wallet={activeWallet}
            openWalletModal={handleOpenWalletModal}
            setCurrentView={setCurrentView}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
        {currentView === 'docs' && (
          <Documentation
            setCurrentView={setCurrentView}
          />
        )}
        {currentView === 'help' && (
          <HelpCenter
            setCurrentView={setCurrentView}
          />
        )}
      </main>

      {/* ── Global Highly Visible Footer ───────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 20px 36px 20px',
        background: 'var(--bg-secondary)',
        marginTop: 'auto',
        position: 'relative',
        zIndex: 20
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center'
        }}>
          {/* Brand & Tagline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="OrionX" style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--border)' }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>OrionX Sentinel</span>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(0, 82, 255, 0.15)', color: '#3b82f6', border: '1px solid rgba(0, 82, 255, 0.3)', fontWeight: 600 }}>
              Base Mainnet
            </span>
          </div>

          {/* Navigation Links (Crisp & High Contrast) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(14px, 3vw, 28px)', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentView('landing')}
              className="btn btn-ghost"
              style={{ padding: '4px 8px', color: 'var(--text-main)', fontSize: '13px', fontWeight: 500 }}
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="btn btn-ghost"
              style={{ padding: '4px 8px', color: 'var(--text-main)', fontSize: '13px', fontWeight: 500 }}
            >
              Shield Console
            </button>
            <button
              onClick={() => setCurrentView('docs')}
              className="btn btn-ghost"
              style={{ padding: '4px 8px', color: 'var(--text-main)', fontSize: '13px', fontWeight: 500 }}
            >
              Documentation
            </button>
            <button
              onClick={() => setCurrentView('help')}
              className="btn btn-ghost"
              style={{ padding: '4px 8px', color: 'var(--text-main)', fontSize: '13px', fontWeight: 500 }}
            >
              Help Centre
            </button>
            <a
              href="https://t.me/OrionXSentinelBot"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
              style={{ padding: '4px 8px', color: 'var(--text-main)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}
            >
              Telegram Sentinel
            </a>
            <a
              href="https://github.com/OpeyemiMoses/Orion"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
              style={{ padding: '4px 8px', color: 'var(--text-main)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}
            >
              GitHub Source
            </a>
          </div>

          {/* Copyright & Disclaimer */}
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '600px' }}>
            © {new Date().getFullYear()} OrionX. Non-custodial autonomous DeFi security sentinel on Base Mainnet. Built for real on-chain execution with zero simulated data.
          </div>
        </div>
      </footer>
    </div>
  );
}
