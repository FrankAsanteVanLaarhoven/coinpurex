// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC20.sol";

/**
 * @title DSAuthority
 * @notice Authority access control interface compatible with DappHub DSAuth architecture.
 */
interface DSAuthority {
    function canCall(
        address src,
        address dst,
        bytes4 sig
    ) external view returns (bool);
}

/**
 * @title CerisCoin
 * @notice Modern Solidity 0.8.20 recreation of Ceris Coin (CRS) originally deployed at:
 *         Ethereum Mainnet 0x819c468e5dc88beb0702577cf8a90c2d0566ac8b
 *         Exchange: https://coinpurex.com
 * @dev Preserves exact read/write ABI signatures, 5-decimal precision, DappHub authority,
 *      circuit-breaker (stop/start), and admin burn capabilities with upgraded Solidity 0.8+
 *      overflow checks, custom gas-efficient errors, and multi-sig compatibility.
 */
contract CerisCoin is IERC20 {
    // --- Token Metadata ---
    string public name = "Ceris Coin";
    string public symbol = "CRS";
    uint8 public immutable decimals = 5; // Standard 5-decimal precision matching mainnet
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * (10 ** 5); // 10,000,000,000,000 (100M CRS)
    uint256 public initialSupply;
    uint256 private _totalSupply;

    // --- State Variables ---
    address public owner;
    address public authority;
    address public burnAdmin;
    bool public stopped;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _approvals;

    // --- Events (Exact Etherscan ABI compatibility) ---
    event Burn(address indexed guy, uint256 wad);
    event LogSetAuthority(address indexed authority);
    event LogSetOwner(address indexed owner);
    event LogNote(
        bytes4 indexed sig,
        address indexed guy,
        bytes32 indexed foo,
        bytes32 bar,
        uint256 wad,
        bytes fax
    );

    // --- Custom Errors ---
    error Unauthorized();
    error ContractStopped();
    error InsufficientBalance(address account, uint256 requested, uint256 available);
    error InsufficientAllowance(address spender, uint256 requested, uint256 available);
    error ZeroAddress();

    // --- Modifiers ---
    modifier auth() {
        if (!isAuthorized(msg.sender, msg.sig)) revert Unauthorized();
        _;
    }

    modifier stoppable() {
        if (stopped) revert ContractStopped();
        _;
    }

    modifier onlyAdmin() {
        if (!isAdmin()) revert Unauthorized();
        _;
    }

    modifier note() {
        _;
        emit LogNote(msg.sig, msg.sender, bytes32(0), bytes32(0), msg.value, msg.data);
    }

    /**
     * @notice Initializes Ceris Coin with 100,000,000 CRS minted to the initial owner.
     * @param _initialOwner The address receiving initial token supply and administrative authority.
     */
    constructor(address _initialOwner) {
        address recipient = _initialOwner == address(0) ? msg.sender : _initialOwner;
        owner = recipient;
        burnAdmin = recipient;
        initialSupply = INITIAL_SUPPLY;
        _totalSupply = INITIAL_SUPPLY;
        _balances[recipient] = INITIAL_SUPPLY;

        emit LogSetOwner(recipient);
        emit Transfer(address(0), recipient, INITIAL_SUPPLY);
    }

    // --- ERC20 Standard View Functions ---

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function allowance(address src, address guy) external view override returns (uint256) {
        return _approvals[src][guy];
    }

    // --- Authority & Governance ---

    function isAuthorized(address src, bytes4 sig) public view returns (bool) {
        if (src == address(this)) {
            return true;
        } else if (src == owner) {
            return true;
        } else if (authority == address(0)) {
            return false;
        } else {
            return DSAuthority(authority).canCall(src, address(this), sig);
        }
    }

    function setOwner(address newOwner) external auth {
        if (newOwner == address(0)) revert ZeroAddress();
        owner = newOwner;
        emit LogSetOwner(newOwner);
    }

    function setAuthority(address newAuthority) external auth {
        authority = newAuthority;
        emit LogSetAuthority(newAuthority);
    }

    // --- Circuit Breaker (DSStop) ---

    function stop() external auth note {
        stopped = true;
    }

    function start() external auth note {
        stopped = false;
    }

    // --- Admin Burn Controls ---

    function isAdmin() public view returns (bool) {
        return msg.sender == burnAdmin;
    }

    function renounceOwnership() external onlyAdmin {
        burnAdmin = address(0);
    }

    function burnfromAdmin(address guy, uint256 wad) external onlyAdmin {
        if (guy == address(0)) revert ZeroAddress();
        if (_balances[guy] < wad) {
            revert InsufficientBalance(guy, wad, _balances[guy]);
        }

        _balances[guy] -= wad;
        _totalSupply -= wad;

        emit Burn(guy, wad);
        emit Transfer(guy, address(0), wad);
    }

    // --- ERC20 Transfers & Allowances ---

    function approve(address guy) external stoppable returns (bool) {
        return _approve(msg.sender, guy, type(uint256).max);
    }

    function approve(address guy, uint256 wad) external override stoppable returns (bool) {
        return _approve(msg.sender, guy, wad);
    }

    function increaseAllowance(address src, uint256 wad) external returns (bool) {
        if (src == address(0)) revert ZeroAddress();
        uint256 newAllowance = _approvals[msg.sender][src] + wad;
        return _approve(msg.sender, src, newAllowance);
    }

    function decreaseAllowance(address src, uint256 wad) external returns (bool) {
        if (src == address(0)) revert ZeroAddress();
        uint256 currentAllowance = _approvals[msg.sender][src];
        if (currentAllowance < wad) {
            revert InsufficientAllowance(src, wad, currentAllowance);
        }
        return _approve(msg.sender, src, currentAllowance - wad);
    }

    function transfer(address dst, uint256 wad) external override returns (bool) {
        return transferFrom(msg.sender, dst, wad);
    }

    function transferFrom(
        address src,
        address dst,
        uint256 wad
    ) public override stoppable returns (bool) {
        if (dst == address(0)) revert ZeroAddress();

        if (src != msg.sender && _approvals[src][msg.sender] != type(uint256).max) {
            uint256 currentAllowance = _approvals[src][msg.sender];
            if (currentAllowance < wad) {
                revert InsufficientAllowance(msg.sender, wad, currentAllowance);
            }
            _approvals[src][msg.sender] = currentAllowance - wad;
        }

        if (_balances[src] < wad) {
            revert InsufficientBalance(src, wad, _balances[src]);
        }

        _balances[src] -= wad;
        _balances[dst] += wad;

        emit Transfer(src, dst, wad);
        return true;
    }

    function _approve(
        address ownerAddress,
        address spender,
        uint256 amount
    ) internal returns (bool) {
        if (spender == address(0)) revert ZeroAddress();
        _approvals[ownerAddress][spender] = amount;
        emit Approval(ownerAddress, spender, amount);
        return true;
    }
}
