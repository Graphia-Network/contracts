# Solidity API

## Assets

This contract is used to manage tokenization of real world assets for Graphia Platform.

### tokenCounter

```solidity
uint256 tokenCounter
```

_Token counter, used for generating unique token IDs_

### frozen

```solidity
mapping(address => bool) frozen
```

_Mapping that keeps track of froozen accounts_

### Created

```solidity
event Created(uint256 id, address to, uint256 amount)
```

Event that is emitted when a new asset is created. To be more clear than Transfer events from ERC1155.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | ID of the asset |
| to | address | Address of the user to whom the asset is minted |
| amount | uint256 | Amount of the asset minted |

### Burned

```solidity
event Burned(uint256 id, address from, uint256 amount, bytes proof)
```

Event that is emitted when an asset is burned. To be more clear than Transfer events from ERC1155.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | ID of the asset |
| from | address | Address of the user from whom the asset is burned |
| amount | uint256 | Amount of the asset burned |
| proof | bytes |  |

### AccountFreezeStatusChanged

```solidity
event AccountFreezeStatusChanged(address account, bool status)
```

Event that is emitted when an account is frozen or unfrozen.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | Address of the account |
| status | bool | True if the account is frozen, false if the account is unfrozen |

### SenderIsFrozen

```solidity
error SenderIsFrozen()
```

### RecipientIsFrozen

```solidity
error RecipientIsFrozen()
```

### constructor

```solidity
constructor(string initialURI, address initialOwner) public
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

### newAsset

```solidity
function newAsset(string uri, address to, uint256 amount) external
```

Function to create a new asset.

_Only admin can call this function._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| uri | string | New URI for the assets, that includes new metadata. |
| to | address | Address of the user to whom the asset is to be minted. |
| amount | uint256 | Amount of the asset to be minted. |

### burnWithProof

```solidity
function burnWithProof(uint256 id, address[] from, uint256[] amount, bytes proof) external
```

Function that allows admin to burn assets that are expired, fraudulent or any other reason.

_Only admin can call this function._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | ID of the asset to be burned. |
| from | address[] | Array of addresses from which the asset is to be burned. |
| amount | uint256[] | Array of amounts of the asset to be burned. |
| proof | bytes | Proof of the reason for burning the asset. |

### burn

```solidity
function burn(uint256 id, uint256 amount) external
```

Function to burn assets.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | ID of the asset to be burned. |
| amount | uint256 | Amount of the asset to be burned. |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes data) public
```

_See \{IERC1155-safeTransferFrom}._

### safeBatchTransferFrom

```solidity
function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] values, bytes data) public
```

_See \{IERC1155-safeBatchTransferFrom}._

### setAccountFreezeStatus

```solidity
function setAccountFreezeStatus(address account, bool status) external
```

Function to freeze or unfreeze an account.

_Only admin can call this function._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | Address of the account to freeze or unfreeze. |
| status | bool | True to freeze the account, false to unfreeze the account. |

### isFrozen

```solidity
function isFrozen(address account) external view returns (bool)
```

Function to check if an account is frozen.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | Address of the account to check. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the account is frozen, false otherwise. |
