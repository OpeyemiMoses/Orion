<div align="center">

<img src="public/logo.png" width="140" height="140" alt="Orion Logo" />

# Orion

**Autonomous DeFi Capital Co-Pilot on Base Mainnet**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Base](https://img.shields.io/badge/Network-Base%20Mainnet%20(8453)-0052FF)](https://base.org)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB)](https://vitejs.dev)
[![EIP-6963](https://img.shields.io/badge/Standard-EIP--6963%20Multi--Provider-3C3C3D)](https://eips.ethereum.org/EIPS/eip-6963)
[![Built for Orion](https://img.shields.io/badge/Hackathon-Orion%20Agents-7C3AED)](https://orionagents.org/hackathon)

*Non-custodial autonomous sentinel that monitors, optimizes, and qualifies your capital across Base DeFi in real time.*

[Live Demo](http://localhost:5173) | [GitHub Repository](https://github.com/OpeyemiMoses/Orion) | [Security Policy](SECURITY.md) | [Contributing](CONTRIBUTING.md)

</div>

---

## Table of Contents
- [Overview](#overview)
- [The Problem and The Solution](#the-problem-and-the-solution)
- [Current MVP](#current-mvp)
- [Platform Infrastructure](#platform-infrastructure)
- [Platform Flow](#platform-flow)
- [Autonomous Core Modules](#autonomous-core-modules)
- [Tech Stack](#tech-stack)
- [Quality Checks](#quality-checks)
- [Project Structure](#project-structure)
- [Data Access and Scope Limits](#data-access-and-scope-limits)
- [System Architecture](#system-architecture)
- [How Orion Works Autonomously](#how-orion-works-autonomously)
- [Security and Non-Custodial Architecture](#security-and-non-custodial-architecture)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Orion is an autonomous DeFi co-pilot engineered natively for Base Mainnet. It transforms passive crypto portfolios into self-defending, yield-maximizing, and incentive-qualifying positions.

Operating continuously across 3 core dimensions:
1. **Liquidation Shield:** Real-time multi-protocol collateral health monitoring and automated debt repayment routing.
2. **Yield Optimizer:** Live DeFi Llama pool yield scanning with mathematical net-profit routing (accounting for gas and slippage).
3. **Incentive Tracker:** Autonomous on-chain qualification gap analysis across active Base reward campaigns.

---

## The Problem and The Solution

| The Challenge in DeFi | Orion Autonomous Solution |
|---|---|
| **Liquidation Volatility:** Sudden price drops liquidate borrowing positions across Moonwell, Aave, and Compound if not manually monitored 24/7. | **Continuous Health Sensing:** The agent computes aggregate collateral health across protocols and autonomously formulates debt repayments if health factor falls below 1.5. |
| **Yield Inefficiency:** Capital sits in low-yield pools because calculating net APY gains after factoring in gas fees and slippage is tedious. | **Mathematical Net-Gain Routing:** The agent continuously parses hundreds of Base pools, executing reallocations only when the net financial benefit is positive. |
| **Unclaimed Ecosystem Incentives:** Users miss lucrative airdrops and protocol incentives because tracking complex qualification rules across dApps is difficult. | **Automated Criteria Auditing:** The agent directly evaluates transaction breadth, balances, and governance locks against active program criteria, queuing qualifying micro-actions. |

---

## Current MVP

The current Minimum Viable Product (MVP) of Orion is live, operational, and connected to Base Mainnet:

* **Live Multi-Protocol Lending Telemetry:** Reads live user collateral and debt positions directly from Moonwell (`mToken.getAccountSnapshot`), Compound III (`Comet`), Aave V3 (`getUserAccountData`), and Seamless Protocol.
* **Autonomous Health Factor Math:** Aggregates multi-market borrowing risk into a single live Health Factor metric with dynamic risk classification (`SAFE`, `CAUTION`, `CRITICAL`).
* **Yield Opportunity Engine:** Scans live Base liquidity pools across Aerodrome, Moonwell, Morpho, Extra Finance, and Beefy with net-gain calculations factoring in gas fees and slippage.
* **On-Chain Campaign Qualification Scanner:** Evaluates connected wallet state (`eth_getTransactionCount`, token balances, and `veAERO` locks) against Aerodrome Season 3, Base Onchain Summer II, and Moonwell Mining.
* **Protocol Security Auditor:** Inspects smart contract addresses on Base, detecting bytecode status, EIP-1967 upgradeable proxy slots, and third-party audit reports.
* **EIP-6963 Multi-Wallet Provider:** Isolated multi-wallet connection supporting MetaMask, OKX Wallet, Coinbase Wallet, Rabby, and browser injectors without provider collision.
* **Direct On-Chain Execution Pipeline:** Assembles non-custodial transaction payloads, dispatches to the connected wallet for signature, and links directly to BaseScan transactions.

---

## Platform Infrastructure

Orion is built on a resilient, high-throughput Web3 telemetry infrastructure designed for continuous client-side operation:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       MULTI-RPC RESILIENCE POOL                         │
│                                                                         │
│  [ Primary Base RPC ] ──(Failover <50ms)──► [ Base PublicNode ]         │
│          │                                          │                   │
│          └──────────────► [ 1RPC Base Node ] ◄──────┘                   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│      IN-MEMORY RPC CACHE         │   │       DEFI LLAMA YIELD SYNC      │
│  12-second TTL for read queries  │   │  Non-blocking background stream  │
│  Prevents rate limits & storms   │   │  Curated Base fallback snapshot  │
└──────────────────────────────────┘   └──────────────────────────────────┘
```

1. **Multi-Endpoint Automatic Failover Pool:**
   * Automatically routes requests across validated CORS-friendly Base endpoints: `https://mainnet.base.org`, `https://base.publicnode.com`, and `https://1rpc.io/base`.
   * If an endpoint returns 400, 429, or times out (>3.5s), the client instantly fails over to the next operational node in <50ms.
2. **In-Memory Request Deduplication & Caching:**
   * Implements a 12-second in-memory TTL cache for high-frequency RPC read calls (`eth_getBalance`, `eth_blockNumber`, and identical `eth_call` payloads) to eliminate burst rate limits.
3. **DeFi Llama Yield Sync:**
   * Asynchronous non-blocking background synchronization with 2-second timeout protection and instant fallback to verified Base pool snapshots.

---

## Platform Flow

```
[ User Connects Wallet ] (EIP-6963 Provider Discovery)
          │
          ▼
[ Autonomous Telemetry Ingestion ]
   ├─► Query Moonwell, Compound III, Aave V3, Seamless positions
   ├─► Scan DeFi Llama Base pool APYs & TVL
   ├─► Check wallet transaction count & governance balances
   └─► Scan token approval permissions & spender addresses
          │
          ▼
[ Autonomous Decision Engine ]
   ├─► Compute Aggregate Health Factor (HF)
   ├─► Calculate Net Yield Benefit: (Target APY - Current APY - Gas - Slippage)
   └─► Evaluate Incentive Qualification Gaps
          │
          ▼
[ Execution Assembly ]
   ├─► If HF < 1.50: Assemble protective debt repayment calldata
   ├─► If Yield Profitable: Formulate token approval & deposit route
   └─► If Incentive Missing Step: Build qualifying interaction payload
          │
          ▼
[ Non-Custodial User Authorization ]
   └─► User reviews and signs transaction via Web3 Wallet
          │
          ▼
[ On-Chain Confirmation & BaseScan Link ]
```

---

## Autonomous Core Modules

### 1. Liquidation Shield
* **Protocols Monitored:** Moonwell (`getAccountSnapshot`), Compound III (`Comet`), Aave V3 (`getUserAccountData`), Seamless Protocol.
* **Autonomous Math:** Computes aggregate collateral-to-debt ratio in real time.
* **Protection Trigger:** When Health Factor < 1.50, the agent calculates the exact debt reduction delta needed to restore safe margins (>= 2.0) and prepares the protective repayment transaction.

### 2. Yield Optimizer
* **Data Ingestion:** Streams real-time pool yields across Base from DeFi Llama's live API.
* **Decision Formula:**
  $$\text{Net Yield Gain} = \text{Target APY} - \text{Current APY} - \text{Gas Cost} - \text{Slippage}$$
* **Execution:** Routes capital reallocations via Aerodrome and Base liquidity vaults.

### 3. Incentive Tracker
* **On-Chain Gap Analysis:** Evaluates wallet activity records (`eth_getTransactionCount`), token holdings (`balanceOf`), and voting locks (`veAERO`).
* **Active Campaigns:** Aerodrome Season 3 LP Rewards, Base Onchain Summer II, Moonwell WELL Mining, Extra Finance Points.
* **Action Formulation:** Formats the exact, lowest-gas interaction required to satisfy missing qualification tiers.

### 4. Protocol Security Auditor
* **1-Click Smart Contract Vetting:** Audits any Base address before funds are deposited.
* **Security Checks:** BaseScan verified source code, EIP-1967 upgradeable proxy detection, independent security audit firms (OpenZeppelin, Trail of Bits, Spearbit, Halborn), and DeFi Llama TVL.

---

## Tech Stack

* **Frontend Framework:** React 19 + Vite
* **Styling & Design System:** Vanilla CSS with custom design tokens, modern typography, glassmorphism, responsive grid containers, and smooth cubic-bezier animations.
* **Web3 Integration & Standards:**
  * EIP-6963 (Multi-Injected Provider Discovery)
  * JSON-RPC 2.0 Client with automatic endpoint failover
  * Standard ERC-20 / Compound / Aave ABI interfaces
* **Data Providers & APIs:**
  * Base Mainnet JSON-RPC (`mainnet.base.org`, `base.publicnode.com`, `1rpc.io/base`)
  * BaseScan Block Explorer API
  * DeFi Llama Yields API
* **Icons & Animation:**
  * Lucide React (Clean vector iconography)
  * IntersectionObserver Scroll Reveal Hook (`useScrollReveal`)

---

## Quality Checks

* **Zero-Custody Guarantee:** Orion does not collect, log, store, or transmit private keys, seed phrases, or credentials.
* **Bytecode Verification:** Verifies smart contract addresses against on-chain bytecode (`eth_getCode`) to detect Personal Wallets (EOAs) vs. smart contracts.
* **Proxy Architecture Detection:** Checks EIP-1967 implementation storage slots to identify upgradeable contracts and warn users of admin changeability.
* **Strict Multi-RPC Fallback:** All read operations are wrapped with abort controllers and multi-node fallbacks to eliminate single-point-of-failure hangs.
* **Production Build Verification:** Validated with `npm run build` using strict module transformation and bundle minification.

---

## Project Structure

```
orion/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md             # Standard bug report template
│   │   └── feature_request.md        # Protocol integration request template
│   └── pull_request_template.md      # Pull request checklist
├── public/
│   ├── favicon.png                   # Official browser favicon
│   ├── logo.png                      # Official brand avatar
│   └── orion-beam.png                # Dual-agent coordination illustration
├── server/
│   └── index.js                      # Express relay proxy (optional server-side cache)
├── src/
│   ├── assets/
│   │   ├── hero.png                  # Product hero visual
│   │   ├── logo.png                  # Brand logo
│   │   └── orion-beam.png            # Character beam illustration
│   ├── components/
│   │   ├── AgentAuditor.jsx          # Security export & audit view
│   │   ├── AutonomousAgent.jsx       # Autonomous execution pipeline component
│   │   ├── Dashboard.jsx             # Main application layout & history back-stack
│   │   ├── ErrorBoundary.jsx         # Global error fallback component
│   │   ├── Header.jsx                # Top bar with network status, logo & GitHub link
│   │   ├── IncentiveTracker.jsx      # Campaign qualification gap evaluator
│   │   ├── LandingPage.jsx           # Landing page with 3D mockup & on-scroll reveal
│   │   ├── LiquidationShield.jsx     # Multi-protocol health factor monitor & repay
│   │   ├── PortfolioShield.jsx       # Token approval risk auditor & revocation
│   │   ├── ProtocolAuditor.jsx       # Contract bytecode, proxy & audit validator
│   │   ├── Settings.jsx              # RPC endpoint and parameter configuration
│   │   ├── WalletConnectModal.jsx    # EIP-6963 multi-wallet modal
│   │   └── YieldOptimizer.jsx        # Live APY scanner & rebalancing calculator
│   ├── hooks/
│   │   └── useScrollReveal.js        # IntersectionObserver on-scroll reveal hook
│   ├── services/
│   │   ├── agentEngine.js            # Health factor math, incentive rules & yield fetch
│   │   ├── onChainExecutor.js        # Non-custodial transaction dispatcher & calldata
│   │   ├── protocolAudit.js          # Contract verification, proxy slots & TVL queries
│   │   ├── riskEngine.js             # Spender risk scoring & classification
│   │   ├── walletProviders.js        # EIP-6963 provider resolver
│   │   └── web3Wallet.js             # Multi-RPC pool, balance & approval scanner
│   ├── App.jsx                       # Root application component & view router
│   ├── index.css                     # Design tokens, typography & animation keyframes
│   └── main.jsx                      # React entrypoint
├── CODE_OF_CONDUCT.md                # Contributor Covenant Code of Conduct
├── CONTRIBUTING.md                   # Development workflow & contribution guide
├── LICENSE                           # MIT License
├── package.json                      # Project dependencies & scripts
├── README.md                         # Project documentation
├── SECURITY.md                       # Security policy & disclosure guidelines
└── vite.config.js                    # Vite bundler configuration
```

---

## Data Access and Scope Limits

To protect users and ensure deterministic behavior, Orion operates within explicit boundaries:

1. **Read Operations (Public RPC):**
   * Orion queries only public, verifiable on-chain state (`eth_call`, `eth_getBalance`, `eth_getTransactionCount`, `eth_getCode`).
   * No proprietary, centralized database or opaque indexer is required.
2. **Write Operations (Delegated Web3 Signing):**
   * Orion **never** executes transactions autonomously without explicit user signing.
   * Every action (debt repayment, token approval, reallocation deposit) generates a standard EVM transaction payload presented to the user's connected wallet for review and approval.
3. **Allowance Scope Limits:**
   * Reallocation approvals target exact required allowances rather than infinite/unbounded permissions.
   * Approval Shield includes 1-click 0-allowance revocation utilities.
4. **Network Boundaries:**
   * Orion strictly targets Base Mainnet (Chain ID `8453`, `0x2105`). Transactions on unverified networks are automatically intercepted and prompted for network switching.

---

## System Architecture

```
+-------------------------------------------------------------------------+
|                               ORION AGENT                               |
|                                                                         |
|  +-----------------------+  +---------------------+  +---------------+  |
|  |  Liquidation Shield   |  |   Yield Optimizer   |  |   Incentive   |  |
|  | (Moonwell/Compound)   |  | (DeFi Llama Pools)  |  |    Tracker    |  |
|  +-----------+-----------+  +----------+----------+  +-------+-------+  |
+--------------+-------------------------+---------------------+----------+
               |                         |                     |
               v                         v                     v
+-------------------------------------------------------------------------+
|               ON-CHAIN TELEMETRY & DECISION PIPELINE                    |
|   * Base JSON-RPC (eth_call, eth_getLogs, eth_getCode)                  |
|   * Multi-Endpoint Automatic RPC Fallback (Base, PublicNode, 1RPC)      |
|   * EIP-6963 Isolated Multi-Wallet Provider Manager                     |
+----------------------------------+--------------------------------------+
                                   |
                                   v
+-------------------------------------------------------------------------+
|                    NON-CUSTODIAL EXECUTION LAYER                        |
|   * User-Approved Web3 Transaction Signatures (MetaMask/OKX/Coinbase)   |
|   * BaseScan Verification & Block Explorer Confirmation                 |
+-------------------------------------------------------------------------+
```

---

## How Orion Works Autonomously

```
       +-------------------------------------------------------------+
       |             CONTINUOUS AUTONOMOUS SENSING LOOP              |
       |   Base JSON-RPC  *  DeFi Llama  *  Lending Protocols        |
       +------------------------------+------------------------------+
                                      |
            +-------------------------+-------------------------+
            v                                                   v
+-----------------------+                           +-----------------------+
|   DECISION ENGINE     |                           |   EXECUTION BUILDER   |
| * Health Factor Math  | ---> Triggers Calculated ->| * Calldata Assembly   |
| * Net Yield Formula   |       Opportunity         | * Gas Optimization    |
| * Incentive Criteria  |                           | * Wallet Dispatch     |
+-----------------------+                           +-----------------------+
```

* **Continuous Observation:** Continuously monitors health factors, active incentives, and yield spreads without requiring active user input.
* **Mathematical Modeling:** Quantifies risk thresholds ($HF < 1.5$) and calculates the exact debt repayment amount to restore safety buffers ($HF \ge 2.0$).
* **Automated Calldata Construction:** Formats raw smart contract calls for token approvals, vault deposits, and debt repayments.

---

## Security and Non-Custodial Architecture

* **Zero Cloud Key Storage:** Orion **never** holds, stores, or transmits your private keys.
* **Autonomous Intelligence + Delegated Execution:** The agent performs 100% of the continuous observation, mathematical modeling, and payload construction autonomously in the background. Transactions are dispatched directly to your Web3 wallet for signing.
* **EIP-6963 Wallet Isolation:** Native multi-provider detection prevents extensions (like OKX or MetaMask) from hijacking or colliding with each other.

---

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/OpeyemiMoses/Orion.git
cd Orion

# Install dependencies
npm install
```

### Development
```bash
# Start the Vite development server
npm run dev
# Open http://localhost:5173
```

### Production Build
```bash
# Compile optimized production bundle
npm run build

# Preview production build
npm run preview
```

---

## Environment Configuration

Create a `.env` file in the root directory:

```env
# Primary Base RPC Endpoint
VITE_BASE_RPC_URL=https://mainnet.base.org

# BaseScan API Key (Optional for faster contract source verification)
VITE_BASESCAN_API_KEY=YOUR_BASESCAN_KEY

# Backend Server Port (Optional)
PORT=3001
```

---

## Roadmap

- [x] Base Mainnet Multi-Protocol Health Factor Sensing (Moonwell, Compound III, Aave V3, Seamless)
- [x] Live DeFi Llama Yield Scanner & Gas-Adjusted Rebalancing Engine
- [x] Autonomous Incentive Criteria Evaluator (Aerodrome, Moonwell, Base Onchain Summer)
- [x] EIP-6963 Multi-Wallet Provider Isolation
- [x] Direct On-Chain Execution Pipeline with BaseScan Links
- [x] On-Scroll Reveal and Smooth Rise-In Animation System
- [ ] ERC-4337 Session Key Automation for 1-click bounded auto-execution
- [ ] Cross-chain capital bridging telemetry (Arbitrum, Optimism to Base)
- [ ] Telegram & Discord real-time liquidation alert bot

---

## Contributing

Contributions are welcome! Please review our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

---

## License

This project is open source and licensed under the [MIT License](LICENSE).
