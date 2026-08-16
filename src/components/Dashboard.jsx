import React, { useState } from 'react';
import { Shield, ShieldAlert, TrendingUp, Gift, ScanSearch, Settings as SettingsIcon, Menu, X } from 'lucide-react';
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

export default function Dashboard({ wallet, openWalletModal }) {
  const [tab, setTab] = useState('liquidation');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSelectTab = (id) => {
    setTab(id);
    setMobileSidebarOpen(false);
  };

  const currentNav = NAV.find(n => n.id === tab) || (tab === 'settings' ? { label: 'Settings', icon: SettingsIcon } : null);
  const CurrentIcon = currentNav?.icon || Shield;

  return (
    <div className="app-layout">
      {/* ── Mobile Top Bar (Only visible on small screens) ── */}
      <div className="mobile-sidebar-toggle-bar">
        <button
          onClick={() => setMobileSidebarOpen(prev => !prev)}
          className="btn btn-outline"
          style={{ padding: '6px 10px', fontSize: '13px', gap: '6px' }}
        >
          <Menu size={16} />
          <span>Modules</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
          <CurrentIcon size={15} style={{ color: 'var(--text-muted)' }} />
          <span>{currentNav?.label || 'Dashboard'}</span>
        </div>
      </div>

      {/* ── Mobile Sidebar Backdrop ───────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (Desktop static + Mobile slide drawer) ── */}
      <aside className={`sidebar ${mobileSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-mobile-header">
          <span style={{ fontWeight: 700, fontSize: '13px' }}>Navigation</span>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="btn btn-ghost"
            style={{ padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="sidebar-section-label">Agent Modules</div>
        {NAV.filter(n => n.group === 'agent').map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => handleSelectTab(id)} className={`sidebar-link ${tab === id ? 'active' : ''}`}>
            <Icon size={14} />{label}
          </button>
        ))}

        <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '4px' }}>
          <div className="sidebar-section-label">Tools</div>
          {NAV.filter(n => n.group === 'tools').map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => handleSelectTab(id)} className={`sidebar-link ${tab === id ? 'active' : ''}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '4px' }}>
          <div className="sidebar-section-label">System</div>
          <button onClick={() => handleSelectTab('settings')} className={`sidebar-link ${tab === 'settings' ? 'active' : ''}`}>
            <SettingsIcon size={14} />Settings
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────── */}
      <main className="main-content">
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
