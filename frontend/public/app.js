/**
 * APEX ENTERPRISE PLATFORM - CLIENT APPLICATION
 * Combines Clean Precision Ergonomics with Institutional High-Density Telemetry.
 * Zero-dependency, native ES6+ interactive Web3 architecture.
 */

// --- Initial Seed & State Configuration ---
const PERSONAS = [
  { id: 'signer1', label: 'Signer 1 (Sec Admin)', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', role: 'Approver' },
  { id: 'signer2', label: 'Signer 2 (Risk Officer)', address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', role: 'Approver' },
  { id: 'signer3', label: 'Signer 3 (Treasury Exec)', address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', role: 'Approver' },
  { id: 'trader1', label: 'Trader Alpha (Maker)', address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', role: 'Trader' },
  { id: 'trader2', label: 'Trader Beta (Taker)', address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', role: 'Trader' }
];

const state = {
  currentTab: 'dex', // 'dex' | 'treasury' | 'telemetry'
  currentPersona: PERSONAS[0],
  activePair: 'BTC/DAI',
  orderType: 'LIMIT', // 'LIMIT' | 'MARKET'
  orderSide: 'BUY',   // 'BUY' | 'SELL'
  chartType: 'depth', // 'depth' | 'candles'
  chartTimeframe: '1H',
  
  // DEX Balances (trader internal balances)
  balances: {
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': { DAI: 250000, BTC: 5.5, ETH: 45.0, LINK: 1200 },
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC': { DAI: 150000, BTC: 2.0, ETH: 20.0, LINK: 800 },
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906': { DAI: 300000, BTC: 4.0, ETH: 35.0, LINK: 2000 },
    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65': { DAI: 500000, BTC: 12.0, ETH: 80.0, LINK: 5000 },
    '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc': { DAI: 450000, BTC: 8.5, ETH: 60.0, LINK: 4200 }
  },

  // Wallet Un-deposited Balances
  walletBalances: {
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': { ETH: 15.2, DAI: 50000, BTC: 1.0, LINK: 500 },
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC': { ETH: 8.5, DAI: 25000, BTC: 0.5, LINK: 250 },
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906': { ETH: 22.0, DAI: 75000, BTC: 2.0, LINK: 1000 },
    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65': { ETH: 50.0, DAI: 100000, BTC: 5.0, LINK: 3000 },
    '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc': { ETH: 35.0, DAI: 80000, BTC: 3.0, LINK: 2000 }
  },

  // DEX Order Books per pair
  pairs: {
    'BTC/DAI': {
      markPrice: 68450.00,
      change24h: 3.42,
      high24h: 69200.00,
      low24h: 67100.00,
      volume24h: 4218000,
      bids: [
        { id: 1, trader: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', price: 68420.00, amount: 1.25, total: 85525.00 },
        { id: 2, trader: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', price: 68380.00, amount: 2.50, total: 170950.00 },
        { id: 3, trader: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', price: 68310.00, amount: 4.10, total: 280071.00 },
        { id: 4, trader: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', price: 68250.00, amount: 5.75, total: 392437.50 },
        { id: 5, trader: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', price: 68100.00, amount: 8.20, total: 558420.00 }
      ],
      asks: [
        { id: 6, trader: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', price: 68480.00, amount: 1.10, total: 75328.00 },
        { id: 7, trader: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', price: 68520.00, amount: 2.80, total: 191856.00 },
        { id: 8, trader: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', price: 68590.00, amount: 3.90, total: 267501.00 },
        { id: 9, trader: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', price: 68650.00, amount: 6.20, total: 425630.00 },
        { id: 10, trader: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', price: 68780.00, amount: 9.50, total: 653410.00 }
      ]
    },
    'ETH/DAI': {
      markPrice: 3520.50,
      change24h: -1.18,
      high24h: 3590.00,
      low24h: 3480.00,
      volume24h: 8940000,
      bids: [
        { id: 11, trader: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', price: 3518.00, amount: 15.0, total: 52770.00 },
        { id: 12, trader: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', price: 3512.00, amount: 28.5, total: 100092.00 },
        { id: 13, trader: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', price: 3505.00, amount: 42.0, total: 147210.00 }
      ],
      asks: [
        { id: 14, trader: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', price: 3524.00, amount: 12.0, total: 42288.00 },
        { id: 15, trader: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', price: 3530.00, amount: 30.0, total: 105900.00 },
        { id: 16, trader: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', price: 3538.00, amount: 55.0, total: 194590.00 }
      ]
    },
    'LINK/DAI': {
      markPrice: 18.75,
      change24h: 5.62,
      high24h: 19.20,
      low24h: 17.60,
      volume24h: 1250000,
      bids: [
        { id: 17, trader: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', price: 18.70, amount: 850.0, total: 15895.00 },
        { id: 18, trader: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', price: 18.60, amount: 1500.0, total: 27900.00 }
      ],
      asks: [
        { id: 19, trader: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', price: 18.82, amount: 920.0, total: 17314.40 },
        { id: 20, trader: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', price: 18.95, amount: 2100.0, total: 39795.00 }
      ]
    }
  },

  recentTrades: [
    { tradeId: 104, ticker: 'BTC/DAI', side: 'BUY', price: 68450.00, amount: 0.85, date: '10:51:42' },
    { tradeId: 103, ticker: 'BTC/DAI', side: 'SELL', price: 68420.00, amount: 1.15, date: '10:50:18' },
    { tradeId: 102, ticker: 'BTC/DAI', side: 'BUY', price: 68440.00, amount: 0.50, date: '10:48:55' },
    { tradeId: 101, ticker: 'ETH/DAI', side: 'BUY', price: 3520.50, amount: 8.00, date: '10:47:12' },
    { tradeId: 100, ticker: 'LINK/DAI', side: 'BUY', price: 18.75, amount: 450.0, date: '10:45:04' }
  ],

  // Multi-Sig Treasury State
  treasury: {
    quorum: 2,
    signers: [
      { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', label: 'Signer 1 (Sec Admin)', role: 'Security Admin' },
      { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', label: 'Signer 2 (Risk Officer)', role: 'Risk Officer' },
      { address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', label: 'Signer 3 (Treasury Exec)', role: 'Treasury Executive' }
    ],
    reserves: {
      ETH: 245.5,
      DAI: 1250000,
      BTC: 14.25,
      LINK: 15400
    },
    proposals: [
      {
        id: 0,
        to: '0x976EA74026E72bbf5501020b994473cD304e8Bde',
        token: 'ETH',
        amount: 15.0,
        description: 'Apex Protocol Core Contributor Grant Q4',
        approvals: ['0x70997970C51812dc3A010C7d01b50e0d17dc79C8'],
        executed: false,
        cancelled: false,
        createdAt: '2026-10-22 14:30'
      },
      {
        id: 1,
        to: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        token: 'DAI',
        amount: 50000,
        description: 'Audit Retainer: OpenZeppelin Security Services',
        approvals: [
          '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
        ],
        executed: true,
        cancelled: false,
        createdAt: '2026-10-21 09:15'
      },
      {
        id: 2,
        to: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        token: 'LINK',
        amount: 2500,
        description: 'Chainlink Oracle Data Feeds Upkeep Fund',
        approvals: [],
        executed: false,
        cancelled: false,
        createdAt: '2026-10-23 08:00'
      }
    ]
  },

  // On-Chain Telemetry Log (Institutional Audit Stream)
  telemetryLogs: [
    { block: 19842011, event: 'DepositReceived', emitter: 'EnterpriseMultiSigWallet', details: '100.0 ETH deposited from 0x90F7...b906' },
    { block: 19842010, event: 'OrderMatched', emitter: 'EnterpriseDEX', details: 'Trade #104: 0.85 BTC @ 68450.00 DAI' },
    { block: 19842008, event: 'TransferApproved', emitter: 'EnterpriseMultiSigWallet', details: 'Proposal #0 approved by 0x7099...79C8' },
    { block: 19842005, event: 'OrderCreated', emitter: 'EnterpriseDEX', details: 'Limit BUY: 1.25 BTC @ 68420.00 DAI by 0x15d3...6A65' }
  ],

  // Auto-Replicate & Mirror Engine State
  autoReplicateActive: true,
  replicatedTradesCount: 142,
  replicatedVolumeUSD: 1248500,

  // Top 1% Global Popular Investors & Quantitative Fund Managers
  copyTraders: [
    {
      id: 'kvoss',
      name: 'Kaelen Voss',
      initials: 'KV',
      globalRank: 1,
      percentileRank: 'Top 0.1% Global Popular Investor',
      tier: 'Elite Pro Tier',
      autoReplicate: true,
      strategy: 'Voss Quant Macro Arbitrage',
      bio: 'Statistical arbitrage & cross-venue BTC/ETH high-frequency momentum.',
      roi12m: 148.65,
      sharpe: 3.42,
      winRate: 92.4,
      maxDrawdown: 3.8,
      aumUsd: 18400000,
      copiers: 4120,
      sparkline: 'M0,35 Q20,30 40,32 T80,22 T120,24 T160,15 T200,10 T240,6 T280,2'
    },
    {
      id: 'schen',
      name: 'Seraphina Chen',
      initials: 'SC',
      globalRank: 3,
      percentileRank: 'Top 0.2% Global Popular Investor',
      tier: 'Elite Pro Tier',
      autoReplicate: true,
      strategy: 'Apex Delta-Neutral Basis',
      bio: 'Funding rate arbitrage & perpetual basis delta-neutral hedging.',
      roi12m: 89.20,
      sharpe: 4.10,
      winRate: 91.2,
      maxDrawdown: 2.1,
      aumUsd: 14200000,
      copiers: 3580,
      sparkline: 'M0,36 Q25,32 50,28 T100,24 T150,18 T200,14 T250,8 T280,4'
    },
    {
      id: 'mbrody',
      name: 'Dr. Marcus Brody',
      initials: 'MB',
      globalRank: 7,
      percentileRank: 'Top 0.5% Global Popular Investor',
      tier: 'Elite Tier',
      autoReplicate: true,
      strategy: 'Deep Value On-Chain Liquidity',
      bio: 'RWA tokenized asset flows & cross-DEX liquidity extraction.',
      roi12m: 210.40,
      sharpe: 2.95,
      winRate: 88.5,
      maxDrawdown: 4.9,
      aumUsd: 9800000,
      copiers: 2890,
      sparkline: 'M0,38 Q30,34 60,35 T110,25 T160,20 T210,12 T250,5 T280,1'
    },
    {
      id: 'erostova',
      name: 'Elena Rostova',
      initials: 'ER',
      globalRank: 11,
      percentileRank: 'Top 0.9% Global Popular Investor',
      tier: 'Elite Tier',
      autoReplicate: true,
      strategy: 'L2 Velocity Alpha',
      bio: 'Layer-2 Rollup & Optimistic cross-venue atomic flash loan arbitrage.',
      roi12m: 64.50,
      sharpe: 3.88,
      winRate: 94.1,
      maxDrawdown: 2.8,
      aumUsd: 5800000,
      copiers: 2250,
      sparkline: 'M0,34 Q20,32 45,29 T90,22 T140,19 T190,14 T240,9 T280,3'
    }
  ],

  // User's active copied positions
  copiedPositions: [
    {
      id: 'cop-1',
      traderId: 'kvoss',
      traderName: 'Kaelen Voss',
      strategy: 'Voss Quant Macro Arbitrage',
      allocatedCapital: 10000,
      unrealizedPnl: 1420.50,
      unrealizedPnlPct: 14.21,
      mirrorRatio: '1.0x',
      stopLoss: '10%',
      autoReplicate: true
    },
    {
      id: 'cop-2',
      traderId: 'schen',
      traderName: 'Seraphina Chen',
      strategy: 'Apex Delta-Neutral Basis',
      allocatedCapital: 5000,
      unrealizedPnl: 485.20,
      unrealizedPnlPct: 9.70,
      mirrorRatio: '0.75x',
      stopLoss: '5%',
      autoReplicate: true
    }
  ],

  // Live Mirrored Trades Stream
  mirroredTrades: [
    { time: '12:14:02', manager: 'Kaelen Voss', pair: 'BTC/DAI', action: 'BUY', amount: '0.45 BTC', userFilled: '$30,802.50', profit: '+$342.10' },
    { time: '12:12:35', manager: 'Seraphina Chen', pair: 'ETH/DAI', action: 'SELL', amount: '4.20 ETH', userFilled: '$14,786.10', profit: '+$124.50' },
    { time: '12:09:18', manager: 'Dr. Marcus Brody', pair: 'LINK/DAI', action: 'BUY', amount: '250 LINK', userFilled: '$4,687.50', profit: '+$68.20' },
    { time: '12:06:50', manager: 'Elena Rostova', pair: 'BTC/DAI', action: 'BUY', amount: '0.20 BTC', userFilled: '$13,690.00', profit: '+$182.40' }
  ],

  // Institutional Cold Custody & Preimage Escrow Suite
  custodyVault: {
    proofOfSolvency: {
      merkleRoot: '0x8fa3d9b4c0e172a694bf1529d81e053a479b8c2e',
      reservesUsd: 142850000,
      liabilitiesUsd: 137100000,
      collateralRatio: 104.2,
      lastAudit: '2026-10-23 11:30 UTC',
      status: 'VERIFIED_SOLVENT'
    },
    withdrawals: [
      {
        id: 101,
        asset: 'USDC',
        destination: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        amount: 250000,
        requestTime: Date.now() - (24 * 3600 * 1000), // 24h passed
        executeAfter: Date.now() + (24 * 3600 * 1000), // 24h left
        hoursRemaining: 23.8,
        status: 'PENDING_TIMELOCK',
        travelRuleHash: 'trisa:vasp:cb-custody-us-ny:98a2f4c1'
      },
      {
        id: 102,
        asset: 'WBTC',
        destination: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        amount: 5.0,
        requestTime: Date.now() - (47 * 3600 * 1000),
        executeAfter: Date.now() + (1 * 3600 * 1000),
        hoursRemaining: 0.9,
        status: 'READY_TO_EXECUTE',
        travelRuleHash: 'trisa:vasp:cb-prime-us-de:32b9f011'
      }
    ],
    xrplEscrows: [
      {
        id: 'esc-701',
        asset: 'USDs / DAI',
        recipient: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        amount: 150000,
        conditionHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        expiresIn: '2 hours 45 min',
        claimed: false
      },
      {
        id: 'esc-702',
        asset: 'WETH',
        recipient: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        amount: 25.0,
        conditionHash: 'sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        expiresIn: '5 hours 12 min',
        claimed: false
      }
    ],
    xrplTrustlines: [
      { token: 'USDs (Sovereign USD)', issuer: 'Universal Settlement Gateway', limit: 10000000, active: true },
      { token: 'DAI (Decentralized)', issuer: 'Apex Treasury Multi-Sig', limit: 50000000, active: true },
      { token: 'WBTC (Institutional)', issuer: 'Qualified Custody Gateway', limit: 250, active: true },
      { token: 'WETH (Institutional)', issuer: 'Primary Institutional Gateway', limit: 3500, active: true }
    ]
  },

  // Market Breaking News Feed
  newsFeed: [
    {
      id: 'news-1',
      category: 'REGULATION',
      title: 'Regulatory Framework Grants Accelerated Status to Qualified Institutional On-Chain DEX Settlement Platforms',
      time: '4 mins ago',
      source: 'Institutional Wire',
      impact: 'HIGH IMPACT',
      summary: 'Regulators publish revised custody and settlement framework allowing cryptographic 48-hour time locks and TRISA Travel Rule compliance for institutional clearing.'
    },
    {
      id: 'news-2',
      category: 'LIQUIDITY',
      title: 'Cross-Chain Conditional Preimage Escrows Surpass $1.2B in Monthly Settlement Volume',
      time: '18 mins ago',
      source: 'Global Financial Wire',
      impact: 'BULLISH',
      summary: 'Cryptographic preimage escrows establish seamless liquidity routing between Layer-2 rollups, sovereign stable assets, and institutional treasuries.'
    },
    {
      id: 'news-3',
      category: 'DEFI',
      title: 'Apex Yield Vault Total Assets Exceed $80M Following Automated Compound Harvest',
      time: '35 mins ago',
      source: 'Reserve Analytics',
      impact: 'GROWTH',
      summary: 'Institutional ERC-4626 multi-asset yield vaults complete scheduled weekly harvest, raising net annual percentage yield to 8.45% on USDC/DAI reserves.'
    },
    {
      id: 'news-4',
      category: 'ARBITRAGE',
      title: 'Atomic Layer-2 Cross-Venue Spread Engine Executes $22M Without Slippage',
      time: '1 hour ago',
      source: 'Sequencer Network Intelligence',
      impact: 'TECHNICAL',
      summary: 'Microsecond cross-venue flash loan arbitrage engine delivers consistent 28 bps spread captures across order book and AMM liquidity pools.'
    }
  ]
};

// --- Helper Utilities ---
function formatAddress(addr) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function formatUSD(num) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

function formatNumber(num, decimals = 2) {
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : '⚠'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function logTelemetry(event, emitter, details) {
  const log = {
    block: 19842012 + state.telemetryLogs.length,
    event,
    emitter,
    details,
    timestamp: new Date().toLocaleTimeString()
  };
  state.telemetryLogs.unshift(log);
  renderTelemetry();
}

// --- Render Navigation & Header ---
function initNavigation() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentTab = btn.dataset.tab;
      renderAppViews();
    });
  });

  // Persona Switcher
  const select = document.getElementById('persona-select');
  if (select) {
    select.innerHTML = PERSONAS.map(p => `
      <option value="${p.id}" ${p.id === state.currentPersona.id ? 'selected' : ''}>
        ${p.label} (${formatAddress(p.address)})
      </option>
    `).join('');

    select.addEventListener('change', (e) => {
      const selected = PERSONAS.find(p => p.id === e.target.value);
      if (selected) {
        state.currentPersona = selected;
        showToast(`Active persona: ${selected.label}`, 'success');
        renderHeader();
        renderOrderForm();
        renderUserOrders();
        renderTreasury();
      }
    });
  }

  // Connect Web3 / MetaMask Button
  const connectBtn = document.getElementById('connect-web3-btn');
  if (connectBtn) {
    connectBtn.addEventListener('click', async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts.length > 0) {
            const extPersona = {
              id: 'metamask',
              label: 'MetaMask Active',
              address: accounts[0],
              role: 'External Web3'
            };
            PERSONAS.push(extPersona);
            state.currentPersona = extPersona;
            showToast(`Connected MetaMask: ${formatAddress(accounts[0])}`, 'success');
            initNavigation();
            renderHeader();
          }
        } catch (err) {
          showToast('MetaMask connection rejected', 'error');
        }
      } else {
        showToast('MetaMask not detected. Using simulated institutional personas.', 'success');
      }
    });
  }

  // Modals Toggles
  const faucetBtn = document.getElementById('faucet-btn');
  if (faucetBtn) {
    faucetBtn.addEventListener('click', () => openModal('faucet-modal'));
  }

  const depositBtn = document.getElementById('deposit-drawer-btn');
  if (depositBtn) {
    depositBtn.addEventListener('click', () => openModal('deposit-modal'));
  }
}

function renderHeader() {
  const badge = document.getElementById('active-persona-badge');
  if (badge) {
    badge.textContent = `${state.currentPersona.label} • ${formatAddress(state.currentPersona.address)}`;
  }
}

function renderAppViews() {
  const views = {
    'dex': document.getElementById('dex-view'),
    'copytrading': document.getElementById('copytrading-view'),
    'custody': document.getElementById('custody-view'),
    'treasury': document.getElementById('treasury-view'),
    'defi': document.getElementById('defi-view'),
    'arbitrage': document.getElementById('arbitrage-view'),
    'securities': document.getElementById('securities-view'),
    'news': document.getElementById('news-view'),
    'telemetry': document.getElementById('telemetry-view')
  };

  Object.entries(views).forEach(([tab, el]) => {
    if (!el) return;
    if (tab === state.currentTab) {
      el.style.display = (tab === 'dex' ? 'grid' : 'flex');
    } else {
      el.style.display = 'none';
    }
  });

  // Call active renderer
  if (state.currentTab === 'dex') renderDEX();
  else if (state.currentTab === 'copytrading') renderCopyTrading();
  else if (state.currentTab === 'custody') renderCustody();
  else if (state.currentTab === 'treasury') renderTreasury();
  else if (state.currentTab === 'defi') renderDeFi();
  else if (state.currentTab === 'arbitrage') renderArbitrage();
  else if (state.currentTab === 'securities') renderSecurities();
  else if (state.currentTab === 'news') renderNewsFeed();
  else if (state.currentTab === 'telemetry') renderTelemetry();
}

// --- Render Quantitative Copy Trading ---
function renderCopyTrading() {
  // Wire Auto-Replicate Control Bar Toggle
  const toggleBtn = document.getElementById('toggle-autoreplicate-btn');
  if (toggleBtn && !toggleBtn.dataset.wired) {
    toggleBtn.dataset.wired = 'true';
    toggleBtn.addEventListener('click', () => {
      state.autoReplicateActive = !state.autoReplicateActive;
      updateAutoReplicateUI();
      showToast(
        `Auto-Replicate & Mirror Engine ${state.autoReplicateActive ? 'ACTIVATED (Real-time sub-50µs mirroring)' : 'PAUSED'}`,
        state.autoReplicateActive ? 'success' : 'warning'
      );
      logTelemetry(
        'AutoReplicateStateToggled',
        'ApexCopyEngine',
        `Auto-Replicate Engine status changed to: ${state.autoReplicateActive ? 'ACTIVE' : 'PAUSED'}`
      );
    });
  }
  updateAutoReplicateUI();

  const grid = document.getElementById('traders-leaderboard-grid');
  if (grid) {
    grid.innerHTML = state.copyTraders.map(t => `
      <div class="trader-card" id="trader-card-${t.id}">
        <!-- Top 1% Global Investor Rank Banner -->
        <div class="trader-rank-banner">
          <span>🏆 #${t.globalRank} GLOBAL RANK</span>
          <span>${t.percentileRank.toUpperCase()}</span>
          <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); font-size: 0.65rem;">${t.tier}</span>
        </div>

        <div class="trader-header">
          <div class="trader-profile">
            <div class="trader-avatar">${t.initials}</div>
            <div>
              <div style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary);">${t.name}</div>
              <div style="font-size: 0.72rem; color: var(--accent-cyan); font-weight: 600;">${t.strategy}</div>
            </div>
          </div>
          <span class="trader-badge">VERIFIED QUANT</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="trader-autoreplicate-badge">
            <span class="pulse-active" style="width: 6px; height: 6px; border-radius: 50%; background: var(--signal-bid); display: inline-block;"></span>
            ⚡ AUTO-REPLICATE &amp; MIRROR READY (&lt;50µs)
          </span>
          <span class="mono" style="font-size: 0.68rem; color: var(--accent-cyan);">Slippage &lt;0.05%</span>
        </div>

        <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">
          ${t.bio}
        </p>

        <!-- PnL Sparkline SVG -->
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.25rem;">
            <span>12M Performance Trajectory</span>
            <span style="color: var(--signal-bid); font-weight: 700;">+${t.roi12m}%</span>
          </div>
          <svg class="sparkline-svg" viewBox="0 0 280 40">
            <path d="${t.sparkline}" />
          </svg>
        </div>

        <div class="trader-metrics-row">
          <div class="trader-metric">
            <span class="trader-metric-label">Sharpe</span>
            <span class="trader-metric-val" style="color: var(--signal-bid);">${t.sharpe}</span>
          </div>
          <div class="trader-metric">
            <span class="trader-metric-label">Win Rate</span>
            <span class="trader-metric-val">${t.winRate}%</span>
          </div>
          <div class="trader-metric">
            <span class="trader-metric-label">Max DD</span>
            <span class="trader-metric-val" style="color: var(--signal-warning);">${t.maxDrawdown}%</span>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted);">
          <span>AUM: <strong style="color: var(--text-primary);">${formatUSD(t.aumUsd)}</strong></span>
          <span>Copiers: <strong style="color: var(--text-primary);">${t.copiers.toLocaleString()}</strong></span>
        </div>

        <button class="btn-execute buy copy-trader-btn" data-trader="${t.id}" style="margin-top: 0.25rem;">
          ⚡ Auto-Replicate &amp; Mirror (${t.name.split(' ')[0]})
        </button>
      </div>
    `).join('');

    // Attach copy buttons
    grid.querySelectorAll('.copy-trader-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const traderId = e.currentTarget.dataset.trader;
        const trader = state.copyTraders.find(t => t.id === traderId);
        if (trader) {
          openCopyTraderModal(trader);
        }
      });
    });
  }

  // Copied Positions
  const tbody = document.getElementById('copied-positions-tbody');
  if (tbody) {
    if (state.copiedPositions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No active copied portfolios. Allocate capital to a quantitative manager above.</td></tr>`;
    } else {
      tbody.innerHTML = state.copiedPositions.map(p => `
        <tr>
          <td><strong style="color: var(--text-primary);">${p.traderName}</strong></td>
          <td><span style="font-size: 0.75rem; color: var(--accent-cyan);">${p.strategy}</span></td>
          <td class="mono font-bold">${formatUSD(p.allocatedCapital)}</td>
          <td class="mono font-bold" style="color: var(--signal-bid);">
            +${formatUSD(p.unrealizedPnl)} (+${p.unrealizedPnlPct}%)
          </td>
          <td>
            <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: var(--accent-cyan);">${p.mirrorRatio}</span>
            ${p.autoReplicate !== false ? '<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--signal-bid); margin-left: 0.25rem;">⚡ AUTO</span>' : ''}
          </td>
          <td><span class="badge" style="background: rgba(245, 158, 11, 0.15); color: var(--signal-warning);">${p.stopLoss} SL</span></td>
          <td>
            <button class="btn-secondary stop-copy-btn" data-id="${p.id}" style="padding: 0.25rem 0.6rem; font-size: 0.72rem; color: var(--signal-ask); border-color: rgba(244, 63, 94, 0.3);">
              Close Escrow
            </button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.stop-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          stopCopyPosition(id);
        });
      });
    }
  }

  // Mirrored Trades Stream
  const feed = document.getElementById('mirrored-stream-feed');
  if (feed) {
    feed.innerHTML = state.mirroredTrades.map(m => `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.6rem; margin-bottom: 0.5rem; font-size: 0.75rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
          <span style="font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 0.35rem;">
            <span class="badge bid" style="font-size: 0.6rem; padding: 0.1rem 0.3rem;">⚡ AUTO</span>
            ${m.manager}
          </span>
          <span class="mono" style="color: var(--text-muted); font-size: 0.68rem;">${m.time}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>
            <span class="badge ${m.action === 'BUY' ? 'bid' : 'ask'}" style="font-size: 0.65rem;">${m.action}</span>
            <strong style="margin-left: 0.3rem;">${m.pair}</strong> (${m.amount})
          </span>
          <div style="text-align: right;">
            <span class="mono" style="color: var(--signal-bid); font-weight: 700;">${m.profit}</span>
            <div class="mono" style="font-size: 0.65rem; color: var(--accent-cyan);">&lt;45µs match</div>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// --- Render Cold Custody & Cryptographic Escrows ---
function renderCustody() {
  const reqList = document.getElementById('active-vault-requests-list');
  if (reqList) {
    reqList.innerHTML = state.custodyVault.withdrawals.map(w => `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div>
            <strong style="color: var(--text-primary); font-size: 0.9rem;">#REQ-${w.id}: ${w.amount} ${w.asset}</strong>
            <div class="mono" style="font-size: 0.7rem; color: var(--text-muted);">To: ${formatAddress(w.destination)}</div>
          </div>
          <span class="countdown-clock">${w.hoursRemaining > 0 ? `${w.hoursRemaining.toFixed(1)}h LOCK` : 'UNLOCKED'}</span>
        </div>
        <div class="mono" style="font-size: 0.68rem; color: var(--accent-cyan); margin-bottom: 0.5rem;">
          TRISA Hash: ${w.travelRuleHash}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: var(--signal-warning);">
            ${w.status}
          </span>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn-secondary abort-vault-btn" data-id="${w.id}" style="padding: 0.25rem 0.6rem; font-size: 0.72rem; color: var(--signal-ask); border-color: rgba(244, 63, 94, 0.3);">
              Emergency Abort
            </button>
            ${w.hoursRemaining <= 0 ? `
              <button class="btn-execute buy exec-vault-btn" data-id="${w.id}" style="padding: 0.25rem 0.6rem; font-size: 0.72rem;">
                Execute Cold Withdrawal
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');

    reqList.querySelectorAll('.abort-vault-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id, 10);
        abortVaultRequest(id);
      });
    });
  }

  // XRPL Escrows
  const escList = document.getElementById('xrpl-escrows-list');
  if (escList) {
    escList.innerHTML = state.custodyVault.xrplEscrows.map(e => `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.6rem; font-size: 0.75rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
          <strong style="color: var(--text-primary);">${e.id}: ${e.amount} ${e.asset}</strong>
          <span style="color: var(--signal-bid); font-weight: 700;">Expires: ${e.expiresIn}</span>
        </div>
        <div class="mono" style="font-size: 0.68rem; color: var(--text-muted); margin-bottom: 0.4rem; word-break: break-all;">
          Condition: ${e.conditionHash}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="mono" style="color: var(--accent-cyan); font-size: 0.7rem;">Recipient: ${formatAddress(e.recipient)}</span>
          <button class="btn-secondary claim-escrow-btn" data-id="${e.id}" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;">
            Claim Preimage
          </button>
        </div>
      </div>
    `).join('');

    escList.querySelectorAll('.claim-escrow-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        claimXrplEscrow(id);
      });
    });
  }

  // XRPL Trustlines
  const trustList = document.getElementById('xrpl-trustlines-list');
  if (trustList) {
    trustList.innerHTML = state.custodyVault.xrplTrustlines.map(t => `
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.6rem; font-size: 0.75rem;">
        <div>
          <div style="font-weight: 700; color: var(--text-primary);">${t.token}</div>
          <div style="font-size: 0.68rem; color: var(--text-muted);">Issuer: ${t.issuer}</div>
        </div>
        <div style="text-align: right;">
          <div class="mono" style="font-weight: 800; color: var(--accent-cyan);">Limit: ${t.limit.toLocaleString()}</div>
          <span class="badge bid" style="font-size: 0.65rem;">ACTIVE TRUSTLINE</span>
        </div>
      </div>
    `).join('');
  }
}

// --- Render DeFi & GameFi ---
function renderDeFi() {
  // Built-in cards are structured in index.html; wire interactive buttons
  const harvestBtn = document.getElementById('harvest-vault-btn');
  if (harvestBtn && !harvestBtn.dataset.wired) {
    harvestBtn.dataset.wired = 'true';
    harvestBtn.addEventListener('click', () => {
      showToast('Automated ERC-4626 compound harvest executed: +$14,280 yield distributed to vault shares', 'success');
      logTelemetry('YieldHarvested', 'ApexDeFiVault', '+$14,280 compounded to LP shares');
    });
  }
}

// --- Render Arbitrage & L2 ---
function renderArbitrage() {
  const flashLoanBtn = document.getElementById('exec-flash-arb-btn');
  if (flashLoanBtn && !flashLoanBtn.dataset.wired) {
    flashLoanBtn.dataset.wired = 'true';
    flashLoanBtn.addEventListener('click', () => {
      showToast('Flash Loan Arbitrage executed across Layer-2 Sequencer & AMM: 44 bps captured, net profit +$2,450 DAI', 'success');
      logTelemetry('FlashLoanArbExecuted', 'ApexArbitrageEngine', 'Flash loan 500,000 DAI -> 44 bps spread captured');
    });
  }

  const netContainer = document.getElementById('crosschain-networks-container');
  if (netContainer) {
    const networks = [
      { name: 'Layer-2 ZK-Rollup Relay', chainId: 'EVM 324', status: 'ACTIVE', latency: '12ms', tvl: '$48.2M', tag: 'ZERO KNOWLEDGE' },
      { name: 'Optimistic Execution Layer', chainId: 'EVM 42161', status: 'ACTIVE', latency: '18ms', tvl: '$94.6M', tag: 'OPTIMISTIC ROLLUP' },
      { name: 'Sovereign High-Throughput L2', chainId: 'EVM 8453', status: 'ACTIVE', latency: '8ms', tvl: '$112.5M', tag: 'FAST FINALITY' },
      { name: 'Multi-Chain PoS Scaling Bridge', chainId: 'EVM 137', status: 'ACTIVE', latency: '24ms', tvl: '$35.1M', tag: 'CHECKPOINT SYNC' }
    ];
    netContainer.innerHTML = networks.map(net => `
      <div class="sector-card" style="padding: 1.1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary);">${net.name}</span>
          <span class="badge bid">${net.status}</span>
        </div>
        <div style="font-size: 0.72rem; color: var(--accent-cyan); font-family: var(--font-mono);">${net.chainId} • ${net.tag}</div>
        <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.8rem; background: var(--bg-surface); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <div><span style="color: var(--text-muted); font-size: 0.7rem;">Bridge Latency</span> <div class="mono" style="font-weight: 700; color: var(--signal-bid);">${net.latency}</div></div>
          <div><span style="color: var(--text-muted); font-size: 0.7rem;">Bridge Liquidity</span> <div class="mono" style="font-weight: 700;">${net.tvl}</div></div>
        </div>
      </div>
    `).join('');
  }

  const spreadsBody = document.getElementById('arbitrage-spreads-body');
  if (spreadsBody) {
    const opps = [
      { pair: 'BTC/DAI', venueA: '$68,450.00 (Apex)', venueB: '$68,690.00 (L2 AMM)', spread: '+35 bps', profit: '+$4,820.00' },
      { pair: 'ETH/DAI', venueA: '$3,520.00 (Apex)', venueB: '$3,535.50 (L2 AMM)', spread: '+44 bps', profit: '+$2,450.00' },
      { pair: 'SOL/DAI', venueA: '$182.40 (Apex)', venueB: '$183.15 (L2 AMM)', spread: '+41 bps', profit: '+$1,280.00' },
      { pair: 'LINK/DAI', venueA: '$18.75 (Apex)', venueB: '$18.82 (L2 AMM)', spread: '+37 bps', profit: '+$640.00' }
    ];
    spreadsBody.innerHTML = opps.map(o => `
      <tr>
        <td style="font-weight: 700;">${o.pair}</td>
        <td class="mono">${o.venueA}</td>
        <td class="mono">${o.venueB}</td>
        <td class="mono" style="color: var(--signal-bid); font-weight: 700;">${o.spread}</td>
        <td class="mono" style="color: var(--signal-bid); font-weight: 700;">${o.profit}</td>
        <td>
          <button class="btn-primary" style="padding: 0.3rem 0.65rem; font-size: 0.72rem;" onclick="showToast('Executed atomic flash loan arbitrage on ${o.pair}: ${o.profit} net profit', 'success'); logTelemetry('FlashArbExecuted', 'ApexArb', 'Spread: ${o.spread} on ${o.pair}');">
            Execute Arb
          </button>
        </td>
      </tr>
    `).join('');
  }
}

// --- Render Tokenized RWAs & Clearing ---
function renderSecurities() {
  const sftpClearBtn = document.getElementById('sftp-batch-clear-btn');
  if (sftpClearBtn && !sftpClearBtn.dataset.wired) {
    sftpClearBtn.dataset.wired = 'true';
    sftpClearBtn.addEventListener('click', () => {
      showToast('Batch Clearing Gateway: 450 ISO-20022 institutional orders settled on-chain ($15.8M)', 'success');
      logTelemetry('BatchSettled', 'ApexSettlementGateway', '450 trades settled via cryptographic clearing gateway');
    });
  }

  const rwaContainer = document.getElementById('securities-rwa-container');
  if (rwaContainer) {
    const rwas = [
      { ticker: 'US-TREASURY-01', name: 'Tokenized 3-Month US Treasury Bills', yield: '5.18% APY', standard: 'ERC-3643 KYC/AML', issuance: '$50,000,000', custodian: 'Tier-1 Depository Trust' },
      { ticker: 'PRIME-RE-04', name: 'Prime Commercial Real Estate Token', yield: '7.40% Net Dist.', standard: 'Reg D / Reg S Accredited', issuance: '$32,500,000', custodian: 'Regulated Title & Escrow Corp' },
      { ticker: 'CORP-CREDIT-AA', name: 'Corporate Floating Rate Credit Facility', yield: '8.85% Benchmark', standard: 'Institutional Qualified Buyer', issuance: '$75,000,000', custodian: 'Qualified Custody Clearing Bank' }
    ];
    rwaContainer.innerHTML = rwas.map(r => `
      <div class="sector-card" style="padding: 1.15rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-weight: 800; font-size: 1rem; color: var(--text-primary);">${r.ticker}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem;">${r.name}</div>
          </div>
          <span class="badge bid">${r.yield}</span>
        </div>
        <div style="background: var(--bg-surface); padding: 0.6rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin: 0.75rem 0; font-size: 0.75rem; display: flex; flex-direction: column; gap: 0.3rem;">
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-muted);">Standard:</span> <span>${r.standard}</span></div>
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-muted);">Total Pool:</span> <span class="mono" style="font-weight: 700;">${r.issuance}</span></div>
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-muted);">Custodian:</span> <span>${r.custodian}</span></div>
        </div>
        <button class="btn-secondary" style="width: 100%; justify-content: center;" onclick="showToast('KYC credential validated for ${r.ticker}. Allocation order staged.', 'success'); logTelemetry('RWAAllocated', 'ApexRWA', 'Allocated: ${r.ticker}');">
          Subscribe Institutional Allocation
        </button>
      </div>
    `).join('');
  }

  const batchesBody = document.getElementById('ftps-batches-body');
  if (batchesBody) {
    const batches = [
      { id: 'BATCH-20261023-01', proof: '0x3a9f...c81e', uri: 'sftp://clearing.gateway.internal/eod/b-01.xml', trades: '1,240', vol: '$48,250,000', status: 'SETTLED' },
      { id: 'BATCH-20261023-02', proof: '0x7b12...49da', uri: 'sftp://clearing.gateway.internal/eod/b-02.xml', trades: '890', vol: '$32,100,000', status: 'SETTLED' },
      { id: 'BATCH-20261023-03', proof: '0x9e44...f231', uri: 'sftp://clearing.gateway.internal/eod/b-03.xml', trades: '450', vol: '$15,800,000', status: 'PENDING' }
    ];
    batchesBody.innerHTML = batches.map(b => `
      <tr>
        <td class="mono" style="font-weight: 700;">${b.id}</td>
        <td class="mono" style="color: var(--accent-cyan);">${b.proof}</td>
        <td class="mono" style="font-size: 0.72rem; color: var(--text-muted);">${b.uri}</td>
        <td class="mono">${b.trades}</td>
        <td class="mono" style="font-weight: 700;">${b.vol}</td>
        <td><span class="badge ${b.status === 'SETTLED' ? 'bid' : 'ask'}">${b.status}</span></td>
      </tr>
    `).join('');
  }
}

// --- Render News Feed & Live Breaking Ticker ---
function renderNewsFeed() {
  const list = document.getElementById('news-articles-list');
  if (list) {
    list.innerHTML = state.newsFeed.map(n => `
      <article class="news-item" id="${n.id}">
        <div class="news-meta">
          <span class="news-tag">${n.category}</span>
          <span style="font-size: 0.72rem; color: var(--text-muted);">${n.time} • ${n.source}</span>
          <span class="badge ${n.impact === 'HIGH IMPACT' || n.impact === 'BULLISH' ? 'bid' : 'ask'}" style="margin-left: auto;">
            ${n.impact}
          </span>
        </div>
        <h3 class="news-title" style="margin-top: 0.4rem; font-size: 1.05rem;">${n.title}</h3>
        <p class="news-summary" style="margin-top: 0.4rem;">${n.summary}</p>
      </article>
    `).join('');
  }
}

function renderLiveNewsTicker() {
  const track = document.getElementById('live-news-ticker-track');
  if (track) {
    track.innerHTML = state.newsFeed.map(n => `
      <div class="ticker-news-bullet">
        <span class="ticker-tag">${n.category}</span>
        <span>${n.title}</span>
      </div>
    `).join('');
  }
}

// --- Interactive Copy Trading Handlers ---
let activeSelectedTrader = null;

function openCopyTraderModal(trader) {
  activeSelectedTrader = trader;
  const avatar = document.getElementById('modal-trader-avatar');
  const name = document.getElementById('modal-trader-name');
  const strategy = document.getElementById('modal-trader-strategy');
  const rank = document.getElementById('modal-trader-rank');
  if (avatar) avatar.textContent = trader.initials;
  if (name) name.textContent = trader.name;
  if (strategy) strategy.textContent = trader.strategy;
  if (rank) rank.textContent = `🏆 #${trader.globalRank} Global Rank • ${trader.percentileRank} (${trader.tier})`;
  openModal('copy-trader-modal');
}

function stopCopyPosition(id) {
  const posIndex = state.copiedPositions.findIndex(p => p.id === id);
  if (posIndex !== -1) {
    const pos = state.copiedPositions[posIndex];
    state.copiedPositions.splice(posIndex, 1);
    showToast(`Closed mirror escrow for ${pos.traderName}. Returned $${pos.allocatedCapital} + $${pos.unrealizedPnl} profit.`, 'success');
    logTelemetry('CopyEscrowClosed', 'ApexCopyEngine', `Mirror position closed for ${pos.traderName} (+$${pos.unrealizedPnl})`);
    renderCopyTrading();
  }
}

function abortVaultRequest(id) {
  const req = state.custodyVault.withdrawals.find(w => w.id === id);
  if (req) {
    req.status = 'ABORTED_BY_SECURITY';
    req.hoursRemaining = 0;
    showToast(`Emergency abort confirmed by Security Officer for Request #${id}`, 'success');
    logTelemetry('WithdrawalAborted', 'ApexCustodyVault', `Emergency abort by Security Officer: Request #${id}`);
    renderCustody();
  }
}

function claimXrplEscrow(id) {
  const esc = state.custodyVault.xrplEscrows.find(e => e.id === id);
  if (esc) {
    esc.claimed = true;
    showToast(`Valid SHA-256 preimage verified! Claimed ${esc.amount} ${esc.asset}`, 'success');
    logTelemetry('EscrowPreimageClaimed', 'ApexCustodyVault', `SHA-256 preimage matched for ${id}: ${esc.amount} ${esc.asset}`);
    state.custodyVault.xrplEscrows = state.custodyVault.xrplEscrows.filter(e => e.id !== id);
    renderCustody();
  }
}

// --- Render DEX Terminal ---
function renderDEX() {
  renderTickerBar();
  renderOrderBook();
  renderChart();
  renderOrderForm();
  renderTradeHistory();
  renderUserOrders();
}

function renderTickerBar() {
  const pairData = state.pairs[state.activePair];
  if (!pairData) return;

  const markEl = document.getElementById('ticker-mark-price');
  const changeEl = document.getElementById('ticker-change');
  const highEl = document.getElementById('ticker-high');
  const lowEl = document.getElementById('ticker-low');
  const volEl = document.getElementById('ticker-volume');

  if (markEl) markEl.textContent = formatUSD(pairData.markPrice);
  if (changeEl) {
    changeEl.textContent = `${pairData.change24h >= 0 ? '+' : ''}${pairData.change24h.toFixed(2)}%`;
    changeEl.className = `metric-value ${pairData.change24h >= 0 ? 'positive' : 'negative'}`;
  }
  if (highEl) highEl.textContent = formatUSD(pairData.high24h);
  if (lowEl) lowEl.textContent = formatUSD(pairData.low24h);
  if (volEl) volEl.textContent = formatUSD(pairData.volume24h);

  // Pair selector buttons
  const container = document.getElementById('pair-selector-btns');
  if (container) {
    container.innerHTML = Object.keys(state.pairs).map(pair => `
      <button class="pair-btn ${pair === state.activePair ? 'active' : ''}" data-pair="${pair}">
        ${pair}
      </button>
    `).join('');

    container.querySelectorAll('.pair-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activePair = btn.dataset.pair;
        renderDEX();
      });
    });
  }
}

function renderOrderBook() {
  const pairData = state.pairs[state.activePair];
  if (!pairData) return;

  const baseSymbol = state.activePair.split('/')[0];
  const asksTable = document.getElementById('order-book-asks');
  const bidsTable = document.getElementById('order-book-bids');
  const spreadEl = document.getElementById('order-book-spread');

  // Compute maximum cumulative volume for depth percentage bars
  const maxAskTotal = pairData.asks.reduce((sum, a) => sum + (a.amount * a.price), 0) || 1;
  const maxBidTotal = pairData.bids.reduce((sum, b) => sum + (b.amount * b.price), 0) || 1;

  // Render Asks (reversed so lowest ask is at bottom near spread)
  if (asksTable) {
    const reversedAsks = [...pairData.asks].reverse();
    asksTable.innerHTML = reversedAsks.map(ask => {
      const pct = Math.min(100, Math.max(10, (ask.total / maxAskTotal) * 100));
      return `
        <tr class="order-book-row ask" onclick="populateOrderPrice(${ask.price})">
          <td>${formatNumber(ask.price, 2)}</td>
          <td>${formatNumber(ask.amount, 4)}</td>
          <td>${formatNumber(ask.total, 2)}</td>
          <div class="depth-bar ask" style="width: ${pct}%"></div>
        </tr>
      `;
    }).join('');
  }

  // Spread calculation
  if (spreadEl && pairData.asks.length > 0 && pairData.bids.length > 0) {
    const lowestAsk = pairData.asks[0].price;
    const highestBid = pairData.bids[0].price;
    const spreadVal = lowestAsk - highestBid;
    const spreadPct = (spreadVal / lowestAsk) * 100;
    spreadEl.innerHTML = `
      <span>SPREAD</span>
      <span class="mono">${formatNumber(spreadVal, 2)} (${spreadPct.toFixed(3)}%)</span>
    `;
  }

  // Render Bids
  if (bidsTable) {
    bidsTable.innerHTML = pairData.bids.map(bid => {
      const pct = Math.min(100, Math.max(10, (bid.total / maxBidTotal) * 100));
      return `
        <tr class="order-book-row bid" onclick="populateOrderPrice(${bid.price})">
          <td>${formatNumber(bid.price, 2)}</td>
          <td>${formatNumber(bid.amount, 4)}</td>
          <td>${formatNumber(bid.total, 2)}</td>
          <div class="depth-bar bid" style="width: ${pct}%"></div>
        </tr>
      `;
    }).join('');
  }
}

window.populateOrderPrice = function(price) {
  const priceInput = document.getElementById('order-price-input');
  if (priceInput) {
    priceInput.value = price;
    updateOrderSummary();
  }
};

function renderChart() {
  const svg = document.getElementById('trading-chart-svg');
  if (!svg) return;

  const pairData = state.pairs[state.activePair];
  const width = svg.clientWidth || 600;
  const height = 300;

  // Render interactive SVG depth chart
  if (state.chartType === 'depth') {
    let bidPoints = '0,300 ';
    let askPoints = '';

    const bids = [...pairData.bids].sort((a, b) => a.price - b.price);
    const asks = [...pairData.asks].sort((a, b) => a.price - b.price);

    // Calculate bids curve
    bids.forEach((b, idx) => {
      const x = (idx / Math.max(1, bids.length - 1)) * (width / 2);
      const y = height - (b.amount / 10) * 220;
      bidPoints += `${x},${Math.max(40, y)} `;
    });
    bidPoints += `${width / 2},300`;

    // Calculate asks curve
    askPoints += `${width / 2},300 `;
    asks.forEach((a, idx) => {
      const x = (width / 2) + (idx / Math.max(1, asks.length - 1)) * (width / 2);
      const y = height - (a.amount / 10) * 220;
      askPoints += `${x},${Math.max(40, y)} `;
    });
    askPoints += `${width},300`;

    svg.innerHTML = `
      <defs>
        <linearGradient id="bidGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#10b981" stop-opacity="0.02"/>
        </linearGradient>
        <linearGradient id="askGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      <line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="rgba(255,255,255,0.15)" stroke-dasharray="4"/>
      <polygon points="${bidPoints}" fill="url(#bidGrad)" stroke="#10b981" stroke-width="2"/>
      <polygon points="${askPoints}" fill="url(#askGrad)" stroke="#f43f5e" stroke-width="2"/>
      <text x="20" y="30" fill="#10b981" font-family="monospace" font-size="12" font-weight="700">BUY DEPTH (CUMULATIVE BIDS)</text>
      <text x="${width - 220}" y="30" fill="#f43f5e" font-family="monospace" font-size="12" font-weight="700">SELL DEPTH (CUMULATIVE ASKS)</text>
      <text x="${width / 2}" y="20" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">MID: $${formatNumber(pairData.markPrice, 2)}</text>
    `;
  } else {
    // Candlesticks rendering
    svg.innerHTML = `
      <g stroke="rgba(255,255,255,0.05)" stroke-width="1">
        <line x1="0" y1="60" x2="${width}" y2="60"/>
        <line x1="0" y1="120" x2="${width}" y2="120"/>
        <line x1="0" y1="180" x2="${width}" y2="180"/>
        <line x1="0" y1="240" x2="${width}" y2="240"/>
      </g>
      <!-- Candles -->
      <g stroke="#10b981" stroke-width="1">
        <line x1="60" y1="90" x2="60" y2="210"/><rect x="52" y="110" width="16" height="80" fill="#10b981" rx="2"/>
        <line x1="140" y1="70" x2="140" y2="190"/><rect x="132" y="90" width="16" height="70" fill="#10b981" rx="2"/>
        <line x1="220" y1="110" x2="220" y2="250"/><rect x="212" y="140" width="16" height="90" fill="#f43f5e" stroke="#f43f5e" rx="2"/>
        <line x1="300" y1="60" x2="300" y2="180"/><rect x="292" y="80" width="16" height="60" fill="#10b981" rx="2"/>
        <line x1="380" y1="50" x2="380" y2="170"/><rect x="372" y="70" width="16" height="80" fill="#10b981" rx="2"/>
        <line x1="460" y1="80" x2="460" y2="220"/><rect x="452" y="100" width="16" height="90" fill="#f43f5e" stroke="#f43f5e" rx="2"/>
        <line x1="540" y1="40" x2="540" y2="160"/><rect x="532" y="60" width="16" height="70" fill="#10b981" rx="2"/>
      </g>
      <text x="20" y="30" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="700">OHLCV / 1H CANDLESTICK ACTION</text>
    `;
  }
}

// Chart toolbar controls
function initChartToolbar() {
  document.querySelectorAll('.chart-type-selector .toolbar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-type-selector .toolbar-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.chartType = btn.dataset.chart;
      renderChart();
    });
  });

  document.querySelectorAll('.timeframe-selector .toolbar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.timeframe-selector .toolbar-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.chartTimeframe = btn.dataset.tf;
      renderChart();
    });
  });
}

// --- Render Order Execution Panel ---
function renderOrderForm() {
  const baseSymbol = state.activePair.split('/')[0];
  const quoteSymbol = 'DAI';
  const pairData = state.pairs[state.activePair];

  const userBal = state.balances[state.currentPersona.address] || { DAI: 0, BTC: 0, ETH: 0, LINK: 0 };
  const availDai = userBal.DAI || 0;
  const availBase = userBal[baseSymbol] || 0;

  const availEl = document.getElementById('order-avail-balance');
  if (availEl) {
    if (state.orderSide === 'BUY') {
      availEl.textContent = `${formatNumber(availDai, 2)} DAI`;
    } else {
      availEl.textContent = `${formatNumber(availBase, 4)} ${baseSymbol}`;
    }
  }

  const baseUnitEls = document.querySelectorAll('.base-unit-label');
  baseUnitEls.forEach(el => el.textContent = baseSymbol);

  const priceWrapper = document.getElementById('order-price-group');
  if (priceWrapper) {
    if (state.orderType === 'MARKET') {
      priceWrapper.style.display = 'none';
    } else {
      priceWrapper.style.display = 'block';
      const priceInput = document.getElementById('order-price-input');
      if (priceInput && !priceInput.value) {
        priceInput.value = pairData.markPrice;
      }
    }
  }

  // Order execution button text & style
  const execBtn = document.getElementById('execute-order-btn');
  if (execBtn) {
    execBtn.className = `btn-execute ${state.orderSide.toLowerCase()}`;
    execBtn.textContent = `${state.orderSide} ${baseSymbol}`;
  }

  updateOrderSummary();
}

function updateOrderSummary() {
  const baseSymbol = state.activePair.split('/')[0];
  const pairData = state.pairs[state.activePair];
  const amountInput = document.getElementById('order-amount-input');
  const priceInput = document.getElementById('order-price-input');

  const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
  let price = state.orderType === 'MARKET' ? pairData.markPrice : (parseFloat(priceInput ? priceInput.value : 0) || pairData.markPrice);

  const totalDai = amount * price;
  const feeDai = totalDai * 0.001; // 0.1% protocol fee

  const totalEl = document.getElementById('order-summary-total');
  const feeEl = document.getElementById('order-summary-fee');

  if (totalEl) totalEl.textContent = formatUSD(totalDai);
  if (feeEl) feeEl.textContent = formatUSD(feeDai);
}

function initOrderForm() {
  // Tabs: Limit vs Market
  document.querySelectorAll('.form-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.form-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.orderType = btn.dataset.type;
      renderOrderForm();
    });
  });

  // Side Toggle: Buy vs Sell
  document.querySelectorAll('.side-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.orderSide = btn.dataset.side;
      renderOrderForm();
    });
  });

  // Inputs
  const amountInput = document.getElementById('order-amount-input');
  const priceInput = document.getElementById('order-price-input');
  if (amountInput) amountInput.addEventListener('input', updateOrderSummary);
  if (priceInput) priceInput.addEventListener('input', updateOrderSummary);

  // Percentage pills
  document.querySelectorAll('.pct-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const pct = parseFloat(btn.dataset.pct) / 100;
      const baseSymbol = state.activePair.split('/')[0];
      const userBal = state.balances[state.currentPersona.address] || { DAI: 0, BTC: 0, ETH: 0, LINK: 0 };
      const pairData = state.pairs[state.activePair];

      if (state.orderSide === 'BUY') {
        const availDai = userBal.DAI || 0;
        const price = state.orderType === 'MARKET' ? pairData.markPrice : (parseFloat(priceInput.value) || pairData.markPrice);
        if (price > 0) {
          const maxAmount = (availDai * pct) / price;
          amountInput.value = maxAmount.toFixed(4);
        }
      } else {
        const availBase = userBal[baseSymbol] || 0;
        amountInput.value = (availBase * pct).toFixed(4);
      }
      updateOrderSummary();
    });
  });

  // Execute Order Submission
  const execBtn = document.getElementById('execute-order-btn');
  if (execBtn) {
    execBtn.addEventListener('click', handleOrderSubmission);
  }
}

function handleOrderSubmission() {
  const baseSymbol = state.activePair.split('/')[0];
  const pairData = state.pairs[state.activePair];
  const amountInput = document.getElementById('order-amount-input');
  const priceInput = document.getElementById('order-price-input');

  const amount = parseFloat(amountInput.value);
  if (!amount || amount <= 0) {
    showToast('Please enter a valid order amount', 'error');
    return;
  }

  const traderAddr = state.currentPersona.address;
  const userBal = state.balances[traderAddr];

  if (state.orderType === 'LIMIT') {
    const price = parseFloat(priceInput.value);
    if (!price || price <= 0) {
      showToast('Please enter a valid limit price', 'error');
      return;
    }

    const totalDai = amount * price;

    if (state.orderSide === 'BUY') {
      if (userBal.DAI < totalDai) {
        showToast(`Insufficient DAI balance. Required: ${formatUSD(totalDai)}, Available: ${formatUSD(userBal.DAI)}`, 'error');
        return;
      }
      userBal.DAI -= totalDai; // lock DAI
      pairData.bids.push({
        id: Date.now(),
        trader: traderAddr,
        price,
        amount,
        total: totalDai
      });
      pairData.bids.sort((a, b) => b.price - a.price); // Descending for bids
    } else {
      if (userBal[baseSymbol] < amount) {
        showToast(`Insufficient ${baseSymbol} balance. Available: ${userBal[baseSymbol]}`, 'error');
        return;
      }
      userBal[baseSymbol] -= amount; // lock token
      pairData.asks.push({
        id: Date.now(),
        trader: traderAddr,
        price,
        amount,
        total: totalDai
      });
      pairData.asks.sort((a, b) => a.price - b.price); // Ascending for asks
    }

    showToast(`Limit ${state.orderSide} Order Placed: ${amount} ${baseSymbol} @ ${price} DAI`, 'success');
    logTelemetry('OrderCreated', 'EnterpriseDEX', `Limit ${state.orderSide}: ${amount} ${baseSymbol} @ ${price} DAI by ${formatAddress(traderAddr)}`);
  } else {
    // Market Order execution
    const isBuy = state.orderSide === 'BUY';
    const oppOrders = isBuy ? pairData.asks : pairData.bids;

    if (oppOrders.length === 0) {
      showToast('Insufficient liquidity in the order book for market execution', 'error');
      return;
    }

    let remaining = amount;
    let matchedCount = 0;

    while (oppOrders.length > 0 && remaining > 0) {
      const topOrder = oppOrders[0];
      const matchAmount = Math.min(remaining, topOrder.amount);
      const tradeCost = matchAmount * topOrder.price;

      if (isBuy) {
        if (userBal.DAI < tradeCost) {
          showToast('Insufficient DAI balance to complete market buy fill', 'error');
          break;
        }
        userBal.DAI -= tradeCost;
        userBal[baseSymbol] = (userBal[baseSymbol] || 0) + matchAmount;

        // Credit maker
        const makerBal = state.balances[topOrder.trader];
        if (makerBal) {
          makerBal.DAI = (makerBal.DAI || 0) + tradeCost;
        }
      } else {
        if (userBal[baseSymbol] < matchAmount) {
          showToast(`Insufficient ${baseSymbol} balance to complete market sell`, 'error');
          break;
        }
        userBal[baseSymbol] -= matchAmount;
        userBal.DAI = (userBal.DAI || 0) + tradeCost;

        // Credit maker
        const makerBal = state.balances[topOrder.trader];
        if (makerBal) {
          makerBal[baseSymbol] = (makerBal[baseSymbol] || 0) + matchAmount;
        }
      }

      topOrder.amount -= matchAmount;
      remaining -= matchAmount;
      matchedCount++;

      // Log trade
      state.recentTrades.unshift({
        tradeId: 105 + state.recentTrades.length,
        ticker: state.activePair,
        side: state.orderSide,
        price: topOrder.price,
        amount: matchAmount,
        date: new Date().toLocaleTimeString()
      });

      logTelemetry('OrderMatched', 'EnterpriseDEX', `Trade: ${matchAmount} ${baseSymbol} @ ${topOrder.price} DAI (${state.orderSide})`);

      if (topOrder.amount <= 0.00001) {
        oppOrders.shift();
      }
    }

    showToast(`Market ${state.orderSide} Order Executed! Filled ${amount - remaining} ${baseSymbol}`, 'success');
  }

  amountInput.value = '';
  renderDEX();
}

// --- Render Trade History & Open Orders ---
function renderTradeHistory() {
  const container = document.getElementById('trades-stream-body');
  if (!container) return;

  container.innerHTML = state.recentTrades.slice(0, 15).map(trade => `
    <tr class="standard-table-row">
      <td style="color: ${trade.side === 'BUY' ? 'var(--signal-bid)' : 'var(--signal-ask)'}; font-weight: 700;">
        ${trade.side}
      </td>
      <td>${formatNumber(trade.price, 2)}</td>
      <td>${formatNumber(trade.amount, 4)}</td>
      <td style="color: var(--text-muted); font-size: 0.75rem;">${trade.date}</td>
    </tr>
  `).join('');
}

function renderUserOrders() {
  const container = document.getElementById('user-open-orders-body');
  if (!container) return;

  const currentAddr = state.currentPersona.address;
  const pairData = state.pairs[state.activePair];
  const baseSymbol = state.activePair.split('/')[0];

  const myBids = pairData.bids.filter(b => b.trader === currentAddr).map(b => ({ ...b, side: 'BUY' }));
  const myAsks = pairData.asks.filter(a => a.trader === currentAddr).map(a => ({ ...a, side: 'SELL' }));
  const myOrders = [...myBids, ...myAsks];

  if (myOrders.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
          No active open orders for ${state.currentPersona.label} in ${state.activePair}
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = myOrders.map(order => `
    <tr>
      <td>${order.id}</td>
      <td style="color: ${order.side === 'BUY' ? 'var(--signal-bid)' : 'var(--signal-ask)'}; font-weight: 700;">
        ${order.side}
      </td>
      <td>${formatNumber(order.price, 2)} DAI</td>
      <td>${formatNumber(order.amount, 4)} ${baseSymbol}</td>
      <td><span class="badge pending">Open</span></td>
      <td>
        <button class="btn-cancel" onclick="cancelOrder(${order.id}, '${order.side}')">
          Cancel
        </button>
      </td>
    </tr>
  `).join('');
}

window.cancelOrder = function(orderId, side) {
  const pairData = state.pairs[state.activePair];
  const baseSymbol = state.activePair.split('/')[0];
  const list = side === 'BUY' ? pairData.bids : pairData.asks;
  const idx = list.findIndex(o => o.id === orderId);

  if (idx !== -1) {
    const order = list[idx];
    const userBal = state.balances[state.currentPersona.address];
    if (side === 'BUY') {
      userBal.DAI += (order.amount * order.price); // refund locked DAI
    } else {
      userBal[baseSymbol] += order.amount; // refund locked tokens
    }
    list.splice(idx, 1);
    showToast(`Order #${orderId} cancelled and funds unlocked`, 'success');
    logTelemetry('OrderCancelled', 'EnterpriseDEX', `Order #${orderId} cancelled by ${formatAddress(state.currentPersona.address)}`);
    renderDEX();
  }
};

// --- Render Multi-Sig Treasury Cockpit ---
function renderTreasury() {
  const t = state.treasury;

  // Metrics
  const ethEl = document.getElementById('treasury-eth-reserves');
  const daiEl = document.getElementById('treasury-dai-reserves');
  const btcEl = document.getElementById('treasury-btc-reserves');
  const linkEl = document.getElementById('treasury-link-reserves');
  const quorumEl = document.getElementById('treasury-quorum-label');

  if (ethEl) ethEl.textContent = `${t.reserves.ETH.toFixed(2)} ETH`;
  if (daiEl) daiEl.textContent = formatUSD(t.reserves.DAI);
  if (btcEl) btcEl.textContent = `${t.reserves.BTC.toFixed(2)} BTC`;
  if (linkEl) linkEl.textContent = `${t.reserves.LINK.toLocaleString()} LINK`;
  if (quorumEl) quorumEl.textContent = `${t.quorum} of ${t.signers.length} Signers Required (M-of-N)`;

  // Proposals Queue
  const queueEl = document.getElementById('proposals-queue-container');
  if (!queueEl) return;

  const currentAddr = state.currentPersona.address;

  queueEl.innerHTML = t.proposals.map(prop => {
    const hasApproved = prop.approvals.includes(currentAddr);
    const approvalsCount = prop.approvals.length;
    const isQuorumReached = approvalsCount >= t.quorum;
    const progressPct = Math.min(100, (approvalsCount / t.quorum) * 100);

    return `
      <div class="proposal-card">
        <div class="proposal-top">
          <div>
            <span class="proposal-id">PROPOSAL #${prop.id}</span>
            <h3 class="proposal-desc">${prop.description}</h3>
          </div>
          <div>
            ${prop.executed ? '<span class="badge success">Executed</span>' : 
              prop.cancelled ? '<span class="badge danger">Cancelled</span>' : 
              '<span class="badge pending">Awaiting Quorum</span>'}
          </div>
        </div>

        <div class="proposal-meta">
          <div class="meta-group">
            <span class="meta-lbl">Target Beneficiary</span>
            <span class="meta-txt">${formatAddress(prop.to)}</span>
          </div>
          <div class="meta-group">
            <span class="meta-lbl">Asset & Volume</span>
            <span class="meta-txt" style="color: var(--accent-cyan); font-weight: 700;">
              ${prop.amount} ${prop.token}
            </span>
          </div>
          <div class="meta-group">
            <span class="meta-lbl">Submission Date</span>
            <span class="meta-txt">${prop.createdAt}</span>
          </div>
          <div class="meta-group">
            <span class="meta-lbl">Quorum Consensus</span>
            <div class="quorum-meter">
              <div class="progress-track">
                <div class="progress-fill" style="width: ${progressPct}%"></div>
              </div>
              <span class="meta-txt" style="font-size: 0.75rem;">${approvalsCount}/${t.quorum}</span>
            </div>
          </div>
        </div>

        <div class="proposal-actions">
          <div class="signers-badges">
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">CONFIRMATIONS:</span>
            ${t.signers.map(s => `
              <span class="signer-pill ${prop.approvals.includes(s.address) ? 'approved' : ''}">
                ${s.label}: ${prop.approvals.includes(s.address) ? '✓ YES' : 'PENDING'}
              </span>
            `).join('')}
          </div>

          <div>
            ${!prop.executed && !prop.cancelled ? `
              <button 
                class="btn-approve" 
                onclick="approveProposal(${prop.id})"
                ${hasApproved ? 'disabled' : ''}
              >
                ${hasApproved ? '✓ Approved by Current Persona' : 'Confirm & Sign Approval'}
              </button>
            ` : `
              <span style="font-size: 0.8rem; color: var(--text-muted);">
                Transaction Settled on Ethereum L1
              </span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.approveProposal = function(propId) {
  const prop = state.treasury.proposals.find(p => p.id === propId);
  if (!prop) return;

  const currentAddr = state.currentPersona.address;
  const isApprover = state.treasury.signers.some(s => s.address === currentAddr);

  if (!isApprover) {
    showToast('Unauthorized: Active persona is not a registered Multi-Sig approver', 'error');
    return;
  }

  if (prop.approvals.includes(currentAddr)) {
    showToast('Transfer already approved by current signer', 'error');
    return;
  }

  prop.approvals.push(currentAddr);
  showToast(`Approval submitted by ${state.currentPersona.label}`, 'success');
  logTelemetry('TransferApproved', 'EnterpriseMultiSigWallet', `Proposal #${propId} approved by ${formatAddress(currentAddr)}`);

  // Auto-execute if quorum reached!
  if (prop.approvals.length >= state.treasury.quorum) {
    prop.executed = true;
    // Deduct reserves
    if (state.treasury.reserves[prop.token]) {
      state.treasury.reserves[prop.token] -= prop.amount;
    }
    showToast(`🎉 Quorum achieved! Proposal #${propId} successfully executed on-chain!`, 'success');
    logTelemetry('TransferExecuted', 'EnterpriseMultiSigWallet', `Proposal #${propId} (${prop.amount} ${prop.token}) executed to ${formatAddress(prop.to)}`);
  }

  renderTreasury();
};

function initTreasuryControls() {
  const newPropBtn = document.getElementById('new-proposal-btn');
  if (newPropBtn) {
    newPropBtn.addEventListener('click', () => openModal('new-proposal-modal'));
  }

  const submitPropBtn = document.getElementById('submit-proposal-btn');
  if (submitPropBtn) {
    submitPropBtn.addEventListener('click', () => {
      const desc = document.getElementById('prop-desc-input').value;
      const to = document.getElementById('prop-to-input').value;
      const token = document.getElementById('prop-token-select').value;
      const amount = parseFloat(document.getElementById('prop-amount-input').value);

      if (!desc || !to || !amount || amount <= 0) {
        showToast('Please fill all proposal fields with valid values', 'error');
        return;
      }

      const newId = state.treasury.proposals.length;
      state.treasury.proposals.unshift({
        id: newId,
        to,
        token,
        amount,
        description: desc,
        approvals: [state.currentPersona.address], // auto-approve by proposer
        executed: false,
        cancelled: false,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      });

      closeModal('new-proposal-modal');
      showToast(`Proposal #${newId} submitted with 1 approval`, 'success');
      logTelemetry('TransferProposed', 'EnterpriseMultiSigWallet', `Proposal #${newId} created: ${amount} ${token} for ${desc}`);
      renderTreasury();
    });
  }
}

// --- Render On-Chain Telemetry Stream ---
function renderTelemetry() {
  const container = document.getElementById('telemetry-logs-body');
  if (!container) return;

  container.innerHTML = state.telemetryLogs.map(log => `
    <tr>
      <td style="color: var(--accent-cyan); font-weight: 700;">#${log.block}</td>
      <td><span class="badge success">${log.event}</span></td>
      <td style="color: var(--text-secondary);">${log.emitter}</td>
      <td style="color: var(--text-primary); font-family: var(--font-mono);">${log.details}</td>
      <td style="color: var(--text-muted); font-size: 0.75rem;">${log.timestamp || 'Live'}</td>
    </tr>
  `).join('');
}

// --- Modal Utilities ---
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

window.closeModal = closeModal;

function initModals() {
  // Close buttons
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop');
      if (modal) modal.classList.remove('open');
    });
  });

  // Faucet claim button
  const claimFaucetBtn = document.getElementById('claim-faucet-btn');
  if (claimFaucetBtn) {
    claimFaucetBtn.addEventListener('click', () => {
      const targetBal = state.walletBalances[state.currentPersona.address];
      targetBal.DAI += 10000;
      targetBal.ETH += 10;
      targetBal.BTC += 1.0;
      targetBal.LINK += 500;

      closeModal('faucet-modal');
      showToast(`Dispensed 10,000 DAI, 10 ETH, 1 BTC, 500 LINK to ${state.currentPersona.label}`, 'success');
      logTelemetry('FaucetDispensed', 'MockERC20', `10,000 DAI & tokens dispensed to ${formatAddress(state.currentPersona.address)}`);
      renderOrderForm();
    });
  }

  // Deposit into DEX custody
  const executeDepositBtn = document.getElementById('execute-deposit-btn');
  if (executeDepositBtn) {
    executeDepositBtn.addEventListener('click', () => {
      const token = document.getElementById('deposit-token-select').value;
      const amount = parseFloat(document.getElementById('deposit-amount-input').value);

      if (!amount || amount <= 0) {
        showToast('Please enter a valid deposit amount', 'error');
        return;
      }

      const walletBal = state.walletBalances[state.currentPersona.address];
      const dexBal = state.balances[state.currentPersona.address];

      if ((walletBal[token] || 0) < amount) {
        showToast(`Insufficient wallet balance for ${token}. Claim test tokens from faucet first!`, 'error');
        return;
      }

      walletBal[token] -= amount;
      dexBal[token] = (dexBal[token] || 0) + amount;

      closeModal('deposit-modal');
      showToast(`Successfully deposited ${amount} ${token} into DEX trading account`, 'success');
      logTelemetry('Deposit', 'EnterpriseDEX', `${amount} ${token} deposited by ${formatAddress(state.currentPersona.address)}`);
      renderOrderForm();
      renderDEX();
    });
  }

  // Copy Trader Modal Confirmation
  const confirmCopyBtn = document.getElementById('confirm-copy-trader-btn');
  if (confirmCopyBtn) {
    confirmCopyBtn.addEventListener('click', () => {
      if (!activeSelectedTrader) return;
      const capital = parseFloat(document.getElementById('copy-capital-input').value) || 5000;
      const ratio = document.getElementById('copy-ratio-select').value;
      const stopLoss = document.getElementById('copy-stoploss-input').value;
      const autoReplicate = document.getElementById('copy-autoreplicate-checkbox') ? document.getElementById('copy-autoreplicate-checkbox').checked : true;

      const newPos = {
        id: `cop-${Date.now()}`,
        traderId: activeSelectedTrader.id,
        traderName: activeSelectedTrader.name,
        strategy: activeSelectedTrader.strategy,
        allocatedCapital: capital,
        unrealizedPnl: 0.0,
        unrealizedPnlPct: 0.0,
        mirrorRatio: `${ratio}x`,
        stopLoss: `${stopLoss}%`,
        autoReplicate: autoReplicate
      };

      state.copiedPositions.unshift(newPos);
      closeModal('copy-trader-modal');
      showToast(`Non-custodial mirror escrow authorized: $${capital.toLocaleString()} allocated to ${activeSelectedTrader.name} (${autoReplicate ? '⚡ AUTO-REPLICATE ACTIVE' : 'MANUAL'})`, 'success');
      logTelemetry('CopyEscrowCreated', 'ApexCopyEngine', `$${capital.toLocaleString()} allocated to mirror ${activeSelectedTrader.name} (${ratio}x ratio, autoReplicate=${autoReplicate})`);
      renderCopyTrading();
    });
  }

  // Vault Withdrawal Modal Handlers
  const initVaultWithdrawBtn = document.getElementById('initiate-vault-withdraw-btn');
  if (initVaultWithdrawBtn) {
    initVaultWithdrawBtn.addEventListener('click', () => {
      openModal('vault-withdrawal-modal');
    });
  }

  const confirmVaultWithdrawBtn = document.getElementById('confirm-vault-withdrawal-btn');
  if (confirmVaultWithdrawBtn) {
    confirmVaultWithdrawBtn.addEventListener('click', () => {
      const asset = document.getElementById('vault-asset-select').value;
      const dest = document.getElementById('vault-destination-input').value;
      const amount = parseFloat(document.getElementById('vault-amount-input').value) || 100000;
      const trisaHash = document.getElementById('vault-travel-rule-input').value || 'trisa:vasp:cb-custody:verified';

      const newReq = {
        id: 100 + state.custodyVault.withdrawals.length + 1,
        asset,
        destination: dest,
        amount,
        requestTime: Date.now(),
        executeAfter: Date.now() + (48 * 3600 * 1000),
        hoursRemaining: 48.0,
        status: 'PENDING_TIMELOCK',
        travelRuleHash: trisaHash
      };

      state.custodyVault.withdrawals.unshift(newReq);
      closeModal('vault-withdrawal-modal');
      showToast(`48-Hour Vault Withdrawal Scheduled: ${amount} ${asset} locked until time lock expiration`, 'success');
      logTelemetry('VaultWithdrawalInitiated', 'ApexCustodyVault', `48h delay active for ${amount} ${asset} to ${formatAddress(dest)}`);
      renderCustody();
    });
  }
}

// --- Real Live Data Engine & High-Frequency Mirroring ---
function updateAutoReplicateUI() {
  const statsEl = document.getElementById('auto-replicate-stats');
  if (statsEl) {
    statsEl.textContent = `${state.replicatedTradesCount} Mirrored Orders (${formatUSD(state.replicatedVolumeUSD)} Vol)`;
  }

  const toggleBtn = document.getElementById('toggle-autoreplicate-btn');
  if (toggleBtn) {
    if (state.autoReplicateActive) {
      toggleBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Auto-Replicate: ACTIVE
      `;
      toggleBtn.style.background = 'var(--signal-bid)';
      toggleBtn.style.borderColor = 'var(--signal-bid)';
      toggleBtn.style.color = '#000';
    } else {
      toggleBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        Auto-Replicate: PAUSED
      `;
      toggleBtn.style.background = 'var(--bg-surface)';
      toggleBtn.style.borderColor = 'var(--border-subtle)';
      toggleBtn.style.color = 'var(--text-secondary)';
    }
  }
}

function updateOrderBookLevels(pairSymbol, currentPrice) {
  const p = state.pairs[pairSymbol];
  if (!p) return;
  const spreadBasis = currentPrice * 0.0004; // 4 bps tight institutional spread
  const bestBid = currentPrice - spreadBasis;
  const bestAsk = currentPrice + spreadBasis;

  p.bids.forEach((bid, idx) => {
    bid.price = Number((bestBid - (idx * spreadBasis * 1.5)).toFixed(2));
    bid.total = Number((bid.price * bid.amount).toFixed(2));
  });

  p.asks.forEach((ask, idx) => {
    ask.price = Number((bestAsk + (idx * spreadBasis * 1.5)).toFixed(2));
    ask.total = Number((ask.price * ask.amount).toFixed(2));
  });
}

async function fetchRealMarketData() {
  let fetchedAny = false;

  // 1. Attempt Binance 24h ticker for real live exchange crypto rates
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22,%22ETHUSDT%22,%22LINKUSDT%22%5D', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      data.forEach(item => {
        let pairKey = null;
        if (item.symbol === 'BTCUSDT') pairKey = 'BTC/DAI';
        else if (item.symbol === 'ETHUSDT') pairKey = 'ETH/DAI';
        else if (item.symbol === 'LINKUSDT') pairKey = 'LINK/DAI';

        if (pairKey && state.pairs[pairKey]) {
          const p = state.pairs[pairKey];
          p.markPrice = parseFloat(item.lastPrice);
          p.change24h = parseFloat(item.priceChangePercent);
          p.high24h = parseFloat(item.highPrice);
          p.low24h = parseFloat(item.lowPrice);
          p.volume24h = parseFloat(item.quoteVolume);
          updateOrderBookLevels(pairKey, p.markPrice);
        }
      });
      fetchedAny = true;
    }
  } catch (err) {
    // Isolated sandbox or offline environment: fall through to local Go Gateway
  }

  // 2. Fallback to local Go Gateway live prices
  if (!fetchedAny) {
    try {
      const gatewayUrl = (window.location.port === '4200') ? 'http://localhost:8080/api/v1/prices' : '/api/v1/prices';
      const res = await fetch(gatewayUrl);
      if (res.ok) {
        const prices = await res.json();
        Object.entries(prices).forEach(([symbol, pData]) => {
          if (state.pairs[symbol]) {
            state.pairs[symbol].markPrice = pData.markPrice;
            state.pairs[symbol].change24h = pData.change24h;
            state.pairs[symbol].high24h = pData.high24h;
            state.pairs[symbol].low24h = pData.low24h;
            state.pairs[symbol].volume24h = pData.volume24h;
            updateOrderBookLevels(symbol, pData.markPrice);
          }
        });
        fetchedAny = true;
      }
    } catch (err) {}
  }

  // 3. High-resolution local live market ticks around true real market price levels
  if (!fetchedAny) {
    const pairData = state.pairs[state.activePair];
    if (pairData && pairData.bids.length > 0 && pairData.asks.length > 0) {
      const delta = (Math.random() - 0.49) * (pairData.markPrice * 0.0005);
      pairData.markPrice = Math.max(10, Number((pairData.markPrice + delta).toFixed(2)));
      updateOrderBookLevels(state.activePair, pairData.markPrice);
    }
  }

  renderTickerBar();
  if (state.currentTab === 'dex') {
    renderOrderBook();
  }
}

function executeAutoReplicateTrade(data) {
  if (!state.autoReplicateActive) return;

  const leadName = data.leadTrader || 'Kaelen Voss (Apex Quant)';
  const pair = data.pair || 'BTC/DAI';
  const action = data.action || 'BUY';
  const markPrice = (state.pairs[pair] && state.pairs[pair].markPrice) || (data.price || 68450);
  const tradeSize = data.leadSize || (pair.startsWith('BTC') ? 0.35 : pair.startsWith('ETH') ? 2.5 : 120);
  const notionalUsd = Number((markPrice * tradeSize).toFixed(2));
  const profitNum = (notionalUsd * 0.0035 + (Math.random() * 50)).toFixed(2);

  const newTrade = {
    time: new Date().toLocaleTimeString(),
    manager: leadName,
    pair: pair,
    action: action,
    amount: `${tradeSize.toFixed(2)} ${pair.split('/')[0]}`,
    userFilled: formatUSD(notionalUsd),
    profit: `+$${profitNum}`,
    autoReplicated: true,
    settlementNanos: data.settlementNanos || 42000
  };

  state.mirroredTrades.unshift(newTrade);
  if (state.mirroredTrades.length > 8) state.mirroredTrades.pop();

  state.replicatedTradesCount++;
  state.replicatedVolumeUSD += notionalUsd;

  // Also add to DEX recent trades so DEX tape shows the replicated execution
  const newDexTrade = {
    tradeId: 105 + state.recentTrades.length,
    ticker: pair,
    side: action,
    price: markPrice,
    amount: Number(tradeSize.toFixed(4)),
    date: new Date().toLocaleTimeString()
  };
  state.recentTrades.unshift(newDexTrade);
  if (state.recentTrades.length > 15) state.recentTrades.pop();

  // Log on-chain telemetry
  logTelemetry(
    'AutoReplicateOrderMatched',
    'ApexRustEngine',
    `Lead: ${leadName} • ${action} ${newTrade.amount} @ ${formatUSD(markPrice)} • Mirror Settled in 42µs`
  );

  updateAutoReplicateUI();

  if (state.currentTab === 'copytrading') {
    renderCopyTrading();
  } else if (state.currentTab === 'dex') {
    renderTradeHistory();
  }
}

function initRealLiveDataStreams() {
  fetchRealMarketData();
  setInterval(fetchRealMarketData, 3500);

  // Initialize Go Gateway SSE stream if available
  if (typeof EventSource !== 'undefined') {
    try {
      const streamUrl = (window.location.port === '4200') ? 'http://localhost:8080/api/v1/stream' : '/api/v1/stream';
      const evtSource = new EventSource(streamUrl);
      evtSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'AUTO_REPLICATE_TRADE_EVENT') {
            executeAutoReplicateTrade(payload.data);
          }
        } catch (e) {}
      };
      evtSource.onerror = () => {
        evtSource.close();
      };
    } catch (e) {}
  }

  // Periodic autonomous lead investor trade replication (every 8s)
  setInterval(() => {
    if (state.autoReplicateActive && state.copyTraders.length > 0) {
      const randTrader = state.copyTraders[Math.floor(Math.random() * state.copyTraders.length)];
      const pairs = ['BTC/DAI', 'ETH/DAI', 'LINK/DAI'];
      const randPair = pairs[Math.floor(Math.random() * pairs.length)];
      const action = Math.random() > 0.45 ? 'BUY' : 'SELL';
      const currentPrice = (state.pairs[randPair] && state.pairs[randPair].markPrice) || 68450;

      executeAutoReplicateTrade({
        leadTrader: randTrader.name,
        pair: randPair,
        action: action,
        price: currentPrice,
        leadSize: randPair.startsWith('BTC') ? (0.2 + Math.random() * 0.8) : randPair.startsWith('ETH') ? (1.5 + Math.random() * 4.0) : (50 + Math.random() * 200),
        settlementNanos: 42000
      });
    }
  }, 8000);
}

// --- App Bootstrap ---
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initChartToolbar();
  initOrderForm();
  initTreasuryControls();
  initModals();

  renderHeader();
  renderLiveNewsTicker();
  renderAppViews();

  initRealLiveDataStreams();
});
