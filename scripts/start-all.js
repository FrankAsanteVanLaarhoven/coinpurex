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

// 2. Start Unified Web Platform & RFC 6455 WebSocket Server on :4200
console.log('[2/2] Launching Sovereign Web Platform & WebSocket Server on http://localhost:4200...');
const server = spawn('node', [path.join(__dirname, 'server.js')], {
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('Server spawn error:', err.message);
});

// Graceful termination
const shutdown = () => {
  console.log('\nShutting down CoinPurex platform services...');
  try {
    server.kill('SIGTERM');
  } catch (e) {}
  try {
    gateway.kill('SIGTERM');
  } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
