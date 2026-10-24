// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC20.sol";

/**
 * @title CoinPurexOffering
 * @notice Institutional Coin Offering & Presale Launchpad contract for Ceris Coin (CRS).
 *         Powers primary capital formation on https://coinpurex.com.
 * @dev Supports configurable soft/hard caps, individual contribution boundaries,
 *      real-time allocation calculation with precision decimal scaling,
 *      direct multi-sig treasury forwarding, and emergency pause controls.
 */
contract CoinPurexOffering {
    // --- Configuration ---
    IERC20 public immutable token;
    address payable public immutable treasuryWallet;
    
    // Rate: CRS tokens (in base units, 5 decimals) per 1 ETH (10^18 wei)
    // Example: 5,000 CRS per 1 ETH -> 5,000 * 10^5 = 500,000,000 base units per 10^18 wei
    uint256 public immutable tokensPerEth;
    
    uint256 public immutable minContribution;
    uint256 public immutable maxContribution;
    uint256 public immutable hardCap;
    uint256 public immutable softCap;
    uint256 public immutable startTime;
    uint256 public immutable endTime;

    // --- State Variables ---
    address public admin;
    bool public isPaused;
    bool public isFinalized;
    uint256 public totalEthRaised;
    uint256 public totalTokensSold;
    uint256 public totalContributors;

    mapping(address => uint256) public contributions;
    mapping(address => uint256) public tokenAllocations;
    mapping(address => bool) public hasContributed;

    // --- Events ---
    event TokensPurchased(
        address indexed buyer,
        address indexed recipient,
        uint256 ethAmount,
        uint256 tokenAmount
    );
    event OfferingPaused(bool paused);
    event OfferingFinalized(uint256 totalRaised, uint256 totalTokensSold);
    event TreasuryForwarded(address indexed treasury, uint256 amount);
    event EmergencyTokenRecovery(address indexed token, uint256 amount);

    // --- Custom Errors ---
    error OfferingNotActive();
    error ExceedsHardCap(uint256 attempted, uint256 remaining);
    error BelowMinContribution(uint256 amount, uint256 minAllowed);
    error ExceedsMaxContribution(uint256 totalContributed, uint256 maxAllowed);
    error Unauthorized();
    error TransferFailed();
    error SoftCapNotReached();
    error AlreadyFinalized();

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }

    modifier whenActive() {
        if (isPaused || isFinalized) revert OfferingNotActive();
        if (block.timestamp < startTime || block.timestamp > endTime) revert OfferingNotActive();
        _;
    }

    /**
     * @notice Initializes the Coin Offering Launchpad for CRS.
     * @param _token Address of the Ceris Coin (CRS) contract.
     * @param _treasury Multi-Sig Governance Treasury wallet.
     * @param _tokensPerEth Number of CRS base units distributed per 1 ETH.
     * @param _softCap Minimum ETH required for successful completion.
     * @param _hardCap Maximum ETH allowable.
     * @param _minContribution Minimum ETH allowed per participant.
     * @param _maxContribution Maximum cumulative ETH allowed per participant.
     * @param _durationSeconds Duration of the offering window.
     */
    constructor(
        address _token,
        address payable _treasury,
        uint256 _tokensPerEth,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _minContribution,
        uint256 _maxContribution,
        uint256 _durationSeconds
    ) {
        require(_token != address(0), "Invalid token address");
        require(_treasury != address(0), "Invalid treasury address");
        require(_hardCap >= _softCap, "Hard cap must be >= soft cap");

        token = IERC20(_token);
        treasuryWallet = _treasury;
        tokensPerEth = _tokensPerEth;
        softCap = _softCap;
        hardCap = _hardCap;
        minContribution = _minContribution;
        maxContribution = _maxContribution;
        startTime = block.timestamp;
        endTime = block.timestamp + _durationSeconds;
        admin = msg.sender;
    }

    /**
     * @notice Fallback payable receiver for direct ETH contributions.
     */
    receive() external payable {
        buyTokens(msg.sender);
    }

    /**
     * @notice Participates in the coin offering for a specified recipient.
     * @param recipient Target account receiving the CRS token allocation.
     */
    function buyTokens(address recipient) public payable whenActive {
        address buyer = recipient == address(0) ? msg.sender : recipient;
        uint256 ethAmount = msg.value;

        if (ethAmount < minContribution) {
            revert BelowMinContribution(ethAmount, minContribution);
        }

        uint256 newCumulative = contributions[buyer] + ethAmount;
        if (newCumulative > maxContribution) {
            revert ExceedsMaxContribution(newCumulative, maxContribution);
        }

        if (totalEthRaised + ethAmount > hardCap) {
            revert ExceedsHardCap(ethAmount, hardCap - totalEthRaised);
        }

        // Calculate token volume: (ETH in wei * tokensPerEth) / 10^18
        uint256 tokenAmount = (ethAmount * tokensPerEth) / 1e18;
        require(tokenAmount > 0, "Token allocation rounded to zero");

        // State updates
        if (!hasContributed[buyer]) {
            hasContributed[buyer] = true;
            totalContributors++;
        }
        contributions[buyer] = newCumulative;
        tokenAllocations[buyer] += tokenAmount;
        totalEthRaised += ethAmount;
        totalTokensSold += tokenAmount;

        // Distribute tokens directly from offering reserve to buyer
        bool success = token.transfer(buyer, tokenAmount);
        if (!success) revert TransferFailed();

        // Forward capital directly to the Multi-Sig Treasury
        (bool forwarded, ) = treasuryWallet.call{value: ethAmount}("");
        if (!forwarded) revert TransferFailed();
        emit TreasuryForwarded(treasuryWallet, ethAmount);

        emit TokensPurchased(msg.sender, buyer, ethAmount, tokenAmount);

        // Auto-finalize if hard cap is reached
        if (totalEthRaised >= hardCap) {
            isFinalized = true;
            emit OfferingFinalized(totalEthRaised, totalTokensSold);
        }
    }

    /**
     * @notice Toggles pause state for the offering.
     */
    function setPaused(bool _paused) external onlyAdmin {
        isPaused = _paused;
        emit OfferingPaused(_paused);
    }

    /**
     * @notice Finalizes the offering once complete or soft cap reached.
     */
    function finalize() external onlyAdmin {
        if (isFinalized) revert AlreadyFinalized();
        isFinalized = true;
        emit OfferingFinalized(totalEthRaised, totalTokensSold);
    }

    /**
     * @notice Allows admin to recover unsold CRS tokens after finalization.
     */
    function withdrawUnsoldTokens() external onlyAdmin {
        require(isFinalized || block.timestamp > endTime, "Offering still active");
        uint256 remaining = token.balanceOf(address(this));
        if (remaining > 0) {
            bool success = token.transfer(admin, remaining);
            if (!success) revert TransferFailed();
            emit EmergencyTokenRecovery(address(token), remaining);
        }
    }

    /**
     * @notice Returns comprehensive public metrics for frontend displays.
     */
    function getOfferingStats() external view returns (
        uint256 ethRaised,
        uint256 tokensSold,
        uint256 contributors,
        uint256 hardCapEth,
        uint256 softCapEth,
        uint256 rate,
        bool active,
        bool finalized
    ) {
        return (
            totalEthRaised,
            totalTokensSold,
            totalContributors,
            hardCap,
            softCap,
            tokensPerEth,
            (!isPaused && !isFinalized && block.timestamp >= startTime && block.timestamp <= endTime),
            isFinalized
        );
    }
}
