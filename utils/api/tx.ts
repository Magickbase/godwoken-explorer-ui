import { SERVER_URL, pretreat } from './utils'
export type TxStatus = 'pending' | 'committed' | 'finalized'
type HashType = 'type' | 'data'
export type TxType = 'polyjuice_creator' | 'polyjuice'

interface Raw {
  block_hash?: string
  block_number?: number
  gas_limit: number
  gas_price: string
  gas_used: number
  hash: string
  nonce: number
  status?: TxStatus
  timestamp: number
  from: string
  to: string
  to_alias: string
  fee: string
  value: string
  transfer_value?: string
  receive_eth_address: string | null
  type: TxType
  udt_id: number | null
  /* polyjuice creator */
  code_hash?: string
  fee_amount?: string
  fee_udt?: string
  hash_type?: HashType
  script_args?: string
  /* polyjuice */
  contract_abi?: []
}

interface Parsed {
  blockHash: string | null
  blockNumber: number | null
  gasLimit: number | null
  gasPrice: string
  gasUsed: number | null
  hash: string
  nonce: number
  status: TxStatus
  timestamp: number
  from: string
  to: string
  toAlias: string
  fee: string
  value: string
  transferValue: string | null
  receiveEthAddress: string | null
  type: TxType
  udtId: number | null
  /* polyjuice creator */
  codeHash: string | null
  feeAmount: string | null
  feeUdt: string | null
  hashType: HashType | null
  scriptArgs: string | null
  /* polyjuice */
  contractAbi: [] | null
}

export const getTxRes = (tx: Raw): Parsed => ({
  blockHash: tx.block_hash ?? null,
  blockNumber: tx.block_number ?? null,
  gasLimit: tx.gas_limit ?? null,
  gasPrice: tx.gas_price,
  gasUsed: tx.gas_used ?? null,
  hash: tx.hash,
  nonce: tx.nonce,
  status: tx.status ?? 'pending',
  timestamp: tx.timestamp ? tx.timestamp * 1000 : -1,
  from: tx.from,
  to: tx.to,
  toAlias: tx.to_alias,
  fee: tx.fee,
  value: tx.value,
  transferValue: tx.transfer_value ?? null,
  receiveEthAddress: tx.receive_eth_address ?? null,
  type: tx.type,
  udtId: tx.udt_id ?? null,
  codeHash: tx.code_hash ?? null,
  feeAmount: tx.fee_amount ?? null,
  feeUdt: tx.fee_udt ?? null,
  hashType: tx.hash_type ?? null,
  scriptArgs: tx.script_args ?? null,
  contractAbi: tx.contract_abi ?? null,
})

export const fetchTx = (hash: string): Promise<Parsed> =>
  fetch(`${SERVER_URL}/txs/${hash}`)
    .then(res => pretreat<Raw>(res))
    .then(getTxRes)
