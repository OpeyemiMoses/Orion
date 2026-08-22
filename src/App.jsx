import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Documentation from './components/Documentation';
import HelpCenter from './components/HelpCenter';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal, useAccountModal } from '@rainbow-me/rainbowkit';
import { getDemoWallet } from './services/web3Wallet';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard' | 'docs' | 'help'
  const [activeTab, setActiveTab] = useState('liquidation'); // 'shield' | 'liquidation' | 'yield' | 'incentive' | 'protocol' | 'telegram' | 'settings'
  const [demoWallet, setDemoWallet] = useState(null);

  const { address, isConnected, chain, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();

  // Load demo wallet if selected
  useEffect(() => {
    const savedType = localStorage.getItem('orion_wallet_type');
    if (savedType === 'demo') {
      setDemoWallet(getDemoWallet());
    }
  }, []);

  // Sync active wallet (Wagmi Live Web3 takes priority, then Demo wallet)
  const activeWallet = isConnected && address
    ? {
        address,
        chainId: chain?.id || 8453,
        chainName: chain?.name || 'Base',
        isLiveWeb3: true,
        providerName: connector?.name || 'Web3 Wallet',
        status: 'connected',
      }
    : demoWallet;

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Navigation Header */}
      {/* Background Side Watermark (Reduced Opacity) */}
      <img
        src="/orion-beam.png"
        className="side-watermark"
        alt=""
      />

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

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-glass)',
        padding: '1.5rem',
        textAlign: 'center',
        color: 'var(--text-dim)',
        fontSize: '12px',
        background: 'rgba(10, 15, 29, 0.4)',
        backdropFilter: 'blur(8px)',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCurrentView('landing')}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '12px' }}
          >
            Overview
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '12px' }}
          >
            Shield Console
          </button>
          <button
            onClick={() => setCurrentView('docs')}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '12px' }}
          >
            Documentation
          </button>
          <button
            onClick={() => setCurrentView('help')}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '12px' }}
          >
            Help Centre
          </button>
          <a
            href="https://t.me/OrionXSentinelBot"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--text-dim)', textDecoration: 'none' }}
          >
            Telegram Bot
          </a>
          <a
            href="https://github.com/OpeyemiMoses/Orion"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--text-dim)', textDecoration: 'none' }}
          >
            GitHub
          </a>
        </div>
        <div>
          © 2026 OrionX. Non-custodial autonomous DeFi security sentinel on Base Mainnet.
        </div>
      </footer>
    </div>
  );
}
