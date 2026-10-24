/**
 * COINPUREX ENTERPRISE PLATFORM (coinpurex.com)
 * Native HTTP & RFC 6455 WebSocket Unified Server
 * Zero external dependencies: Uses Node.js native http, crypto, fs, and path.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 4200;
const ROOT = path.join(__dirname, '..', 'frontend', 'public');

const MIME_TYPES = {
  'html': 'text/html; charset=utf-8',
  'css': 'text/css; charset=utf-8',
  'js': 'text/javascript; charset=utf-8',
  'json': 'application/json; charset=utf-8',
  'svg': 'image/svg+xml',
  'png': 'image/png',
  'ico': 'image/x-icon',
  'txt': 'text/plain; charset=utf-8',
  'xml': 'application/xml; charset=utf-8'
};

// Connected WebSocket Clients
const wsClients = new Set();

// Mock Live State for Real-Time Streaming
let livePrices = {
  'BTC/DAI': { symbol: 'BTC/DAI', markPrice: 68450.00, change24h: 3.42, high24h: 69200.00, low24h: 67100.00, volume24h: 4218000, lastUpdated: Date.now() },
  'ETH/DAI': { symbol: 'ETH/DAI', markPrice: 3540.00, change24h: 2.15, high24h: 3610.00, low24h: 3480.00, volume24h: 2890000, lastUpdated: Date.now() },
  'LINK/DAI': { symbol: 'LINK/DAI', markPrice: 18.50, change24h: 5.60, high24h: 19.20, low24h: 17.80, volume24h: 940000, lastUpdated: Date.now() },
  'CRS/DAI': { symbol: 'CRS/DAI', markPrice: 0.50, change24h: 8.70, high24h: 0.54, low24h: 0.46, volume24h: 1850000, lastUpdated: Date.now() },
  'CRS/ETH': { symbol: 'CRS/ETH', markPrice: 0.0001412, change24h: 6.50, high24h: 0.0001500, low24h: 0.0001350, volume24h: 520.0, lastUpdated: Date.now() }
};

// RFC 6455 WebSocket Frame Encoder
function encodeWsFrame(data, opcode = 0x1) {
  const payload = Buffer.from(typeof data === 'string' ? data : JSON.stringify(data));
  const length = payload.length;
  let header;

  if (length <= 125) {
    header = Buffer.from([0x80 | (opcode & 0x0f), length]);
  } else if (length <= 65535) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | (opcode & 0x0f);
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | (opcode & 0x0f);
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }

  return Buffer.concat([header, payload]);
}

// RFC 6455 WebSocket Frame Decoder
function decodeWsFrame(buffer) {
  if (buffer.length < 2) return null;
  const opcode = buffer[0] & 0x0f;
  const isMasked = (buffer[1] & 0x80) !== 0;
  let payloadLength = buffer[1] & 0x7f;
  let offset = 2;

  if (payloadLength === 126) {
    if (buffer.length < 4) return null;
    payloadLength = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLength === 127) {
    if (buffer.length < 10) return null;
    payloadLength = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }

  let maskingKey = null;
  if (isMasked) {
    if (buffer.length < offset + 4) return null;
    maskingKey = buffer.slice(offset, offset + 4);
    offset += 4;
  }

  if (buffer.length < offset + payloadLength) return null;
  const payload = Buffer.from(buffer.slice(offset, offset + payloadLength));

  if (isMasked && maskingKey) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] ^= maskingKey[i % 4];
    }
  }

  return { opcode, payload, totalLength: offset + payloadLength };
}

// Broadcast to all active WebSocket clients
function broadcastWs(data) {
  const frame = encodeWsFrame(data);
  for (const socket of wsClients) {
    try {
      if (socket.writable) {
        socket.write(frame);
      } else {
        wsClients.delete(socket);
      }
    } catch (e) {
      wsClients.delete(socket);
    }
  }
}

// Create HTTP Server
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health endpoint
  if (req.url === '/api/v1/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'HEALTHY',
      server: 'CoinPurex Unified Server',
      websocket: 'RFC-6455 Active',
      activeClients: wsClients.size,
      domain: 'coinpurex.com',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Arbitrage status endpoint
  if (req.url === '/api/v1/arbitrage') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      autonomousActive: true,
      status: 'BOT ACTIVE • POLLING VENUES',
      totalProfitUsd: 28450.00,
      totalExecutions: 68,
      gasSavedVsL1Usd: 1632.40,
      activeVenues: ['Polygon PoS QuickSwap v3', 'Ethereum Uniswap v3', 'Balancer Flash Vault', 'CoinPurex DEX Order Book'],
      lastScanTimestamp: Math.floor(Date.now() / 1000),
      opportunities: [
        { pair: 'CRS/DAI', venueA: '$0.500 (CoinPurex Order Book)', venueB: '$0.518 (Polygon QuickSwap)', spreadBps: 360, estGasUsd: 0.0006, estProfitUsd: 1800.00, isPolygonOptimal: true },
        { pair: 'CRS/POL', venueA: '1.48 POL (CoinPurex)', venueB: '1.52 POL (QuickSwap v3)', spreadBps: 270, estGasUsd: 0.0006, estProfitUsd: 890.00, isPolygonOptimal: true },
        { pair: 'POL/DAI', venueA: '$0.338 (CoinPurex)', venueB: '$0.342 (Polygon Uniswap)', spreadBps: 118, estGasUsd: 0.0006, estProfitUsd: 620.00, isPolygonOptimal: true },
        { pair: 'BTC/DAI', venueA: '$68,450.00 (CoinPurex)', venueB: '$68,690.00 (L2 AMM)', spreadBps: 35, estGasUsd: 0.0018, estProfitUsd: 4820.00, isPolygonOptimal: true },
        { pair: 'ETH/DAI', venueA: '$3,520.00 (CoinPurex)', venueB: '$3,535.50 (L2 AMM)', spreadBps: 44, estGasUsd: 0.0018, estProfitUsd: 2450.00, isPolygonOptimal: true }
      ]
    }));
    return;
  }

  // Supported Networks endpoint
  if (req.url === '/api/v1/networks') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([
      { id: 'polygon', name: 'Polygon PoS (137)', chainId: 137, currency: 'POL', gasPrice: '0.0018 POL (~$0.0006)', gasUsd: 0.0006, finality: '2.1s', latencyMs: 24, status: 'ACTIVE', tag: 'CHECKPOINT SYNC' },
      { id: 'ethereum', name: 'Ethereum Mainnet (1)', chainId: 1, currency: 'ETH', gasPrice: '0.0035 ETH (~$12.30)', gasUsd: 12.30, finality: '12.8s', latencyMs: 45, status: 'ACTIVE', tag: 'L1 SECURE SETTLEMENT' },
      { id: 'arbitrum', name: 'Arbitrum One (42161)', chainId: 42161, currency: 'ETH', gasPrice: '0.00008 ETH (~$0.28)', gasUsd: 0.28, finality: '0.6s', latencyMs: 18, status: 'ACTIVE', tag: 'OPTIMISTIC ROLLUP' },
      { id: 'base', name: 'Base L2 (8453)', chainId: 8453, currency: 'ETH', gasPrice: '0.00004 ETH (~$0.14)', gasUsd: 0.14, finality: '0.4s', latencyMs: 8, status: 'ACTIVE', tag: 'FAST FINALITY' }
    ]));
    return;
  }

  // Static File Serving
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  let filePath = path.join(ROOT, reqPath);

  // Security check: ensure path stays within ROOT
  if (!filePath.startsWith(ROOT)) {
    filePath = path.join(ROOT, '404.html');
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    if (fs.existsSync(filePath)) {
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.end('<h1>404 Not Found - CoinPurex</h1>');
    }
    return;
  }

  const ext = path.extname(filePath).slice(1).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'text/plain';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': (ext === 'html' || ext === 'json') ? 'no-cache' : 'public, max-age=3600'
  });
  fs.createReadStream(filePath).pipe(res);
});

// Real RFC 6455 WebSocket Upgrade Handler
server.on('upgrade', (req, socket, head) => {
  const pathname = req.url.split('?')[0];
  if (pathname !== '/ws' && pathname !== '/ws/' && pathname !== '/api/v1/ws') {
    socket.destroy();
    return;
  }

  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }

  const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  const acceptKey = crypto.createHash('sha1').update(key + GUID).digest('base64');

  const responseHeaders = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`,
    'Sec-WebSocket-Protocol: coinpurex-v2',
    '\r\n'
  ];

  socket.write(responseHeaders.join('\r\n'));
  wsClients.add(socket);

  // Send immediate welcome snapshot
  const welcomePayload = {
    type: 'WS_CONNECTED',
    server: 'CoinPurex RFC-6455 Streaming Gateway',
    domain: 'coinpurex.com',
    prices: livePrices,
    timestamp: Date.now()
  };
  socket.write(encodeWsFrame(welcomePayload));

  let incomingBuffer = Buffer.alloc(0);

  socket.on('data', (chunk) => {
    incomingBuffer = Buffer.concat([incomingBuffer, chunk]);

    while (incomingBuffer.length >= 2) {
      const decoded = decodeWsFrame(incomingBuffer);
      if (!decoded) break;

      incomingBuffer = incomingBuffer.slice(decoded.totalLength);

      // Handle Opcode
      if (decoded.opcode === 0x8) {
        // Close frame
        socket.end();
        wsClients.delete(socket);
        break;
      } else if (decoded.opcode === 0x9) {
        // Ping -> respond with Pong (0xA)
        socket.write(encodeWsFrame(decoded.payload, 0xa));
      } else if (decoded.opcode === 0x1) {
        // Text message
        try {
          const msg = JSON.parse(decoded.payload.toString('utf-8'));
          if (msg.action === 'ping') {
            socket.write(encodeWsFrame({ action: 'pong', timestamp: Date.now() }));
          } else if (msg.action === 'subscribe') {
            socket.write(encodeWsFrame({
              type: 'SUBSCRIBED',
              pairs: msg.pairs || Object.keys(livePrices),
              timestamp: Date.now()
            }));
          }
        } catch (e) {}
      }
    }
  });

  socket.on('close', () => {
    wsClients.delete(socket);
  });

  socket.on('error', () => {
    wsClients.delete(socket);
  });
});

// Periodic real-time price tick and mirror trade broadcasting
setInterval(() => {
  if (wsClients.size === 0) return;

  const pairs = Object.keys(livePrices);
  const randPair = pairs[Math.floor(Math.random() * pairs.length)];
  const p = livePrices[randPair];

  // Micro-fluctuation around institutional mark price
  const delta = (Math.random() - 0.49) * (p.markPrice * 0.0006);
  p.markPrice = Number((p.markPrice + delta).toFixed(randPair.includes('CRS/ETH') ? 7 : 2));
  p.lastUpdated = Date.now();

  // 1. Broadcast Price Update
  broadcastWs({
    type: 'PRICE_UPDATE',
    symbol: randPair,
    data: p,
    timestamp: Date.now()
  });

  // 2. Occasionally broadcast auto-replicate copy trading event
  if (Math.random() > 0.65) {
    const managers = ['@voss_quant', '@schen_macro', '@brody_mev', '@erostova_alpha'];
    const mgr = managers[Math.floor(Math.random() * managers.length)];
    const action = Math.random() > 0.45 ? 'BUY' : 'SELL';

    broadcastWs({
      type: 'AUTO_REPLICATE_TRADE_EVENT',
      timestamp: Date.now(),
      data: {
        leadTrader: mgr,
        pair: randPair,
        action: action,
        price: p.markPrice,
        leadSize: randPair.startsWith('BTC') ? (0.2 + Math.random() * 0.8) : (1.5 + Math.random() * 4.0),
        mirrorRatio: 1.0,
        autoReplicated: true,
        settlementNanos: 38000,
        status: 'MIRRORED_ON_CHAIN'
      }
    });
  }
}, 1000);

server.listen(PORT, () => {
  console.log(`===================================================================`);
  console.log(`🚀 CoinPurex Unified Platform Server (coinpurex.com)`);
  console.log(`   HTTP Web App:       http://localhost:${PORT}`);
  console.log(`   Native WebSocket:   ws://localhost:${PORT}/ws`);
  console.log(`   Production Domain:  https://coinpurex.com`);
  console.log(`===================================================================`);
});
