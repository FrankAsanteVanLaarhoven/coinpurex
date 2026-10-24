// Test Suite for CerisCoin (CRS) and CoinPurexOffering
const assert = require('assert');

// Simulated CerisCoin matching the contract logic in contracts/core/CerisCoin.sol
class SimulatedCerisCoin {
    constructor(initialOwner = '0xOwner') {
        this.name = 'Ceris Coin';
        this.symbol = 'CRS';
        this.decimals = 5;
        this.initialSupply = 100_000_000n * (10n ** 5n); // 10,000,000,000,000
        this.totalSupply = this.initialSupply;
        this.owner = initialOwner;
        this.authority = null;
        this.burnAdmin = initialOwner;
        this.stopped = false;
        this.balances = { [initialOwner]: this.initialSupply };
        this.allowances = {};
        this.events = [];
    }

    balanceOf(account) {
        return this.balances[account] || 0n;
    }

    allowance(owner, spender) {
        return this.allowances[`${owner}_${spender}`] || 0n;
    }

    isAuthorized(caller) {
        return caller === this.owner;
    }

    setOwner(caller, newOwner) {
        if (!this.isAuthorized(caller)) throw new Error('Unauthorized');
        if (!newOwner) throw new Error('ZeroAddress');
        this.owner = newOwner;
        this.events.push({ event: 'LogSetOwner', owner: newOwner });
    }

    setAuthority(caller, newAuthority) {
        if (!this.isAuthorized(caller)) throw new Error('Unauthorized');
        this.authority = newAuthority;
        this.events.push({ event: 'LogSetAuthority', authority: newAuthority });
    }

    stop(caller) {
        if (!this.isAuthorized(caller)) throw new Error('Unauthorized');
        this.stopped = true;
    }

    start(caller) {
        if (!this.isAuthorized(caller)) throw new Error('Unauthorized');
        this.stopped = false;
    }

    isAdmin(caller) {
        return caller === this.burnAdmin && this.burnAdmin !== null;
    }

    renounceOwnership(caller) {
        if (!this.isAdmin(caller)) throw new Error('Unauthorized');
        this.burnAdmin = null;
    }

    burnfromAdmin(caller, guy, wad) {
        if (!this.isAdmin(caller)) throw new Error('Unauthorized');
        if (!guy) throw new Error('ZeroAddress');
        const bal = this.balanceOf(guy);
        if (bal < wad) throw new Error('InsufficientBalance');

        this.balances[guy] = bal - wad;
        this.totalSupply -= wad;
        this.events.push({ event: 'Burn', guy, wad });
        this.events.push({ event: 'Transfer', from: guy, to: '0x0000000000000000000000000000000000000000', wad });
    }

    approve(caller, guy, wad = (2n ** 256n) - 1n) {
        if (this.stopped) throw new Error('ContractStopped');
        if (!guy) throw new Error('ZeroAddress');
        this.allowances[`${caller}_${guy}`] = wad;
        this.events.push({ event: 'Approval', owner: caller, spender: guy, wad });
        return true;
    }

    increaseAllowance(caller, src, wad) {
        if (!src) throw new Error('ZeroAddress');
        const curr = this.allowance(caller, src);
        return this.approve(caller, src, curr + wad);
    }

    decreaseAllowance(caller, src, wad) {
        if (!src) throw new Error('ZeroAddress');
        const curr = this.allowance(caller, src);
        if (curr < wad) throw new Error('InsufficientAllowance');
        return this.approve(caller, src, curr - wad);
    }

    transfer(caller, dst, wad) {
        return this.transferFrom(caller, caller, dst, wad);
    }

    transferFrom(caller, src, dst, wad) {
        if (this.stopped) throw new Error('ContractStopped');
        if (!dst) throw new Error('ZeroAddress');

        const maxUint = (2n ** 256n) - 1n;
        if (src !== caller && this.allowance(src, caller) !== maxUint) {
            const currAllow = this.allowance(src, caller);
            if (currAllow < wad) throw new Error('InsufficientAllowance');
            this.allowances[`${src}_${caller}`] = currAllow - wad;
        }

        const bal = this.balanceOf(src);
        if (bal < wad) throw new Error('InsufficientBalance');

        this.balances[src] = bal - wad;
        this.balances[dst] = (this.balances[dst] || 0n) + wad;
        this.events.push({ event: 'Transfer', from: src, to: dst, wad });
        return true;
    }
}

// Simulated CoinPurexOffering matching contracts/enterprise/CoinPurexOffering.sol
class SimulatedCoinOffering {
    constructor(token, treasury, tokensPerEth, softCap, hardCap, minContrib, maxContrib) {
        this.token = token;
        this.treasury = treasury;
        this.tokensPerEth = tokensPerEth;
        this.softCap = softCap;
        this.hardCap = hardCap;
        this.minContribution = minContrib;
        this.maxContribution = maxContrib;
        this.admin = '0xAdmin';
        this.isPaused = false;
        this.isFinalized = false;
        this.totalEthRaised = 0n;
        this.totalTokensSold = 0n;
        this.totalContributors = 0n;
        this.contributions = {};
        this.tokenAllocations = {};
        this.hasContributed = {};
        this.treasuryBalance = 0n;
    }

    buyTokens(caller, recipient, ethAmount) {
        if (this.isPaused || this.isFinalized) throw new Error('OfferingNotActive');
        const buyer = recipient || caller;
        if (ethAmount < this.minContribution) throw new Error('BelowMinContribution');

        const newCumulative = (this.contributions[buyer] || 0n) + ethAmount;
        if (newCumulative > this.maxContribution) throw new Error('ExceedsMaxContribution');

        if (this.totalEthRaised + ethAmount > this.hardCap) throw new Error('ExceedsHardCap');

        // Token amount: (ethAmount in wei * tokensPerEth) / 10^18
        const tokenAmount = (ethAmount * this.tokensPerEth) / (10n ** 18n);
        if (tokenAmount <= 0n) throw new Error('ZeroAllocation');

        if (!this.hasContributed[buyer]) {
            this.hasContributed[buyer] = true;
            this.totalContributors++;
        }

        this.contributions[buyer] = newCumulative;
        this.tokenAllocations[buyer] = (this.tokenAllocations[buyer] || 0n) + tokenAmount;
        this.totalEthRaised += ethAmount;
        this.totalTokensSold += tokenAmount;

        // Transfer tokens from offering reserve to buyer
        this.token.transfer('0xOfferingContract', buyer, tokenAmount);

        // Forward ETH to treasury
        this.treasuryBalance += ethAmount;

        if (this.totalEthRaised >= this.hardCap) {
            this.isFinalized = true;
        }

        return tokenAmount;
    }

    setPaused(caller, paused) {
        if (caller !== this.admin) throw new Error('Unauthorized');
        this.isPaused = paused;
    }

    finalize(caller) {
        if (caller !== this.admin) throw new Error('Unauthorized');
        if (this.isFinalized) throw new Error('AlreadyFinalized');
        this.isFinalized = true;
    }
}

async function runCerisCoinTests() {
    console.log('\n--- Running CerisCoin (CRS) & CoinPurexOffering Tests ---');
    console.log('    (Ethereum 0x819c468e5dc88beb0702577cf8a90c2d0566ac8b Recreated Standard)');
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

    // 1. Token Initialization & Supply
    test('CerisCoin: should initialize with correct name, symbol, 5 decimals, and 100M CRS supply', () => {
        const token = new SimulatedCerisCoin('0xOwner');
        assert.strictEqual(token.name, 'Ceris Coin');
        assert.strictEqual(token.symbol, 'CRS');
        assert.strictEqual(token.decimals, 5);
        assert.strictEqual(token.totalSupply, 10_000_000_000_000n);
        assert.strictEqual(token.balanceOf('0xOwner'), 10_000_000_000_000n);
        assert.strictEqual(token.owner, '0xOwner');
        assert.strictEqual(token.burnAdmin, '0xOwner');
    });

    // 2. Transfers
    test('CerisCoin: should execute transfers between accounts and deduct balances accurately', () => {
        const token = new SimulatedCerisCoin('0xOwner');
        const transferAmount = 500_000n * (10n ** 5n); // 500k CRS
        token.transfer('0xOwner', '0xInvestor1', transferAmount);

        assert.strictEqual(token.balanceOf('0xInvestor1'), transferAmount);
        assert.strictEqual(token.balanceOf('0xOwner'), 10_000_000_000_000n - transferAmount);
    });

    // 3. Allowances & transferFrom
    test('CerisCoin: should allow approvals and transferFrom with standard allowance subtraction', () => {
        const token = new SimulatedCerisCoin('0xOwner');
        const allowAmount = 100_000n * (10n ** 5n);
        token.approve('0xOwner', '0xSpender', allowAmount);
        assert.strictEqual(token.allowance('0xOwner', '0xSpender'), allowAmount);

        token.transferFrom('0xSpender', '0xOwner', '0xRecipient', 40_000n * (10n ** 5n));
        assert.strictEqual(token.balanceOf('0xRecipient'), 40_000n * (10n ** 5n));
        assert.strictEqual(token.allowance('0xOwner', '0xSpender'), 60_000n * (10n ** 5n));
    });

    // 4. Increase / Decrease Allowance
    test('CerisCoin: should increase and decrease allowance safely without race condition', () => {
        const token = new SimulatedCerisCoin('0xOwner');
        token.approve('0xOwner', '0xSpender', 50_000n);
        token.increaseAllowance('0xOwner', '0xSpender', 25_000n);
        assert.strictEqual(token.allowance('0xOwner', '0xSpender'), 75_000n);

        token.decreaseAllowance('0xOwner', '0xSpender', 15_000n);
        assert.strictEqual(token.allowance('0xOwner', '0xSpender'), 60_000n);
    });

    // 5. DSStop Circuit Breaker
    test('CerisCoin: should halt transfers when stopped by authorized owner', () => {
        const token = new SimulatedCerisCoin('0xOwner');
        token.stop('0xOwner');
        assert.strictEqual(token.stopped, true);

        assert.throws(() => {
            token.transfer('0xOwner', '0xInvestor1', 1000n);
        }, /ContractStopped/);

        // Resume with start()
        token.start('0xOwner');
        assert.strictEqual(token.stopped, false);
        token.transfer('0xOwner', '0xInvestor1', 1000n);
        assert.strictEqual(token.balanceOf('0xInvestor1'), 1000n);
    });

    // 6. Admin Burn Capabilities
    test('CerisCoin: should allow burnAdmin to execute burnfromAdmin and reduce total supply', () => {
        const token = new SimulatedCerisCoin('0xOwner');
        token.transfer('0xOwner', '0xBadActor', 200_000n * (10n ** 5n));
        const supplyBefore = token.totalSupply;

        token.burnfromAdmin('0xOwner', '0xBadActor', 200_000n * (10n ** 5n));
        assert.strictEqual(token.balanceOf('0xBadActor'), 0n);
        assert.strictEqual(token.totalSupply, supplyBefore - (200_000n * (10n ** 5n)));
    });

    test('CerisCoin: should reject burnfromAdmin from unauthorized non-admin address', () => {
        const token = new SimulatedCerisCoin('0xOwner');
        token.transfer('0xOwner', '0xVictim', 50_000n);
        assert.throws(() => {
            token.burnfromAdmin('0xImposter', '0xVictim', 10_000n);
        }, /Unauthorized/);
    });

    // 7. Ownership Renunciation
    test('CerisCoin: should allow admin to renounce ownership and disable burnadmin permanently', () => {
        const token = new SimulatedCerisCoin('0xOwner');
        token.renounceOwnership('0xOwner');
        assert.strictEqual(token.burnAdmin, null);

        assert.throws(() => {
            token.burnfromAdmin('0xOwner', '0xAnyone', 100n);
        }, /Unauthorized/);
    });

    // 8. Coin Offering Presale Execution
    test('CoinPurexOffering: should accept ETH contribution, calculate CRS tokens, and forward ETH to Multi-Sig', () => {
        const token = new SimulatedCerisCoin('0xOwner');
        // Rate: 5,000 CRS (with 5 decimals) per 1 ETH (10^18 wei)
        const rate = 5000n * (10n ** 5n); // 500,000,000 base units / ETH
        const softCap = 10n * (10n ** 18n);  // 10 ETH
        const hardCap = 100n * (10n ** 18n); // 100 ETH
        const minContrib = 1n * (10n ** 17n); // 0.1 ETH
        const maxContrib = 10n * (10n ** 18n); // 10 ETH

        const offering = new SimulatedCoinOffering(token, '0xMultiSigTreasury', rate, softCap, hardCap, minContrib, maxContrib);

        // Pre-fund offering contract with 20M CRS
        const offeringSupply = 20_000_000n * (10n ** 5n);
        token.transfer('0xOwner', '0xOfferingContract', offeringSupply);

        // Buyer contributes 2 ETH
        const ethContrib = 2n * (10n ** 18n);
        const tokensReceived = offering.buyTokens('0xBuyer1', '0xBuyer1', ethContrib);

        // 2 ETH * 5,000 CRS = 10,000 CRS
        assert.strictEqual(tokensReceived, 10_000n * (10n ** 5n));
        assert.strictEqual(token.balanceOf('0xBuyer1'), 10_000n * (10n ** 5n));
        assert.strictEqual(offering.totalEthRaised, ethContrib);
        assert.strictEqual(offering.treasuryBalance, ethContrib);
        assert.strictEqual(offering.totalContributors, 1n);
    });

    // 9. Boundary & Cap Restrictions
    test('CoinPurexOffering: should enforce min/max contribution and hard cap boundaries', () => {
        const token = new SimulatedCerisCoin('0xOwner');
        const rate = 5000n * (10n ** 5n);
        const softCap = 1n * (10n ** 18n);
        const hardCap = 5n * (10n ** 18n); // 5 ETH hard cap
        const minContrib = 5n * (10n ** 17n); // 0.5 ETH min
        const maxContrib = 3n * (10n ** 18n); // 3 ETH max

        const offering = new SimulatedCoinOffering(token, '0xMultiSigTreasury', rate, softCap, hardCap, minContrib, maxContrib);
        token.transfer('0xOwner', '0xOfferingContract', 1_000_000n * (10n ** 5n));

        // Below minimum
        assert.throws(() => {
            offering.buyTokens('0xBuyer', '0xBuyer', 1n * (10n ** 17n)); // 0.1 ETH < 0.5 ETH
        }, /BelowMinContribution/);

        // Above maximum
        assert.throws(() => {
            offering.buyTokens('0xBuyer', '0xBuyer', 4n * (10n ** 18n)); // 4 ETH > 3 ETH
        }, /ExceedsMaxContribution/);

        // Legitimate fill
        offering.buyTokens('0xBuyerA', '0xBuyerA', 3n * (10n ** 18n));
        offering.buyTokens('0xBuyerB', '0xBuyerB', 2n * (10n ** 18n)); // Total 5 ETH reached

        assert.strictEqual(offering.isFinalized, true);

        // Exceeding hard cap
        assert.throws(() => {
            offering.buyTokens('0xBuyerC', '0xBuyerC', 1n * (10n ** 18n));
        }, /OfferingNotActive/);
    });

    // 10. Pause Mechanism
    test('CoinPurexOffering: should reject purchases when paused by administrator', () => {
        const token = new SimulatedCerisCoin('0xOwner');
        const offering = new SimulatedCoinOffering(token, '0xMultiSigTreasury', 5000n * (10n ** 5n), 1n, 100n * (10n ** 18n), 1n * (10n ** 17n), 10n * (10n ** 18n));
        token.transfer('0xOwner', '0xOfferingContract', 1_000_000n * (10n ** 5n));

        offering.setPaused('0xAdmin', true);
        assert.throws(() => {
            offering.buyTokens('0xBuyer', '0xBuyer', 1n * (10n ** 18n));
        }, /OfferingNotActive/);
    });

    console.log(`Summary: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) process.exit(1);
    return { passed, failed };
}

module.exports = { runCerisCoinTests };

if (require.main === module) {
    runCerisCoinTests();
}
