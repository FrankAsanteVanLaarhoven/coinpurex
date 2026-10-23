/**
 * APEX ENTERPRISE PLATFORM - CLIENT APPLICATION
 * Combines Apple Clean Precision with Palantir High-Density Telemetry.
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

  // On-Chain Telemetry Log (Palantir Audit Stream)
  telemetryLogs: [
    { block: 19842011, event: 'DepositReceived', emitter: 'EnterpriseMultiSigWallet', details: '100.0 ETH deposited from 0x90F7...b906' },
    { block: 19842010, event: 'OrderMatched', emitter: 'EnterpriseDEX', details: 'Trade #104: 0.85 BTC @ 68450.00 DAI' },
    { block: 19842008, event: 'TransferApproved', emitter: 'EnterpriseMultiSigWallet', details: 'Proposal #0 approved by 0x7099...79C8' },
    { block: 19842005, event: 'OrderCreated', emitter: 'EnterpriseDEX', details: 'Limit BUY: 1.25 BTC @ 68420.00 DAI by 0x15d3...6A65' }
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
  const dexView = document.getElementById('dex-view');
  const treasuryView = document.getElementById('treasury-view');
  const telemetryView = document.getElementById('telemetry-view');

  if (state.currentTab === 'dex') {
    dexView.style.display = 'grid';
    treasuryView.style.display = 'none';
    telemetryView.style.display = 'none';
    renderDEX();
  } else if (state.currentTab === 'treasury') {
    dexView.style.display = 'none';
    treasuryView.style.display = 'flex';
    telemetryView.style.display = 'none';
    renderTreasury();
  } else {
    dexView.style.display = 'none';
    treasuryView.style.display = 'none';
    telemetryView.style.display = 'flex';
    renderTelemetry();
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

// --- Render Palantir Telemetry Stream ---
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
}

// --- App Bootstrap ---
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initChartToolbar();
  initOrderForm();
  initTreasuryControls();
  initModals();

  renderHeader();
  renderAppViews();

  // Subtle simulated real-time orderbook micro-tick updates
  setInterval(() => {
    const pairData = state.pairs[state.activePair];
    if (pairData && pairData.bids.length > 0 && pairData.asks.length > 0) {
      const delta = (Math.random() - 0.49) * 2;
      pairData.markPrice = Math.max(10, pairData.markPrice + delta);
      renderTickerBar();
    }
  }, 3500);
});
