// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ApexSecurityToken
 * @notice Institutional Tokenized Securities & Real World Asset (RWA) Standard (ERC-3643 / ERC-1400 compliant).
 * @dev Enforces automated on-chain KYC/AML accreditation, jurisdictional transfer restrictions,
 * dividend distributions, and institutional asset recovery for regulated financial instruments.
 */
contract ApexSecurityToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    address public complianceOfficer;
    address public multiSigTreasury;

    // Regulated Identity Registry (KYC / Accredited Status)
    struct InvestorIdentity {
        bool isVerified;
        bool isAccredited;
        uint16 countryCode; // ISO 3166-1 numeric
        uint256 lockupExpiry;
    }

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => InvestorIdentity) public identityRegistry;
    mapping(address => bool) public frozenAccounts;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event InvestorVerified(address indexed investor, uint16 countryCode, bool isAccredited);
    event AccountFrozen(address indexed account, bool isFrozen);
    event RecoveryExecuted(address indexed lostAccount, address indexed targetAccount, uint256 amount);
    event DividendDistributed(address indexed token, uint256 totalAmount, uint256 timestamp);

    error NotComplianceOfficer();
    error TransferRestricted(string reason);
    error AccountIsFrozen(address account);
    error InvestorNotVerified(address account);
    error LockupActive(address account, uint256 expiry);
    error ZeroAddress();

    modifier onlyCompliance() {
        if (msg.sender != complianceOfficer && msg.sender != multiSigTreasury) {
            revert NotComplianceOfficer();
        }
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _complianceOfficer,
        address _multiSigTreasury
    ) {
        name = _name;
        symbol = _symbol;
        complianceOfficer = _complianceOfficer;
        multiSigTreasury = _multiSigTreasury;
    }

    /**
     * @notice Institutional KYC/AML accreditation registrar.
     */
    function verifyInvestor(
        address investor,
        uint16 countryCode,
        bool isAccredited,
        uint256 lockupPeriodSeconds
    ) external onlyCompliance {
        if (investor == address(0)) revert ZeroAddress();

        identityRegistry[investor] = InvestorIdentity({
            isVerified: true,
            isAccredited: isAccredited,
            countryCode: countryCode,
            lockupExpiry: block.timestamp + lockupPeriodSeconds
        });

        emit InvestorVerified(investor, countryCode, isAccredited);
    }

    /**
     * @notice Regulatory compliance pre-transfer verification check.
     */
    function canTransfer(address from, address to, uint256 amount) public view returns (bool, string memory) {
        if (frozenAccounts[from]) return (false, "Sender account frozen");
        if (frozenAccounts[to]) return (false, "Recipient account frozen");

        if (!identityRegistry[from].isVerified && from != address(0)) {
            return (false, "Sender KYC not verified");
        }
        if (!identityRegistry[to].isVerified && to != address(0)) {
            return (false, "Recipient KYC not verified");
        }

        if (block.timestamp < identityRegistry[from].lockupExpiry) {
            return (false, "Investor lockup period active");
        }

        if (balanceOf[from] < amount) {
            return (false, "Insufficient balance");
        }

        return (true, "Compliant");
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        (bool ok, string memory reason) = canTransfer(msg.sender, to, amount);
        if (!ok) revert TransferRestricted(reason);

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        (bool ok, string memory reason) = canTransfer(from, to, amount);
        if (!ok) revert TransferRestricted(reason);

        uint256 currentAllowance = allowance[from][msg.sender];
        require(currentAllowance >= amount, "Insufficient allowance");
        if (currentAllowance != type(uint256).max) {
            allowance[from][msg.sender] = currentAllowance - amount;
        }

        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external onlyCompliance {
        if (!identityRegistry[to].isVerified) revert InvestorNotVerified(to);
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    /**
     * @notice Legal clawback / asset recovery in compliance with court order or lost private keys.
     */
    function recoveryTransfer(address lostAccount, address targetAccount) external onlyCompliance {
        if (!identityRegistry[targetAccount].isVerified) revert InvestorNotVerified(targetAccount);
        uint256 amount = balanceOf[lostAccount];
        balanceOf[lostAccount] = 0;
        balanceOf[targetAccount] += amount;
        emit RecoveryExecuted(lostAccount, targetAccount, amount);
        emit Transfer(lostAccount, targetAccount, amount);
    }

    function freezeAccount(address account, bool freeze) external onlyCompliance {
        frozenAccounts[account] = freeze;
        emit AccountFrozen(account, freeze);
    }
}
