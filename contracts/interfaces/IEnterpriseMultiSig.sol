// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEnterpriseMultiSig {
    struct Transfer {
        uint256 id;
        address payable to;
        address token;
        uint256 amount;
        bytes data;
        string description;
        uint256 approvals;
        bool executed;
        bool cancelled;
        uint256 createdAt;
    }

    function quorum() external view returns (uint256);
    function getApprovers() external view returns (address[] memory);
    function getTransfers() external view returns (Transfer[] memory);
    function createTransfer(address payable to, address token, uint256 amount, string calldata description) external returns (uint256);
    function approveTransfer(uint256 id) external;
    function revokeApproval(uint256 id) external;
    function executeTransfer(uint256 id) external;
    function cancelTransfer(uint256 id) external;
}
