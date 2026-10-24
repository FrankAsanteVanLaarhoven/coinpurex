// CoinPurex Enterprise Platform - Multi-Service Orchestrator (coinpurex.com)
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('  COINPUREX ENTERPRISE PLATFORM (coinpurex.com) - ORCHESTRATOR');
console.log('================================================================');

// 1. Start Go High-Throughput Gateway on :8080
console.log('[1/2] Launching CoinPurex Go Live Data Gateway on http://localhost:8080...');
const gateway = spawn('go', ['run', '.'], {
  cwd: path.join(__dirname, '../backend/go-gateway'),
  stdio: 'inherit'
});

gateway.on('error', (err) => {
  console.warn('Go Gateway spawn notice (binary will run if Go is installed):', err.message);
});

// 2. Start Frontend Server on :4200 with institutional 404 handler
console.log('[2/2] Launching Sovereign Web Platform on http://localhost:4200...');
const mime = {
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  svg: 'image/svg+xml',
  json: 'application/json',
  png: 'image/png'
};

const root = path.join(__dirname, '../frontend/public');
const server = http.createServer((req, res) => {
  let file = path.join(root, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  let status = 200;
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(root, '404.html');
    status = 404;
  }
  const ext = path.extname(file).slice(1);
  res.writeHead(status, { 'Content-Type': mime[ext] || 'text/plain' });
  fs.createReadStream(file).pipe(res);
});

const PORT = 4200;
server.listen(PORT, () => {
  console.log(`\n🚀 CoinPurex Enterprise Platform fully online at http://localhost:${PORT}`);
  console.log('   - Sovereign DEX & Multi-Sig Treasury Cockpit: http://localhost:4200');
  console.log('   - Production Domain: https://coinpurex.com');
  console.log('   - Go Gateway SSE & REST Feeds: http://localhost:8080/api/v1/stream');
  console.log('   - Ready for institutional deployment & live trade execution.');
  console.log('================================================================\n');
});

// Graceful termination
const shutdown = () => {
  console.log('\nShutting down CoinPurex platform services...');
  server.close();
  try {
    gateway.kill('SIGTERM');
  } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
