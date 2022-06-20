import { SERVER_URL, pretreat } from './utils'

type BridgedType = 'deposit' | 'withdrawal'
type BridgedState = 'succeed' | 'available' | 'pending'

export interface Raw {
  page: string
  total_count: string
  data: Array<{
    block_hash: null
    block_number: null
    ckb_lock_hash: string
    eth_address: string
    layer1_block_number: number
    layer1_output_index: number
    layer1_tx_hash: string
    owner_lock_hash: string | null
    payment_lock_hash: string | null
    script_hash: string
    sell_capacity: string | null
    sell_value: string | null
    sudt_script_hash: string | null
    timestamp: string
    type: BridgedType
    udt_icon: string | null
    udt_id: number
    udt_name: string | null
    udt_symbol: string | null
    value: string
    state: BridgedState
    capacity: string | null
    is_fast_withdrawal: boolean
  }>
}

export interface Parsed {
  records: Array<{
    type: BridgedType
    block: {
      hash: string | null
      number: number | null
    }
    layer1: {
      block: { number: number }
      output: { hash: string; index: number }
    }
    timestamp: number
    to: string
    token: {
      id: number
      icon: string | null
      name: string | null
      symbol: string | null
    }
    value: string
    state: BridgedState
    capacity: string | null
    isFastWithdrawal: boolean
  }>
  meta: Record<'page' | 'total', string>
}

export const getBridgedRecordListRes = (list: Raw): Parsed => ({
  meta: {
    page: list.page,
    total: list.total_count,
  },
  records: list.data.map(r => ({
    type: r.type,
    block: {
      hash: r.block_hash ?? null,
      number: r.block_number ?? null,
    },
    layer1: {
      block: { number: r.layer1_block_number },
      output: { hash: r.layer1_tx_hash, index: r.layer1_output_index },
    },
    timestamp: r.timestamp ? new Date(r.timestamp).getTime() : -1,
    to: r.eth_address ?? '',
    token: {
      id: r.udt_id,
      icon: r.udt_icon ?? null,
      name: r.udt_name ?? null,
      symbol: r.udt_symbol ?? null,
    },
    value: r.value,
    state: r.state,
    capacity: r.capacity,
    isFastWithdrawal: r.is_fast_withdrawal ?? false,
  })),
})
export const fetchBridgedRecordList = (
  query: Partial<Record<'page' | 'udt_id' | 'eth_address' | 'block_number', string>>,
): Promise<Parsed> =>
  fetch(`${SERVER_URL}/deposit_withdrawals?${new URLSearchParams({ ...query, page: query.page || '1' })}`)
    .then(res => pretreat<Raw>(res))
    .then(getBridgedRecordListRes)
