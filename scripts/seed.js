// Enterprise Seeding Script
const fs = require('fs');
const path = require('path');

async function seed() {
    console.log('\n--- Seeding Enterprise Platform Initial Liquidity & Governance ---');

    const seedData = {
        timestamp: new Date().toISOString(),
        treasury: {
            ethBalance: 245.5,
            daiBalance: 1250000,
            crsBalance: 20000000,
            wbtcBalance: 14.25,
            wethBalance: 120.0,
            linkBalance: 15400,
            proposals: [
                {
                    id: 0,
                    to: '0x976EA74026E72bbf5501020b994473cD304e8Bde',
                    token: 'ETH',
                    amount: 15.0,
                    description: 'CoinPurex Protocol Core Contributor Grant Q4',
                    approvals: ['0x70997970C51812dc3A010C7d01b50e0d17dc79C8'],
                    approvalsCount: 1,
                    quorum: 2,
                    executed: false,
                    cancelled: false,
                    createdAt: '2026-10-22T14:30:00Z'
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
                    approvalsCount: 2,
                    quorum: 2,
                    executed: true,
                    cancelled: false,
                    createdAt: '2026-10-21T09:15:00Z'
                },
                {
                    id: 2,
                    to: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
                    token: 'CRS',
                    amount: 20000000,
                    description: 'Ceris Coin (CRS) Offering Launchpad Liquidity Pool Provisioning',
                    approvals: [
                        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
                        '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
                    ],
                    approvalsCount: 2,
                    quorum: 2,
                    executed: true,
                    cancelled: false,
                    createdAt: '2026-10-23T16:00:00Z'
                },
                {
                    id: 3,
                    to: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
                    token: 'LINK',
                    amount: 2500,
                    description: 'Chainlink Oracle Data Feeds Upkeep Fund',
                    approvals: [],
                    approvalsCount: 0,
                    quorum: 2,
                    executed: false,
                    cancelled: false,
                    createdAt: '2026-10-23T08:00:00Z'
                }
            ]
        },
        offering: {
            tokenName: 'Ceris Coin',
            tokenSymbol: 'CRS',
            tokenContract: '0x819c468e5dc88beb0702577cf8a90c2d0566ac8b',
            offeringContract: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
            treasury: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            tokensPerEth: 5000,
            priceUsd: 0.50,
            softCapEth: 50,
            hardCapEth: 1000,
            totalRaisedEth: 412.5,
            totalTokensSold: 2062500,
            totalContributors: 284,
            minContributionEth: 0.05,
            maxContributionEth: 25.0,
            status: 'ACTIVE',
            progressPercent: 41.25,
            etherscanUrl: 'https://etherscan.io/token/0x819c468e5dc88beb0702577cf8a90c2d0566ac8b#readContract'
        },
        dex: {
            pairs: {
                'CRS/DAI': {
                    markPrice: 0.50,
                    change24h: 12.50,
                    high24h: 0.54,
                    low24h: 0.44,
                    volume24h: 580000,
                    bids: [
                        { price: 0.495, amount: 25000, total: 12375.00, depth: 0.90 },
                        { price: 0.490, amount: 50000, total: 24500.00, depth: 0.75 },
                        { price: 0.480, amount: 120000, total: 57600.00, depth: 0.50 }
                    ],
                    asks: [
                        { price: 0.505, amount: 30000, total: 15150.00, depth: 0.88 },
                        { price: 0.510, amount: 65000, total: 33150.00, depth: 0.70 },
                        { price: 0.520, amount: 100000, total: 52000.00, depth: 0.45 }
                    ]
                },
                'BTC/DAI': {
                    markPrice: 68450.00,
                    change24h: 3.42,
                    high24h: 69200.00,
                    low24h: 67100.00,
                    volume24h: 4218000,
                    bids: [
                        { price: 68420.00, amount: 1.25, total: 85525.00, depth: 0.85 },
                        { price: 68380.00, amount: 2.50, total: 170950.00, depth: 0.72 },
                        { price: 68310.00, amount: 4.10, total: 280071.00, depth: 0.60 },
                        { price: 68250.00, amount: 5.75, total: 392437.50, depth: 0.45 },
                        { price: 68100.00, amount: 8.20, total: 558420.00, depth: 0.30 }
                    ],
                    asks: [
                        { price: 68480.00, amount: 1.10, total: 75328.00, depth: 0.88 },
                        { price: 68520.00, amount: 2.80, total: 191856.00, depth: 0.75 },
                        { price: 68590.00, amount: 3.90, total: 267501.00, depth: 0.58 },
                        { price: 68650.00, amount: 6.20, total: 425630.00, depth: 0.42 },
                        { price: 68780.00, amount: 9.50, total: 653410.00, depth: 0.25 }
                    ]
                },
                'ETH/DAI': {
                    markPrice: 3520.50,
                    change24h: -1.18,
                    high24h: 3590.00,
                    low24h: 3480.00,
                    volume24h: 8940000,
                    bids: [
                        { price: 3518.00, amount: 15.0, total: 52770.00, depth: 0.80 },
                        { price: 3512.00, amount: 28.5, total: 100092.00, depth: 0.65 },
                        { price: 3505.00, amount: 42.0, total: 147210.00, depth: 0.48 }
                    ],
                    asks: [
                        { price: 3524.00, amount: 12.0, total: 42288.00, depth: 0.85 },
                        { price: 3530.00, amount: 30.0, total: 105900.00, depth: 0.68 },
                        { price: 3538.00, amount: 55.0, total: 194590.00, depth: 0.50 }
                    ]
                },
                'LINK/DAI': {
                    markPrice: 18.75,
                    change24h: 5.62,
                    high24h: 19.20,
                    low24h: 17.60,
                    volume24h: 1250000,
                    bids: [
                        { price: 18.70, amount: 850.0, total: 15895.00, depth: 0.75 },
                        { price: 18.60, amount: 1500.0, total: 27900.00, depth: 0.55 }
                    ],
                    asks: [
                        { price: 18.82, amount: 920.0, total: 17314.40, depth: 0.78 },
                        { price: 18.95, amount: 2100.0, total: 39795.00, depth: 0.45 }
                    ]
                }
            },
            recentTrades: [
                { tradeId: 104, ticker: 'BTC/DAI', side: 'BUY', price: 68450.00, amount: 0.85, date: '10:51:42' },
                { tradeId: 103, ticker: 'BTC/DAI', side: 'SELL', price: 68420.00, amount: 1.15, date: '10:50:18' },
                { tradeId: 102, ticker: 'BTC/DAI', side: 'BUY', price: 68440.00, amount: 0.50, date: '10:48:55' },
                { tradeId: 101, ticker: 'ETH/DAI', side: 'BUY', price: 3520.50, amount: 8.00, date: '10:47:12' },
                { tradeId: 100, ticker: 'LINK/DAI', side: 'BUY', price: 18.75, amount: 450.0, date: '10:45:04' }
            ]
        }
    };

    const seedPath = path.join(__dirname, '../frontend/public/seed-data.json');
    fs.mkdirSync(path.dirname(seedPath), { recursive: true });
    fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2));

    console.log(`✓ Seeded initial liquidity & proposals to: ${seedPath}\n`);
}

if (require.main === module) {
    seed();
}

module.exports = { seed };
