pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/// @title Assets contract
/// @author Graphia Labs
/// @notice This contract is used to manage tokenization of real world assets for Graphia Platform.
contract Assets is AccessControl, ERC1155 {
    /// @dev Token counter, used for generating unique token IDs
    uint256 internal tokenCounter;

    /// @dev Mapping that keeps track of froozen accounts
    mapping(address => bool) internal frozen;

    /// @notice Event that is emitted when a new asset is created. To be more clear than Transfer events from ERC1155.
    /// @param id ID of the asset
    /// @param to Address of the user to whom the asset is minted
    /// @param amount Amount of the asset minted
    event AssetCreated(uint256 indexed id, address indexed to, uint256 amount);

    /// @notice Event that is emitted when an asset is burned. To be more clear than Transfer events from ERC1155.
    /// @param id ID of the asset
    /// @param from Address of the user from whom the asset is burned
    /// @param amount Amount of the asset burned
    event AssetBurned(
        uint256 indexed id,
        address indexed from,
        uint256 amount,
        bytes proof
    );

    /// @notice Event that is emitted when an account is frozen or unfrozen.
    /// @param account Address of the account
    /// @param status True if the account is frozen, false if the account is unfrozen
    event AccountFreezeStatusChanged(address indexed account, bool status);

    error SenderIsFrozen();
    error RecipientIsFrozen();

    constructor(
        string memory initialURI,
        address initialOwner
    ) ERC1155(initialURI) {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
    }

    // Override supportsInterface since ERC1155 and AccessControl both implement it.
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControl, ERC1155) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// @notice Function to create a new asset.
    /// @param uri New URI for the assets, that includes new metadata.
    /// @param to Address of the user to whom the asset is to be minted.
    /// @param amount Amount of the asset to be minted.
    /// @dev Only admin can call this function.
    function newAsset(
        string memory uri,
        address to,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        unchecked {
            _mint(to, tokenCounter, amount, "");
        }

        emit AssetCreated(tokenCounter++, to, amount);

        _setURI(uri);
    }

    /// @notice Function that allows admin to burn assets that are expired, fraudulent or any other reason.
    /// @param id ID of the asset to be burned.
    /// @param from Array of addresses from which the asset is to be burned.
    /// @param amount Array of amounts of the asset to be burned.
    /// @param proof Proof of the reason for burning the asset.
    /// @dev Only admin can call this function.
    function burnWithProof(
        uint256 id,
        address[] memory from,
        uint256[] memory amount,
        bytes memory proof
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        for (uint256 i = 0; i < from.length; i++) {
            _burn(from[i], id, amount[i]);
            emit AssetBurned(id, from[i], amount[i], proof);
        }
    }

    /// @notice Function to burn assets.
    /// @param id ID of the asset to be burned.
    /// @param amount Amount of the asset to be burned.
    function burn(uint256 id, uint256 amount) external {
        _burn(msg.sender, id, amount);
        emit AssetBurned(id, msg.sender, amount, "");
    }

    // Override safeTransferFrom to check if sender or receiver is frozen.
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 value,
        bytes memory data
    ) public override {
        if (frozen[from]) revert SenderIsFrozen();
        if (frozen[to]) revert RecipientIsFrozen();

        super.safeTransferFrom(from, to, id, value, data);
    }

    // Override safeBatchTransferFrom to check if sender or receiver is frozen.
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) public override {
        if (frozen[from]) revert SenderIsFrozen();
        if (frozen[to]) revert RecipientIsFrozen();

        super.safeBatchTransferFrom(from, to, ids, values, data);
    }

    /// @notice Function to freeze or unfreeze an account.
    /// @param account Address of the account to freeze or unfreeze.
    /// @param status True to freeze the account, false to unfreeze the account.
    /// @dev Only admin can call this function.
    function setAccountFreezeStatus(
        address account,
        bool status
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        frozen[account] = status;

        emit AccountFreezeStatusChanged(account, status);
    }

    /// @notice Function to check if an account is frozen.
    /// @param account Address of the account to check.
    /// @return True if the account is frozen, false otherwise.
    function isFrozen(address account) external view returns (bool) {
        return frozen[account];
    }
}
