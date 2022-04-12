## Homepage

<https://www.gwscan.com/>

### Statistics

| Field              | Description                                          |
| ------------------ | ---------------------------------------------------- |
| Block Number       | Current Tip Block Number                             |
| Average Block Time | Calculated from the last 12 blocks                   |
| Transaction Count  | Total count of transactions                          |
| TPS                | Calculated from the last 10 mins                     |
| Wallet Addresses   | Including all addresses(user, meta, polyjuice, sudt) |

### Last 10 Blocks

| Field                     | Description                                  |
| ------------------------- | -------------------------------------------- |
| Block Number              | Height of the block                          |
| Age                       | Time duration from now to minted time        |
| Transactions in the block | Transaction count that included in the block |

### Last Transactions

| Field            | Description                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| Transaction hash | Hash of the transaction                                                                                |
| Age              | Time duration from now to minted time                                                                  |
| From address     | From field in the transaction                                                                          |
| To address       | To field in the transaction                                                                            |
| Transaction type | Polyjuice / Polyjuice Creator / ETH Address Registry(ETH Address Registery exists only in godwoken v1) |

## Block List

<https://www.gwscan.com/blocks>

| Field           | Description                                    |
| --------------- | ---------------------------------------------- |
| Finalize Status | Status of the block, committed or finalized    |
| Block Number    | Height of the block                            |
| Age             | Time duration from now to minted time          |
| Txn             | Transaction count that included in the block   |
| Gas Used        | Sum of gas used in transactions in this block  |
| Gas Limit       | Sum of gas limit in transactions in this block |

## Transaction List

| Field            | Description                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| Finalize Status  | Status of the block, committed or finalized                                                            |
| Transaction Hash | Hash of the transaction                                                                                |
| Block Number     | Height of the block that including this transaction                                                    |
| Age              | Time duration from now to minted time                                                                  |
| From             | From field in the transaction                                                                          |
| To               | To field in the transaction                                                                            |
| Value            | Value field in the transaction                                                                         |
| Transaction type | Polyjuice / Polyjuice Creator / ETH Address Registry(ETH Address Registery exists only in godwoken v1) |

## Registered Contract List

<https://www.gwscan.com/contracts>

Contracts that registered in GitHub.

General Contracts: <https://github.com/nervosnet/godwoken_explorer/issues?q=is%3Aissue+sort%3Aupdated-desc+is%3Aclosed+label%3A%22Contract+Registration%22>

Token: <https://github.com/nervosnet/godwoken_explorer/issues?q=is%3Aissue+sort%3Aupdated-desc+is%3Aclosed+label%3A%22Token+Registered%22>

| Field         | Description                                     |
| ------------- | ----------------------------------------------- |
| Address       | Contract Address                                |
| Contract Name | Contract Name in Registration                   |
| Compiler      | Compiler Type in Registration                   |
| Version       | Compiler Version in Registration                |
| Balace        | CKB Balance in this contract                    |
| Txn           | Transaction Count that related to this contract |

## Token List

Tokens that registered in GitHub. <https://github.com/nervosnet/godwoken_explorer/issues?q=is%3Aissue+sort%3Aupdated-desc+is%3Aclosed+label%3A%22Token+Registered%22>

<https://www.gwscan.com/tokens/bridge>

| Field                             | Description                          |
| --------------------------------- | ------------------------------------ |
| Token                             | Logo, name and symbol of this token  |
| Address                           | Contract address of this token       |
| Circulating Supply / Total supply | Token amount circulating in layer 2  |
| Holders                           | Count of account who hold this token |

## Charts

- Average Block Size
- Average Block Time
- Daily Block Count
- Daily Transaction Count
- Average Gas Used/Limit
- Daily ERC20 Transfer Count

## Block Info

<https://www.gwscan.com/block/0x032a8fe6d07e8a653144234b72910950610f2f1d05994ae120d9db08f2c87349>

| Field          | Description                                           |
| -------------- | ----------------------------------------------------- |
| Block Number   | Height of the block                                   |
| Block Hash     | Hash of the block                                     |
| Timestamp      | Minted time of the block                              |
| Layer 1 Info   | Layer 1 Transaction that finalized this layer 2 block |
| Finalize State | committed / finalized                                 |
| Transactions   | Transaction count that included in the block          |
| Aggregator     | Address of aggregator that commit this layer 2 block  |
| Size           | Size field in the block                               |
| Gas Used       | Sum of gas used in transactions in this block         |
| Gas Limit      | Sum of gas limit in transactions in this block        |
| Parent Hash    | Block hash of the parent block                        |

### Transaction List

| Field            | Description                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| Finalize Status  | Status of the transaction, committed or finalized                                                      |
| Transaction Hash | Hash of the transaction                                                                                |
| Age              | Time duration from now to minted time                                                                  |
| From address     | From field in the transaction                                                                          |
| To address       | To field in the transaction                                                                            |
| Value            | Transferred value in CKB                                                                               |
| Transaction type | Polyjuice / Polyjuice Creator / ETH Address Registry(ETH Address Registery exists only in godwoken v1) |

### Bridged Transfers

List of bridged transfers in this block, including deposit and withdrawal records.

| Field   | Description                                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------------------- |
| Type    | Deposit / Withdraw                                                                                                   |
| Value   | Transferred token amount                                                                                             |
| Age     | Time duration from now to transfer committed                                                                         |
| Account | Account address that receive/send the bridged assets                                                                 |
| CKB Txn | Committed transaction in layer 1                                                                                     |
| Block   | Committed block number in layer 2 (deposit records have no layer 2 block number because it cannot be parsed for now) |

## Token Info

<https://www.gwscan.com/token/1>

| Field                             | Description                                    |
| --------------------------------- | ---------------------------------------------- |
| Logo, Name and Symbol             | Logo, name and symbol of this token            |
| Decimal                           | Decimal of this token                          |
| Type                              | Token type, bridged / native                   |
| Contract                          | Contract address of this token                 |
| Official Site                     | Official website of this token in registration |
| Description                       | Description of this token in registration      |
| Circulating Supply / Total Supply | Token amount circulating in layer 2            |
| Holders                           | Count of Accounts who hold this token          |
| Transfers                         | Total count of transfers                       |

### Transfers

Transfers in layer 2 of this token

| Field            | Description                                                                         |
| ---------------- | ----------------------------------------------------------------------------------- |
| Transaction Hash | Hash of the transaction that including this transfer                                |
| Block Number     | Block that including this transfer                                                  |
| Age              | Time duration from now to this transfer                                             |
| From             | From field in the transfer event                                                    |
| To               | To field in the transfer event                                                      |
| Value            | Value field in the transfer event, will be parsed if this token has been registered |

### Bridged Transfers

Bridged transfers between layer 1 and layer 2

| Field   | Description                                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------------------- |
| Type    | Deposit / Withdraw                                                                                                   |
| Value   | Transferred token amount                                                                                             |
| Age     | Time duration from now to transfer committed                                                                         |
| Account | Layer 2 account related to this transfer                                                                             |
| CKB Txn | Committed transaction in layer 1                                                                                     |
| Block   | Committed block number in layer 2 (deposit records have no layer 2 block number because it cannot be parsed for now) |

### Holder List

Holder list of this token

| Field      | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| Rank       |                                                              |
| Address    | Account address                                              |
| Balanec    | Account balance in this token                                |
| Percentage | Balance / Circulating Supply                                 |
| Txns       | Count of transactions related to this token and this account |

## Transaction Info

<https://www.gwscan.com/tx/0xeca27dd4f7cae2e956ba9669cb66172e57814582099729f54843829cdeca68d7>

| Field                     | Description                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| Transaction Hash          | Hash of the transaction                                                                                |
| From                      | From field in the transaction                                                                          |
| To/Interact with Contract | To field in the transaction                                                                            |
| Value                     | Value field in the transaction                                                                         |
| Input                     | Input field in the transaction, could be parsed if ABI is known                                        |
| Success Status            | Pending / Failure / Success, this field will be omitted if status is success                           |
| Finalize Status           | Status of the block, committed or finalized                                                            |
| Transaction type          | Polyjuice / Polyjuice Creator / ETH Address Registry(ETH Address Registery exists only in godwoken v1) |
| Layer 1 block             | Layer 1 block in which this layer 2 transaction is committed                                           |
| Layer 2 block             | Layer 2 block in which this layer 2 transaction is committed                                           |
| Nonce                     | Nonce field in the transaction                                                                         |
| Gas price                 | Gas price field in the transaction                                                                     |
| Gas used                  | Gas used in this transaction                                                                           |
| Gas limit                 | Gas limit field in this transaction                                                                    |
| Fee                       | Calculated from gas price \* gas used                                                                  |
| Timestamp                 | Timestamp of the transaction                                                                           |

### ERC20 Transfers

ERC20 Transfer records in this transaction

| Field | Description                                                                         |
| ----- | ----------------------------------------------------------------------------------- |
| From  | From field in the transfer event                                                    |
| To    | To field in the transfer event                                                      |
| Value | Value field in the transfer event, will be parsed if this token has been registered |

## Account Info

### User Account

<https://www.gwscan.com/account/0xf17fa46ca29fc8e8d563961c755bec2a7bae5745>

| Field                     | Description                                       |
| ------------------------- | ------------------------------------------------- |
| CKB Balance               | CKB balance of this account                       |
| Transaction Count         | Transaction count that related to this account    |
| Nonce                     | Nonce of this account                             |
| Depositor CKB Address     | Corresponding CKB Address in layer 1(deprecating) |
| Depositor CKB Lock Script | Lock script decoded from CKB Address(deprecating) |

### SUDT Account

<https://www.gwscan.com/account/0x9e9c54293c3211259de788e97a31b5b3a66cd535>

Token info are registered in <https://github.com/nervosnetwork/force-bridge/blob/main/configs/all-bridged-tokens.json>

| Field             | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| CKB Balance       | CKB balance of this account                                     |
| Transaction Count | Transaction count that related to this account                  |
| Name              | Token Name                                                      |
| Symbol            | Token Symbol                                                    |
| Decimals          | Token Decimals                                                  |
| Layer 2 Supply    | Net deposit from layer 1 to layer 2                             |
| Holders           | Count of holders of this token                                  |
| L2 script hash    | script hash of this token account, internal mapping of godwoken |

- Script hash can be fetched by <https://github.com/nervosnetwork/godwoken/blob/develop/docs/RPC.md#method-gw_get_account_id_by_script_hash>

### Contract Account

<https://www.gwscan.com/account/0xd66eb642ee33837531fda61eb7ab15b15658bcab?tab=contract>

| Field              | Description                                                                    |
| ------------------ | ------------------------------------------------------------------------------ |
| CKB Balance        | CKB balance of this account                                                    |
| Transaction Count  | Transaction count that related to this account                                 |
| Deploy Transaction | Transaction that deployed this contract, omitted if contract is not registered |

### Meta Account

<https://www.gwscan.com/account/0x5c84fc6078725df72052cc858dffc6f352a06970>

Display global state of godwoken <https://github.com/nervosnetwork/godwoken/blob/5f6354ac4fcc065e432a574830ccd98af47f2297/crates/types/schemas/godwoken.mol#L26-L37>

### Polyjuice Account

<https://www.gwscan.com/account/0x8adcb6adf12a1dc8d3302c5129c5feb12cbec229?search=0x8adcb6adf12a1dc8d3302c5129c5feb12cbec229>

| Field             | Description                                               |
| ----------------- | --------------------------------------------------------- |
| CKB Balance       | CKB balance of this account                               |
| Transaction Count | Transaction count that related to this account            |
| L2 script hash    | script hash of this account, internal mapping of godwoken |
| Script            | Layer 2 script of this account                            |

### Transaction List

<https://www.gwscan.com/account/0xf17fa46ca29fc8e8d563961c755bec2a7bae5745?tab=transactions>

Transactions related to this account

| Field            | Description                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| Finalize Status  | Status of the transaction, committed or finalized                                                      |
| Transaction Hash | Hash of the transaction                                                                                |
| Age              | Time duration from now to minted time                                                                  |
| From address     | From field in the transaction                                                                          |
| To address       | To field in the transaction                                                                            |
| Value            | Transferred value in CKB                                                                               |
| Transaction type | Polyjuice / Polyjuice Creator / ETH Address Registry(ETH Address Registery exists only in godwoken v1) |

### ERC20 Transfers

<https://www.gwscan.com/account/0xf17fa46ca29fc8e8d563961c755bec2a7bae5745?tab=erc20>

ERC20 transfers related to this account

| Field            | Description                                                                         |
| ---------------- | ----------------------------------------------------------------------------------- |
| Transaction Hash | Hash of the transaction that including this transfer                                |
| Block Number     | Block that including this transfer                                                  |
| Age              | Time duration from now to this transfer                                             |
| From             | From field in the transfer event                                                    |
| To               | To field in the transfer event                                                      |
| Value            | Value field in the transfer event, will be parsed if this token has been registered |

### Bridged Transfers

<https://www.gwscan.com/account/0xf17fa46ca29fc8e8d563961c755bec2a7bae5745?tab=bridged>

Bridged transfers related to this account

| Field   | Description                                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------------------- |
| Type    | Deposit / Withdraw                                                                                                   |
| Value   | Transferred token amount                                                                                             |
| Age     | Time duration from now to transfer committed                                                                         |
| CKB Txn | Committed transaction in layer 1                                                                                     |
| Block   | Committed block number in layer 2 (deposit records have no layer 2 block number because it cannot be parsed for now) |

### User Defined Assets List

<https://www.gwscan.com/account/0x085a61d7164735fc5378e590b5ed1448561e1a48?tab=assets>

Tokens held by this account

| Field      | Description                    |
| ---------- | ------------------------------ |
| Asset      | Token name                     |
| Asset Type | Bridged / Native               |
| Balance    | Token amount this address hold |

### Contract Info

<https://www.gwscan.com/account/0xd66eb642ee33837531fda61eb7ab15b15658bcab?tab=contract>

Contract Info registed in GitHub

| Field                 | Description                                       |
| --------------------- | ------------------------------------------------- |
| Contract Name         | Contract name in registration                     |
| Compiler Version      | Compiler version in registration                  |
| Code File Format      | Code file format in registration                  |
| Contract Source Code  | Contract source code in registration              |
| ABI                   | Compiled from source code                         |
| Constructor Arguments | Constructor arguments in registration             |
| Read Contract         | interactive panel to read data from this contract |
