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

export default function Dashboard({ wallet, openWalletModal, setCurrentView, activeTab, setActiveTab }) {
  const tab = activeTab || 'liquidation';
  const [history, setHistory] = useState([tab]);

  const handleNavigate = (newTab) => {
    if (setActiveTab) setActiveTab(newTab);
    if (newTab === tab) return;
    setHistory(prev => [...prev, newTab]);
  };

  const handleBack = () => {
    if (history.length > 1) {
      const nextHistory = [...history];
      nextHistory.pop(); // remove current
      const prevTab = nextHistory[nextHistory.length - 1];
      setHistory(nextHistory);
      if (setActiveTab) setActiveTab(prevTab);
    } else {
      if (setCurrentView) setCurrentView('landing');
    }
  };

  const currentNav = NAV.find(n => n.id === tab) || (tab === 'settings' ? { label: 'Settings', icon: SettingsIcon } : null);
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

