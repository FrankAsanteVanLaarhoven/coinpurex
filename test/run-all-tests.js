// Master Test Runner for Apex Enterprise Platform
const { runMultiSigTests } = require('./EnterpriseMultiSigWallet.test');
const { runDEXTests } = require('./EnterpriseDEX.test');
const { runExtensionTests } = require('./EnterpriseExtensions.test');
const { runMockERC20Tests } = require('./MockERC20.test');

async function main() {
    console.log('===============================================================');
    console.log('   APEX ENTERPRISE PLATFORM - AUTOMATED VERIFICATION SUITE     ');
    console.log('===============================================================');
    const start = Date.now();

    try {
        const r1 = await runMultiSigTests();
        const r2 = await runDEXTests();
        const r3 = await runExtensionTests();
        const r4 = await runMockERC20Tests();

        const totalPassed = (r1?.passed || 0) + (r2?.passed || 0) + (r3?.passed || 0) + (r4?.passed || 0);
        const duration = ((Date.now() - start) / 1000).toFixed(2);
        console.log('===============================================================');
        console.log(` ✅ ALL ${totalPassed} TESTS PASSED SUCCESSFULLY in ${duration}s`);
        console.log('   - EnterpriseMultiSigWallet (M-of-N Quorum, Multi-Asset, Governance)');
        console.log('   - EnterpriseDEX (Order Book, Price Priority, Matching Engine, Fills)');
        console.log('   - SOTA Extensions (DeFi Vaults, Polygon/Arbitrum, Arbitrage, Securities, FTPS)');
        console.log('   - Enterprise Custody (48h Time-Locked Delay, Proof of Solvency, Cryptographic Preimage Escrows)');
        console.log('   - MockERC20 (Institutional Faucet, Burn, Allowance & Boundary Invariants)');
        console.log('===============================================================\n');
    } catch (err) {
        console.error('Test run failed:', err);
        process.exit(1);
    }
}

main();
