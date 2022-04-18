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
  polyjuice_status: 'succeed' | 'failed' | null
  status?: TxStatus
  timestamp: number
  from: string
  to: string
  to_alias: string
  fee: string
  value: string
  type: TxType
  udt_id: number | null
  udt_icon: string | null
  udt_symbol: string | null
  l1_block_number: number | null

  /* polyjuice creator */
  code_hash?: string
  fee_amount?: string
  fee_udt?: string
  hash_type?: HashType
  script_args?: string
  /* polyjuice */
  contract_abi?: []
  input?: string
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
  polyjuiceStatus: 'succeed' | 'failed' | 'pending'
  timestamp: number
  from: string
  to: string
  toAlias: string
  fee: string
  value: string
  type: TxType
  udtId: number | null
  udtIcon: string | null
  udtSymbol: string | null
  l1BlockNumber: number | null
  /* polyjuice creator */
  codeHash: string | null
  feeAmount: string | null
  feeUdt: string | null
  hashType: HashType | null
  scriptArgs: string | null
  /* polyjuice */
  contractAbi: [] | null
  input: string | null
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
  polyjuiceStatus: tx.polyjuice_status ?? 'succeed',
  timestamp: tx.timestamp ? tx.timestamp * 1000 : -1,
  from: tx.from,
  to: tx.to,
  toAlias: tx.to_alias,
  fee: tx.fee,
  value: tx.value,
  type: tx.type,
  udtId: tx.udt_id ?? null,
  udtIcon: tx.udt_icon ?? null,
  udtSymbol: tx.udt_symbol ?? null,
  codeHash: tx.code_hash ?? null,
  feeAmount: tx.fee_amount ?? null,
  feeUdt: tx.fee_udt ?? null,
  hashType: tx.hash_type ?? null,
  scriptArgs: tx.script_args ?? null,
  contractAbi: tx.contract_abi ?? null,
  l1BlockNumber: tx.l1_block_number ?? null,
  input: tx.input,
})

export const fetchTx = (hash: string): Promise<Parsed> =>
  fetch(`${SERVER_URL}/txs/${hash}`)
    .then(res => pretreat<Raw>(res))
    .then(getTxRes)
