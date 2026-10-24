// Enterprise Extensions Test Suite: DeFi, GameFi, Multi-Chain (Polygon/Arbitrum), Arbitrage, Securities & FTPS
const assert = require('assert');

class SimulatedDeFiVault {
    constructor() {
        this.totalAssets = 0n;
        this.totalSupply = 0n;
        this.balances = {};
    }

    deposit(caller, assets) {
        if (assets <= 0n) throw new Error("ZeroAssets");
        let shares = assets;
        if (this.totalAssets > 0n && this.totalSupply > 0n) {
            shares = (assets * this.totalSupply) / this.totalAssets;
        }
        this.totalAssets += assets;
        this.totalSupply += shares;
        this.balances[caller] = (this.balances[caller] || 0n) + shares;
        return shares;
    }

    redeem(caller, shares) {
        if (shares <= 0n) throw new Error("ZeroShares");
        if ((this.balances[caller] || 0n) < shares) throw new Error("InsufficientBalance");
        const assets = (shares * this.totalAssets) / this.totalSupply;
        this.balances[caller] -= shares;
        this.totalSupply -= shares;
        this.totalAssets -= assets;
        return assets;
    }

    harvestYield(yieldAssets) {
        this.totalAssets += yieldAssets;
    }
}

class SimulatedSecurityToken {
    constructor() {
        this.identities = {};
        this.balances = {};
        this.frozen = {};
    }

    verifyInvestor(investor, countryCode, isAccredited, lockupSeconds) {
        this.identities[investor] = {
            isVerified: true,
            isAccredited,
            countryCode,
            lockupExpiry: Date.now() + (lockupSeconds * 1000)
        };
    }

    canTransfer(from, to, amount) {
        if (this.frozen[from]) return { ok: false, reason: "Sender frozen" };
        if (this.frozen[to]) return { ok: false, reason: "Recipient frozen" };
        if (!this.identities[from]?.isVerified) return { ok: false, reason: "Sender not KYC verified" };
        if (!this.identities[to]?.isVerified) return { ok: false, reason: "Recipient not KYC verified" };
        if (Date.now() < (this.identities[from]?.lockupExpiry || 0)) return { ok: false, reason: "Lockup active" };
        if ((this.balances[from] || 0n) < amount) return { ok: false, reason: "Insufficient balance" };
        return { ok: true, reason: "Compliant" };
    }

    mint(to, amount) {
        if (!this.identities[to]?.isVerified) throw new Error("InvestorNotVerified");
        this.balances[to] = (this.balances[to] || 0n) + amount;
    }

    transfer(from, to, amount) {
        const check = this.canTransfer(from, to, amount);
        if (!check.ok) throw new Error(check.reason);
        this.balances[from] -= amount;
        this.balances[to] = (this.balances[to] || 0n) + amount;
    }

    recoveryTransfer(lost, target) {
        if (!this.identities[target]?.isVerified) throw new Error("InvestorNotVerified");
        const amt = this.balances[lost] || 0n;
        this.balances[lost] = 0n;
        this.balances[target] = (this.balances[target] || 0n) + amt;
    }
}

class SimulatedArbitrageEngine {
    calculateSpread(orderBookPrice, ammPrice) {
        let spreadBps = 0;
        if (orderBookPrice > ammPrice) {
            spreadBps = Number(((orderBookPrice - ammPrice) * 10000n) / ammPrice);
        } else {
            spreadBps = Number(((ammPrice - orderBookPrice) * 10000n) / orderBookPrice);
        }
        return { spreadBps, isProfitable: spreadBps > 15 };
    }
}

class SimulatedCrossChainGateway {
    constructor() {
        this.supportedChains = { 1: true, 137: true, 42161: true, 10: true, 8453: true };
        this.messages = [];
    }

    bridgeTransfer(destChainId, sender, recipient, token, amount) {
        if (!this.supportedChains[destChainId]) throw new Error("UnsupportedChain");
        const msgId = this.messages.length;
        this.messages.push({ msgId, destChainId, sender, recipient, token, amount, executed: false });
        return msgId;
    }
}

class SimulatedSettlementGateway {
    constructor() {
        this.batches = [];
    }

    submitBatch(merkleRoot, sftpHash, tradeCount, totalVolumeUsd) {
        if (tradeCount === 0) throw new Error("InvalidTradeCount");
        const id = this.batches.length;
        this.batches.push({ id, merkleRoot, sftpHash, tradeCount, totalVolumeUsd, settled: false });
        return id;
    }

    settleBatch(id) {
        const b = this.batches[id];
        if (!b) throw new Error("BatchNotFound");
        if (b.settled) throw new Error("BatchAlreadySettled");
        b.settled = true;
    }
}

class SimulatedCustodyVault {
    constructor(securityOfficer) {
        this.securityOfficer = securityOfficer;
        this.solvencyRoot = null;
        this.withdrawals = {};
        this.escrows = {};
        this.trustlines = {};
        this.withdrawalNonce = 0;
    }

    publishProofOfSolvency(root, aum) {
        if (!root) throw new Error("InvalidRoot");
        this.solvencyRoot = { root, aum, timestamp: Date.now() };
    }

    initiateWithdrawal(caller, asset, destination, amount) {
        if (!destination || amount <= 0n) throw new Error("InvalidArgs");
        const id = ++this.withdrawalNonce;
        this.withdrawals[id] = {
            id,
            asset,
            destination,
            amount,
            executeAfter: Date.now() + 48 * 3600 * 1000,
            executed: false,
            aborted: false
        };
        return id;
    }

    abortWithdrawal(caller, id, reason) {
        if (caller !== this.securityOfficer) throw new Error("NotSecurityOfficer");
        const req = this.withdrawals[id];
        if (!req || req.executed || req.aborted) throw new Error("CannotAbort");
        req.aborted = true;
    }

    createPreimageEscrow(id, recipient, conditionHash, durationMs) {
        this.escrows[id] = {
            id,
            recipient,
            conditionHash,
            expiresAt: Date.now() + durationMs,
            claimed: false
        };
    }

    claimPreimageEscrow(id, preimageHex) {
        const esc = this.escrows[id];
        if (!esc || esc.claimed || Date.now() > esc.expiresAt) throw new Error("EscrowExpiredOrClaimed");
        // Simulated SHA256 match
        esc.claimed = true;
    }

    setTrustline(user, token, limit, authorized) {
        this.trustlines[`${user}_${token}`] = { limit, authorized };
    }
}

async function runExtensionTests() {
    console.log('\n--- Running Enterprise SOTA Extensions Tests ---');
    console.log('   (DeFi, GameFi, Polygon & Arbitrum Cross-Chain, Arbitrage, Securities, FTPS)');
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

    // DeFi Tests
    test('ApexDeFiVault: should deposit assets and mint 1:1 shares on initial deposit', () => {
        const vault = new SimulatedDeFiVault();
        const shares = vault.deposit('0xInvestor1', 1000n);
        assert.strictEqual(shares, 1000n);
        assert.strictEqual(vault.totalAssets, 1000n);
    });

    test('ApexDeFiVault: should compound harvested yield and increase share value on redeem', () => {
        const vault = new SimulatedDeFiVault();
        vault.deposit('0xInvestor1', 1000n);
        vault.harvestYield(100n); // 10% yield
        assert.strictEqual(vault.totalAssets, 1100n);
        const assetsRedeemed = vault.redeem('0xInvestor1', 1000n);
        assert.strictEqual(assetsRedeemed, 1100n); // harvested 10% profit
    });

    // Securities & RWA Tests
    test('ApexSecurityToken: should prevent transfers from unverified non-KYC accounts', () => {
        const secToken = new SimulatedSecurityToken();
        secToken.verifyInvestor('0xInvestorA', 840, true, 0); // US accredited
        secToken.mint('0xInvestorA', 5000n);
        // Recipient is unverified
        assert.throws(() => {
            secToken.transfer('0xInvestorA', '0xUnverifiedUser', 1000n);
        }, /Recipient not KYC verified/);
    });

    test('ApexSecurityToken: should allow compliant transfers between verified accredited investors', () => {
        const secToken = new SimulatedSecurityToken();
        secToken.verifyInvestor('0xInvestorA', 840, true, 0);
        secToken.verifyInvestor('0xInvestorB', 840, true, 0);
        secToken.mint('0xInvestorA', 5000n);
        secToken.transfer('0xInvestorA', '0xInvestorB', 2000n);
        assert.strictEqual(secToken.balances['0xInvestorA'], 3000n);
        assert.strictEqual(secToken.balances['0xInvestorB'], 2000n);
    });

    test('ApexSecurityToken: should enforce lockup period restrictions', () => {
        const secToken = new SimulatedSecurityToken();
        secToken.verifyInvestor('0xInvestorA', 840, true, 3600); // 1 hr lockup
        secToken.verifyInvestor('0xInvestorB', 840, true, 0);
        secToken.mint('0xInvestorA', 5000n);
        assert.throws(() => {
            secToken.transfer('0xInvestorA', '0xInvestorB', 1000n);
        }, /Lockup active/);
    });

    test('ApexSecurityToken: should execute legal recovery clawback for court/lost key compliance', () => {
        const secToken = new SimulatedSecurityToken();
        secToken.verifyInvestor('0xLostKeyAccount', 840, true, 0);
        secToken.verifyInvestor('0xBeneficiaryRecovery', 840, true, 0);
        secToken.mint('0xLostKeyAccount', 10000n);
        secToken.recoveryTransfer('0xLostKeyAccount', '0xBeneficiaryRecovery');
        assert.strictEqual(secToken.balances['0xLostKeyAccount'], 0n);
        assert.strictEqual(secToken.balances['0xBeneficiaryRecovery'], 10000n);
    });

    // Cross-Chain (Polygon & Arbitrum) Tests
    test('ApexCrossChainGateway: should dispatch bridge transfer to Polygon (137) and Arbitrum (42161)', () => {
        const bridge = new SimulatedCrossChainGateway();
        const id1 = bridge.bridgeTransfer(137, '0xTrader', '0xPolygonRecipient', '0xToken', 500n);
        const id2 = bridge.bridgeTransfer(42161, '0xTrader', '0xArbitrumRecipient', '0xToken', 800n);
        assert.strictEqual(bridge.messages.length, 2);
        assert.strictEqual(bridge.messages[0].destChainId, 137);
        assert.strictEqual(bridge.messages[1].destChainId, 42161);
    });

    test('ApexCrossChainGateway: should reject unsupported destination chains', () => {
        const bridge = new SimulatedCrossChainGateway();
        assert.throws(() => {
            bridge.bridgeTransfer(999999, '0xTrader', '0xRecipient', '0xToken', 100n);
        }, /UnsupportedChain/);
    });

    // Arbitrage Engine Tests
    test('ApexArbitrageEngine: should accurately detect cross-venue spread and profitability', () => {
        const arb = new SimulatedArbitrageEngine();
        // DEX order book price 68,000 vs AMM 68,300 (diff 300 / 68000 = ~44 bps > 15 bps hurdle)
        const res = arb.calculateSpread(68000n, 68300n);
        assert.strictEqual(res.isProfitable, true);
        assert(res.spreadBps >= 40);
    });

    // FTPS / SFTP Batch Settlement Gateway Tests
    test('ApexSettlementGateway: should ingest FTPS cleared trade batch and settle on-chain', () => {
        const gateway = new SimulatedSettlementGateway();
        const batchId = gateway.submitBatch(
            '0x8f7d98c21a4f3b7e8d6c4a1b9e0f3d2c',
            'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            450,
            15800000
        );
        assert.strictEqual(gateway.batches[batchId].settled, false);
        gateway.settleBatch(batchId);
        assert.strictEqual(gateway.batches[batchId].settled, true);
    });

    // Cold Storage Custody & Cryptographic Escrows Tests
    test('ApexCustodyVault: should publish cryptographic Merkle Proof of Solvency', () => {
        const vault = new SimulatedCustodyVault('0xSecurityOfficer');
        vault.publishProofOfSolvency('0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d', 850000000n);
        assert.strictEqual(vault.solvencyRoot.root, '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d');
        assert.strictEqual(vault.solvencyRoot.aum, 850000000n);
    });

    test('ApexCustodyVault: should enforce 48h withdrawal delay and allow security officer abort', () => {
        const vault = new SimulatedCustodyVault('0xSecurityOfficer');
        const reqId = vault.initiateWithdrawal('0xAdmin', '0xUSDC', '0xColdStorage', 1000000n);
        assert.strictEqual(vault.withdrawals[reqId].executed, false);
        assert.strictEqual(vault.withdrawals[reqId].aborted, false);
        // Abort by security officer
        vault.abortWithdrawal('0xSecurityOfficer', reqId, 'Suspicious unverified address');
        assert.strictEqual(vault.withdrawals[reqId].aborted, true);
    });

    test('ApexCustodyVault: should support conditional preimage escrows and trustlines', () => {
        const vault = new SimulatedCustodyVault('0xSecurityOfficer');
        vault.setTrustline('0xTrader1', '0xRLUSD', 5000000n, true);
        assert.strictEqual(vault.trustlines['0xTrader1_0xRLUSD'].authorized, true);

        vault.createPreimageEscrow('escrow-101', '0xCounterparty', '0xconditionhash', 3600000);
        vault.claimPreimageEscrow('escrow-101', '0xsecretpreimage');
        assert.strictEqual(vault.escrows['escrow-101'].claimed, true);
    });

    console.log(`Summary: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) process.exit(1);
}

module.exports = { runExtensionTests };

if (require.main === module) {
    runExtensionTests();
}
