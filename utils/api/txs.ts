import { SERVER_URL, pretreat } from './utils'
import type { TxStatus, TxType } from './tx'

type Method = 'Transfer'

interface Raw {
  block_hash: string
  block_number: number
  fee: string
  from: string
  gas_limit: number
  gas_price: string
  gas_used: number
  hash: string
  method: Method
  nonce: number
  receive_eth_address: string
  status: TxStatus
  polyjuice_status: 'succeed' | 'failed'
  timestamp: number
  to: string
  to_alias: string
  transfer_value: string
  type: TxType
  udt_id: number
  value: string
  l1_block_number?: number
}

interface Parsed {
  blockHash: string
  blockNumber: number
  fee: string
  from: string
  gasLimit: number
  gasPrice: string
  gasUsed: number
  hash: string
  method: Method
  nonce: number
  status: TxStatus
  isSuccess: boolean
  timestamp: number
  to: string
  toAlias: string
  type: TxType
  value: string
  l1BlockNumber?: number
}

interface Erc20Raw {
  block_hash: string
  block_number: number
  fee: string
  from: string
  gas_limit: number
  gas_price: string
  gas_used: number
  hash: string
  l1_block_number: number | null
  method: string
  nonce: number
  receive_eth_address: string
  status: TxStatus
  polyjuice_status: 'succeed' | 'failed'
  timestamp: number
  to: string
  to_alias: string
  transfer_value: string
  type: TxType
  udt_id: number
  udt_symbol: string
  value: string
}

interface Erc20Parsed {
  blockHash: string
  blockNumber: number
  fee: string
  from: string
  gasLimit: number
  gasPrice: string
  gasUsed: number
  hash: string
  l1BlockNumber: number | null
  method: string
  nonce: number
  receiveEthAddress: string
  status: TxStatus
  isSuccess: boolean
  timestamp: number
  to: string
  toAlias: string
  transferValue: string
  type: TxType
  udtId: number
  udtSymbol: string
  value: string
}

export const getTxListRes = (txListRes: {
  txs: Array<Raw>
  page: string
  total_count: string
}): { txs: Array<Parsed>; page: string; totalCount: string } => ({
  page: txListRes.page,
  totalCount: txListRes.total_count,
  txs: txListRes.txs.map(tx => ({
    blockHash: tx.block_hash ?? null,
    blockNumber: tx.block_number ?? null,
    fee: tx.fee,
    from: tx.from,
    gasLimit: tx.gas_limit,
    gasPrice: tx.gas_price,
    gasUsed: tx.gas_used,
    hash: tx.hash,
    method: tx.method,
    nonce: tx.nonce,
    status: tx.status ?? 'pending',
    isSuccess: tx.polyjuice_status === 'succeed',
    timestamp: tx.timestamp ? tx.timestamp * 1000 : -1,
    to: tx.to,
    type: tx.type,
    toAlias: tx.to_alias,
    value: tx.value,
    l1BlockNumber: tx.l1_block_number ?? null,
  })),
})
export const fetchTxList = (
  query: Partial<Record<'page' | 'type' | 'tx_type' | 'eth_address' | 'block_hash', string>>,
): Promise<{ txs: Array<Parsed>; page: string; totalCount: string }> =>
  fetch(`${SERVER_URL}/txs?${new URLSearchParams({ ...query, page: query.page || '1' })}`)
    .then(res => pretreat<{ txs: Array<Raw>; page: string; total_count: string }>(res))
    .then(getTxListRes)

export const getERC20TransferListRes = (list: {
  txs: Array<Erc20Raw>
  page: string
  total_count: string
}): { txs: Array<Erc20Parsed>; page: string; totalCount: string } => ({
  page: list.page,
  totalCount: list.total_count,
  txs: list.txs.map(tx => ({
    blockHash: tx.block_hash,
    blockNumber: tx.block_number,
    fee: tx.fee,
    from: tx.from,
    gasLimit: tx.gas_limit,
    gasPrice: tx.gas_price,
    gasUsed: tx.gas_used,
    hash: tx.hash,
    l1BlockNumber: tx.l1_block_number || null,
    method: tx.method,
    nonce: tx.nonce,
    receiveEthAddress: tx.receive_eth_address,
    status: tx.status,
    isSuccess: tx.polyjuice_status === 'succeed',
    timestamp: tx.timestamp ? tx.timestamp * 1000 : -1,
    to: tx.to,
    toAlias: tx.to_alias,
    transferValue: tx.transfer_value,
    type: tx.type,
    udtId: tx.udt_id,
    value: tx.value,
    udtSymbol: tx.udt_symbol,
  })),
})
export const fetchERC20TransferList = (
  query: Partial<Record<'page' | 'udt_address' | 'eth_address', string>>,
): Promise<{ txs: Array<Erc20Parsed>; page: string; totalCount: string }> =>
  fetch(`${SERVER_URL}/transfers?${new URLSearchParams({ ...query, page: query.page || '1' })}`)
    .then(res => pretreat<{ txs: Array<Erc20Raw>; page: string; total_count: string }>(res))
    .then(getERC20TransferListRes)
