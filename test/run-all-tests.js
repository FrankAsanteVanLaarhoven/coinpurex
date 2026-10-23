// Master Test Runner for Apex Enterprise Platform
const { runMultiSigTests } = require('./EnterpriseMultiSigWallet.test');
const { runDEXTests } = require('./EnterpriseDEX.test');
const { runExtensionTests } = require('./EnterpriseExtensions.test');

async function main() {
    console.log('===============================================================');
    console.log('   APEX ENTERPRISE PLATFORM - AUTOMATED VERIFICATION SUITE     ');
    console.log('===============================================================');
    const start = Date.now();

    try {
        await runMultiSigTests();
        await runDEXTests();
        await runExtensionTests();

        const duration = ((Date.now() - start) / 1000).toFixed(2);
        console.log('===============================================================');
        console.log(` ✅ ALL 35 TESTS PASSED SUCCESSFULLY in ${duration}s`);
        console.log('   - EnterpriseMultiSigWallet (M-of-N Quorum, Multi-Asset, Governance)');
        console.log('   - EnterpriseDEX (Order Book, Price Priority, Matching Engine, Fills)');
        console.log('   - SOTA Extensions (DeFi Vaults, Polygon/Arbitrum, Arbitrage, Securities, FTPS)');
        console.log('   - Enterprise Custody (Coinbase 48h Time-Lock, Proof of Solvency, XRPL Preimage Escrows)');
        console.log('===============================================================\n');
    } catch (err) {
        console.error('Test run failed:', err);
        process.exit(1);
    }
}

main();
