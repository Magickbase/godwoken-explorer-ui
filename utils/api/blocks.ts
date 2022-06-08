import { API_ENDPOINT, pretreat } from './utils'
import type { BlockState } from './block'

interface Raw {
  finalize_state: BlockState
  gas_limit: string
  gas_used: string
  hash: string
  miner_hash: string
  number: number
  timestamp: number
  tx_count: number
}

interface Parsed {
  finalizeState: BlockState
  gas: {
    limit: string
    used: string
  }
  hash: string
  miner: string
  number: number
  timestamp: number
  txCount: number
}

export const getBlockListRes = (blockListRes: {
  data: Array<{ attributes: Raw; id: number; relationships: {}; type: 'block' }>
  meta: Record<'current_page' | 'total_page', number>
}): { blocks: Array<Parsed>; page: number; totalPage: number } => ({
  blocks: blockListRes.data.map(b => ({
    finalizeState: b.attributes.finalize_state,
    gas: {
      limit: b.attributes.gas_limit,
      used: b.attributes.gas_used,
    },
    hash: b.attributes.hash,
    miner: b.attributes.miner_hash,
    number: b.attributes.number,
    timestamp: b.attributes.timestamp ? b.attributes.timestamp * 1000 : -1,
    txCount: b.attributes.tx_count,
  })),
  page: blockListRes.meta.current_page,
  totalPage: blockListRes.meta.total_page,
})

export const fetchBlockList = ({
  page = '1',
  page_size = '30',
  ...query
}: Partial<Record<'page' | 'page_size', string>>): Promise<ReturnType<typeof getBlockListRes>> =>
  fetch(`${API_ENDPOINT}/blocks?${new URLSearchParams({ ...query, page, page_size })}`)
    .then(res => pretreat<Parameters<typeof getBlockListRes>[0]>(res))
    .then(getBlockListRes)
