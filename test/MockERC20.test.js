// MockERC20 Contract Verification Suite
const assert = require('assert');

class SimulatedERC20 {
    constructor(name, symbol, decimals, initialSupply, owner) {
        this.name = name;
        this.symbol = symbol;
        this.decimals = decimals;
        this.totalSupply = 0n;
        this.balanceOf = {};
        this.allowance = {}; // owner => spender => amount

        if (initialSupply > 0n && owner) {
            this.mint(owner, initialSupply);
        }
    }

    _getBalance(account) {
        return this.balanceOf[account] || 0n;
    }

    _getAllowance(owner, spender) {
        if (!this.allowance[owner]) return 0n;
        return this.allowance[owner][spender] || 0n;
    }

    transfer(sender, to, amount) {
        if (!to || to === '0x0000000000000000000000000000000000000000') throw new Error("ZeroAddress");
        const balance = this._getBalance(sender);
        if (balance < amount) throw new Error("InsufficientBalance");
        this.balanceOf[sender] = balance - amount;
        this.balanceOf[to] = this._getBalance(to) + amount;
        return true;
    }

    approve(owner, spender, amount) {
        if (!spender || spender === '0x0000000000000000000000000000000000000000') throw new Error("ZeroAddress");
        if (!this.allowance[owner]) this.allowance[owner] = {};
        this.allowance[owner][spender] = amount;
        return true;
    }

    transferFrom(spender, from, to, amount) {
        if (!to || to === '0x0000000000000000000000000000000000000000') throw new Error("ZeroAddress");
        const currentAllowance = this._getAllowance(from, spender);
        if (currentAllowance < amount) throw new Error("InsufficientAllowance");
        const fromBalance = this._getBalance(from);
        if (fromBalance < amount) throw new Error("InsufficientBalance");

        if (currentAllowance !== (2n ** 256n - 1n)) {
            this.allowance[from][spender] = currentAllowance - amount;
        }
        this.balanceOf[from] = fromBalance - amount;
        this.balanceOf[to] = this._getBalance(to) + amount;
        return true;
    }

    mint(to, amount) {
        if (!to || to === '0x0000000000000000000000000000000000000000') throw new Error("ZeroAddress");
        this.totalSupply += amount;
        this.balanceOf[to] = this._getBalance(to) + amount;
    }

    faucet(to, amount) {
        this.mint(to, amount);
    }

    burn(caller, from, amount) {
        if (!from || from === '0x0000000000000000000000000000000000000000') throw new Error("ZeroAddress");
        const balance = this._getBalance(from);
        if (balance < amount) throw new Error("InsufficientBalance");

        if (caller !== from) {
            const currentAllowance = this._getAllowance(from, caller);
            if (currentAllowance < amount) throw new Error("InsufficientAllowance");
            if (currentAllowance !== (2n ** 256n - 1n)) {
                this.allowance[from][caller] = currentAllowance - amount;
            }
        }
        this.balanceOf[from] = balance - amount;
        this.totalSupply -= amount;
    }
}

async function runMockERC20Tests() {
    console.log('--- Running MockERC20 Token & Faucet Tests ---');
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

    const alice = '0xAlice';
    const bob = '0xBob';
    const charlie = '0xCharlie';

    test('should initialize with correct parameters and initial supply', () => {
        const token = new SimulatedERC20('Dai Stablecoin', 'DAI', 18, 1000000n, alice);
        assert.strictEqual(token.name, 'Dai Stablecoin');
        assert.strictEqual(token.symbol, 'DAI');
        assert.strictEqual(token.decimals, 18);
        assert.strictEqual(token.totalSupply, 1000000n);
        assert.strictEqual(token._getBalance(alice), 1000000n);
    });

    test('should execute standard transfer and update balances', () => {
        const token = new SimulatedERC20('Dai Stablecoin', 'DAI', 18, 1000n, alice);
        token.transfer(alice, bob, 400n);
        assert.strictEqual(token._getBalance(alice), 600n);
        assert.strictEqual(token._getBalance(bob), 400n);
    });

    test('should reject transfer with InsufficientBalance', () => {
        const token = new SimulatedERC20('Dai Stablecoin', 'DAI', 18, 100n, alice);
        assert.throws(() => {
            token.transfer(alice, bob, 200n);
        }, /InsufficientBalance/);
    });

    test('should reject transfer to ZeroAddress', () => {
        const token = new SimulatedERC20('Dai Stablecoin', 'DAI', 18, 100n, alice);
        assert.throws(() => {
            token.transfer(alice, '0x0000000000000000000000000000000000000000', 50n);
        }, /ZeroAddress/);
    });

    test('should set allowance and execute transferFrom with allowance deduction', () => {
        const token = new SimulatedERC20('Dai Stablecoin', 'DAI', 18, 1000n, alice);
        token.approve(alice, bob, 500n);
        assert.strictEqual(token._getAllowance(alice, bob), 500n);

        token.transferFrom(bob, alice, charlie, 300n);
        assert.strictEqual(token._getBalance(alice), 700n);
        assert.strictEqual(token._getBalance(charlie), 300n);
        assert.strictEqual(token._getAllowance(alice, bob), 200n);
    });

    test('should reject transferFrom exceeding allowance', () => {
        const token = new SimulatedERC20('Dai Stablecoin', 'DAI', 18, 1000n, alice);
        token.approve(alice, bob, 100n);
        assert.throws(() => {
            token.transferFrom(bob, alice, charlie, 150n);
        }, /InsufficientAllowance/);
    });

    test('should dispense tokens via faucet', () => {
        const token = new SimulatedERC20('Wrapped Bitcoin', 'WBTC', 8, 0n, alice);
        token.faucet(bob, 50000000n); // 0.5 BTC
        assert.strictEqual(token._getBalance(bob), 50000000n);
        assert.strictEqual(token.totalSupply, 50000000n);
    });

    test('should burn tokens and reduce totalSupply', () => {
        const token = new SimulatedERC20('Dai Stablecoin', 'DAI', 18, 1000n, alice);
        token.burn(alice, alice, 300n);
        assert.strictEqual(token._getBalance(alice), 700n);
        assert.strictEqual(token.totalSupply, 700n);
    });

    console.log(`Summary: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) process.exit(1);
    return { passed, failed };
}

module.exports = { runMockERC20Tests, SimulatedERC20 };

if (require.main === module) {
    runMockERC20Tests();
}
