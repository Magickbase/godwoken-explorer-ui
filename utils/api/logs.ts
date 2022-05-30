import { ethers } from 'ethers'
import { LogDescription } from 'ethers/lib/utils'
import { SERVER_URL, pretreat } from './utils'

interface Log {
  attributes: Attributes
  id: number
  relationships: any
  type: string
}

interface Attributes {
  abi: Fragment[]
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

interface Fragment {
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

export interface ParsedEventLog {
  id: number
  parsedLog: Omit<LogDescription, 'eventFragment'>
  addressHash: string
  txHash: string
  data: string
  blockNumber: number
  topics: string[]
}

export const getEventLogsListRes = (raw: Raw): ParsedEventLog[] => {
  return raw.data.map(({ attributes, id }) => {
    const topics = [attributes.first_topic, attributes.second_topic, attributes.third_topic]
    const data = attributes.data
    try {
      const i = new ethers.utils.Interface(attributes.abi)
      const parsedLog = i.parseLog({ data, topics })
      return {
        id: id,
        parsedLog: JSON.parse(JSON.stringify(parsedLog)),
        addressHash: attributes.address_hash,
        txHash: attributes.transaction_hash,
        data: data,
        blockNumber: attributes.block_number,
        topics: topics,
      }
    } catch (err) {
      console.error(err)
      return null
    }
  })
}

export const fetchEventLogsListByType = (type: 'txs' | 'accounts', address: string): Promise<ParsedEventLog[]> => {
  return fetch(`${SERVER_URL}/${type}/${address}/logs`)
    .then(res => pretreat<Raw>(res))
    .then(getEventLogsListRes)
}
