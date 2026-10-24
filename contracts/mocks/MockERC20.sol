// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC20.sol";

/**
 * @title MockERC20
 * @notice Enterprise-grade ERC20 mock token with institutional faucet capabilities.
 * @dev Used for sandbox testing and liquidity seeding in the Apex Enterprise Platform.
 */
contract MockERC20 is IERC20 {
    string public name;
    string public symbol;
    uint8 public immutable decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event FaucetDispensed(address indexed recipient, uint256 amount);

    error InsufficientBalance(address account, uint256 requested, uint256 available);
    error InsufficientAllowance(address spender, uint256 requested, uint256 available);
    error ZeroAddress();

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        if (_initialSupply > 0) {
            mint(msg.sender, _initialSupply);
        }
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        if (to == address(0)) revert ZeroAddress();
        if (balanceOf[msg.sender] < amount) {
            revert InsufficientBalance(msg.sender, amount, balanceOf[msg.sender]);
        }
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        if (spender == address(0)) revert ZeroAddress();
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (to == address(0)) revert ZeroAddress();
        uint256 currentAllowance = allowance[from][msg.sender];
        if (currentAllowance < amount) {
            revert InsufficientAllowance(msg.sender, amount, currentAllowance);
        }
        if (balanceOf[from] < amount) {
            revert InsufficientBalance(from, amount, balanceOf[from]);
        }
        if (currentAllowance != type(uint256).max) {
            allowance[from][msg.sender] = currentAllowance - amount;
        }
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) public {
        if (to == address(0)) revert ZeroAddress();
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    /**
     * @notice Institutional testnet faucet dispenser.
     * @param to Target account receiving minted tokens.
     * @param amount Token volume to dispense.
     */
    function faucet(address to, uint256 amount) external {
        mint(to, amount);
        emit FaucetDispensed(to, amount);
    }

    /**
     * @notice Burns tokens from an account with balance & allowance verification.
     * @param from Account whose tokens will be burned.
     * @param amount Token volume to burn.
     */
    function burn(address from, uint256 amount) public {
        if (from == address(0)) revert ZeroAddress();
        if (balanceOf[from] < amount) {
            revert InsufficientBalance(from, amount, balanceOf[from]);
        }
        if (msg.sender != from && allowance[from][msg.sender] != type(uint256).max) {
            if (allowance[from][msg.sender] < amount) {
                revert InsufficientAllowance(msg.sender, amount, allowance[from][msg.sender]);
            }
            allowance[from][msg.sender] -= amount;
        }
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }
}
