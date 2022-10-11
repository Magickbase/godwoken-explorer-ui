import { GraphQLClient } from 'graphql-request'
import { GRAPHQL_ENDPOINT } from './constants'

export const client = new GraphQLClient(GRAPHQL_ENDPOINT, { headers: { Accept: 'application/json' } })

export namespace GraphQLSchema {
  export enum BlockStatus {
    Pending = 'PENDING',
    Committed = 'COMMITTED',
    Finalized = 'FINALIZED',
  }

  export enum UdtType {
    Bridge = 'BRIDGE',
    Native = 'NATIVE',
  }

  export enum TokenType {
    ERC20 = 'ERC20',
    ERC721 = 'ERC721',
    ERC1155 = 'ERC1155',
  }

  export enum AccountType {
    EthAddrReg = 'ETH_ADDR_REG',
    EthUser = 'ETH_USER',
    MetaContract = 'META_CONTRACT',
    PolyjuiceContract = 'POLYJUICE_CONTRACT',
    PolyjuiceCreator = 'POLYJUICE_CREATOR',
    Udt = 'UDT',
    Unknown = 'UNKNOWN',
  }

  export enum PolyjuiceStatus {
    Failed = 'FAILED',
    Succeed = 'SUCCEED',
    Pending = 'PENDING',
  }

  export enum TransactionType {
    EthAddressRegistry = 'ETH_ADDRESS_REGISTRY',
    Polyjuice = 'POLYJUICE',
    PolyjuiceCreator = 'POLYJUICE_CREATOR',
  }

  export enum ApprovalType {
    Approval = 'APPROVAL',
    ApprovalAll = 'APPROVAL_ALL',
  }

  export enum SortType {
    Asc = 'ASC',
    Desc = 'DESC',
  }

  export enum TokenApprovalsSorter {
    BlockNumber = 'BLOCK_NUMBER',
    Id = 'ID',
  }

  export interface Udt {
    account: Account
    bridge_account_id: number
    decimal: number
    description: string
    icon: string
    id: string
    name: string
    official_site: string
    price: string
    script_hash: string
    supply: string
    symbol: string
    type: UdtType
    eth_type: TokenType
    type_script: object
    value: string
  }

  export interface SmartContract {
    abi: Array<object>
    account: Account
    account_id: string
    compiler_file_format: String
    compiler_version: String
    constructor_arguments: string
    contract_source_code: string
    deployment_tx_hash: string
    id: number
    name: string
    other_info: string
  }

  export interface AccountUdt {
    account: Account
    address_hash: string
    balance: string
    id: number
    token_contract_address_hash: string
    udt: Udt
  }

  export interface Account {
    account_udts: Array<Udt>
    eth_address: string
    id: number
    nonce: number
    script: object
    script_hash: string
    short_address: string
    smart_contract: SmartContract
    token_transfer_count: number
    transaction_count: number
    type: AccountType
  }

  export interface AccountCkb {
    address_hash: string
    balance: string
  }

  export interface Polyjuice {
    gas_limit: number
    gas_price: string
    gas_used: number
    id: number
    input: string
    input_size: number
    is_create: boolean
    status: PolyjuiceStatus
    tx_hash: string
    value: string
    created_contract_address_hash: string | null
    native_transfer_address_hash: string | null
  }

  export interface PolyjuiceCreator {
    code_hash: string
    fee_amount: string
    fee_udt_id: number
    hash_type: string
    id: number
    script_args: string
    tx_hash: string
    created_account: Account | null
  }

  export interface Transaction {
    args: string
    block: Block
    method_id: string | null
    method_name: string | null
    block_hash: string
    block_number: number
    from_account: Account
    to_account: Account
    hash: string
    eth_hash: string
    nonce: number
    polyjuice: Polyjuice
    polyjuice_creator: PolyjuiceCreator
    type: TransactionType
  }

  export interface Block {
    account: Account
    aggregator_id: number
    difficulty: string
    extra_data: string
    gas_limit: string
    gas_used: string
    hash: string
    layer1_block_number: number | null
    layer1_tx_hash: string | null
    logs_bloom: string
    nonce: string
    number: number
    parent_hash: string
    size: number
    state_root: string
    status: BlockStatus
    timestamp: string
    total_difficulty: string
    transaction_count: number
    transactions: Array<Transaction>
  }

  export interface Log {
    address_hash: string
    block_hash: string
    block_number: number
    data: string
    first_topic: string
    second_topic: string
    thrid_topic: string
    fourth_topic: string
    index: number
    transaction_hash: string
  }

  export interface TokenTransfer {
    amount: string
    block: Block
    block_hash: string
    block_number: number
    from_account: Account
    from_address: string
    log_index: number
    polyjuice: Polyjuice
    to_account: Account
    to_address: string
    token_contract_address_hash: string
    token_id: string
    transaction: Transaction
    transaction_hash: string
    udt: Udt
  }

  export interface NftCollectionListItem {
    id: number
    name: string
    symbol: string
    icon: string
    account: Pick<Account, 'eth_address'>
    holders_count: string
    minted_count: string
  }

  export interface MultiTokenCollectionListItem {
    id: number
    name: string
    symbol: string
    icon: string
    account: Pick<Account, 'eth_address'>
    holders_count: string
    minted_count: string
  }

  export interface TokenApprovalsSorterInput {
    sort_type: SortType
    sort_value: TokenApprovalsSorter
  }

  export interface PageMetadata {
    total_count: number
    before: string | null
    after: string | null
  }
}
