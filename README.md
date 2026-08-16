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

[Live Demo](http://localhost:5173) | [Documentation](#architecture) | [Security Policy](SECURITY.md) | [Contributing](CONTRIBUTING.md)

</div>

---

## Table of Contents
- [Overview](#overview)
- [The Problem and The Solution](#the-problem-and-the-solution)
- [Autonomous Core Modules](#autonomous-core-modules)
- [System Architecture](#system-architecture)
- [How Orion Works Autonomously](#how-orion-works-autonomously)
- [Supported Protocols and Live Data Feeds](#supported-protocols-and-live-data-feeds)
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
|   * Multi-Endpoint Automatic RPC Fallback (Base, LlamaRPC, 1RPC)        |
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
# Primary Base RPC Endpoint (Alchemy, Infura, QuickNode, or public)
VITE_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

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
- [ ] ERC-4337 Session Key Automation for 1-click bounded auto-execution
- [ ] Cross-chain capital bridging telemetry (Arbitrum, Optimism to Base)
- [ ] Telegram & Discord real-time liquidation alert bot

---

## Contributing

Contributions are welcome! Please review our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

---

## License

This project is open source and licensed under the [MIT License](LICENSE).
