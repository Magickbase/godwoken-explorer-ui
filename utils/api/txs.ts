import { API_ENDPOINT, pretreat } from './utils'
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
  block_number: number
  from: string
  hash: string
  status: TxStatus
  polyjuice_status: 'succeed' | 'failed'
  timestamp: number
  to: string
  transfer_value: string
  udt_id: number
  udt_symbol: string
  udt_name: string
  log_index: number
}

interface Erc20Parsed {
  blockNumber: number
  from: string
  hash: string
  status: TxStatus
  isSuccess: boolean
  timestamp: number
  to: string
  transferValue: string
  udtId: number
  udtSymbol: string
  logIndex: number
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
  query: Partial<Record<'page' | 'type' | 'tx_type' | 'eth_address' | 'block_hash' | 'page_size', string>>,
): Promise<{ txs: Array<Parsed>; page: string; totalCount: string }> =>
  fetch(`${API_ENDPOINT}/txs?${new URLSearchParams({ ...query, page: query.page || '1' })}`)
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
    blockNumber: tx.block_number,
    from: tx.from,
    hash: tx.hash,
    status: tx.status,
    isSuccess: tx.polyjuice_status === 'succeed',
    timestamp: tx.timestamp ? tx.timestamp * 1000 : -1,
    to: tx.to,
    transferValue: tx.transfer_value,
    udtId: tx.udt_id,
    udtSymbol: tx.udt_symbol,
    logIndex: tx.log_index,
  })),
})
export const fetchERC20TransferList = (
  query: Partial<Record<'page' | 'udt_address' | 'eth_address' | 'tx_hash', string>>,
): Promise<{ txs: Array<Erc20Parsed>; page: string; totalCount: string }> =>
  fetch(`${API_ENDPOINT}/transfers?${new URLSearchParams({ ...query, page: query.page || '1' })}`)
    .then(res => pretreat<{ txs: Array<Erc20Raw>; page: string; total_count: string }>(res))
    .then(getERC20TransferListRes)
