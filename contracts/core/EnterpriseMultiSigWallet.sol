// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Minimal interface for ERC20 transfers within the Multi-Sig wallet.
 */
interface IERC20Minimal {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title EnterpriseMultiSigWallet
 * @notice SOTA Institutional Multi-Signature Treasury & Governance Wallet.
 * @dev Features M-of-N quorum consensus, native ETH & ERC-20 token support,
 * arbitrary calldata execution, reentrancy protection, and comprehensive event telemetry.
 */
contract EnterpriseMultiSigWallet {
    // --- State Variables ---
    address[] public approvers;
    mapping(address => bool) public isApprover;
    uint256 public quorum;

    struct Transfer {
        uint256 id;
        address payable to;
        address token; // address(0) for native ETH, or ERC20 contract address
        uint256 amount;
        bytes data; // Optional arbitrary calldata for contract governance
        string description;
        uint256 approvals;
        bool executed;
        bool cancelled;
        uint256 createdAt;
    }

    Transfer[] public transfers;
    // transferId => approver => hasApproved
    mapping(uint256 => mapping(address => bool)) public approvals;

    // Mutex lock for ReentrancyGuard
    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    // --- Custom Errors ---
    error OnlyApproverAllowed();
    error TransferAlreadyExecuted();
    error TransferIsCancelled();
    error CannotApproveTwice();
    error TransferNotApprovedBySender();
    error QuorumNotReached();
    error InvalidApproversCount();
    error InvalidQuorum();
    error TransferExecutionFailed();
    error ReentrancyGuardTriggered();
    error InvalidTransferId();

    // --- Events ---
    event TransferProposed(
        uint256 indexed id,
        address indexed proposer,
        address indexed to,
        address token,
        uint256 amount,
        string description
    );
    event TransferApproved(uint256 indexed id, address indexed approver, uint256 currentApprovals);
    event TransferRevoked(uint256 indexed id, address indexed approver, uint256 currentApprovals);
    event TransferExecuted(uint256 indexed id, address indexed executor, address indexed to, uint256 amount);
    event TransferCancelled(uint256 indexed id, address indexed initiator);
    event DepositReceived(address indexed sender, uint256 amount);

    // --- Modifiers ---
    modifier onlyApprover() {
        if (!isApprover[msg.sender]) revert OnlyApproverAllowed();
        _;
    }

    modifier nonReentrant() {
        if (_status == _ENTERED) revert ReentrancyGuardTriggered();
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    /**
     * @notice Constructor initializes institutional signers and consensus quorum.
     * @param _approvers Array of unique authorized signer addresses.
     * @param _quorum Minimum required approvals to authorize execution.
     */
    constructor(address[] memory _approvers, uint256 _quorum) {
        if (_approvers.length == 0) revert InvalidApproversCount();
        if (_quorum == 0 || _quorum > _approvers.length) revert InvalidQuorum();

        for (uint256 i = 0; i < _approvers.length; i++) {
            address approver = _approvers[i];
            if (approver == address(0) || isApprover[approver]) revert InvalidApproversCount();
            isApprover[approver] = true;
            approvers.push(approver);
        }

        quorum = _quorum;
        _status = _NOT_ENTERED;
    }

    /**
     * @notice Returns the list of authorized approvers.
     */
    function getApprovers() external view returns (address[] memory) {
        return approvers;
    }

    /**
     * @notice Returns all proposed transfers in the queue.
     */
    function getTransfers() external view returns (Transfer[] memory) {
        return transfers;
    }

    /**
     * @notice Returns the total count of transfers.
     */
    function getTransfersCount() external view returns (uint256) {
        return transfers.length;
    }

    /**
     * @notice Checks if a specific signer has approved a given transfer.
     */
    function hasApproved(uint256 id, address approver) external view returns (bool) {
        if (id >= transfers.length) revert InvalidTransferId();
        return approvals[id][approver];
    }

    /**
     * @notice Propose a standard native ETH or ERC20 transfer.
     * @param to Destination address.
     * @param token Address of ERC20 token, or address(0) for native ETH.
     * @param amount Quantity of tokens or Wei.
     * @param description Institutional record / purpose note.
     */
    function createTransfer(
        address payable to,
        address token,
        uint256 amount,
        string calldata description
    ) external onlyApprover returns (uint256) {
        uint256 transferId = transfers.length;
        transfers.push(Transfer({
            id: transferId,
            to: to,
            token: token,
            amount: amount,
            data: "",
            description: description,
            approvals: 0,
            executed: false,
            cancelled: false,
            createdAt: block.timestamp
        }));

        emit TransferProposed(transferId, msg.sender, to, token, amount, description);
        return transferId;
    }

    /**
     * @notice Legacy-compatible signature for standard ETH transfer creation.
     */
    function createTransfer(uint256 amount, address payable to) external onlyApprover returns (uint256) {
        uint256 transferId = transfers.length;
        transfers.push(Transfer({
            id: transferId,
            to: to,
            token: address(0),
            amount: amount,
            data: "",
            description: "Direct ETH Treasury Transfer",
            approvals: 0,
            executed: false,
            cancelled: false,
            createdAt: block.timestamp
        }));

        emit TransferProposed(transferId, msg.sender, to, address(0), amount, "Direct ETH Treasury Transfer");
        return transferId;
    }

    /**
     * @notice Propose an arbitrary smart contract interaction (e.g. DEX admin calls).
     */
    function createTransaction(
        address payable target,
        uint256 value,
        bytes calldata data,
        string calldata description
    ) external onlyApprover returns (uint256) {
        uint256 transferId = transfers.length;
        transfers.push(Transfer({
            id: transferId,
            to: target,
            token: address(0),
            amount: value,
            data: data,
            description: description,
            approvals: 0,
            executed: false,
            cancelled: false,
            createdAt: block.timestamp
        }));

        emit TransferProposed(transferId, msg.sender, target, address(0), value, description);
        return transferId;
    }

    /**
     * @notice Approve a pending transfer. If quorum is achieved, triggers auto-execution.
     * @param id Identifier of the transfer proposal.
     */
    function approveTransfer(uint256 id) external onlyApprover nonReentrant {
        if (id >= transfers.length) revert InvalidTransferId();
        Transfer storage t = transfers[id];

        if (t.executed) revert TransferAlreadyExecuted();
        if (t.cancelled) revert TransferIsCancelled();
        if (approvals[id][msg.sender]) revert CannotApproveTwice();

        approvals[id][msg.sender] = true;
        t.approvals++;

        emit TransferApproved(id, msg.sender, t.approvals);

        if (t.approvals >= quorum) {
            _executeTransfer(id);
        }
    }

    /**
     * @notice Revoke a previously submitted approval before execution occurs.
     * @param id Identifier of the transfer proposal.
     */
    function revokeApproval(uint256 id) external onlyApprover {
        if (id >= transfers.length) revert InvalidTransferId();
        Transfer storage t = transfers[id];

        if (t.executed) revert TransferAlreadyExecuted();
        if (!approvals[id][msg.sender]) revert TransferNotApprovedBySender();

        approvals[id][msg.sender] = false;
        t.approvals--;

        emit TransferRevoked(id, msg.sender, t.approvals);
    }

    /**
     * @notice Explicit execution call for transfers with sufficient approvals.
     */
    function executeTransfer(uint256 id) external onlyApprover nonReentrant {
        if (id >= transfers.length) revert InvalidTransferId();
        Transfer storage t = transfers[id];

        if (t.executed) revert TransferAlreadyExecuted();
        if (t.cancelled) revert TransferIsCancelled();
        if (t.approvals < quorum) revert QuorumNotReached();

        _executeTransfer(id);
    }

    /**
     * @dev Internal helper for atomic execution.
     */
    function _executeTransfer(uint256 id) internal {
        Transfer storage t = transfers[id];
        t.executed = true;

        if (t.data.length > 0) {
            // Generic contract call
            (bool success, ) = t.to.call{value: t.amount}(t.data);
            if (!success) revert TransferExecutionFailed();
        } else if (t.token == address(0)) {
            // Native ETH transfer
            (bool success, ) = t.to.call{value: t.amount}("");
            if (!success) revert TransferExecutionFailed();
        } else {
            // ERC-20 token transfer
            bool success = IERC20Minimal(t.token).transfer(t.to, t.amount);
            if (!success) revert TransferExecutionFailed();
        }

        emit TransferExecuted(id, msg.sender, t.to, t.amount);
    }

    /**
     * @notice Cancel a pending unexecuted transfer proposal.
     */
    function cancelTransfer(uint256 id) external onlyApprover {
        if (id >= transfers.length) revert InvalidTransferId();
        Transfer storage t = transfers[id];
        if (t.executed) revert TransferAlreadyExecuted();
        t.cancelled = true;
        emit TransferCancelled(id, msg.sender);
    }

    /**
     * @notice Receive native ETH deposits directly into treasury.
     */
    receive() external payable {
        emit DepositReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        emit DepositReceived(msg.sender, msg.value);
    }
}
