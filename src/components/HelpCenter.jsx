import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Send, 
  ScanSearch, 
  TrendingUp, 
  Gift, 
  ArrowRight, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  LifeBuoy, 
  MessageSquare, 
  Terminal, 
  Sparkles,
  BookOpen
} from 'lucide-react';

const QUICK_GUIDES = [
  {
    id: 'guide-revoke',
    title: 'How to Revoke Risky Spender Allowances',
    icon: ShieldCheck,
    tag: 'Security Guide',
    steps: [
      'Navigate to the **Approval Shield** tab in the OrionX Console.',
      'Review your active allowances sorted by risk score (Critical, High, Medium, Low).',
      'Click the **Revoke** button on any unverified or high-risk spender.',
      'Confirm the standard `approve(spender, 0)` transaction in your Web3 wallet (e.g. MetaMask / Coinbase Wallet).',
      'Verify the transaction hash directly on **BaseScan** to confirm zero remaining allowance.'
    ]
  },
  {
    id: 'guide-bot',
    title: 'How to Set Up 24/7 Telegram Sentinel Alerts',
    icon: Send,
    tag: 'Automation Guide',
    steps: [
      'Open Telegram and start a chat with **@OrionXSentinelBot**.',
      'Send `/start` to view the command dashboard and receive your Telegram Chat ID.',
      'Send `/bind 0xYourBaseWalletAddress` to link your active wallet.',
      'Send `/settings` to customize which alerts you receive (Liquidation, Yield Spikes, Incentives, Security).',
      'The background daemon will now evaluate your on-chain solvency every 60 seconds.'
    ]
  },
  {
    id: 'guide-audit',
    title: 'How to Audit Base Smart Contracts & Tokens',
    icon: ScanSearch,
    tag: 'Audit Guide',
    steps: [
      'Go to the **Protocol & Token Auditor** in the Shield Console.',
      'Paste any 42-character Base contract or token address starting with `0x`.',
      'Click **Audit Contract** to trigger multi-RPC bytecode checks and BaseScan V2 source queries.',
      'Review the **Safety Score (0–100)** and the **6-Pillar Deep AI Reasoning Report**.',
      'Check the **Exploit Vector Assessment** and **Critical "What to Watch"** signals before depositing or approving funds.'
    ]
  },
  {
    id: 'guide-liquidation',
    title: 'How to Monitor & Protect Lending Collateral',
    icon: TrendingUp,
    tag: 'DeFi Guide',
    steps: [
      'Open the **Liquidation Shield** to see your aggregate solvency across Moonwell, Compound III, Aave V3, and Seamless.',
      'Keep your **Aggregate Health Factor above 1.50** to maintain a healthy drawdown safety buffer.',
      'If market volatility causes your Health Factor to drop below 1.50, you will receive an instant push notification on Telegram.',
      'Use the recommended protective repay action to restore your collateral buffer above 2.0.'
    ]
  }
];

const FAQS = [
  {
    category: 'General & Security',
    items: [
      {
        q: 'Is OrionX non-custodial? Can OrionX access my funds?',
        a: 'Yes, OrionX is 100% non-custodial. OrionX never requests, stores, or handles private keys or seed phrases. All actions (such as revoking an allowance or repaying debt) require an explicit signature prompt directly inside your connected Web3 wallet.'
      },
      {
        q: 'Which blockchain networks does OrionX support?',
        a: 'OrionX is purpose-built and optimized exclusively for **Base Mainnet (Chain ID 8453)**. All smart contract calls, RPC queries, token interfaces, and DeFi protocol feeds interact natively with Base.'
      },
      {
        q: 'Are the data and actions in OrionX mocked?',
        a: 'No. Every metric is read live from Base RPC nodes, BaseScan V2 APIs, and DeFi Llama. All revoke buttons trigger real `approve(spender, 0)` transactions on Base Mainnet.'
      }
    ]
  },
  {
    category: 'Telegram Sentinel & Alerts',
    items: [
      {
        q: 'How does the 24/7 background sentinel daemon work?',
        a: 'When you bind your wallet via `/bind <0xAddress>`, the OrionX backend daemon schedules automated evaluation cycles every 60 seconds. It reads your on-chain lending positions, monitors Health Factors, and scans for high-yield reallocations, pushing instant Telegram alerts if thresholds are breached.'
      },
      {
        q: 'How do I toggle specific push notifications on or off?',
        a: 'You can toggle alerts in two ways:\n1. Inside Telegram: Send `/settings` and tap any of the interactive toggle buttons (`[🟢 Liquidation]`, `[🟢 Yields]`, etc.).\n2. In the Web App: Go to the **Telegram Sentinel** tab and toggle the switches in the Push Notification Preferences card.'
      },
      {
        q: 'Why did I not receive a test alert?',
        a: 'Ensure you have sent `/start` to **@OrionXSentinelBot** in Telegram first so the bot has permission to message your account, and verify that your wallet address is bound.'
      }
    ]
  },
  {
    category: 'Protocol & Token Audits',
    items: [
      {
        q: 'Can I audit meme coins, community tokens, or new Base tokens?',
        a: 'Yes! The Protocol & Token Auditor probes ERC-20 interface methods (`name()`, `symbol()`, `decimals()`, `owner()`, `totalSupply()`) and checks for EIP-1967 proxy storage slots and BaseScan verification across any contract deployed on Base.'
      },
      {
        q: 'Why does the auditor say "Not a Base Contract / Personal Wallet"?',
        a: 'OrionX enforces strict network verification. If an address has no deployed bytecode on Base Mainnet (such as an individual user wallet EOA, or a contract deployed only on Ethereum L1 or Solana), OrionX halts the scan and displays a clear notice to prevent misleading security scores.'
      },
      {
        q: 'What is an Upgradeable Proxy (EIP-1967) and why does it carry higher risk?',
        a: 'Upgradeable proxy contracts allow contract owners or admin multisigs to swap out the underlying bytecode implementation. While common for protocol upgrades, it means the rules of the contract can change, which is reflected as a medium-risk flag in the audit report.'
      }
    ]
  }
];

export default function HelpCenter({ setCurrentView }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState({});
  const [selectedGuide, setSelectedGuide] = useState(null);

  const toggleFaq = (catIndex, itemIndex) => {
    const key = `${catIndex}-${itemIndex}`;
    setOpenFaqIndex(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQS;
    const q = searchQuery.toLowerCase();
    return FAQS.map(cat => ({
      ...cat,
      items: cat.items.filter(it => 
        it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q)
      )
    })).filter(cat => cat.items.length > 0);
  }, [searchQuery]);

  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return QUICK_GUIDES;
    const q = searchQuery.toLowerCase();
    return QUICK_GUIDES.filter(g => 
      g.title.toLowerCase().includes(q) || g.tag.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '36px 24px clamp(48px, 8vw, 80px)' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 40px auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '20px', marginBottom: '14px' }}>
          <LifeBuoy size={14} style={{ color: 'var(--accent-green)' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-main)' }}>Help Centre & Support</span>
        </div>
        <h1 className="page-title" style={{ fontSize: '32px', marginBottom: '10px' }}>How can we help you today?</h1>
        <p className="page-subtitle" style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
          Step-by-step walkthroughs, interactive guides, FAQs, and security best practices for OrionX on Base.
        </p>

        {/* Global Help Search Box */}
        <div style={{ position: 'relative', maxWidth: '540px', margin: '24px auto 0 auto' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            className="input"
            type="text"
            placeholder="Search guides, FAQs, errors, commands…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', height: '46px', fontSize: '14px', borderRadius: '8px' }}
          />
        </div>
      </div>

      {/* ── Section 1: Step-by-Step Quick Guides ────────────────── */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Step-by-Step Interactive Guides</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Learn how to utilize OrionX sentinel modules effectively.</p>
          </div>
          <button onClick={() => setCurrentView('docs')} className="btn btn-ghost" style={{ fontSize: '12px', gap: '4px' }}>
            Full Documentation <ArrowRight size={12} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {filteredGuides.map(guide => {
            const Icon = guide.icon;
            return (
              <div 
                key={guide.id}
                className="card"
                onClick={() => setSelectedGuide(guide)}
                style={{ 
                  padding: '20px', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s ease',
                  border: selectedGuide?.id === guide.id ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                  background: selectedGuide?.id === guide.id ? 'var(--bg-secondary)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} style={{ color: 'var(--text-main)' }} />
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{guide.tag}</span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', lineHeight: 1.4 }}>{guide.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View {guide.steps.length} steps <ChevronDown size={12} />
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected Guide Details Drawer/Modal */}
        {selectedGuide && (
          <div className="card" style={{ padding: '24px', marginTop: '20px', border: '1px solid var(--accent-blue)', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <selectedGuide.icon size={20} style={{ color: 'var(--accent-blue)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{selectedGuide.title}</h3>
              </div>
              <button onClick={() => setSelectedGuide(null)} className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 8px' }}>
                Close guide ✕
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedGuide.steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--text-main)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    <span dangerouslySetInnerHTML={{ __html: step.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Section 2: Categorized Frequently Asked Questions ────── */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>Frequently Asked Questions</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Find answers to common questions regarding security, daemon telemetry, and audits.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {filteredFaqs.map((category, catIdx) => (
            <div key={category.category}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', marginBottom: '12px' }}>
                {category.category}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {category.items.map((faq, itemIdx) => {
                  const isOpen = openFaqIndex[`${catIdx}-${itemIdx}`];
                  return (
                    <div 
                      key={itemIdx}
                      className="card"
                      style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)' }}
                    >
                      <button
                        onClick={() => toggleFaq(catIdx, itemIdx)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px 20px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '14px',
                          color: 'var(--text-main)'
                        }}
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />}
                      </button>
                      {isOpen && (
                        <div style={{ padding: '0 20px 18px 20px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, borderTop: '1px solid var(--border)', paddingTop: '14px', background: 'var(--bg-secondary)' }}>
                          <span dangerouslySetInnerHTML={{ __html: faq.a.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Community & Direct Support Banner ─────────── */}
      <section className="card responsive-two-col" style={{ padding: '32px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '13px' }}>
            <MessageSquare size={16} /> Need Additional Assistance?
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px 0' }}>Connect with the OrionX Team & Community</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, maxWidth: '520px' }}>
            Have feedback, found a bug, or need help integrating your protocol? Visit our open-source GitHub repository or chat with the sentinel bot on Telegram.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a 
            href="https://t.me/OrionXSentinelBot" 
            target="_blank" 
            rel="noreferrer" 
            className="btn btn-dark" 
            style={{ fontSize: '13px', gap: '6px' }}
          >
            <Send size={13} /> Telegram Bot
          </a>
          <a 
            href="https://github.com/OpeyemiMoses/Orion/issues" 
            target="_blank" 
            rel="noreferrer" 
            className="btn btn-outline" 
            style={{ fontSize: '13px', gap: '6px' }}
          >
            <ExternalLink size={13} /> GitHub Issues
          </a>
        </div>
      </section>
    </div>
  );
}
