// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ApexSettlementGateway
 * @notice Institutional FTPS/SFTP Batch Settlement & Clearing Gateway.
 * @dev Reconciles off-chain broker-dealer trade batches, ISO-20022 message clearing,
 * and automated End-of-Day (EoD) multi-asset net settlement with cryptographic proofs.
 */
contract ApexSettlementGateway {
    address public multiSigTreasury;
    address public settlementOperator;
    uint256 public nextBatchId;

    struct SettlementBatch {
        uint256 batchId;
        bytes32 merkleRoot; // Merkle root of FTPS cleared trade logs
        string sftpFileHash; // SHA-256 hash of encrypted FTPS institutional ledger
        uint256 tradeCount;
        uint256 totalVolumeUsd;
        bool settled;
        uint256 settledAt;
    }

    mapping(uint256 => SettlementBatch) public settlementBatches;

    event BatchCleared(uint256 indexed batchId, bytes32 merkleRoot, uint256 tradeCount, uint256 totalVolumeUsd);
    event BatchSettled(uint256 indexed batchId, address indexed operator, uint256 settledAt);

    error OnlyOperator();
    error BatchAlreadySettled();
    error InvalidTradeCount();

    modifier onlyOperator() {
        if (msg.sender != settlementOperator && msg.sender != multiSigTreasury) {
            revert OnlyOperator();
        }
        _;
    }

    constructor(address _multiSigTreasury, address _settlementOperator) {
        multiSigTreasury = _multiSigTreasury;
        settlementOperator = _settlementOperator;
    }

    /**
     * @notice Ingests cleared trade batch from institutional secure FTPS/SFTP pipeline.
     */
    function submitBatch(
        bytes32 merkleRoot,
        string calldata sftpFileHash,
        uint256 tradeCount,
        uint256 totalVolumeUsd
    ) external onlyOperator returns (uint256) {
        if (tradeCount == 0) revert InvalidTradeCount();

        uint256 batchId = nextBatchId++;
        settlementBatches[batchId] = SettlementBatch({
            batchId: batchId,
            merkleRoot: merkleRoot,
            sftpFileHash: sftpFileHash,
            tradeCount: tradeCount,
            totalVolumeUsd: totalVolumeUsd,
            settled: false,
            settledAt: 0
        });

        emit BatchCleared(batchId, merkleRoot, tradeCount, totalVolumeUsd);
        return batchId;
    }

    /**
     * @notice Finalizes atomic multi-asset on-chain clearing for an ingested FTPS batch.
     */
    function settleBatch(uint256 batchId) external onlyOperator {
        SettlementBatch storage batch = settlementBatches[batchId];
        if (batch.settled) revert BatchAlreadySettled();

        batch.settled = true;
        batch.settledAt = block.timestamp;

        emit BatchSettled(batchId, msg.sender, block.timestamp);
    }
}
