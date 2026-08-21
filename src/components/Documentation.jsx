import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Shield, 
  ShieldAlert, 
  TrendingUp, 
  Gift, 
  ScanSearch, 
  Send, 
  Cpu, 
  Lock, 
  Code, 
  Terminal, 
  Search, 
  Copy, 
  Check, 
  ChevronRight, 
  ExternalLink, 
  Layers, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ArrowRight,
  Database,
  Globe
} from 'lucide-react';

const DOC_SECTIONS = [
  {
    id: 'intro',
    title: 'Introduction & Overview',
    icon: BookOpen,
    category: 'Getting Started',
    content: (
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Introduction to OrionX</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
          <strong>OrionX</strong> is an autonomous, non-custodial Sentinel Agent engineered specifically for the <strong>Base Mainnet (Chain ID 8453)</strong> ecosystem. OrionX provides continuous capital protection, dynamic risk mitigation, real-time yield discovery, and deep smart contract security intelligence without ever requiring custody of your private keys.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-blue)', fontWeight: 600 }}>
              <Shield size={16} /> Non-Custodial Safety
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Zero private key exposure. All revocations and protective transactions execute through your own connected Web3 wallet.
            </p>
          </div>
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-green)', fontWeight: 600 }}>
              <Zap size={16} /> 24/7 Always-On Daemon
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Continuous background telemetry evaluating money market health factors, yield spikes, and contract changes every 60 seconds.
            </p>
          </div>
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-purple)', fontWeight: 600 }}>
              <Cpu size={16} /> Deep AI Reasoning
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Multi-dimensional analysis synthesizing bytecode size, proxy implementations, and tokenomics into clear actionable reports.
            </p>
          </div>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>The Problem OrionX Solves</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
          DeFi on Base is ultra-fast and low-cost, but active capital is exposed to three silent threats:
        </p>
        <ul style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '20px', marginBottom: '24px' }}>
          <li><strong>Dormant Approvals:</strong> Infinite token allowances left active after interacting with DEXs, NFT mints, or yield vaults.</li>
          <li><strong>Sudden Liquidations:</strong> Sudden volatility reducing collateral value across money markets while users are offline.</li>
          <li><strong>Information Asymmetry:</strong> Opaque smart contracts and missed incentive reward campaigns across disparate protocols.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'architecture',
    title: 'System Architecture',
    icon: Layers,
    category: 'Core System',
    content: (
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Dual-Engine Architecture</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
          OrionX operates on a coordinated dual-engine model combining a client-side Web3 Command Console with a high-throughput autonomous backend daemon.
        </p>

        <div className="card" style={{ padding: '24px', marginBottom: '24px', background: 'var(--bg-secondary)' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', marginBottom: '16px' }}>
            Data Flow & Telemetry Pipeline
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            <div style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <strong>1. Base RPC Nodes:</strong> Multi-endpoint quorum querying eth_getCode, eth_call, getAccountSnapshot, Comet borrow balances.
            </div>
            <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>↓</div>
            <div style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <strong>2. Sentinel Daemon:</strong> 60s autonomous loop evaluating bound wallet solvency, token approvals & TVL trajectory.
            </div>
            <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>↓</div>
            <div style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <strong>3. Notification & Execution:</strong> Instant Telegram Push Alerts + 1-Tap Web3 On-Chain Revocations and Repays.
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>Supported Base Protocols</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '14px' }}>
          OrionX natively reads and monitors contracts on Base Mainnet (Chain ID 8453):
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          {['Moonwell Lending', 'Compound III (Comet)', 'Aave V3 Base', 'Seamless Protocol', 'Aerodrome Finance', 'Extra Finance', 'Beefy Base Vaults', 'Morpho Blue'].map(proto => (
            <div key={proto} style={{ padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }}>
              ✓ {proto}
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'approval-shield',
    title: 'Approval & Portfolio Shield',
    icon: Shield,
    category: 'Autonomous Engines',
    content: (
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Approval & Portfolio Shield</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
          The Approval Shield continuously monitors your wallet's historical ERC-20 approval logs on Base. It calculates an exposure risk score based on allowance limits, spender verification, and dormant contract inactivity.
        </p>

        <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px' }}>How Revocation Works On-Chain</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
          When you click <strong>Revoke</strong> in the OrionX interface, it triggers a direct Web3 transaction to the token contract executing:
        </p>
        
        <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '20px' }}>
          <code>IERC20(tokenAddress).approve(spenderAddress, 0);</code>
        </div>

        <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px' }}>Allowance Risk Classification</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '24px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Risk Level</th>
              <th style={{ padding: '8px' }}>Criteria</th>
              <th style={{ padding: '8px' }}>Recommended Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '10px 8px' }}><span className="badge badge-danger">CRITICAL</span></td>
              <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>Unlimited allowance on unverified contract or known exploit vector</td>
              <td style={{ padding: '10px 8px' }}>Immediate revocation required</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '10px 8px' }}><span className="badge badge-warn">HIGH</span></td>
              <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>Unlimited allowance on upgradeable proxy contract</td>
              <td style={{ padding: '10px 8px' }}>Revoke or reduce to exact transaction amount</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '10px 8px' }}><span className="badge badge-settled">LOW</span></td>
              <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>Exact balance allowance on verified immutable protocol</td>
              <td style={{ padding: '10px 8px' }}>Safe to maintain active interaction</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  },
  {
    id: 'liquidation-shield',
    title: 'Liquidation Shield',
    icon: ShieldAlert,
    category: 'Autonomous Engines',
    content: (
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Liquidation Shield Engine</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
          The Liquidation Shield aggregates multi-market borrow positions across Base lending protocols into a single, real-time solvency metric.
        </p>

        <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px' }}>Aggregate Health Factor Formula</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
          OrionX computes weighted collateral liquidation thresholds against total outstanding borrow obligations:
        </p>

        <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '20px' }}>
          <div>Health Factor = (Σ [Collateral_i × LiquidationThreshold_i]) / TotalDebtUSD</div>
        </div>

        <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px' }}>Solvency Thresholds</h3>
        <ul style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '20px', marginBottom: '24px' }}>
          <li><strong>HF &gt; 2.0 (SAFE):</strong> Ample collateral buffer. Drawdown tolerance &gt; 50%.</li>
          <li><strong>1.5 ≤ HF ≤ 2.0 (MODERATE):</strong> Standard buffer. Monitor market volatility.</li>
          <li><strong>1.1 ≤ HF &lt; 1.5 (WARNING):</strong> Sentinel Daemon triggers priority Telegram push notifications.</li>
          <li><strong>HF &lt; 1.1 (CRITICAL):</strong> Imminent liquidation hazard. Immediate protective repay advised.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'protocol-auditor',
    title: 'Protocol & Token Auditor',
    icon: ScanSearch,
    category: 'Autonomous Engines',
    content: (
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Protocol & Token Security Auditor</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
          The Auditor inspects any smart contract or token address deployed on Base Mainnet. It probes bytecode, ERC-20 token interfaces, EIP-1967 proxy storage slots, and BaseScan V2 source verification.
        </p>

        <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px' }}>The 6-Pillar Deep AI Reasoning Framework</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '6px' }}>1. Architecture & Verification</strong>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Bytecode size, proxy implementation address, compiler optimization & license classification.
            </p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '6px' }}>2. Health & Solvency</strong>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              TVL trajectory from DeFi Llama, bad debt exposure, pool utilization and collateral coverage.
            </p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '6px' }}>3. Price & Liquidity Depth</strong>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              2% depth on Aerodrome & Uniswap V3 Base, slippage model for $100k swaps, oracle source verification.
            </p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '6px' }}>4. Market Sentiment & Velocity</strong>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Volume/TVL velocity ratio, institutional vs retail participation, whale dispersion index.
            </p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '6px' }}>5. Exploit Vector Assessment</strong>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Evaluates flash-loan risk, reentrancy guards, admin key centralization, and mintability risks.
            </p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '6px' }}>6. Actionable "What to Watch"</strong>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Concrete monitoring signals (e.g. timelock queues, whale inflows, oracle heartbeat thresholds).
            </p>
          </div>
        </div>

        <div style={{ padding: '14px 18px', background: 'rgba(220, 38, 38, 0.04)', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '8px', marginBottom: '20px' }}>
          <strong style={{ color: 'var(--accent-red)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <AlertTriangle size={15} /> Non-Base Contract Strict Validation
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Addresses that have no deployed bytecode on Base Mainnet (such as personal wallets or contracts deployed only on Ethereum L1) are strictly rejected with an explicit notice.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'telegram-sentinel',
    title: 'Telegram Sentinel Bot',
    icon: Send,
    category: 'Automation & Alerts',
    content: (
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Always-On Telegram Sentinel</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
          The OrionX Telegram Sentinel (<strong>@OrionXSentinelBot</strong>) provides continuous 24/7 telemetry monitoring directly to your mobile device or desktop.
        </p>

        <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '12px' }}>Command Reference</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {[
            { cmd: '/start', desc: 'Initialize Sentinel session and display the interactive navigation menu.' },
            { cmd: '/bind <0xAddress>', desc: 'Bind your Base wallet address for autonomous 24/7 background monitoring.' },
            { cmd: '/status', desc: 'Query live on-chain balances, active lending collateral/debt, and Health Factor.' },
            { cmd: '/yields', desc: 'Retrieve real-time ranked Base pool yields from DeFi Llama (> $100k TVL).' },
            { cmd: '/incentives', desc: 'Audit wallet eligibility for Base ecosystem reward programs (tx counts, veAERO, etc.).' },
            { cmd: '/audit <0xAddress>', desc: 'Generate a full deep AI security audit report for any Base smart contract or token.' },
            { cmd: '/settings', desc: 'Open interactive inline push notification toggles for instant preference updates.' },
          ].map(c => (
            <div key={c.cmd} style={{ padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontWeight: 600, fontSize: '13px' }}>{c.cmd}</code>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>{c.desc}</p>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px' }}>Autonomous Push Alert Triggers</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '14px' }}>
          The backend daemon evaluates subscribed wallets every 60 seconds and pushes instant notifications for:
        </p>
        <ul style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '20px', marginBottom: '20px' }}>
          <li><strong>Liquidation Warnings:</strong> Sent when Health Factor drops below configured safety thresholds (default: 1.50).</li>
          <li><strong>Yield Spikes:</strong> Sent when verified Base pools offer &gt; 3% net gain over current allocation.</li>
          <li><strong>Security Warnings:</strong> Sent when an approved protocol changes its proxy implementation address.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'api-reference',
    title: 'REST API Reference',
    icon: Terminal,
    category: 'Developers',
    content: (
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>REST API Reference</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
          OrionX exposes secure REST endpoints for protocol auditing, telemetry status, and subscription management.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
          {/* Endpoint 1 */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span className="badge badge-settled" style={{ fontWeight: 700, fontSize: '11px' }}>POST</span>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>/api/ai/audit-full</code>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
              Executes full on-chain bytecode probing, BaseScan V2 verification check, and Deep AI reasoning synthesis.
            </p>
            <div style={{ padding: '10px 12px', background: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
              {`// Request Body\n{\n  "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"\n}`}
            </div>
          </div>

          {/* Endpoint 2 */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span className="badge badge-neutral" style={{ fontWeight: 700, fontSize: '11px' }}>GET</span>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>/api/telegram/status</code>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
              Returns current status of the 24/7 background telemetry daemon, active subscriber count, and last scan timestamp.
            </p>
          </div>

          {/* Endpoint 3 */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span className="badge badge-settled" style={{ fontWeight: 700, fontSize: '11px' }}>POST</span>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>/api/telegram/preferences</code>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
              Updates push notification preferences by Telegram chatId or walletAddress.
            </p>
            <div style={{ padding: '10px 12px', background: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
              {`// Request Body\n{\n  "walletAddress": "0xb4825a...9a6c09",\n  "preferences": {\n    "liquidationAlerts": true,\n    "yieldAlerts": true,\n    "incentiveAlerts": true,\n    "securityAlerts": true\n  }\n}`}
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'security-model',
    title: 'Security & Non-Custodial Model',
    icon: Lock,
    category: 'Security',
    content: (
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Security & Non-Custodial Model</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
          OrionX is built on foundational non-custodial principles to ensure that users maintain complete sovereignty over their capital at all times.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} /> Zero Private Key Exposure
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              OrionX never asks for, stores, or transmits private keys, seed phrases, or wallet signing credentials. Read requests use standard JSON-RPC queries.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} /> Explicit User Signatures
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              Any state-changing action (such as revoking an allowance or executing a protective repay) requires an explicit EIP-1193 transaction prompt signed directly inside your Web3 wallet provider.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} /> Multi-Endpoint RPC Quorum
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              Data integrity is protected against single-node manipulation through automated multi-RPC fallback across official Base nodes, 1RPC, and Base Public Node endpoints.
            </p>
          </div>
        </div>
      </div>
    )
  }
];

export default function Documentation({ setCurrentView }) {
  const [activeSectionId, setActiveSectionId] = useState('intro');
  const [searchQuery, setSearchQuery] = useState('');

  const activeSection = useMemo(() => {
    return DOC_SECTIONS.find(s => s.id === activeSectionId) || DOC_SECTIONS[0];
  }, [activeSectionId]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return DOC_SECTIONS;
    const q = searchQuery.toLowerCase();
    return DOC_SECTIONS.filter(s => 
      s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const categories = useMemo(() => {
    const cats = {};
    DOC_SECTIONS.forEach(s => {
      if (!cats[s.category]) cats[s.category] = [];
      cats[s.category].push(s);
    });
    return cats;
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px clamp(48px, 8vw, 80px)' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '36px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--accent-blue)' }}>
            <BookOpen size={16} />
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Official Documentation</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '28px', marginBottom: '6px' }}>OrionX Technical Documentation</h1>
          <p className="page-subtitle" style={{ fontSize: '14px' }}>
            Complete architectural guides, protocol specifications, API reference, and autonomous daemon configuration for Base Mainnet.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setCurrentView('help')} className="btn btn-outline" style={{ fontSize: '12px' }}>
            Help Centre & FAQ
          </button>
          <button onClick={() => setCurrentView('dashboard')} className="btn btn-dark" style={{ fontSize: '12px' }}>
            Launch Shield Console <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Main Layout: Left Sidebar Navigation + Right Content */}
      <div className="responsive-two-col" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '36px', alignItems: 'flex-start' }}>
        {/* Sidebar Nav */}
        <aside style={{ position: 'sticky', top: '72px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              className="input"
              type="text"
              placeholder="Search documentation…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.entries(categories).map(([catName, items]) => {
              const visibleItems = items.filter(it => filteredSections.some(fs => fs.id === it.id));
              if (visibleItems.length === 0) return null;

              return (
                <div key={catName}>
                  <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', margin: '0 0 8px 10px' }}>
                    {catName}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {visibleItems.map(item => {
                      const Icon = item.icon;
                      const isActive = item.id === activeSectionId;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSectionId(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: isActive ? 'var(--bg-secondary)' : 'transparent',
                            border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                            color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                            fontWeight: isActive ? 600 : 400,
                            fontSize: '13px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Icon size={14} style={{ flexShrink: 0, color: isActive ? 'var(--accent-blue)' : 'var(--text-dim)' }} />
                          <span style={{ flex: 1 }}>{item.title}</span>
                          {isActive && <ChevronRight size={12} style={{ color: 'var(--text-dim)' }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Links Card */}
          <div className="card" style={{ padding: '16px', marginTop: '24px', background: 'var(--bg)' }}>
            <strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Developer Resources</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <a href="https://github.com/OpeyemiMoses/Orion" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                <ExternalLink size={11} /> GitHub Repository
              </a>
              <a href="https://t.me/OrionXSentinelBot" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                <Send size={11} /> @OrionXSentinelBot
              </a>
              <a href="https://docs.base.org" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                <Globe size={11} /> Base Docs
              </a>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <article className="card" style={{ padding: 'clamp(24px, 4vw, 40px)', minHeight: '600px' }}>
          {activeSection.content}

          {/* Bottom Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            {(() => {
              const currIdx = DOC_SECTIONS.findIndex(s => s.id === activeSectionId);
              const prev = currIdx > 0 ? DOC_SECTIONS[currIdx - 1] : null;
              const next = currIdx < DOC_SECTIONS.length - 1 ? DOC_SECTIONS[currIdx + 1] : null;

              return (
                <>
                  <div>
                    {prev && (
                      <button 
                        onClick={() => setActiveSectionId(prev.id)}
                        className="btn btn-ghost" 
                        style={{ fontSize: '12px', padding: '6px 10px' }}
                      >
                        ← {prev.title}
                      </button>
                    )}
                  </div>
                  <div>
                    {next && (
                      <button 
                        onClick={() => setActiveSectionId(next.id)}
                        className="btn btn-outline" 
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        {next.title} →
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </article>
      </div>
    </div>
  );
}
