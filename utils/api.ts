import { addressToScript } from '@nervosnetwork/ckb-sdk-utils'
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
    type UDT = Record<'name' | 'balance' | 'icon', string>
    export type RawScript = Record<'args' | 'code_hash' | 'hash_type' | 'name', string>
    export type ParsedScript = Record<'args' | 'codeHash' | 'hashType' | 'name', string>
    export type Raw = Record<'id' | 'type' | 'ckb' | 'tx_count', string> &
      Partial<{
        meta_contract: {
          status: 'running' | 'halting'
          account_merkle_state: any
          block_merkle_state: any
          last_finalized_block_number: string
          reverted_block_root: string
        }
        sudt: Record<'decimal' | 'holders' | 'name' | 'supply' | 'symbol' | 'icon', string> & {
          type_script: RawScript | null
        }
        user: {
          eth_addr: string | null
          ckb_lock_script: RawScript | null
          nonce: string
          udt_list: Array<UDT>
        }
        polyjuice: {
          script: RawScript
        }
        smart_contract: {
          tx_hash: string
          udt_list: Array<UDT>
        }
      }>
    export type Parsed = Record<'id' | 'type' | 'ckb' | 'txCount', string> &
      Partial<{
        metaContract: {
          status: 'running' | 'halting'
          accountMerkleState: any
          blockMerkleState: any
          lastFinalizedBlockNumber: string
          revertedBlockRoot: string
        }
        sudt: Record<'decimal' | 'holders' | 'name' | 'supply' | 'symbol' | 'icon', string> & {
          typeScript: ParsedScript | null
        }
        user: {
          ethAddr: string | null
          ckbLockScript: ParsedScript | null
          nonce: string
          udtList: Array<UDT>
        }
        polyjuice: { script: ParsedScript }
        smartContract: {
          txHash: string
          udtList: Array<UDT>
        }
      }>
  }

  export namespace Txs {
    export interface Raw {
      page: number
      total_count: number
      txs: Array<
        Record<'hash' | 'block_number' | 'from' | 'to' | 'type', string> & {
          success: boolean
          timestamp: Timestamp
        }
      >
    }

    export interface Parsed {
      page: number
      totalCount: number
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

export const getHomeRes = (home: API.Home.Raw): API.Home.Parsed => ({
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
})

export const fetchHome = (): Promise<API.Home.Parsed> =>
  fetch(`${SERVER_URL}/home`)
    .then(res => pretreat<API.Home.Raw>(res))
    .then(getHomeRes)

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

export const getTxRes = (tx: API.Tx.Raw): API.Tx.Parsed => ({
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
})
export const fetchTx = (hash: string): Promise<API.Tx.Parsed> =>
  fetch(`${SERVER_URL}/txs/${hash}`)
    .then(res => pretreat<API.Tx.Raw>(res))
    .then(getTxRes)

const getMetaContract = (metaContract: API.Account.Raw['meta_contract']): API.Account.Parsed['metaContract'] => ({
  status: metaContract.status,
  accountMerkleState: metaContract.account_merkle_state,
  blockMerkleState: metaContract.block_merkle_state,
  lastFinalizedBlockNumber: metaContract.last_finalized_block_number,
  revertedBlockRoot: metaContract.reverted_block_root,
})

const getScript = (script: API.Account.RawScript): API.Account.ParsedScript => ({
  args: script.args,
  codeHash: script.code_hash,
  hashType: script.hash_type,
  name: script.name,
})

const getSUDT = (sudt: API.Account.Raw['sudt']): API.Account.Parsed['sudt'] => ({
  decimal: sudt.decimal,
  holders: sudt.holders,
  name: sudt.name,
  supply: sudt.supply,
  symbol: sudt.symbol,
  icon: sudt.icon || null,
  typeScript: sudt.type_script ? getScript(sudt.type_script) : null,
})

const getUser = (user: API.Account.Raw['user']): API.Account.Parsed['user'] => ({
  ethAddr: user.eth_addr,
  ckbLockScript: user.ckb_lock_script ? getScript(user.ckb_lock_script) : null,
  nonce: user.nonce,
  udtList: user.udt_list || [],
})

const getPolyjuice = (polyjuice: API.Account.Raw['polyjuice']): API.Account.Parsed['polyjuice'] => ({
  script: getScript(polyjuice.script),
})

const getSmartContract = (smartContract: API.Account.Raw['smart_contract']): API.Account.Parsed['smartContract'] => ({
  txHash: smartContract.tx_hash,
  udtList: smartContract.udt_list || [],
})

export const getAccountRes = (account: API.Account.Raw): API.Account.Parsed => ({
  id: account.id,
  type: account.type,
  ckb: account.ckb,
  txCount: account.tx_count,
  metaContract: account.meta_contract ? getMetaContract(account.meta_contract) : null,
  sudt: account.sudt ? getSUDT(account.sudt) : null,
  user: account.user ? getUser(account.user) : null,
  polyjuice: account.polyjuice ? getPolyjuice(account.polyjuice) : null,
  smartContract: account.smart_contract ? getSmartContract(account.smart_contract) : null,
})

export const fetchAccount = (id: string): Promise<API.Account.Parsed> =>
  fetch(`${SERVER_URL}/accounts/${id}`)
    .then(res => pretreat<API.Account.Raw>(res))
    .then(getAccountRes)

export const getTxListRes = (txListRes: API.Txs.Raw): API.Txs.Parsed => ({
  page: txListRes.page,
  totalCount: txListRes.total_count,
  txs:
    txListRes.txs?.map(tx => ({
      hash: tx.hash,
      blockNumber: tx.block_number,
      from: tx.from,
      to: tx.to,
      timestamp: tx.timestamp * 1000,
      type: tx.type,
      success: tx.success ?? true,
    })) ?? [],
})
export const fetchTxList = (query: string): Promise<API.Txs.Parsed> =>
  fetch(`${SERVER_URL}/txs?${query}`)
    .then(res => pretreat<API.Txs.Raw>(res))
    .then(getTxListRes)

export const fetchSearch = (search: string) => {
  let query = search
  if (query.startsWith('ck')) {
    try {
      const script = addressToScript(query)
      query = `${script.codeHash}_${script.hashType}_${script.args}`
    } catch (err) {
      console.warn(err)
    }
  }

  return fetch(`${SERVER_URL}/search?keyword=${query}`)
    .then(async res => {
      if (res.status === HttpStatus.NotFound) {
        return `/404`
      }
      const found: Record<'id' | 'type', string> | ErrorResponse = await res.json()
      if (isError(found)) {
        return `/404`
      }
      switch (found.type) {
        case 'block': {
          return `/block/${found.id}`
        }
        case 'transaction': {
          return `/tx/${found.id}`
        }
        case 'account': {
          return `/account/${found.id}`
        }
        default: {
          return `/404`
        }
      }
    })
    .then(url => `${url}?search=${search}`)
}
