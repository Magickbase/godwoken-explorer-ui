import { API, SERVER_URL, pretreat } from './utils'
export const getBlockRes = (block: API.Block.Raw): API.Block.Parsed => ({
  hash: block.hash,
  number: block.number,
  l1Block: block.l1_block,
  txHash: block.tx_hash,
  finalizeState: block.finalize_state,
  txCount: block.tx_count,
  aggregator: block.aggregator,
  timestamp: block.timestamp * 1000,
})
export const fetchBlock = (id: string): Promise<API.Block.Parsed> =>
  fetch(`${SERVER_URL}/blocks/${id}`)
    .then(res => pretreat<API.Block.Raw>(res))
    .then(getBlockRes)
