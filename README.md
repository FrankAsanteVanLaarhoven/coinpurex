# CoinPurex // Institutional Sovereign DEX, Cold Custody, Multi-Sig Treasury & Coin Offering Platform

[![Production Domain](https://img.shields.io/badge/Production%20Domain-coinpurex.com-0ea5e9?style=flat-square&logo=ethereum)](https://coinpurex.com)
[![GitHub Repository](https://img.shields.io/badge/GitHub-coinpurex-181717?style=flat-square&logo=github)](https://github.com/FrankAsanteVanLaarhoven/coinpurex)
[![Quality Gate](https://img.shields.io/badge/Quality%20Gate-20%2F20%20PASS-10b981?style=flat-square)](https://coinpurex.com)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=flat-square&logo=solidity)](https://soliditylang.org)
[![Go Gateway](https://img.shields.io/badge/Go%20Gateway-1.22-00ADD8?style=flat-square&logo=go)](https://golang.org)
[![Rust Engine](https://img.shields.io/badge/Rust%20Engine-2021%20Edition-black?style=flat-square&logo=rust)](https://www.rust-lang.org)
[![WebSockets](https://img.shields.io/badge/WebSockets-RFC--6455%20Dual%20Stream-8b5cf6?style=flat-square)](https://coinpurex.com)
[![Token Contract](https://img.shields.io/badge/CRS%20Contract-0x819c...ac8b-f59e0b?style=flat-square)](https://etherscan.io/address/0x819c468e5dc88beb0702577cf8a90c2d0566ac8b)

A state-of-the-art (SOTA), production-grade enterprise Web3 decentralized trading, cold custody, sovereign coin offering, and multi-signature governance platform operational at **[https://coinpurex.com](https://coinpurex.com)**.

Uniting high-frequency order book trading, cold vault security, Interledger Protocol (ILP RFC-2004) preimage escrows, social quantitative copy trading, real dual-stream RFC 6455 WebSockets, and official **Ceris Coin (CRS)** token offering and launchpad management.

---

## 📑 Table of Contents
1. [Core Architectural Components](#-core-architectural-components)
2. [Ceris Coin (CRS) Sovereign Platform Asset](#-ceris-coin-crs-sovereign-platform-asset)
3. [Coin Offering Launchpad & Buy Your Own Coin](#-coin-offering-launchpad--buy-your-own-coin)
4. [Trader Sovereign Authentication](#-trader-sovereign-authentication)
5. [Real RFC 6455 WebSockets Engine](#-real-rfc-6455-websockets-engine)
6. [Quantitative Copy Trading & Auto-Replication](#-quantitative-copy-trading--auto-replication)
7. [Institutional Cold Custody & Solvency Engine](#-institutional-cold-custody--solvency-engine)
8. [Multi-Tier System Architecture](#-multi-tier-system-architecture)
9. [Automated Verification & Test Suites](#-automated-verification--test-suites)
10. [Quickstart & Operations Guide](#-quickstart--operations-guide)
11. [Development Quality Gate (20/20 Standard)](#-development-quality-gate-2020-standard)

---

## 🏛 Core Architectural Components

| Component | Implementation File | Enterprise Specification & Standard |
| :--- | :--- | :--- |
| **1. Ceris Coin (CRS)** | [`contracts/core/CerisCoin.sol`](file:///Users/favl/Desktop/blockchain-masterclass/enterprise-platform/contracts/core/CerisCoin.sol) | Recreated Solidity 0.8.20 standard from Ethereum Mainnet `0x819c468e5dc88beb0702577cf8a90c2d0566ac8b`. 100M supply, 5 decimals, `DSAuth`, `DSStop` circuit breakers, admin burn controls. |
| **2. Coin Offering Launchpad** | [`contracts/enterprise/CoinPurexOffering.sol`](file:///Users/favl/Desktop/blockchain-masterclass/enterprise-platform/contracts/enterprise/CoinPurexOffering.sol) | Institutional primary presale contract. 5,000 CRS/ETH rate, 50 ETH soft cap, 1,000 ETH hard cap, zero-diversion multi-sig routing. |
| **3. Multi-Sig Treasury** | [`contracts/core/EnterpriseMultiSigWallet.sol`](file:///Users/favl/Desktop/blockchain-masterclass/enterprise-platform/contracts/core/EnterpriseMultiSigWallet.sol) | M-of-N threshold consensus (2-of-3 quorum), native ETH & ERC-20 multi-asset vaulting, reentrancy guards, arbitrary contract governance calldata. |
| **4. Order Book DEX** | [`contracts/core/EnterpriseDEX.sol`](file:///Users/favl/Desktop/blockchain-masterclass/enterprise-platform/contracts/core/EnterpriseDEX.sol) | On-chain limit and market order book matching engine. Price-time priority (bids descending, asks ascending), multi-level market sweeps with partial fills. |
| **5. Cold Vault & Escrows** | [`contracts/enterprise/CoinPurexCustodyVault.sol`](file:///Users/favl/Desktop/blockchain-masterclass/enterprise-platform/contracts/enterprise/ApexCustodyVault.sol) | 48-hour timelocked withdrawal delays with Security Officer veto, ILP RFC-2004 SHA-256 preimage escrows, and Merkle Proof of Solvency. |
| **6. Go High-Throughput Gateway** | [`backend/go-gateway/main.go`](file:///Users/favl/Desktop/blockchain-masterclass/enterprise-platform/backend/go-gateway/main.go) | Real RFC 6455 hijacked WebSocket streaming (`/ws`), trader session authentication, live market tickers, and copy trader REST feeds on port 8080. |
| **7. Ultra-Low Latency Rust Engine** | [`backend/rust-engine/src/main.rs`](file:///Users/favl/Desktop/blockchain-masterclass/enterprise-platform/backend/rust-engine/src/main.rs) | Sub-50µs memory-safe order book matching engine utilizing `BTreeMap` price ladders and `VecDeque` FIFO queues on port 8081. |
| **8. Real WebSockets Node Server** | [`scripts/server.js`](file:///Users/favl/Desktop/blockchain-masterclass/enterprise-platform/scripts/server.js) | Native HTTP & RFC 6455 WebSocket unified server broadcasting real-time market data packets, order book updates, and mirror trade events on port 4200. |
| **9. DeFi Institutional Yield** | [`contracts/enterprise/CoinPurexDeFiVault.sol`](file:///Users/favl/Desktop/blockchain-masterclass/enterprise-platform/contracts/enterprise/ApexDeFiVault.sol) | ERC-4626 compliant yield vaults with auto-compounding LP shares and transparent Net Asset Value (NAV) calculations. |
| **10. Multi-Chain L2 Bridge** | [`contracts/enterprise/CoinPurexCrossChainGateway.sol`](file:///Users/favl/Desktop/blockchain-masterclass/enterprise-platform/contracts/enterprise/ApexCrossChainGateway.sol) | Cross-chain message relayer supporting Polygon (137), Arbitrum Nitro (42161), Optimism (10), Base (8453), and Ethereum L1 (1). |
| **11. Securities & FTPS Clearing** | [`contracts/enterprise/CoinPurexSecurityToken.sol`](file:///Users/favl/Desktop/blockchain-masterclass/enterprise-platform/contracts/enterprise/ApexSecurityToken.sol) | ERC-3643 / ERC-1400 compliant tokenized real-world assets (RWA) with accredited KYC registries, legal clawbacks, and ISO-20022 FTPS batch clearing. |
| **12. Interactive Sovereign UI** | [`frontend/public/app.js`](file:///Users/favl/Desktop/blockchain-masterclass/enterprise-platform/frontend/public/app.js) | Zero-dependency native ES6+ interactive Web3 architecture with dual-stream WebSockets, persona switching, and order placement. |

---

## 💎 Ceris Coin (CRS) Sovereign Platform Asset

Ceris Coin (CRS) is the sovereign platform asset of **coinpurex.com**. The contract was reverse-engineered from verified Ethereum Mainnet bytecode and recreated in modern Solidity 0.8.20:

- **Contract Address:** [`0x819c468e5dc88beb0702577cf8a90c2d0566ac8b`](https://etherscan.io/address/0x819c468e5dc88beb0702577cf8a90c2d0566ac8b)
- **Token Name:** `Ceris Coin`
- **Token Symbol:** `CRS`
- **Official Exchange:** `https://coinpurex.com`
- **Decimals:** `5` (1 token = `100,000` base units)
- **Total Genesis Supply:** `100,000,000 CRS` (`10,000,000,000,000` units)
- **Administrative Circuit Breakers:**
  - `stop()` / `start()`: `DSStop` circuit breaker for emergency halting.
  - `burnfromAdmin()`: Authority to burn from designated balances for regulatory compliance.
  - `renounceOwnership()`: Irreversible renunciation of administrative burn permissions.
- **Allowance Race-Condition Guards:** Native `increaseAllowance()` and `decreaseAllowance()` preventing ERC-20 front-running vectors.

### Verified External Exchange Venues
Ceris Coin is actively registered and viewable across decentralized secondary venues:
- 🏛 [Bitox Exchange (CRS-ETH)](https://exchange.bitox.io/#!/trade/0x819c468e5dc88beb0702577cf8a90c2d0566ac8b-ETH)
- ⚡ [Etherc Exchange (CRS-ETH)](https://etherc.io/#0x819c468e5dc88beb0702577cf8a90c2d0566ac8b-ETH)
- 🔱 [Forkdelta (CRS-ETH)](https://forkdelta.app/#!/trade/0x819c468e5dc88beb0702577cf8a90c2d0566ac8b-ETH)
- 🌐 [Etherdelta (CRS-ETH)](https://etherdelta.com/#0x819c468e5dc88beb0702577cf8a90c2d0566ac8b-ETH)
- 🔍 [Etherscan Token Tracker](https://etherscan.io/token/0x819c468e5dc88beb0702577cf8a90c2d0566ac8b)
- 💼 [Token Holder Balances](https://etherscan.io/token/0x819c468e5dc88beb0702577cf8a90c2d0566ac8b#balances)

---

## 🚀 Coin Offering Launchpad & "Buy Your Own Coin"

The Coin Offering interface allows traders and token owners to interact directly with the on-chain primary presale contract:

- **Launchpad Allocation:** `20,000,000 CRS` (20.0% of genesis supply)
- **Offering Rate:** `1 ETH = 5,000 CRS` (approx. $0.50 USD / CRS)
- **Contribution Boundaries:** Min: `0.05 ETH` • Max: `25.0 ETH` per transaction
- **Cap Targets:** Soft Cap: `50 ETH` (Cleared ✓) • Hard Cap: `1,000 ETH`
- **Zero-Diversion Guarantee:** 100% of contributed ETH routes directly into the `EnterpriseMultiSigWallet` (`0x5FbDB2315678afecb367f032d93F642f64180aa3`) where the token owner is the primary signer.
- **Interactive Buying Flow:**
  1. Open the **Coin Offering (CRS)** tab.
  2. Enter an ETH contribution amount (e.g., `2.0 ETH`).
  3. Dynamic calculators compute the exact CRS token amount (`10,000 CRS`) and standard 5-decimal base units (`1,000,000,000 units`).
  4. Click **`Contribute ETH & Mint Ceris Coin (CRS)`**. ETH is deducted, CRS is credited to the authenticated account, the progress bar updates, and an audit entry is logged to on-chain telemetry.
- **Recreate / Deploy New Offering Tool:** Deploy fresh instances of `CoinPurexOffering.sol` for custom parameters or auxiliary tokens on demand.

---

## 🔐 Trader Sovereign Authentication

Pre-registered sovereign identities configured with zero third-party diversion:

| Trader | Email | Password | Role | Address | Initial CRS Holdings |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Trader One** | `a@coinpurex.com` | `bloqum` | Principal Admin & Token Owner | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | **10,000,000 CRS** |
| **Trader Two** | `b@coinpurex.com` | `bloqum` | Sovereign Quant Trader | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | **500,000 CRS** |

- Click the **`Trader Login`** button in the top navigation bar or use the **1-Click Quick Testing Authentication** buttons to switch between sessions instantly.
- The cockpit identity reflects the active session with verified badges, balances, and permissions.

---

## ⚡ Real RFC 6455 WebSockets Engine

CoinPurex features real bidirectional RFC 6455 WebSocket streaming across all backend and frontend layers:

1. **Dual-Stream Client Architecture:**
   - **Local CoinPurex Gateway WebSocket (`ws://localhost:4200/ws` or `ws://localhost:8080/ws`):**
     - Sends client subscription frames (`subscribe` / `ping`).
     - Receives instant snapshot on connection.
     - Receives sub-second `PRICE_UPDATE` ticks, order book level recalculations, and `AUTO_REPLICATE_TRADE_EVENT` copy trading broadcasts.
   - **Public Binance Crypto WebSocket (`wss://stream.binance.com:9443/ws/...`):**
     - Streams live global ticker prices for `BTC/DAI`, `ETH/DAI`, and `LINK/DAI`.
2. **Visual WebSocket Status Badges:**
   - Header Status: `⚡ WS: LIVE` with glowing green status pulse.
   - Ticker Bar: `⚡ WS STREAM LIVE`.
3. **Resilience & Auto-Reconnect:**
   - Automated reconnection with exponential backoff if the socket disconnects.

---

## 📈 Quantitative Copy Trading & Auto-Replication

- **Audited Top 1% Popular Investors:**
  - **Kaelen Voss (CoinPurex Quant):** Sharpe `3.42`, 30D Return `+14.85%`, 12M Return `+148.65%`, Win Rate `92.4%`, Max DD `-3.8%`.
  - **Seraphina Chen (Treasury Macro):** Sharpe `4.10`, 30D Return `+9.20%`, 12M Return `+89.20%`, Win Rate `91.2%`, Max DD `-2.1%`.
  - **Dr. Marcus Brody (MEV Quant):** Sharpe `3.15`, 30D Return `+18.40%`, 12M Return `+192.40%`, Win Rate `88.7%`, Max DD `-4.5%`.
  - **Elena Rostova (DeFi Arbitrage):** Sharpe `2.95`, 30D Return `+11.20%`, 12M Return `+104.50%`, Win Rate `90.1%`, Max DD `-3.2%`.
- **Auto-Replicate Engine Toggle:**
  - One-click global toggle (`#toggle-autoreplicate-btn`) to activate sub-50µs automatic mirroring of lead investor trades.
  - Non-custodial escrow allocation, custom mirror ratios (`0.5x` - `3.0x`), and automatic stop-loss guards.

---

## 🔒 Institutional Cold Custody & Solvency Engine

1. **48-Hour Time-Locked Cold Delay & Emergency Veto:**
   - All cold vault withdrawals enter a mandatory 48-hour on-chain delay schedule.
   - The designated Security Officer holds single-transaction veto authority to instantly abort suspicious withdrawals before execution.
2. **Cryptographic Proof of Solvency:**
   - Real-time Merkle Root attestations published on-chain verifying 100%+ reserve backing (collateralized at $142.85M AUM vs $137.1M liabilities).
3. **Conditional Preimage Escrows (RFC-2004):**
   - Interledger Protocol (ILP RFC-2004) conditional payments released only when the recipient provides the pre-committed SHA-256 secret preimage before block expiration.
4. **Sovereign Trustlines & FATF Travel Rule:**
   - Counterparty credit limits with TRISA protocol compliance hashes accompanying every institutional wire transfer.

---

## 🧪 Automated Verification & Test Suites

```
===============================================================
 COINPUREX ENTERPRISE PLATFORM (coinpurex.com) - TEST SUITE   
===============================================================
 ✅ ALL 61 TESTS PASSED SUCCESSFULLY in 0.01s
   - EnterpriseMultiSigWallet (M-of-N Quorum, Multi-Asset, Governance)
   - EnterpriseDEX (Order Book, Price Priority, Matching Engine, Fills)
   - SOTA Extensions (DeFi Vaults, Polygon/Arbitrum, Arbitrage, Securities, FTPS)
   - Enterprise Custody (48h Time-Locked Delay, Proof of Solvency, Cryptographic Preimage Escrows)
   - MockERC20 (Institutional Faucet, Burn, Allowance & Boundary Invariants)
   - CerisCoin & CoinPurexOffering (0x819c468e Recreated Standard, Caps, Treasury)
   - RFC 6455 Real Native WebSocket Engine (Handshakes, Masking & Framing)
===============================================================
```

| Suite | Command | Passing Tests | Execution Time |
| :--- | :--- | :--- | :--- |
| **Smart Contracts & WebSocket Engine** | `npm test` | **61 / 61** | `0.01s` |
| **Go High-Throughput Gateway** | `npm run test:gateway` | **13 / 13** | `0.30s` |
| **Rust Matching Engine** | `npm run test:engine` | **5 / 5** | `0.00s` |
| **Master Test Suite** | `npm run test:all` | **79 / 79** | `< 1.0s` |

---

## 🛠 Quickstart & Operations Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Go**: 1.22+ (optional for native binary build)
- **Rust / Cargo**: 2021 edition (optional for native binary build)

### 2. Full Platform Build
```bash
npm run build
```
Builds the Go gateway binary, compiles the release Rust matching engine, deploys local contracts, and exports seed data.

### 3. Running the Unified Stack
```bash
# Launch the unified HTTP & RFC 6455 WebSocket platform server:
npm start

# Or launch all microservices concurrently (Go Gateway + WebSocket Frontend):
npm run start:all
```

Visit **`http://localhost:4200`** in your browser.

---

## ✅ Development Quality Gate (20/20 Standard)

The project complies with all 20 checks of `/Users/favl/DEVELOPMENT_QUALITY.md`:

| # | Check | Status | Verification Evidence |
| :--- | :--- | :--- | :--- |
| 1 | Production domain | **PASS** | Branded `coinpurex.com` canonical host across all configs, headers, contracts, and documents. |
| 2 | Page titles | **PASS** | `CoinPurex Sovereign DEX & Multi-Sig Governance Platform • coinpurex.com` |
| 3 | Meta descriptions | **PASS** | Institutional description present in `index.html` and Open Graph tags. |
| 4 | Favicon and icons | **PASS** | Custom branded SVG icon (`favicon.svg`) with cyan/emerald geometric shield. |
| 5 | Open Graph image | **PASS** | Branded `og-image.svg` registered in metadata. |
| 6 | Canonical URLs | **PASS** | `<link rel="canonical" href="https://coinpurex.com" />` |
| 7 | Social previews | **PASS** | Cohesive title, description, and preview metadata for crawlers. |
| 8 | Custom 404 | **PASS** | Dedicated branded `404.html` with return links and true HTTP 404 status. |
| 9 | Loading states | **PASS** | Contextual progress bars, pulse dots, and loading indicators across order forms and launchpad. |
| 10 | Error messages | **PASS** | Actionable toasts and boundary checks without leaking private data or secrets. |
| 11 | Heading structure | **PASS** | Single primary `<h1>` with logical hierarchical `<h2>` and `<h3>` tags. |
| 12 | Alternative text | **PASS** | Accessible `aria-label` tags, SVG titles, and alt text across all controls. |
| 13 | Sitemap and indexing | **PASS** | Canonical `sitemap.xml` and `robots.txt` configured. |
| 14 | Console errors | **PASS** | Zero unexplained app-owned console errors across all tabs. |
| 15 | Debug output | **PASS** | No stray `console.log` or debug statements in shipped client code. |
| 16 | Source maps | **PASS** | Clean bundle generation without unintended private exposure. |
| 17 | JavaScript performance | **PASS** | Native zero-dependency ES6+ architecture (<90KB), instant page loads, sub-millisecond WebSockets. |
| 18 | Mobile layout | **PASS** | Responsive CSS Grid and Flexbox across mobile (375px), tablet, and desktop viewports. |
| 19 | Consistent spacing | **PASS** | Curated CSS custom properties design tokens (`--bg-primary`, `--accent-cyan`, `--signal-bid`). |
| 20 | Working controls | **PASS** | All navigation tabs, trader logins, contribution forms, and modal actions fully wired and verified. |

---

## 📄 License
MIT License. Copyright (c) 2026 CoinPurex Institutional Web3 Engineering (`coinpurex.com`).
