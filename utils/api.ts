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
  export namespace Home {
    type Tx = Record<'hash' | 'timestamp' | 'from' | 'to' | 'type', string> & { success: boolean }
    export interface Raw {
      block_list: Array<Record<'hash' | 'number' | 'timestamp' | 'tx_count', string>>
      tx_list: Array<Tx>
      statistic: Record<'block_count' | 'tx_count' | 'tps' | 'account_count', string>
    }
    export interface Parsed {
      blockList: Array<Record<'hash' | 'number' | 'timestamp' | 'txCount', string>>
      txList: Array<Tx>
      statistic: Record<'blockCount' | 'txCount' | 'tps' | 'accountCount', string>
    }
  }

  export namespace Block {
    export type Raw = Record<
      'hash' | 'number' | 'l1_block' | 'tx_hash' | 'finalize_state' | 'tx_count' | 'aggregator',
      string
    >
    export type Parsed = Record<
      'hash' | 'number' | 'l1Block' | 'txHash' | 'finalizeState' | 'txCount' | 'aggregator' | 'timestamp',
      string
    >
  }

  export namespace Tx {
    export type Raw = Record<
      | 'hash'
      | 'timestamp'
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
    >
    export type Parsed = Record<
      | 'hash'
      | 'timestamp'
      | 'finalizeState'
      | 'l2Block'
      | 'l1Block'
      | 'from'
      | 'to'
      | 'nonce'
      | 'args'
      | 'type'
      | 'gasPrice'
      | 'fee',
      string
    >
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
        Record<'hash' | 'block_number' | 'block_hash' | 'from' | 'to' | 'timestamp' | 'type', string> & {
          success: boolean
        }
      >
    }

    export interface Parsed {
      page: string
      totalCount: string
      txs: Array<
        Record<'hash' | 'blockNumber' | 'blockHash' | 'from' | 'to' | 'timestamp' | 'type', string> & {
          success: boolean
        }
      >
    }
  }
}

export const fetchHome = (): Promise<API.Home.Parsed> =>
  fetch(`${SERVER_URL}/home/1`).then(async res => {
    if (res.status === HttpStatus.NotFound) {
      throw new NotFoundException()
    }
    const home: API.Home.Raw | ErrorResponse = await res.json()
    if (isError(home)) {
      return handleError(home)
    }
    return {
      blockList: home.block_list.map(({ hash, number, tx_count, timestamp }) => ({
        hash,
        number,
        txCount: tx_count,
        timestamp,
      })),
      txList: home.tx_list,
      statistic: {
        blockCount: home.statistic.block_count,
        txCount: home.statistic.tx_count,
        tps: home.statistic.tps,
        accountCount: home.statistic.account_count,
      },
    }
  })

export const fetchBlock = (id: string): Promise<API.Block.Parsed> =>
  fetch(`${SERVER_URL}/blocks/${id}`).then(async res => {
    if (res.status === HttpStatus.NotFound) {
      throw new NotFoundException()
    }
    const block: API.Block.Raw | ErrorResponse = await res.json()
    if (isError(block)) {
      return handleError(block)
    }
    return {
      hash: block.hash,
      number: block.number,
      l1Block: block.l1_block,
      txHash: block.tx_hash,
      finalizeState: block.finalize_state ? 'finalized' : 'committed',
      txCount: block.tx_count,
      aggregator: block.aggregator,
      timestamp: Date.now().toString(),
    }
  })

export const fetchTx = (hash: string): Promise<API.Tx.Parsed> =>
  fetch(`${SERVER_URL}/txs/${hash}`).then(async res => {
    if (res.status === HttpStatus.NotFound) {
      throw new NotFoundException()
    }
    const tx: API.Tx.Raw | ErrorResponse = await res.json()
    if (isError(tx)) {
      return handleError(tx)
    }
    return {
      hash: tx.hash,
      timestamp: tx.timestamp,
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
  fetch(`${SERVER_URL}/accounts/${id}`).then(async res => {
    if (res.status === HttpStatus.NotFound) {
      throw new NotFoundException()
    }
    const account: API.Account.Raw | ErrorResponse = await res.json()
    if (isError(account)) {
      return handleError(account)
    }
    return {
      id: account.id,
      type: account.type,
      ckb: account.ckb,
      txCount: account.tx_count,
    }
  })

export const fetchTxList = (query: string): Promise<API.Txs.Parsed> =>
  fetch(`${SERVER_URL}/txs?${query}`)
    .then(async res => {
      if (res.status === HttpStatus.NotFound) {
        throw new NotFoundException()
      }

      const txsRes: API.Txs.Raw | ErrorResponse = await res.json()
      if (isError(txsRes)) {
        return handleError(txsRes)
      }

      return {
        page: txsRes.page,
        totalCount: txsRes.total_count,
        txs: txsRes.txs.map(tx => ({
          hash: tx.hash,
          blockNumber: tx.block_number,
          blockHash: tx.block_hash,
          from: tx.from,
          to: tx.to,
          timestamp: tx.timestamp,
          type: tx.type,
          success: tx.success,
        })),
      }
    })
    .catch(() => {
      // mock data
      return {
        page: '1',
        totalCount: '200',
        txs: Array.from({ length: 10 }).map((_, idx) => ({
          hash: 'hash' + idx,
          blockNumber: 'block_number' + idx,
          blockHash: 'block_hash' + idx,
          from: 'from' + idx,
          to: 'to' + idx,
          timestamp: Date.now().toString(),
          type: 'withdraw',
          success: true,
        })),
      }
    })
