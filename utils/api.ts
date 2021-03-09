import { SERVER_URL } from './constants'
import { NotFoundException } from './exceptions'

enum HttpStatus {
  NotFound = 404,
}

type ErrorResponse = {
  error_code?: number
  message?: string
}

const isError = (res: any): res is ErrorResponse => {
  return res.error_code
}

const handleError = ({ error_code, message }: ErrorResponse) => {
  if (error_code === 404) {
    throw new NotFoundException()
  }
  const error = new Error(message)
  Object.defineProperty(error, 'code', {
    value: error_code,
  })
  throw error
}

export namespace API {
  type Timestamp = number // second from server
  export namespace Home {
    type Tx = Record<'hash' | 'from' | 'to' | 'type', string> & { success: boolean; timestamp: Timestamp }
    export interface Raw {
      block_list: Array<Record<'hash' | 'number' | 'tx_count', string> & { timestamp: Timestamp }>
      tx_list: Array<Tx>
      statistic: Record<'block_count' | 'tx_count' | 'tps' | 'account_count', string>
    }
    export interface Parsed {
      blockList: Array<Record<'hash' | 'number' | 'txCount', string> & { timestamp: Timestamp }>
      txList: Array<Tx>
      statistic: Record<'blockCount' | 'txCount' | 'tps' | 'accountCount', string>
    }
  }

  export namespace Block {
    export type Raw = Record<'hash' | 'number' | 'finalize_state' | 'tx_count' | 'aggregator', string> & {
      timestamp: Timestamp
      l1_block: string | null
      tx_hash: string | null
    }
    export type Parsed = Record<'hash' | 'number' | 'finalizeState' | 'txCount' | 'aggregator', string> & {
      timestamp: Timestamp
      l1Block: string | null
      txHash: string | null
    }
  }

  export namespace Tx {
    export type Raw = Record<
      | 'hash'
      | 'finalize_state'
      | 'l2_block'
      | 'l1_block'
      | 'from'
      | 'to'
      | 'nonce'
      | 'args'
      | 'type'
      | 'gas_price'
      | 'fee',
      string
    > & { timestamp: Timestamp }
    export type Parsed = Record<
      'hash' | 'finalizeState' | 'l2Block' | 'l1Block' | 'from' | 'to' | 'nonce' | 'args' | 'type' | 'gasPrice' | 'fee',
      string
    > & { timestamp: Timestamp }
  }

  export namespace Account {
    export type Raw = Record<'id' | 'type' | 'ckb' | 'tx_count', string>
    export type Parsed = Record<'id' | 'type' | 'ckb' | 'txCount', string>
  }

  export namespace Txs {
    export interface Raw {
      page: string
      total_count: string
      txs: Array<
        Record<'hash' | 'block_number' | 'from' | 'to' | 'type', string> & {
          success: boolean
          timestamp: Timestamp
        }
      >
    }

    export interface Parsed {
      page: string
      totalCount: string
      txs: Array<
        Record<'hash' | 'blockNumber' | 'from' | 'to' | 'type', string> & {
          success: boolean
          timestamp: Timestamp
        }
      >
    }
  }
}

const pretreat = async <T>(res: Response) => {
  if (res.status === HttpStatus.NotFound) {
    throw new NotFoundException()
  }
  const parsed: T | ErrorResponse = await res.json()
  if (isError(parsed)) {
    return handleError(parsed)
  }
  return parsed
}

export const fetchHome = (): Promise<API.Home.Parsed> =>
  fetch(`${SERVER_URL}/home`)
    .then(res => pretreat<API.Home.Raw>(res))
    .then(async home => {
      return {
        blockList: home.block_list.map(({ hash, number, tx_count, timestamp }) => ({
          hash,
          number,
          txCount: tx_count,
          timestamp: timestamp * 1000,
        })),
        txList: home.tx_list.map(tx => ({ ...tx, timestamp: tx.timestamp * 1000 })),
        statistic: {
          blockCount: home.statistic.block_count,
          txCount: home.statistic.tx_count,
          tps: home.statistic.tps,
          accountCount: home.statistic.account_count,
        },
      }
    })

export const fetchBlock = (id: string): Promise<API.Block.Parsed> =>
  fetch(`${SERVER_URL}/block/${id}`)
    .then(res => pretreat<API.Block.Raw>(res))
    .then(async block => {
      return {
        hash: block.hash,
        number: block.number,
        l1Block: block.l1_block,
        txHash: block.tx_hash,
        finalizeState: block.finalize_state,
        txCount: block.tx_count,
        aggregator: block.aggregator,
        timestamp: block.timestamp * 1000,
      }
    })

export const fetchTx = (hash: string): Promise<API.Tx.Parsed> =>
  fetch(`${SERVER_URL}/txs/${hash}`)
    .then(res => pretreat<API.Tx.Raw>(res))
    .then(async tx => {
      return {
        hash: tx.hash,
        timestamp: tx.timestamp * 1000,
        finalizeState: tx.finalize_state,
        l2Block: tx.l2_block,
        l1Block: tx.l1_block,
        from: tx.from,
        to: tx.to,
        nonce: tx.nonce,
        args: tx.args,
        type: tx.type,
        gasPrice: tx.gas_price,
        fee: tx.fee,
      }
    })

export const fetchAccount = (id: string): Promise<API.Account.Parsed> =>
  fetch(`${SERVER_URL}/accounts/${id}`)
    .then(res => pretreat<API.Account.Raw>(res))
    .then(async account => {
      return {
        id: account.id,
        type: account.type,
        ckb: account.ckb,
        txCount: account.tx_count,
      }
    })

export const fetchTxList = (query: string): Promise<API.Txs.Parsed> =>
  fetch(`${SERVER_URL}/txs?${query}`)
    .then(res => pretreat<API.Txs.Raw>(res))
    .then(async res => {
      return {
        page: res.page,
        totalCount: res.total_count,
        txs:
          res.txs?.map(tx => ({
            hash: tx.hash,
            blockNumber: tx.block_number,
            from: tx.from,
            to: tx.to,
            timestamp: tx.timestamp * 1000,
            type: tx.type,
            success: tx.success ?? true,
          })) ?? [],
      }
    })

export const fetchSearch = (keyword: string) =>
  fetch(`${SERVER_URL}/search?keyword=${keyword}`).then(async res => {
    if (res.status === HttpStatus.NotFound) {
      return `/404?keyword=${keyword}`
    }
    const found: Record<'id' | 'type', string> | ErrorResponse = await res.json()
    if (isError(found)) {
      return `/404?keyword=${keyword}`
    }
    switch (found.type) {
      case 'block': {
        return `/block/${found.id}`
      }
      case 'transaction': {
        return `/tx/${found.id}`
      }
      case 'account': {
        return `account/${found.id}`
      }
      default: {
        return `/404?keyword=${keyword}`
      }
    }
  })
