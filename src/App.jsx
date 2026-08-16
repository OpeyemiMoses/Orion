import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import WalletConnectModal from './components/WalletConnectModal';
import { connectWeb3Wallet, getDemoWallet } from './services/web3Wallet';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard'
  const [wallet, setWallet] = useState(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // ── Auto-reconnect wallet from localStorage on mount ────────────────────────
  useEffect(() => {
    const savedType = localStorage.getItem('orion_wallet_type');
    const savedAddr = localStorage.getItem('orion_wallet_address');

    if (savedType === 'live' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts && accounts.length > 0) {
            connectWeb3Wallet().then(w => {
              if (w) setWallet(w);
            }).catch(console.error);
          }
        })
        .catch(console.error);
    } else if (savedType === 'demo') {
      setWallet(getDemoWallet());
    }
  }, []);

  // ── Listen to Web3 provider events (account change, chain change) ───────────
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) {
        setWallet(null);
        localStorage.removeItem('orion_wallet_type');
        localStorage.removeItem('orion_wallet_address');
      } else {
        connectWeb3Wallet().then(w => {
          if (w) setWallet(w);
        });
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
  }, []);

  const handleSetWallet = (newWallet) => {
    setWallet(newWallet);
    if (newWallet) {
      localStorage.setItem('orion_wallet_type', newWallet.isLiveWeb3 ? 'live' : 'demo');
      localStorage.setItem('orion_wallet_address', newWallet.address || '');
    } else {
      localStorage.removeItem('orion_wallet_type');
      localStorage.removeItem('orion_wallet_address');
    }
  };

  const handleLaunchApp = () => {
    setCurrentView('dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Navigation Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        wallet={wallet}
        openWalletModal={() => setIsWalletModalOpen(true)}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {currentView === 'landing' ? (
          <LandingPage
            onLaunchApp={handleLaunchApp}
            openWalletModal={() => setIsWalletModalOpen(true)}
          />
        ) : (
          <Dashboard
            wallet={wallet}
            openWalletModal={() => setIsWalletModalOpen(true)}
            setCurrentView={setCurrentView}
          />
        )}
      </main>

      {/* Web3 Wallet Connection Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallet={wallet}
        setWallet={handleSetWallet}
      />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-glass)',
        padding: '1.5rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        background: 'rgba(5, 7, 12, 0.95)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="Orion" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
            <span><strong>Orion</strong> • Autonomous Capital Sentinel on Base</span>
          </div>
          <div>
            <a
              href="https://github.com/OpeyemiMoses/Orion"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}
            >
              GitHub Repository
            </a>
            {' • '}
            <span>Built by <a href="https://github.com/OpeyemiMoses" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>OpeyemiMoses</a></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
