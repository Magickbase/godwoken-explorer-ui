import { utils } from 'ethers'
import { SERVER_URL, pretreat } from './utils'

export interface RawDailyData {
  data: Array<{
    attributes: {
      avg_block_size: number
      avg_block_time: number
      avg_gas_limit: string
      avg_gas_used: string
      date: string
      erc20_transfer_count: number
      id: number
      total_block_count: number
      total_txn: number
    }
  }>
}

export type ParsedDailyData = Array<{
  avgBlockSize: number
  avgBlockTime: number
  blockCount: number
  txCount: number
  avgGasLimit: string
  avgGasUsed: string
  date: string
  id: number
  erc20Transfers: number
}>

export const GAS_UNIT = 'gwei'
export const getDailyDataRes = (raw: RawDailyData): ParsedDailyData =>
  raw.data.map(d => ({
    avgBlockSize: d.attributes.avg_block_size / 1000,
    avgBlockTime: d.attributes.avg_block_time,
    blockCount: d.attributes.total_block_count,
    txCount: d.attributes.total_txn / 1000,
    avgGasLimit: utils.formatUnits(d.attributes.avg_gas_limit.split('.')[0], GAS_UNIT),
    avgGasUsed: utils.formatUnits(d.attributes.avg_gas_used.split('.')[0], GAS_UNIT),
    date: d.attributes.date,
    id: d.attributes.id,
    erc20Transfers: d.attributes.erc20_transfer_count / 1000,
  }))

export const fetchDailyData = (query?: Partial<Record<'start_date' | 'end_date', string>>): Promise<ParsedDailyData> =>
  fetch(`${SERVER_URL}/daily_stats?${new URLSearchParams(query)}`)
    .then(res => pretreat<RawDailyData>(res))
    .then(getDailyDataRes)
