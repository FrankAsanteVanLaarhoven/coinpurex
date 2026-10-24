// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC20.sol";

/**
 * @title ApexDeFiVault
 * @notice Institutional ERC-4626 Yield & Staking Vault for the Apex Platform.
 * @dev Manages institutional liquidity, yield farming compounding, and multi-collateral lending.
 */
contract ApexDeFiVault {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;

    address public immutable asset;
    address public governance;
    uint256 public totalAssets;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    uint256 public performanceFeeBps = 50; // 0.5%
    uint256 public annualYieldRateBps = 850; // 8.5% APY base

    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event YieldHarvested(uint256 yieldAmount, uint256 timestamp);

    error ZeroAssets();
    error ZeroShares();
    error InsufficientBalance();
    error OnlyGovernance();

    modifier onlyGovernance() {
        if (msg.sender != governance) revert OnlyGovernance();
        _;
    }

    constructor(
        address _asset,
        string memory _name,
        string memory _symbol,
        address _governance
    ) {
        asset = _asset;
        name = _name;
        symbol = _symbol;
        governance = _governance;
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        if (totalAssets == 0 || totalSupply == 0) return assets;
        return (assets * totalSupply) / totalAssets;
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        if (totalSupply == 0) return shares;
        return (shares * totalAssets) / totalSupply;
    }

    function deposit(uint256 assets, address receiver) external returns (uint256 shares) {
        if (assets == 0) revert ZeroAssets();
        shares = convertToShares(assets);
        if (shares == 0) revert ZeroShares();

        bool success = IERC20(asset).transferFrom(msg.sender, address(this), assets);
        require(success, "Transfer failed");

        totalAssets += assets;
        totalSupply += shares;
        balanceOf[receiver] += shares;

        emit Deposit(msg.sender, receiver, assets, shares);
    }

    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets) {
        if (shares == 0) revert ZeroShares();
        if (balanceOf[owner] < shares) revert InsufficientBalance();

        assets = convertToAssets(shares);
        if (assets == 0) revert ZeroAssets();

        balanceOf[owner] -= shares;
        totalSupply -= shares;
        totalAssets -= assets;

        bool success = IERC20(asset).transfer(receiver, assets);
        require(success, "Transfer failed");

        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    /**
     * @notice Distributes institutional yield harvested from lending/arbitrage strategies.
     */
    function harvestYield(uint256 yieldAssets) external onlyGovernance {
        bool success = IERC20(asset).transferFrom(msg.sender, address(this), yieldAssets);
        require(success, "Yield transfer failed");
        totalAssets += yieldAssets;
        emit YieldHarvested(yieldAssets, block.timestamp);
    }
}
