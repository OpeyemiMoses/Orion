# OrionSentinel

**Autonomous DeFi Capital Co-Pilot on Base Mainnet**  
Built for the [Orion Agents Hackathon](https://orionagents.org/hackathon)

---

## Overview

OrionSentinel is a non-custodial autonomous agent that protects, optimizes, and qualifies a wallet's DeFi capital across Base Mainnet.

### Core Autonomous Modules

| Module | Purpose | Live On-Chain Data Sources |
|---|---|---|
| **Liquidation Shield** | Monitors aggregate lending health factors across 4 major Base protocols in real time. Formulates and executes protective repayments before liquidation strikes. | Moonwell (`getAccountSnapshot`), Compound III (`Comet`), Aave V3 (`getUserAccountData`), Seamless Protocol |
| **Yield Optimizer** | Continuously scans live APYs across hundreds of Base pools, net of gas costs and slippage. Formulates optimal reallocation routes via Aerodrome and Base vaults. | DeFi Llama `/pools`, Aerodrome Router |
| **Incentive Tracker** | Inspects wallet activity, token holdings, and locked governance votes against active Base ecosystem programs, queuing low-cost qualifying actions. | Base JSON-RPC (`eth_getTransactionCount`, `balanceOf`), Aerodrome, Moonwell |
| **Approval Shield** | Scans token allowances across Base tokens, calculates overall portfolio threat score, and executes 0-allowance revocations directly via Web3 wallet. | Base JSON-RPC (`eth_getLogs`), Token Contracts |
| **Protocol Auditor** | Instant security & verification audit for any Base contract address before approving or depositing. | BaseScan API, Bytecode Proxy Detector, DeFi Llama TVL |

---

## Key Architecture & Innovations

* **100% Non-Custodial:** OrionSentinel does the continuous monitoring, risk calculation, route discovery, and payload assembly autonomously — but users retain full custody through Web3 wallet signatures.
* **EIP-6963 Multi-Wallet Provider Discovery:** Isolated provider routing for MetaMask, OKX Wallet, Coinbase Wallet, Rainbow, and Rabby without extension collision or hijacking.
* **Pure On-Chain Verifiability:** No mocked data or centralized databases — all telemetry is queried live from Base Mainnet RPC and decentralized APIs.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
VITE_BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY
PORT=3001
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY
```

### 3. Run Locally
```bash
# Start frontend
npm run dev

# Start backend proxy (optional)
npm run server
```

---

## Deployment

* **Frontend:** Configured for Vercel deployment with client-side SPA routing (`vercel.json`).
* **Backend:** Configured for Render / Node.js cloud hosting (`render.config.yaml`).

---

## License
MIT License. Built for the Orion Agents Hackathon.
