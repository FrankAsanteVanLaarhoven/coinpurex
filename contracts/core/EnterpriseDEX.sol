// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20Token {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
 * @title EnterpriseDEX
 * @notice High-Performance Institutional On-Chain Order Book Decentralized Exchange.
 * @dev Supports Limit Orders (price-time priority), Market Orders, Order Cancellations,
 * multi-token asset management, SafeERC20 interactions, and ReentrancyGuard.
 */
contract EnterpriseDEX {
    enum Side {
        BUY,
        SELL
    }

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

    // --- State Variables ---
    mapping(bytes32 => Token) public tokens;
    bytes32[] public tokenList;
    mapping(address => mapping(bytes32 => uint256)) public traderBalances;
    // ticker => (side: 0 for BUY, 1 for SELL) => Order[]
    mapping(bytes32 => mapping(uint256 => Order[])) public orderBook;

    address public admin;
    uint256 public nextOrderId;
    uint256 public nextTradeId;
    bytes32 public constant DAI = bytes32("DAI");

    // Reentrancy guard state
    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    // --- Custom Errors ---
    error TokenDoesNotExist();
    error CannotTradeQuoteToken();
    error BalanceTooLow(uint256 requested, uint256 available);
    error TokenBalanceTooLow();
    error DaiBalanceTooLow();
    error OrderNotFound();
    error OnlyOrderCreator();
    error OnlyAdminAllowed();
    error ZeroAmountNotAllowed();
    error ZeroPriceNotAllowed();
    error TokenTransferFailed();
    error ReentrancyGuardTriggered();

    // --- Events ---
    event TokenAdded(bytes32 indexed ticker, address indexed tokenAddress);
    event Deposit(address indexed trader, bytes32 indexed ticker, uint256 amount);
    event Withdraw(address indexed trader, bytes32 indexed ticker, uint256 amount);
    event OrderCreated(
        uint256 indexed orderId,
        address indexed trader,
        Side indexed side,
        bytes32 ticker,
        uint256 amount,
        uint256 price,
        uint256 date
    );
    event OrderCancelled(uint256 indexed orderId, address indexed trader, bytes32 indexed ticker, Side side);
    event NewTrade(
        uint256 tradeId,
        uint256 orderId,
        bytes32 indexed ticker,
        address indexed maker,
        address indexed taker,
        uint256 amount,
        uint256 price,
        uint256 date
    );
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    // --- Modifiers ---
    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdminAllowed();
        _;
    }

    modifier tokenExist(bytes32 ticker) {
        if (tokens[ticker].tokenAddress == address(0)) revert TokenDoesNotExist();
        _;
    }

    modifier tokenIsNotDai(bytes32 ticker) {
        if (ticker == DAI) revert CannotTradeQuoteToken();
        _;
    }

    modifier nonReentrant() {
        if (_status == _ENTERED) revert ReentrancyGuardTriggered();
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    constructor() {
        admin = msg.sender;
        _status = _NOT_ENTERED;
    }

    /**
     * @notice Transfer admin authority to a new address (e.g. EnterpriseMultiSigWallet).
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }

    /**
     * @notice Register a newly supported trading token.
     */
    function addToken(bytes32 ticker, address tokenAddress) external onlyAdmin {
        require(tokenAddress != address(0), "Zero token address");
        tokens[ticker] = Token(ticker, tokenAddress);
        tokenList.push(ticker);
        emit TokenAdded(ticker, tokenAddress);
    }

    /**
     * @notice Returns array of all registered tokens.
     */
    function getTokens() external view returns (Token[] memory) {
        Token[] memory _tokens = new Token[](tokenList.length);
        for (uint256 i = 0; i < tokenList.length; i++) {
            _tokens[i] = Token(tokens[tokenList[i]].ticker, tokens[tokenList[i]].tokenAddress);
        }
        return _tokens;
    }

    /**
     * @notice Returns full list of active orders on an orderbook side.
     */
    function getOrders(bytes32 ticker, Side side) external view returns (Order[] memory) {
        return orderBook[ticker][uint256(side)];
    }

    /**
     * @notice Deposit supported ERC20 token into DEX trading custody.
     */
    function deposit(uint256 amount, bytes32 ticker) external tokenExist(ticker) nonReentrant {
        if (amount == 0) revert ZeroAmountNotAllowed();

        bool success = IERC20Token(tokens[ticker].tokenAddress).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        if (!success) revert TokenTransferFailed();

        traderBalances[msg.sender][ticker] += amount;
        emit Deposit(msg.sender, ticker, amount);
    }

    /**
     * @notice Withdraw available token balance from DEX back to wallet.
     */
    function withdraw(uint256 amount, bytes32 ticker) external tokenExist(ticker) nonReentrant {
        if (amount == 0) revert ZeroAmountNotAllowed();
        uint256 balance = traderBalances[msg.sender][ticker];
        if (balance < amount) revert BalanceTooLow(amount, balance);

        traderBalances[msg.sender][ticker] -= amount;

        bool success = IERC20Token(tokens[ticker].tokenAddress).transfer(msg.sender, amount);
        if (!success) revert TokenTransferFailed();

        emit Withdraw(msg.sender, ticker, amount);
    }

    /**
     * @notice Place a Limit Order into the order book.
     * @dev Buy book maintains descending price order; Sell book maintains ascending price order.
     */
    function createLimitOrder(
        bytes32 ticker,
        uint256 amount,
        uint256 price,
        Side side
    ) external tokenExist(ticker) tokenIsNotDai(ticker) {
        if (amount == 0) revert ZeroAmountNotAllowed();
        if (price == 0) revert ZeroPriceNotAllowed();

        if (side == Side.SELL) {
            if (traderBalances[msg.sender][ticker] < amount) {
                revert TokenBalanceTooLow();
            }
        } else {
            if (traderBalances[msg.sender][DAI] < amount * price) {
                revert DaiBalanceTooLow();
            }
        }

        Order[] storage orders = orderBook[ticker][uint256(side)];
        orders.push(Order({
            id: nextOrderId,
            trader: msg.sender,
            side: side,
            ticker: ticker,
            amount: amount,
            filled: 0,
            price: price,
            date: block.timestamp
        }));

        // Insertion sort maintaining price-time priority
        if (orders.length > 1) {
            uint256 i = orders.length - 1;
            while (i > 0) {
                if (side == Side.BUY && orders[i - 1].price >= orders[i].price) {
                    break;
                }
                if (side == Side.SELL && orders[i - 1].price <= orders[i].price) {
                    break;
                }
                Order memory temp = orders[i - 1];
                orders[i - 1] = orders[i];
                orders[i] = temp;
                i--;
            }
        }

        emit OrderCreated(nextOrderId, msg.sender, side, ticker, amount, price, block.timestamp);
        nextOrderId++;
    }

    /**
     * @notice Cancel an unfilled resting limit order.
     */
    function cancelLimitOrder(
        bytes32 ticker,
        Side side,
        uint256 orderId
    ) external tokenExist(ticker) {
        Order[] storage orders = orderBook[ticker][uint256(side)];
        int256 orderIdx = -1;

        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].id == orderId) {
                if (orders[i].trader != msg.sender) revert OnlyOrderCreator();
                orderIdx = int256(i);
                break;
            }
        }

        if (orderIdx == -1) revert OrderNotFound();

        uint256 idx = uint256(orderIdx);
        emit OrderCancelled(orderId, msg.sender, ticker, side);

        // Shift remaining orders and pop
        for (uint256 j = idx; j < orders.length - 1; j++) {
            orders[j] = orders[j + 1];
        }
        orders.pop();
    }

    /**
     * @notice Execute an aggressive Market Order against opposing order book liquidity.
     */
    function createMarketOrder(
        bytes32 ticker,
        uint256 amount,
        Side side
    ) external tokenExist(ticker) tokenIsNotDai(ticker) nonReentrant {
        if (amount == 0) revert ZeroAmountNotAllowed();

        if (side == Side.SELL) {
            if (traderBalances[msg.sender][ticker] < amount) {
                revert TokenBalanceTooLow();
            }
        }

        uint256 oppSide = uint256(side == Side.BUY ? Side.SELL : Side.BUY);
        Order[] storage orders = orderBook[ticker][oppSide];

        uint256 i = 0;
        uint256 remaining = amount;

        while (i < orders.length && remaining > 0) {
            uint256 available = orders[i].amount - orders[i].filled;
            uint256 matched = (remaining > available) ? available : remaining;
            remaining -= matched;
            orders[i].filled += matched;

            emit NewTrade(
                nextTradeId,
                orders[i].id,
                ticker,
                orders[i].trader,
                msg.sender,
                matched,
                orders[i].price,
                block.timestamp
            );

            uint256 totalDai = matched * orders[i].price;

            if (side == Side.SELL) {
                // Taker is selling base token, receiving DAI; Maker (buyer) receives base token, pays DAI
                traderBalances[msg.sender][ticker] -= matched;
                traderBalances[msg.sender][DAI] += totalDai;
                traderBalances[orders[i].trader][ticker] += matched;
                traderBalances[orders[i].trader][DAI] -= totalDai;
            } else {
                // Taker is buying base token, paying DAI; Maker (seller) receives DAI, pays base token
                if (traderBalances[msg.sender][DAI] < totalDai) {
                    revert DaiBalanceTooLow();
                }
                traderBalances[msg.sender][ticker] += matched;
                traderBalances[msg.sender][DAI] -= totalDai;
                traderBalances[orders[i].trader][ticker] -= matched;
                traderBalances[orders[i].trader][DAI] += totalDai;
            }

            nextTradeId++;
            i++;
        }

        // Clean up completely filled orders cleanly
        while (orders.length > 0 && orders[0].filled == orders[0].amount) {
            for (uint256 j = 0; j < orders.length - 1; j++) {
                orders[j] = orders[j + 1];
            }
            orders.pop();
        }
    }
}
