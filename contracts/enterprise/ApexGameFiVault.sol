// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ApexGameFiVault
 * @notice Enterprise GameFi & Metaverse Asset Custody & Escrow Vault.
 * @dev Manages in-game item escrows, cross-game collateralization, tournament prize pools,
 * and Guild treasury allocations.
 */
contract ApexGameFiVault {
    address public multiSigTreasury;

    struct TournamentPool {
        uint256 id;
        string gameTitle;
        uint256 prizeAmount;
        address prizeToken; // address(0) for native ETH
        bool distributed;
        address winner;
        uint256 createdAt;
    }

    struct ItemEscrow {
        uint256 escrowId;
        address seller;
        address buyer;
        uint256 nftId;
        address nftContract;
        uint256 price;
        address paymentToken;
        bool completed;
        bool cancelled;
    }

    TournamentPool[] public tournamentPools;
    ItemEscrow[] public itemEscrows;

    event TournamentPoolCreated(uint256 indexed poolId, string gameTitle, uint256 prizeAmount);
    event PrizeDistributed(uint256 indexed poolId, address indexed winner, uint256 prizeAmount);
    event ItemEscrowCreated(uint256 indexed escrowId, address indexed seller, uint256 nftId, uint256 price);
    event ItemEscrowSettled(uint256 indexed escrowId, address indexed buyer);

    error OnlyTreasury();
    error PoolAlreadyDistributed();
    error EscrowAlreadyCompleted();

    modifier onlyTreasury() {
        if (msg.sender != multiSigTreasury) revert OnlyTreasury();
        _;
    }

    constructor(address _multiSigTreasury) {
        multiSigTreasury = _multiSigTreasury;
    }

    function createTournamentPool(
        string calldata gameTitle,
        uint256 prizeAmount,
        address prizeToken
    ) external onlyTreasury returns (uint256) {
        uint256 id = tournamentPools.length;
        tournamentPools.push(TournamentPool({
            id: id,
            gameTitle: gameTitle,
            prizeAmount: prizeAmount,
            prizeToken: prizeToken,
            distributed: false,
            winner: address(0),
            createdAt: block.timestamp
        }));

        emit TournamentPoolCreated(id, gameTitle, prizeAmount);
        return id;
    }

    function distributePrize(uint256 poolId, address winner) external onlyTreasury {
        TournamentPool storage pool = tournamentPools[poolId];
        if (pool.distributed) revert PoolAlreadyDistributed();

        pool.distributed = true;
        pool.winner = winner;

        emit PrizeDistributed(poolId, winner, pool.prizeAmount);
    }

    function getPoolsCount() external view returns (uint256) {
        return tournamentPools.length;
    }
}
