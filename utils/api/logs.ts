import { SERVER_URL, pretreat } from './utils'

interface Log {
  attributes: Attributes
  id: number
  relationships: any
  type: string
}

interface Attributes {
  abi: ABI[]
  address_hash: string
  block_number: number
  data: string
  first_topic: string
  second_topic: string
  third_topic: string
  fourth_topic: string
  transaction_hash: string
}

interface Input {
  indexed?: boolean
  internalType: string
  name: string
  type: string
}

interface Output {
  internalType: string
  name: string
  type: string
}

interface Meta {
  current_page?: number
  total_page?: number
}

interface ABI {
  anonymous?: boolean
  inputs: Input[]
  name: string
  type: 'event' | 'function' | string
  outputs?: Output[]
  stateMutability?: string
}

interface Raw {
  data: Log[]
  included: any[]
  meta: Meta
}

export interface ParsedLog {
  id: number
  abi: ABI
  addressHash: string
  txHash: string
  data: string
  blockNumber: number
  topics: string[]
}

export const getEventLogsListRes = (rawData: Raw): ParsedLog[] => {
  return rawData.data.map(({ attributes, id }) => {
    const matchingEventAbi = attributes.abi.find(abi => abi.type === 'event')[0] || null
    return {
      id: id,
      abi: matchingEventAbi,
      addressHash: attributes.address_hash,
      txHash: attributes.transaction_hash,
      data: attributes.data,
      blockNumber: attributes.block_number,
      topics: [attributes.first_topic, attributes.second_topic, attributes.third_topic, attributes.fourth_topic],
    }
  })
}

export const fetchEventLogsListByType = (type: 'txs' | 'accounts', address: string): Promise<ParsedLog[]> =>
  fetch(`${SERVER_URL}/${type}/${address}/logs`)
    .then(res => pretreat<Raw>(res))
    .then(getEventLogsListRes)
