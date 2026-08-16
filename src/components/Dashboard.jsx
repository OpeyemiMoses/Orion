import React, { useState } from 'react';
import { Shield, ShieldAlert, TrendingUp, Gift, ScanSearch, Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import PortfolioShield  from './PortfolioShield';
import LiquidationShield from './LiquidationShield';
import YieldOptimizer   from './YieldOptimizer';
import IncentiveTracker from './IncentiveTracker';
import ProtocolAuditor  from './ProtocolAuditor';
import Settings         from './Settings';

const NAV = [
  { id: 'shield',      label: 'Approval Shield',    icon: Shield,       group: 'agent' },
  { id: 'liquidation', label: 'Liquidation Shield',  icon: ShieldAlert,  group: 'agent' },
  { id: 'yield',       label: 'Yield Optimizer',     icon: TrendingUp,   group: 'agent' },
  { id: 'incentive',   label: 'Incentive Tracker',   icon: Gift,         group: 'agent' },
  { id: 'protocol',    label: 'Protocol Auditor',    icon: ScanSearch,   group: 'tools' },
];

export default function Dashboard({ wallet, openWalletModal, setCurrentView }) {
  const [tab, setTab] = useState('liquidation');
  const [history, setHistory] = useState(['liquidation']);

  const handleNavigate = (newTab) => {
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
  const prevNavId = history.length > 1 ? history[history.length - 2] : null;
  const prevNav = prevNavId ? (NAV.find(n => n.id === prevNavId) || (prevNavId === 'settings' ? { label: 'Settings' } : null)) : null;

  return (
    <div className="app-layout">
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="sidebar">
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
          <div className="sidebar-section-label">System</div>
          <button onClick={() => handleNavigate('settings')} className={`sidebar-link ${tab === 'settings' ? 'active' : ''}`}>
            <SettingsIcon size={14} />Settings
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────── */}
      <main className="main-content">
        {/* Navigation Breadcrumb Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
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

        {tab === 'shield'      && <PortfolioShield   wallet={wallet} openWalletModal={openWalletModal} />}
        {tab === 'liquidation' && <LiquidationShield wallet={wallet} openWalletModal={openWalletModal} />}
        {tab === 'yield'       && <YieldOptimizer    wallet={wallet} openWalletModal={openWalletModal} />}
        {tab === 'incentive'   && <IncentiveTracker  wallet={wallet} openWalletModal={openWalletModal} />}
        {tab === 'protocol'    && <ProtocolAuditor />}
        {tab === 'settings'    && <Settings />}
      </main>
    </div>
  );
}
