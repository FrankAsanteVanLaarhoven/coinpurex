// Enterprise Multi-Sig Wallet Test Suite
const assert = require('assert');

// In-Memory Contract Simulation matching EnterpriseMultiSigWallet.sol
class SimulatedMultiSigWallet {
    constructor(approvers, quorum) {
        if (!approvers || approvers.length === 0) throw new Error("InvalidApproversCount");
        if (quorum === 0 || quorum > approvers.length) throw new Error("InvalidQuorum");

        this.approvers = [...approvers];
        this.isApprover = {};
        for (const addr of approvers) {
            if (!addr || this.isApprover[addr]) throw new Error("InvalidApproversCount");
            this.isApprover[addr] = true;
        }
        this.quorum = quorum;
        this.transfers = [];
        this.approvals = {}; // id => approver => bool
        this.ethBalance = 0;
        this.erc20Balances = {}; // tokenAddress => balance
    }

    depositEth(amount) {
        this.ethBalance += amount;
    }

    depositErc20(token, amount) {
        this.erc20Balances[token] = (this.erc20Balances[token] || 0) + amount;
    }

    getApprovers() {
        return this.approvers;
    }

    getTransfers() {
        return this.transfers;
    }

    createTransfer(from, to, token, amount, description) {
        if (!this.isApprover[from]) throw new Error("OnlyApproverAllowed");
        const id = this.transfers.length;
        const transfer = {
            id,
            to,
            token: token || '0x0000000000000000000000000000000000000000',
            amount,
            description: description || 'Transfer',
            approvals: 0,
            executed: false,
            cancelled: false,
            createdAt: Date.now()
        };
        this.transfers.push(transfer);
        this.approvals[id] = {};
        return id;
    }

    approveTransfer(from, id) {
        if (!this.isApprover[from]) throw new Error("OnlyApproverAllowed");
        const t = this.transfers[id];
        if (!t) throw new Error("InvalidTransferId");
        if (t.executed) throw new Error("TransferAlreadyExecuted");
        if (t.cancelled) throw new Error("TransferIsCancelled");
        if (this.approvals[id][from]) throw new Error("CannotApproveTwice");

        this.approvals[id][from] = true;
        t.approvals++;

        if (t.approvals >= this.quorum) {
            this._executeTransfer(id);
        }
    }

    revokeApproval(from, id) {
        if (!this.isApprover[from]) throw new Error("OnlyApproverAllowed");
        const t = this.transfers[id];
        if (!t) throw new Error("InvalidTransferId");
        if (t.executed) throw new Error("TransferAlreadyExecuted");
        if (!this.approvals[id][from]) throw new Error("TransferNotApprovedBySender");

        this.approvals[id][from] = false;
        t.approvals--;
    }

    _executeTransfer(id) {
        const t = this.transfers[id];
        t.executed = true;
        if (t.token === '0x0000000000000000000000000000000000000000') {
            if (this.ethBalance < t.amount) throw new Error("TransferExecutionFailed");
            this.ethBalance -= t.amount;
        } else {
            const bal = this.erc20Balances[t.token] || 0;
            if (bal < t.amount) throw new Error("TransferExecutionFailed");
            this.erc20Balances[t.token] -= t.amount;
        }
    }

    cancelTransfer(from, id) {
        if (!this.isApprover[from]) throw new Error("OnlyApproverAllowed");
        const t = this.transfers[id];
        if (!t) throw new Error("InvalidTransferId");
        if (t.executed) throw new Error("TransferAlreadyExecuted");
        t.cancelled = true;
    }
}

async function runMultiSigTests() {
    console.log('\n--- Running Enterprise Multi-Sig Wallet Tests ---');
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

    const accounts = [
        '0xSigner1Admin',
        '0xSigner2RiskOfficer',
        '0xSigner3TreasuryExec',
        '0xUnauthorizedUser',
        '0xRecipientBeneficiary'
    ];

    test('should have correct approvers and quorum initialization', () => {
        const wallet = new SimulatedMultiSigWallet([accounts[0], accounts[1], accounts[2]], 2);
        assert.strictEqual(wallet.getApprovers().length, 3);
        assert.strictEqual(wallet.quorum, 2);
        assert.strictEqual(wallet.isApprover[accounts[0]], true);
        assert.strictEqual(wallet.isApprover[accounts[3]], undefined);
    });

    test('should create native ETH transfers when called by approver', () => {
        const wallet = new SimulatedMultiSigWallet([accounts[0], accounts[1], accounts[2]], 2);
        const id = wallet.createTransfer(accounts[0], accounts[4], null, 100, "Seed Funding");
        assert.strictEqual(id, 0);
        const transfers = wallet.getTransfers();
        assert.strictEqual(transfers.length, 1);
        assert.strictEqual(transfers[0].amount, 100);
        assert.strictEqual(transfers[0].approvals, 0);
        assert.strictEqual(transfers[0].executed, false);
    });

    test('should NOT create transfers if sender is not an authorized approver', () => {
        const wallet = new SimulatedMultiSigWallet([accounts[0], accounts[1], accounts[2]], 2);
        assert.throws(() => {
            wallet.createTransfer(accounts[3], accounts[4], null, 100, "Malicious Proposal");
        }, /OnlyApproverAllowed/);
    });

    test('should increment approvals on first vote', () => {
        const wallet = new SimulatedMultiSigWallet([accounts[0], accounts[1], accounts[2]], 2);
        wallet.depositEth(1000);
        const id = wallet.createTransfer(accounts[0], accounts[4], null, 100, "Vendor Payout");
        wallet.approveTransfer(accounts[0], id);
        assert.strictEqual(wallet.transfers[0].approvals, 1);
        assert.strictEqual(wallet.transfers[0].executed, false);
        assert.strictEqual(wallet.ethBalance, 1000);
    });

    test('should auto-execute transfer once quorum is reached', () => {
        const wallet = new SimulatedMultiSigWallet([accounts[0], accounts[1], accounts[2]], 2);
        wallet.depositEth(1000);
        const id = wallet.createTransfer(accounts[0], accounts[4], null, 250, "Operations Budget");
        wallet.approveTransfer(accounts[0], id);
        assert.strictEqual(wallet.transfers[0].executed, false);
        wallet.approveTransfer(accounts[1], id); // Quorum reached!
        assert.strictEqual(wallet.transfers[0].executed, true);
        assert.strictEqual(wallet.ethBalance, 750);
    });

    test('should NOT approve transfer if sender is not an authorized approver', () => {
        const wallet = new SimulatedMultiSigWallet([accounts[0], accounts[1], accounts[2]], 2);
        const id = wallet.createTransfer(accounts[0], accounts[4], null, 100, "Grant");
        assert.throws(() => {
            wallet.approveTransfer(accounts[3], id);
        }, /OnlyApproverAllowed/);
    });

    test('should NOT approve transfer twice from the same approver', () => {
        const wallet = new SimulatedMultiSigWallet([accounts[0], accounts[1], accounts[2]], 2);
        const id = wallet.createTransfer(accounts[0], accounts[4], null, 100, "Security Bounty");
        wallet.approveTransfer(accounts[0], id);
        assert.throws(() => {
            wallet.approveTransfer(accounts[0], id);
        }, /CannotApproveTwice/);
    });

    test('should NOT approve transfer if already executed', () => {
        const wallet = new SimulatedMultiSigWallet([accounts[0], accounts[1], accounts[2]], 2);
        wallet.depositEth(500);
        const id = wallet.createTransfer(accounts[0], accounts[4], null, 100, "Auditor Invoice");
        wallet.approveTransfer(accounts[0], id);
        wallet.approveTransfer(accounts[1], id); // Executed!
        assert.throws(() => {
            wallet.approveTransfer(accounts[2], id);
        }, /TransferAlreadyExecuted/);
    });

    test('should allow approver to revoke approval before quorum execution', () => {
        const wallet = new SimulatedMultiSigWallet([accounts[0], accounts[1], accounts[2]], 2);
        const id = wallet.createTransfer(accounts[0], accounts[4], null, 100, "Pending Review");
        wallet.approveTransfer(accounts[0], id);
        assert.strictEqual(wallet.transfers[0].approvals, 1);
        wallet.revokeApproval(accounts[0], id);
        assert.strictEqual(wallet.transfers[0].approvals, 0);
    });

    test('should support ERC20 token proposals and execution', () => {
        const wallet = new SimulatedMultiSigWallet([accounts[0], accounts[1], accounts[2]], 2);
        const DAI_TOKEN = '0xDaiTokenContract';
        wallet.depositErc20(DAI_TOKEN, 5000);
        const id = wallet.createTransfer(accounts[0], accounts[4], DAI_TOKEN, 1200, "DAI Payroll");
        wallet.approveTransfer(accounts[0], id);
        wallet.approveTransfer(accounts[1], id);
        assert.strictEqual(wallet.transfers[0].executed, true);
        assert.strictEqual(wallet.erc20Balances[DAI_TOKEN], 3800);
    });

    console.log(`Summary: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) process.exit(1);
}

module.exports = { runMultiSigTests, SimulatedMultiSigWallet };

if (require.main === module) {
    runMultiSigTests();
}
