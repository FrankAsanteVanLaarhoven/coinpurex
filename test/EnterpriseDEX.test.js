// Enterprise DEX Test Suite
const assert = require('assert');

const SIDE = {
    BUY: 0,
    SELL: 1
};

class SimulatedDEX {
    constructor() {
        this.admin = '0xAdmin';
        this.tokens = {};
        this.tokenList = [];
        this.traderBalances = {}; // trader => ticker => balance
        this.orderBook = {}; // ticker => { 0: [], 1: [] }
        this.nextOrderId = 0;
        this.nextTradeId = 0;
        this.trades = [];
        this.DAI = 'DAI';
    }

    _getBalance(trader, ticker) {
        if (!this.traderBalances[trader]) this.traderBalances[trader] = {};
        return this.traderBalances[trader][ticker] || 0n;
    }

    _setBalance(trader, ticker, amount) {
        if (!this.traderBalances[trader]) this.traderBalances[trader] = {};
        this.traderBalances[trader][ticker] = amount;
    }

    addToken(ticker, address) {
        if (!address) throw new Error("Zero token address");
        this.tokens[ticker] = { ticker, address };
        this.tokenList.push(ticker);
        this.orderBook[ticker] = { 0: [], 1: [] };
    }

    deposit(trader, ticker, amount) {
        if (!this.tokens[ticker]) throw new Error("TokenDoesNotExist");
        if (amount <= 0n) throw new Error("ZeroAmountNotAllowed");
        const current = this._getBalance(trader, ticker);
        this._setBalance(trader, ticker, current + amount);
    }

    withdraw(trader, ticker, amount) {
        if (!this.tokens[ticker]) throw new Error("TokenDoesNotExist");
        if (amount <= 0n) throw new Error("ZeroAmountNotAllowed");
        const current = this._getBalance(trader, ticker);
        if (current < amount) throw new Error("BalanceTooLow");
        this._setBalance(trader, ticker, current - amount);
    }

    createLimitOrder(trader, ticker, amount, price, side) {
        if (!this.tokens[ticker]) throw new Error("TokenDoesNotExist");
        if (ticker === this.DAI) throw new Error("CannotTradeQuoteToken");
        if (amount <= 0n) throw new Error("ZeroAmountNotAllowed");
        if (price <= 0n) throw new Error("ZeroPriceNotAllowed");

        if (side === SIDE.SELL) {
            const bal = this._getBalance(trader, ticker);
            if (bal < amount) throw new Error("TokenBalanceTooLow");
        } else {
            const bal = this._getBalance(trader, this.DAI);
            if (bal < amount * price) throw new Error("DaiBalanceTooLow");
        }

        const orders = this.orderBook[ticker][side];
        const newOrder = {
            id: this.nextOrderId,
            trader,
            side,
            ticker,
            amount,
            filled: 0n,
            price,
            date: Date.now()
        };
        orders.push(newOrder);

        // Insertion sort price-time priority
        if (orders.length > 1) {
            let i = orders.length - 1;
            while (i > 0) {
                if (side === SIDE.BUY && orders[i - 1].price >= orders[i].price) break;
                if (side === SIDE.SELL && orders[i - 1].price <= orders[i].price) break;
                const temp = orders[i - 1];
                orders[i - 1] = orders[i];
                orders[i] = temp;
                i--;
            }
        }

        this.nextOrderId++;
        return newOrder.id;
    }

    cancelLimitOrder(trader, ticker, side, orderId) {
        if (!this.tokens[ticker]) throw new Error("TokenDoesNotExist");
        const orders = this.orderBook[ticker][side];
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx === -1) throw new Error("OrderNotFound");
        if (orders[idx].trader !== trader) throw new Error("OnlyOrderCreator");

        orders.splice(idx, 1);
        return true;
    }

    createMarketOrder(trader, ticker, amount, side) {
        if (!this.tokens[ticker]) throw new Error("TokenDoesNotExist");
        if (ticker === this.DAI) throw new Error("CannotTradeQuoteToken");
        if (amount <= 0n) throw new Error("ZeroAmountNotAllowed");

        if (side === SIDE.SELL) {
            const bal = this._getBalance(trader, ticker);
            if (bal < amount) throw new Error("TokenBalanceTooLow");
        }

        const oppSide = side === SIDE.BUY ? SIDE.SELL : SIDE.BUY;
        const orders = this.orderBook[ticker][oppSide];

        let i = 0;
        let remaining = amount;

        while (i < orders.length && remaining > 0n) {
            const available = orders[i].amount - orders[i].filled;
            const matched = remaining > available ? available : remaining;
            remaining -= matched;
            orders[i].filled += matched;

            const totalDai = matched * orders[i].price;

            if (side === SIDE.SELL) {
                this._setBalance(trader, ticker, this._getBalance(trader, ticker) - matched);
                this._setBalance(trader, this.DAI, this._getBalance(trader, this.DAI) + totalDai);
                this._setBalance(orders[i].trader, ticker, this._getBalance(orders[i].trader, ticker) + matched);
                this._setBalance(orders[i].trader, this.DAI, this._getBalance(orders[i].trader, this.DAI) - totalDai);
            } else {
                if (this._getBalance(trader, this.DAI) < totalDai) {
                    throw new Error("DaiBalanceTooLow");
                }
                this._setBalance(trader, ticker, this._getBalance(trader, ticker) + matched);
                this._setBalance(trader, this.DAI, this._getBalance(trader, this.DAI) - totalDai);
                this._setBalance(orders[i].trader, ticker, this._getBalance(orders[i].trader, ticker) - matched);
                this._setBalance(orders[i].trader, this.DAI, this._getBalance(orders[i].trader, this.DAI) + totalDai);
            }

            this.trades.push({
                tradeId: this.nextTradeId,
                orderId: orders[i].id,
                ticker,
                maker: orders[i].trader,
                taker: trader,
                amount: matched,
                price: orders[i].price,
                date: Date.now()
            });

            this.nextTradeId++;
            i++;
        }

        // Prune completely filled orders cleanly
        while (orders.length > 0 && orders[0].filled === orders[0].amount) {
            orders.shift();
        }
    }
}

async function runDEXTests() {
    console.log('\n--- Running Enterprise DEX Order Book & Execution Tests ---');
    let passed = 0;
    let failed = 0;

    function test(name, fn) {
        try {
            fn();
            console.log(`  ✓ ${name}`);
            passed++;
        } catch (err) {
            console.error(`  ✗ ${name}: ${err.message}`);
            failed++;
        }
    }

    const trader1 = '0xTraderAlpha';
    const trader2 = '0xTraderBeta';
    const [DAI, BTC, ETH, LINK] = ['DAI', 'BTC', 'ETH', 'LINK'];

    function setupDEX() {
        const dex = new SimulatedDEX();
        dex.addToken(DAI, '0xDaiContract');
        dex.addToken(BTC, '0xBtcContract');
        dex.addToken(ETH, '0xEthContract');
        dex.addToken(LINK, '0xLinkContract');

        dex.deposit(trader1, DAI, 500000n);
        dex.deposit(trader1, BTC, 10n);
        dex.deposit(trader1, ETH, 100n);

        dex.deposit(trader2, DAI, 500000n);
        dex.deposit(trader2, BTC, 10n);
        dex.deposit(trader2, ETH, 100n);
        return dex;
    }

    test('should deposit tokens and update internal balances', () => {
        const dex = new SimulatedDEX();
        dex.addToken(DAI, '0xDaiContract');
        dex.deposit(trader1, DAI, 500n);
        assert.strictEqual(dex._getBalance(trader1, DAI), 500n);
    });

    test('should NOT deposit tokens if token is not registered', () => {
        const dex = new SimulatedDEX();
        assert.throws(() => {
            dex.deposit(trader1, 'UNKNOWN', 100n);
        }, /TokenDoesNotExist/);
    });

    test('should withdraw tokens and reduce internal balance', () => {
        const dex = new SimulatedDEX();
        dex.addToken(DAI, '0xDaiContract');
        dex.deposit(trader1, DAI, 500n);
        dex.withdraw(trader1, DAI, 200n);
        assert.strictEqual(dex._getBalance(trader1, DAI), 300n);
    });

    test('should NOT withdraw more tokens than available balance', () => {
        const dex = new SimulatedDEX();
        dex.addToken(DAI, '0xDaiContract');
        dex.deposit(trader1, DAI, 100n);
        assert.throws(() => {
            dex.withdraw(trader1, DAI, 200n);
        }, /BalanceTooLow/);
    });

    test('should create Limit BUY orders sorted in descending price order', () => {
        const dex = setupDEX();
        dex.createLimitOrder(trader1, BTC, 1n, 50000n, SIDE.BUY);
        dex.createLimitOrder(trader1, BTC, 1n, 52000n, SIDE.BUY); // higher bid
        dex.createLimitOrder(trader1, BTC, 1n, 49000n, SIDE.BUY); // lower bid

        const buyBook = dex.orderBook[BTC][SIDE.BUY];
        assert.strictEqual(buyBook.length, 3);
        assert.strictEqual(buyBook[0].price, 52000n); // Highest bid first
        assert.strictEqual(buyBook[1].price, 50000n);
        assert.strictEqual(buyBook[2].price, 49000n);
    });

    test('should create Limit SELL orders sorted in ascending price order', () => {
        const dex = setupDEX();
        dex.createLimitOrder(trader2, BTC, 1n, 55000n, SIDE.SELL);
        dex.createLimitOrder(trader2, BTC, 1n, 53000n, SIDE.SELL); // lower ask
        dex.createLimitOrder(trader2, BTC, 1n, 57000n, SIDE.SELL); // higher ask

        const sellBook = dex.orderBook[BTC][SIDE.SELL];
        assert.strictEqual(sellBook.length, 3);
        assert.strictEqual(sellBook[0].price, 53000n); // Lowest ask first
        assert.strictEqual(sellBook[1].price, 55000n);
        assert.strictEqual(sellBook[2].price, 57000n);
    });

    test('should NOT create limit order if trader balance is insufficient', () => {
        const dex = setupDEX();
        assert.throws(() => {
            dex.createLimitOrder(trader1, BTC, 100n, 50000n, SIDE.SELL); // Only has 10 BTC
        }, /TokenBalanceTooLow/);

        assert.throws(() => {
            dex.createLimitOrder(trader1, BTC, 10n, 100000n, SIDE.BUY); // Requires 1,000,000 DAI, only has 100,000
        }, /DaiBalanceTooLow/);
    });

    test('should cancel resting limit order and update book', () => {
        const dex = setupDEX();
        const id = dex.createLimitOrder(trader1, BTC, 1n, 50000n, SIDE.BUY);
        assert.strictEqual(dex.orderBook[BTC][SIDE.BUY].length, 1);
        dex.cancelLimitOrder(trader1, BTC, SIDE.BUY, id);
        assert.strictEqual(dex.orderBook[BTC][SIDE.BUY].length, 0);
    });

    test('should NOT allow unauthorized trader to cancel another trader\'s order', () => {
        const dex = setupDEX();
        const id = dex.createLimitOrder(trader1, BTC, 1n, 50000n, SIDE.BUY);
        assert.throws(() => {
            dex.cancelLimitOrder(trader2, BTC, SIDE.BUY, id);
        }, /OnlyOrderCreator/);
    });

    test('should execute Market BUY order matching single limit order', () => {
        const dex = setupDEX();
        dex.createLimitOrder(trader2, BTC, 2n, 50000n, SIDE.SELL);

        const t1DaiBefore = dex._getBalance(trader1, DAI);
        const t1BtcBefore = dex._getBalance(trader1, BTC);

        dex.createMarketOrder(trader1, BTC, 2n, SIDE.BUY);

        assert.strictEqual(dex._getBalance(trader1, BTC), t1BtcBefore + 2n);
        assert.strictEqual(dex._getBalance(trader1, DAI), t1DaiBefore - 100000n);
        assert.strictEqual(dex.orderBook[BTC][SIDE.SELL].length, 0); // Fully filled and cleared
        assert.strictEqual(dex.trades.length, 1);
    });

    test('should execute Market order matching across multiple book levels with partial fill', () => {
        const dex = setupDEX();
        dex.createLimitOrder(trader2, BTC, 1n, 50000n, SIDE.SELL); // Level 1
        dex.createLimitOrder(trader2, BTC, 2n, 51000n, SIDE.SELL); // Level 2

        // Market buy of 2 BTC should take all of Level 1 (1 BTC @ 50k) and 1 BTC of Level 2 (@ 51k)
        dex.createMarketOrder(trader1, BTC, 2n, SIDE.BUY);

        assert.strictEqual(dex.trades.length, 2);
        assert.strictEqual(dex.trades[0].amount, 1n);
        assert.strictEqual(dex.trades[0].price, 50000n);
        assert.strictEqual(dex.trades[1].amount, 1n);
        assert.strictEqual(dex.trades[1].price, 51000n);

        // Level 2 should now have 1 BTC remaining
        const sellBook = dex.orderBook[BTC][SIDE.SELL];
        assert.strictEqual(sellBook.length, 1);
        assert.strictEqual(sellBook[0].amount, 2n);
        assert.strictEqual(sellBook[0].filled, 1n);
    });

    test('should NOT trade quote currency (DAI) against itself', () => {
        const dex = setupDEX();
        assert.throws(() => {
            dex.createLimitOrder(trader1, DAI, 10n, 1n, SIDE.BUY);
        }, /CannotTradeQuoteToken/);
    });

    test('should execute Market SELL order matching single limit BUY order', () => {
        const dex = setupDEX();
        // Trader 1 places limit BUY for 2 BTC at 50,000 DAI
        dex.createLimitOrder(trader1, BTC, 2n, 50000n, SIDE.BUY);

        const t2BtcBefore = dex._getBalance(trader2, BTC);
        const t2DaiBefore = dex._getBalance(trader2, DAI);

        // Trader 2 executes market SELL of 2 BTC
        dex.createMarketOrder(trader2, BTC, 2n, SIDE.SELL);

        assert.strictEqual(dex._getBalance(trader2, BTC), t2BtcBefore - 2n);
        assert.strictEqual(dex._getBalance(trader2, DAI), t2DaiBefore + 100000n);
        assert.strictEqual(dex.orderBook[BTC][SIDE.BUY].length, 0); // Filled
        assert.strictEqual(dex.trades.length, 1);
    });

    test('should execute Market SELL order matching across multiple book levels with descending price priority', () => {
        const dex = setupDEX();
        // Higher price first (descending priority for bids)
        dex.createLimitOrder(trader1, BTC, 1n, 52000n, SIDE.BUY); // Level 1 (better price)
        dex.createLimitOrder(trader1, BTC, 2n, 50000n, SIDE.BUY); // Level 2

        // Market SELL of 2 BTC should take 1 BTC @ 52,000 first, then 1 BTC @ 50,000
        dex.createMarketOrder(trader2, BTC, 2n, SIDE.SELL);

        assert.strictEqual(dex.trades.length, 2);
        assert.strictEqual(dex.trades[0].price, 52000n);
        assert.strictEqual(dex.trades[0].amount, 1n);
        assert.strictEqual(dex.trades[1].price, 50000n);
        assert.strictEqual(dex.trades[1].amount, 1n);

        // Level 2 should have 1 BTC remaining
        const buyBook = dex.orderBook[BTC][SIDE.BUY];
        assert.strictEqual(buyBook.length, 1);
        assert.strictEqual(buyBook[0].amount, 2n);
        assert.strictEqual(buyBook[0].filled, 1n);
    });

    test('should NOT create market SELL order if trader balance is insufficient', () => {
        const dex = setupDEX();
        dex.createLimitOrder(trader1, BTC, 1n, 50000n, SIDE.BUY);
        assert.throws(() => {
            dex.createMarketOrder(trader2, BTC, 1000n, SIDE.SELL); // trader2 only has 5 BTC
        }, /TokenBalanceTooLow/);
    });

    console.log(`Summary: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) process.exit(1);
    return { passed, failed };
}

module.exports = { runDEXTests, SimulatedDEX };

if (require.main === module) {
    runDEXTests();
}
