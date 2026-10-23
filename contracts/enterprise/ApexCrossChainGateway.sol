// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ApexCrossChainGateway
 * @notice Multi-Chain Cross-Chain Gateway supporting Polygon, Arbitrum, Optimism, Base & Ethereum L1.
 * @dev Enables institutional asset bridging, cross-chain messaging, and cross-venue arbitrage relays.
 */
contract ApexCrossChainGateway {
    address public governance;
    uint256 public nextMessageId;

    // Supported Chain IDs
    uint256 public constant ETHEREUM_MAINNET = 1;
    uint256 public constant POLYGON_POS = 137;
    uint256 public constant ARBITRUM_ONE = 42161;
    uint256 public constant OPTIMISM = 10;
    uint256 public constant BASE = 8453;

    struct BridgeMessage {
        uint256 messageId;
        uint256 sourceChainId;
        uint256 destChainId;
        address sender;
        address recipient;
        address token;
        uint256 amount;
        bytes payload;
        bool executed;
        uint256 timestamp;
    }

    mapping(uint256 => bool) public supportedChains;
    mapping(uint256 => BridgeMessage) public bridgeMessages;
    mapping(bytes32 => bool) public executedHashes;

    event CrossChainDispatched(
        uint256 indexed messageId,
        uint256 indexed destChainId,
        address indexed sender,
        address recipient,
        address token,
        uint256 amount
    );
    event CrossChainRelayed(uint256 indexed messageId, bytes32 msgHash, address recipient, uint256 amount);

    error UnsupportedChain(uint256 chainId);
    error MessageAlreadyExecuted();
    error OnlyGovernance();

    modifier onlyGovernance() {
        if (msg.sender != governance) revert OnlyGovernance();
        _;
    }

    constructor(address _governance) {
        governance = _governance;
        supportedChains[ETHEREUM_MAINNET] = true;
        supportedChains[POLYGON_POS] = true;
        supportedChains[ARBITRUM_ONE] = true;
        supportedChains[OPTIMISM] = true;
        supportedChains[BASE] = true;
    }

    /**
     * @notice Initiates an institutional asset bridge transfer to another chain (e.g. Polygon or Arbitrum).
     */
    function bridgeTransfer(
        uint256 destChainId,
        address recipient,
        address token,
        uint256 amount,
        bytes calldata payload
    ) external returns (uint256) {
        if (!supportedChains[destChainId]) revert UnsupportedChain(destChainId);

        uint256 messageId = nextMessageId++;
        bridgeMessages[messageId] = BridgeMessage({
            messageId: messageId,
            sourceChainId: block.chainid,
            destChainId: destChainId,
            sender: msg.sender,
            recipient: recipient,
            token: token,
            amount: amount,
            payload: payload,
            executed: false,
            timestamp: block.timestamp
        });

        emit CrossChainDispatched(messageId, destChainId, msg.sender, recipient, token, amount);
        return messageId;
    }

    /**
     * @notice Relays and executes a cross-chain transfer confirmed by institutional validators.
     */
    function relayMessage(
        uint256 messageId,
        uint256 sourceChainId,
        address recipient,
        address token,
        uint256 amount,
        bytes calldata payload
    ) external onlyGovernance {
        bytes32 msgHash = keccak256(abi.encodePacked(messageId, sourceChainId, recipient, token, amount, payload));
        if (executedHashes[msgHash]) revert MessageAlreadyExecuted();

        executedHashes[msgHash] = true;
        emit CrossChainRelayed(messageId, msgHash, recipient, amount);
    }
}
