// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEnterpriseDEX {
    enum Side { BUY, SELL }

    struct Token {
        bytes32 ticker;
        address tokenAddress;
    }

    struct Order {
        uint256 id;
        address trader;
        Side side;
        bytes32 ticker;
        uint256 amount;
        uint256 filled;
        uint256 price;
        uint256 date;
    }

    function addToken(bytes32 ticker, address tokenAddress) external;
    function deposit(uint256 amount, bytes32 ticker) external;
    function withdraw(uint256 amount, bytes32 ticker) external;
    function createLimitOrder(bytes32 ticker, uint256 amount, uint256 price, Side side) external;
    function cancelLimitOrder(bytes32 ticker, Side side, uint256 orderId) external;
    function createMarketOrder(bytes32 ticker, uint256 amount, Side side) external;
    function getOrders(bytes32 ticker, Side side) external view returns (Order[] memory);
    function getTokens() external view returns (Token[] memory);
    function traderBalances(address trader, bytes32 ticker) external view returns (uint256);
}
