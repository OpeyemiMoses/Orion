<div align="center">

<img src="public/logo.png" width="140" height="140" alt="OrionX Logo" />

# OrionX Sentinel

**Autonomous DeFi Capital Co-Pilot & Security Sentinel on Base Mainnet**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Base](https://img.shields.io/badge/Network-Base%20Mainnet%20(8453)-0052FF)](https://base.org)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB)](https://vitejs.dev)
[![RainbowKit](https://img.shields.io/badge/Web3-RainbowKit%20%2B%20Wagmi%20%2B%20Viem-7C3AED)](https://rainbowkit.com)
[![Telegram Bot](https://img.shields.io/badge/Sentinel-Telegram%20Bot%20(@OrionXSentinelBot)-2CA5E0)](https://t.me/OrionXSentinelBot)
[![Built for Orion](https://img.shields.io/badge/Hackathon-Orion%20Agents-0052FF)](https://orionagents.org/hackathon)

*Non-custodial autonomous DeFi security sentinel that monitors, optimizes, and protects your capital across Base DeFi 24/7 with zero simulated data.*

[🌐 Live Web Application](https://orionx-agent.vercel.app/) • [🤖 Telegram Bot (@OrionXSentinelBot)](https://t.me/OrionXSentinelBot) • [🚀 Backend API (Railway)](https://orion-production-3db8.up.railway.app) • [📖 Full Docs](https://orionx-agent.vercel.app/)

</div>

---

## 📑 Table of Contents
- [Overview](#overview)
- [The Problem & The Solution](#the-problem--the-solution)
- [Key Features & Modules](#key-features--modules)
  - [1. Approval Shield (On-Chain Permission Manager)](#1-approval-shield-on-chain-permission-manager)
  - [2. Liquidation Shield (Multi-Protocol Solvency)](#2-liquidation-shield-multi-protocol-solvency)
  - [3. Yield Optimizer (Net-Gain Routing)](#3-yield-optimizer-net-gain-routing)
  - [4. Incentive Tracker (On-Chain Rewards Audit)](#4-incentive-tracker-on-chain-rewards-audit)
  - [5. Protocol & Token Auditor (Deep AI Reasoning)](#5-protocol--token-auditor-deep-ai-reasoning)
  - [6. Always-On Telegram Sentinel Bot](#6-always-on-telegram-sentinel-bot)
  - [7. In-App Documentation & Help Centre](#7-in-app-documentation--help-centre)
- [System Architecture](#system-architecture)
- [Multi-RPC & Resilient Infrastructure](#multi-rpc--resilient-infrastructure)
- [Tech Stack](#tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Security & Non-Custodial Guarantee](#security--non-custodial-guarantee)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Telegram Bot Commands Quick Reference](#telegram-bot-commands-quick-reference)
- [Contributing & License](#contributing--license)

---

## 🌟 Overview

**OrionX** is a non-custodial, autonomous DeFi sentinel engineered natively for **Base Mainnet (Chain ID 8453)**. It transforms passive crypto portfolios into self-defending, yield-maximizing, and incentive-qualifying positions.

OrionX operates across 3 core pillars:
1. **Security & Solvency Sentinel:** Real-time smart contract allowance revocation, threat radar analysis, and multi-protocol lending health monitoring (Moonwell, Compound III, Aave V3, Seamless).
2. **Autonomous Yield & Incentive Engine:** Mathematical net-profit yield scanning via DeFi Llama and live qualification gap auditing for active Base reward campaigns.
3. **Always-On Telegram Push Telemetry:** 24/7 background daemon executing proactive risk checks and alerting users before liquidations or unauthorized spender exploits occur.

---

## ⚡ The Problem & The Solution

| DeFi Pain Point | OrionX Autonomous Solution |
|---|---|
| **Dangling Token Approvals:** Wallets leave unlimited ERC-20 allowances open to DEXes and routers, exposing funds to drainer exploits. | **Approval Shield:** Queries live token allowances on Base and executes genuine zero-allowance revocations (`approve(spender, 0)`) with verified BaseScan receipts. |
| **Silent Liquidation Crises:** Volatile price swings wipe out collateral on lending markets when users are offline. | **Liquidation Shield & Telemetry:** Aggregates health factors across Moonwell, Compound III, Aave V3, and Seamless, alerting via Telegram when $HF < 1.50$ and formulating protective debt repayments. |
| **Yield Inefficiency & Gas Drag:** Capital sits in stagnant pools because manually calculating net yield after gas and slippage is complex. | **Net-Gain Yield Routing:** Computes real net gains ($\text{Target APY} - \text{Current APY} - \text{Gas} - \text{Slippage}$) across all active Base liquidity pools. |
| **Missed Ecosystem Incentives:** Users miss reward distributions due to obscure qualification criteria across various dApps. | **Automated Qualification Auditing:** Evaluates on-chain transaction breadth, balances, and governance locks against active campaigns to format lowest-gas qualifying actions. |

---

## 🛡️ Key Features & Modules

### 1. Approval Shield (On-Chain Permission Manager)
* **Real-Time Allowance Scanning:** Audits active allowances for `USDC`, `WETH`, `cbBTC`, `AERO`, `DAI`, and `DEGEN` across Uniswap v3, Aerodrome, Moonwell, 1inch, BaseSwap, and custom spenders.
* **100% Genuine Revocations:** Direct `writeContract` integration through Wagmi/Viem to execute `approve(spender, 0)` with live BaseScan transaction tracking.
* **Threat Radar & Risk Scoring:** Visual interactive radar classifying spenders by threat severity (`Critical`, `High`, `Medium`, `Low`).
* **Custom Spender Inspection:** Allows users to paste any token & spender address on Base to inspect and revoke permissions instantly.

### 2. Liquidation Shield (Multi-Protocol Solvency)
* **Multi-Market Telemetry:** Real-time reads from Moonwell (`getAccountSnapshot`), Compound III (`Comet`), Aave V3 (`getUserAccountData`), and Seamless Protocol.
* **Aggregate Health Factor Math:** Aggregates multi-protocol collateral and debt into a unified solvency score ($HF$).
* **Automated Defensive Repayment:** Triggers alerts when $HF < 1.50$ and calculates the exact debt reduction delta needed to restore safe margins ($HF \ge 2.00$).

### 3. Yield Optimizer (Net-Gain Routing)
* **Live DeFi Llama Stream:** Synchronizes verified yields across Aerodrome, Moonwell, Morpho, Extra Finance, and Beefy.
* **Mathematical Formula:**
  $$\text{Net Yield Gain} = \text{Target APY} - \text{Current APY} - \text{Gas Cost} - \text{Slippage}$$
* **Slippage & Depth Protection:** Flags low-liquidity pools and filters out unsustainable reward spikes.

### 4. Incentive Tracker (On-Chain Rewards Audit)
* **Live On-Chain Criteria Verification:** Evaluates transaction count (`eth_getTransactionCount`), governance locks (`veAERO`), and token balances directly from Base RPC.
* **Tracked Campaigns:** Aerodrome Season 3 LP Rewards, Base Onchain Summer II (Coinbase), Moonwell WELL Mining, Extra Finance Yield Program.
* **Actionable Step Guidance:** Pinpoints the exact micro-action remaining to achieve 100% qualification.

### 5. Protocol & Token Auditor (Deep AI Reasoning)
* **1-Click Contract Vetting:** Paste any Base contract address for instant security analysis.
* **6-Dimensional Deep AI Report:**
  1. *Architecture & Governance:* EIP-1967 proxy slots, timelock delays, multisig thresholds.
  2. *Health & Solvency:* Bad debt exposure, utilization rates, TVL trajectory.
  3. *Price & Liquidity Depth:* DEX depth, oracle manipulation vulnerability, slippage modeling.
  4. *Market Sentiment:* 24h volume/TVL ratio, whale concentration dispersion.
  5. *Exploit Vector Matrix:* Reentrancy, oracle arbitrage, liquidation cascade risks.
  6. *Critical "What to Watch":* Actionable on-chain triggers to monitor.

### 6. Always-On Telegram Sentinel Bot (`@OrionXSentinelBot`)
* **24/7 Autonomous Background Daemon:** Continuously polls Base RPC every 60 seconds to protect registered wallets even when the web application is closed.
* **Proactive Push Alerts:** Dispatches instant notifications for low health factors, high-yield reallocations, incentive qualification gaps, and proxy upgrades.
* **Interactive Chat Controls:** Full suite of commands with inline quick-action buttons:
  * `/start` — Main interactive dashboard and bot guide.
  * `/bind <0xAddress>` — Pair your Base wallet for 24/7 push alerts.
  * `/approvals <0xAddress>` — Inspect active token allowances and spenders on-chain.
  * `/status` or `/shield` — Live aggregate Health Factor and collateral positions.
  * `/yields` — Top Base pool yields with net-gain ranking.
  * `/incentives` — On-chain reward qualification criteria checks.
  * `/audit <0xAddress>` — Run Deep AI protocol & token audits directly in chat.
  * `/settings` — Customize alert thresholds and toggle specific notification categories.
  * `/unbind` — Unlink wallet and disable notifications.

### 7. In-App Documentation & Help Centre
* **Comprehensive Docs (`/docs`):** Architectural breakdowns, smart contract specifications, security models, and autonomous formula references.
* **Help Centre (`/help`):** Step-by-step onboarding guides, FAQs, troubleshooting steps, and direct support links.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ORIONX APPLICATION ECOSYSTEM                                   │
├──────────────────────────────────────────────────┬───────────────────────────────────────────────┤
│               WEB CONSOLE (FRONTEND)             │           ALWAYS-ON SENTINEL (BACKEND)        │
│                                                  │                                               │
│  ┌────────────────────────────────────────────┐  │  ┌─────────────────────────────────────────┐  │
│  │   RainbowKit + Wagmi + Viem (Base 8453)   │  │  │   24/7 Background Telemetry Daemon      │  │
│  │   - MetaMask, Coinbase, Rainbow, Rabby     │  │  │   - 60s Polling Loop across Base RPC    │  │
│  │   - Persistent session across page reloads │  │  │   - Subscribers JSON Persistent Store   │  │
│  └─────────────────────┬──────────────────────┘  │  └────────────────────┬────────────────────┘  │
│                        │                         │                       │                       │
│  ┌─────────────────────▼──────────────────────┐  │  ┌────────────────────▼────────────────────┐  │
│  │   Autonomous Security & Execution Modules  │  │  │   Telegram Bot Client (@OrionXSentinel) │  │
│  │   - Approval Shield (On-Chain Revocation)  │  │  │   - Interactive Command & Button Router │  │
│  │   - Liquidation Shield (Solvency Monitor)  │  │  │   - Real-Time Push Notification Engine  │  │
│  │   - Yield Optimizer (Net APY Routing)      │  │  │   - AI Protocol Reasoning Dispatcher    │  │
│  │   - Incentive Tracker (On-Chain Audit)     │  │  └─────────────────────────────────────────┘  │
│  │   - Protocol & Token Deep AI Auditor       │  │                                               │
│  └─────────────────────┬──────────────────────┘  │                                               │
└────────────────────────┼─────────────────────────┴───────────────────────┬───────────────────────┘
                         │                                                 │
                         └────────────────────────┬────────────────────────┘
                                                  │
                                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                BASE MAINNET DATA & EXECUTION LAYER                               │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│  • Multi-RPC Pool: https://mainnet.base.org • https://base.publicnode.com • https://1rpc.io/base │
│  • Protocols: Moonwell • Compound III • Aave V3 • Seamless • Aerodrome • Uniswap v3             │
│  • Verification: BaseScan API (EIP-1967 Proxy Detection) • DeFi Llama Yields API                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌐 Multi-RPC & Resilient Infrastructure

OrionX uses an automatic failover pool to ensure high availability and prevent RPC rate limits:

```
                  ┌──────────────────────────────┐
                  │    In-Memory Request Cache   │
                  │   12s TTL Deduplication Pool │
                  └──────────────┬───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
    [ Primary Base Mainnet RPC ]     [ Base PublicNode Failover ]
        https://mainnet.base.org         https://base.publicnode.com
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                    [ 1RPC Private Base Relay ]
                       https://1rpc.io/base
```

* **Automatic Failover:** If an endpoint times out (>3.5s) or returns 429/500, the client fails over to the next node in <50ms.
* **In-Memory Deduplication:** Prevents redundant requests for block numbers, balances, and contract bytecode.

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend UI** | React 19, Vite, Lucide Icons, Custom CSS Design System, Responsive Glassmorphism |
| **Web3 & Wallet Layer** | RainbowKit, Wagmi Core, Viem, TanStack Query |
| **Backend & Bot** | Node.js, Express, Telegram Bot API (Long-Polling & Webhooks), `node-fetch` |
| **Blockchain** | Base Mainnet (Chain ID `8453`, Hex `0x2105`) |
| **External APIs** | BaseScan Block Explorer API, DeFi Llama Yields API |
| **Hosting & Deployments** | Vercel (Frontend), Railway (Backend & Telegram Bot) |

---

## 📂 Project Directory Structure

```
orion/
├── public/
│   ├── favicon.png                   # Favicon
│   ├── logo.png                      # OrionX avatar & logo
│   └── orion-beam.png                # Background beam illustration
├── server/
│   ├── data/
│   │   └── subscribers.json          # Persistent Telegram subscriber store
│   ├── aiReasoning.js                # Deep AI 6-dimensional protocol auditor
│   ├── index.js                      # Express server entrypoint
│   ├── onChainAuditor.js             # Base contract bytecode & proxy analyzer
│   ├── onChainPositions.js           # Live lending, balances, yields & approvals
│   └── telegramBot.js                # Always-On Telegram Bot Sentinel & commands
├── src/
│   ├── components/
│   │   ├── AutonomousAgent.jsx       # Autonomous execution pipeline view
│   │   ├── Dashboard.jsx             # Main dashboard layout
│   │   ├── Documentation.jsx         # Full in-app documentation suite
│   │   ├── Header.jsx                # Responsive header with latched mobile nav
│   │   ├── HelpCenter.jsx            # Help Centre with FAQ and user guides
│   │   ├── IncentiveTracker.jsx      # Campaign qualification gap evaluator
│   │   ├── LandingPage.jsx           # High-impact landing page
│   │   ├── LiquidationShield.jsx     # Multi-protocol health monitor & repay
│   │   ├── PortfolioShield.jsx       # Real on-chain approval manager & revocation
│   │   ├── ProtocolAuditor.jsx       # Contract bytecode, proxy & TVL auditor
│   │   ├── Settings.jsx              # RPC parameters & notification preferences
│   │   ├── WalletConnectModal.jsx    # Fallback wallet connector
│   │   └── YieldOptimizer.jsx        # Live APY scanner & rebalancing calculator
│   ├── hooks/
│   │   └── useScrollReveal.js        # On-scroll element animation hook
│   ├── services/
│   │   ├── agentEngine.js            # Health factor math, incentive rules & yield fetch
│   │   ├── onChainExecutor.js        # Wagmi Core writeContract zero-allowance executor
│   │   ├── protocolAudit.js          # Bytecode, EIP-1967 proxy & BaseScan queries
│   │   ├── riskEngine.js             # Spender threat classification
│   │   └── web3Wallet.js             # Live Base RPC balance & allowance queries
│   ├── App.jsx                       # Root application component & router
│   ├── index.css                     # Design tokens & responsive styles
│   ├── main.jsx                      # Wagmi & RainbowKit provider wrappers
│   └── wagmiConfig.js                # RainbowKit Base Mainnet configuration
├── package.json                      # Project dependencies & scripts
├── README.md                         # Comprehensive project documentation
├── SECURITY.md                       # Security & vulnerability disclosure policy
├── CONTRIBUTING.md                   # Contribution guidelines
└── vite.config.js                    # Vite bundler configuration
```

---

## 🔒 Security & Non-Custodial Guarantee

1. **Zero Private Key Exposure:** OrionX runs completely non-custodially. Private keys and seed phrases never touch our codebase, frontend, or backend.
2. **Explicit User Signature:** Every state-modifying action (zero-allowance revocation, debt repay, liquidity deposit) requires manual confirmation through your connected Web3 wallet (MetaMask, Coinbase Wallet, Rainbow, Rabby).
3. **Exact Allowance Bounds:** When authorizing deposits, approvals are strictly bounded to the exact interaction amount—never unbounded or infinite by default.
4. **Bytecode Verification:** All audited contracts are verified directly against on-chain bytecode (`eth_getCode`) to detect unverified code or suspicious implementation slots.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** `>= 18.0.0`
- **Package Manager:** `npm` or `yarn`
- **Web3 Wallet:** MetaMask, Coinbase Wallet, Rainbow, Rabby, or WalletConnect compatible wallet

### 1. Clone & Install
```bash
git clone https://github.com/OpeyemiMoses/Orion.git
cd Orion
npm install
```

### 2. Configure Environment
Create a `.env` file in the project root:
```env
# Web3 / RainbowKit
VITE_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID
VITE_BASE_RPC_URL=https://mainnet.base.org

# Optional BaseScan API Key
VITE_BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY

# Telegram Bot Sentinel
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
PORT=3001
ALLOWED_ORIGIN=https://orionx-agent.vercel.app
```

### 3. Run Locally
```bash
# Terminal 1: Start Frontend (Vite)
npm run dev

# Terminal 2: Start Backend & Telegram Sentinel (Optional)
npm run server
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 💬 Telegram Bot Commands Quick Reference

Send these commands to **[@OrionXSentinelBot](https://t.me/OrionXSentinelBot)**:

| Command | Action |
|---|---|
| `/start` | Launch interactive menu and view linked wallet status |
| `/bind <0xAddress>` | Link your Base wallet address for 24/7 automated alerts |
| `/approvals <0xAddress>` | Scan active on-chain token allowances and get 1-tap revoke links |
| `/status` or `/shield` | View live aggregate Health Factor, collateral, and debt across protocols |
| `/yields` | Get top Base pool yields with net-gain ranking from DeFi Llama |
| `/incentives` | Audit real on-chain eligibility for active Base reward campaigns |
| `/audit <0xAddress>` | Run Deep AI security & exploit reasoning on any Base contract |
| `/settings` | Toggle push notification categories and adjust Health Factor thresholds |
| `/unbind` | Disconnect wallet and pause background alerts |

---

## 🤝 Contributing & License

Contributions, feedback, and feature requests are warmly welcomed!
- Review our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).
- Submit bug reports and feature requests via [GitHub Issues](https://github.com/OpeyemiMoses/Orion/issues).

Licensed under the **[MIT License](LICENSE)**. © 2026 OrionX Team. Built for the Orion Agents Hackathon on Base Mainnet.
