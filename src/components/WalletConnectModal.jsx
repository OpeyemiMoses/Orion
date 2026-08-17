import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Loader, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { connectWeb3Wallet, getDemoWallet } from '../services/web3Wallet';
import { getDiscoveredWallets } from '../services/walletProviders';

// ── Official Wallet SVG Icons ────────────────────────────────────────────────
function MetaMaskIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M29.56 2.44L17.7 11.23l2.2 5.25 7.4-2.15 2.26-11.89z" fill="#E2761B"/>
      <path d="M2.44 2.44l11.75 8.87-2.1 5.17-7.4-2.15L2.44 2.44z" fill="#E4761B"/>
      <path d="M25.04 22.84l-2.14 3.28 5.76 1.58 1.66-5.63-5.28.77z" fill="#E4761B"/>
      <path d="M6.96 22.84l2.14 3.28-5.76 1.58L1.68 22.07l5.28.77z" fill="#E4761B"/>
      <path d="M9.19 14.28L7.33 19.8l5.26-.74-.2-5.73-3.2.95z" fill="#E4761B"/>
      <path d="M22.81 14.28l1.86 5.52-5.26-.74.2-5.73 3.2.95z" fill="#E4761B"/>
      <path d="M9.1 26.12l3.47-1.69-2.98-2.32-.49 4.01z" fill="#D7C1B3"/>
      <path d="M22.9 26.12l-3.47-1.69 2.98-2.32.49 4.01z" fill="#D7C1B3"/>
      <path d="M12.4 13.33l-.2 5.73 3.8 3.84 3.8-3.84-.2-5.73-3.6 1.1-3.6-1.1z" fill="#233447"/>
      <path d="M16 2.44L4.85 10.74l3.48 2.65 7.67-2.34 7.67 2.34 3.48-2.65L16 2.44z" fill="#E4751F"/>
    </svg>
  );
}

function OKXWalletIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#000000"/>
      <rect x="7" y="7" width="6" height="6" fill="#FFFFFF"/>
      <rect x="19" y="7" width="6" height="6" fill="#FFFFFF"/>
      <rect x="13" y="13" width="6" height="6" fill="#FFFFFF"/>
      <rect x="7" y="19" width="6" height="6" fill="#FFFFFF"/>
      <rect x="19" y="19" width="6" height="6" fill="#FFFFFF"/>
    </svg>
  );
}

function CoinbaseWalletIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#0052FF"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6zm-3.5 7h7a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 0111 17.5v-3a1.5 1.5 0 011.5-1.5z" fill="#FFFFFF"/>
    </svg>
  );
}

function RainbowWalletIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#0E0E10"/>
      <path d="M6 23C6 14.716 12.716 8 21 8" stroke="#FF4040" strokeWidth="3" strokeLinecap="round"/>
      <path d="M6 23C6 16.373 11.373 11 18 11" stroke="#FF8A00" strokeWidth="3" strokeLinecap="round"/>
      <path d="M6 23C6 18.03 10.03 14 15 14" stroke="#FFD600" strokeWidth="3" strokeLinecap="round"/>
      <path d="M6 23C6 19.686 8.686 17 12 17" stroke="#00E599" strokeWidth="3" strokeLinecap="round"/>
      <path d="M6 23C6 21.343 7.343 20 9 20" stroke="#0080FF" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function RabbyWalletIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#8C91FF"/>
      <path d="M10 24c0-4.418 3.582-8 8-8h2v8H10z" fill="#FFFFFF"/>
      <circle cx="21" cy="11" r="3" fill="#FFFFFF"/>
      <path d="M12 12a3 3 0 013-3h1v6h-4v-3z" fill="#FFFFFF"/>
    </svg>
  );
}

export default function WalletConnectModal({ isOpen, onClose, wallet, setWallet }) {
  const [connecting, setConnecting] = useState(false);
  const [connectingName, setConnectingName] = useState('');
  const [connectingDemo, setConnectingDemo] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [detectedWallets, setDetectedWallets] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const discovered = getDiscoveredWallets();
      setDetectedWallets(discovered);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isInstalled = (name) => {
    return detectedWallets.some(w => w.info?.name?.toLowerCase().includes(name.toLowerCase()));
  };

  const handleConnect = async (walletOption) => {
    setConnecting(true);
    setConnectingName(walletOption.name);
    setErrorMsg(null);

    try {
      const w = await connectWeb3Wallet(walletOption.name);
      setWallet(w);
      setConnecting(false);
      setConnectingName('');
      onClose();
    } catch (err) {
      console.error(err);
      const isMissing = err.message?.includes('not installed') || err.message?.includes('not found');
      setErrorMsg(
        isMissing
          ? { text: `${walletOption.name} is not installed in your browser.`, link: walletOption.downloadUrl, label: `Download ${walletOption.name}` }
          : { text: err.message || 'Connection was rejected or failed.' }
      );
      setConnecting(false);
      setConnectingName('');
    }
  };

  const handleConnectDemo = () => {
    setConnectingDemo(true);
    setErrorMsg(null);
    setTimeout(() => {
      setWallet(getDemoWallet());
      setConnectingDemo(false);
      onClose();
    }, 400);
  };

  const handleDisconnect = () => {
    setWallet(null);
    setErrorMsg(null);
    onClose();
  };

  const walletOptions = [
    { name: 'MetaMask', icon: <MetaMaskIcon size={26} />, desc: 'MetaMask Extension', downloadUrl: 'https://metamask.io/download/' },
    { name: 'OKX Wallet', icon: <OKXWalletIcon size={26} />, desc: 'OKX Web3 Wallet', downloadUrl: 'https://www.okx.com/web3' },
    { name: 'Coinbase Wallet', icon: <CoinbaseWalletIcon size={26} />, desc: 'Coinbase Base Wallet', downloadUrl: 'https://www.coinbase.com/wallet/downloads' },
    { name: 'Rainbow', icon: <RainbowWalletIcon size={26} />, desc: 'Rainbow Ethereum Wallet', downloadUrl: 'https://rainbow.me/' },
    { name: 'Rabby Wallet', icon: <RabbyWalletIcon size={26} />, desc: 'Rabby Extension', downloadUrl: 'https://rabby.io/' },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.35)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="card" style={{
        maxWidth: '430px',
        width: '100%',
        padding: '0',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)'
        }}>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>
            {wallet ? 'Connected Wallet' : 'Connect Web3 Wallet'}
          </span>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '4px', borderRadius: '6px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {wallet ? (
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
              OrionX is active on Base Mainnet.
            </p>

            <div style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <span>Address</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{wallet.walletName || 'Web3 Wallet'}</span>
              </div>
              <div className="addr" style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-main)', wordBreak: 'break-all' }}>
                {wallet.address}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {wallet.ethBalance} <span style={{ color: 'var(--text-dim)' }}>ETH</span>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  ${wallet.usdcBalance} <span style={{ color: 'var(--text-dim)' }}>USDC</span>
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  marginLeft: 'auto', color: '#15803d', fontSize: '11px', fontWeight: 500
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                  {wallet.isLiveWeb3 ? 'Live Base' : 'Demo Mode'}
                </span>
              </div>
            </div>

            <button onClick={handleDisconnect} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', color: 'var(--accent-red)', borderColor: 'rgba(220,38,38,0.3)' }}>
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div>
            <div style={{ padding: '14px 20px 6px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Select your wallet extension below. Each wallet will open its own native interface.
              </p>
            </div>

            {errorMsg && (
              <div style={{ margin: '0 20px 10px', padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', fontSize: '12px', color: '#b91c1c', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                  <span>{errorMsg.text || errorMsg}</span>
                </div>
                {errorMsg.link && (
                  <a
                    href={errorMsg.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#dc2626', fontWeight: 600, textDecoration: 'underline', marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>{errorMsg.label || 'Download wallet'}</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            )}

            {/* Wallet List */}
            <div style={{ padding: '4px 0 8px' }}>
              {walletOptions.map((opt) => {
                const installed = isInstalled(opt.name);
                const isThisConnecting = connecting && connectingName === opt.name;

                return (
                  <button
                    key={opt.name}
                    onClick={() => handleConnect(opt)}
                    disabled={connecting || connectingDemo}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      width: '100%',
                      padding: '12px 20px',
                      background: 'none',
                      border: 'none',
                      cursor: connecting ? 'wait' : 'pointer',
                      fontSize: '14px',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      color: 'var(--text-main)',
                      transition: 'background 0.15s',
                      textAlign: 'left',
                      opacity: (connecting || connectingDemo) && !isThisConnecting ? 0.5 : 1,
                    }}
                    onMouseEnter={e => !connecting && (e.currentTarget.style.background = 'var(--bg)')}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {opt.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600 }}>{opt.name}</span>
                        {installed && (
                          <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', fontWeight: 600 }}>
                            INSTALLED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>{opt.desc}</div>
                    </div>
                    {isThisConnecting && (
                      <RefreshCw size={14} className="spin" style={{ color: 'var(--text-dim)' }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Demo wallet option */}
            <div style={{ borderTop: '1px solid var(--border)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Explore in Demo Mode</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Instant inspection with sample portfolio</div>
              </div>
              <button
                onClick={handleConnectDemo}
                disabled={connecting || connectingDemo}
                className="btn btn-outline"
                style={{ fontSize: '11px', padding: '5px 12px' }}
              >
                {connectingDemo ? <Loader size={12} className="spin" /> : 'Load Demo'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
