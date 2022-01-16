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
  timestamp: number
  to: string
  to_alias: string
  transfer_value: string
  type: TxType
  udt_id: number
  value: string
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
  timestamp: number
  to: string
  toAlias: string
  type: TxType
  value: string
}

interface Erc20Raw {
  args: string
  block_number: string
  from: string
  gas_limit: number
  gas_price: string
  gas_used: number
  hash: string
  input: string
  nonce: string
  receive_eth_address: string
  timestamp: number
  to: string
  transfer_count: string
  type: TxType
  value: string
}

interface Erc20Parsed {
  block_number: string
  from: string
  gasLimit: number
  gasPrice: string
  gasUsed: number
  hash: string
  input: string
  nonce: string
  receiveEthAddress: string
  timestamp: number
  to: string
  transferCount: string
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
    timestamp: tx.timestamp ? tx.timestamp * 1000 : -1,
    to: tx.to,
    type: tx.type,
    toAlias: tx.to_alias,
    value: tx.value,
  })),
})
export const fetchTxList = (
  query: Partial<Record<'page' | 'type' | 'tx_type' | 'account_id', string>>,
): Promise<{ txs: Array<Parsed>; page: string; totalCount: string }> =>
  fetch(`${SERVER_URL}/txs?${new URLSearchParams(query)}`)
    .then(res => pretreat<{ txs: Array<Raw>; page: string; total_count: string }>(res))
    .then(getTxListRes)
