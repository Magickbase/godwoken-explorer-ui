import { SERVER_URL, pretreat } from './utils'

export type BlockState = 'committed' | 'finalized'

interface Raw {
  hash: string
  number: number
  timestamp: number
  tx_count: number
  miner_hash: string
  size: string
  gas_limit: string
  gas_used: string
  l1_block: number | null
  l1_tx_hash: string | null
  finalize_state: BlockState
  parent_hash: string
}

interface Parsed {
  hash: string
  number: number
  timestamp: number
  txCount: number
  miner: { hash: string }
  size: string
  gas: {
    used: string
    limit: string
  }
  parentHash: string
  finalizeState: BlockState
  layer1: { block: number; txHash: string } | null
}

export const getBlockRes = (block: Raw): Parsed => ({
  number: block.number,
  hash: block.hash,
  timestamp: block.timestamp ? block.timestamp * 1000 : -1,
  txCount: block.tx_count,
  miner: { hash: block.miner_hash },
  size: block.size,
  gas: {
    used: block.gas_used,
    limit: block.gas_limit,
  },
  parentHash: block.parent_hash,
  finalizeState: block.finalize_state,
  layer1: block.l1_tx_hash ? { block: block.l1_block, txHash: block.l1_tx_hash } : null,
})

export const fetchBlock = (id: string): Promise<Parsed> =>
  fetch(`${SERVER_URL}/blocks/${id}`)
    .then(res => pretreat<Raw>(res))
    .then(getBlockRes)
