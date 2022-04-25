import { GwHashException, NotFoundException } from '../exceptions'
export { SERVER_URL, NODE_URL } from '../constants'
export enum HttpStatus {
  NotFound = 404,
}

enum ServerErrorCode {
  UseEthHash = '303',
}

export type ErrorResponse = {
  error_code?: number
  message?: string
  errors?: {
    detail: string
    status: ServerErrorCode
    title: string
  }
}

export const isError = (res: any): res is ErrorResponse => {
  return res.error_code
}

export const handleError = ({ error_code, message }: ErrorResponse) => {
  if (error_code === 404) {
    throw new NotFoundException()
  }
  const error = new Error(message)
  Object.defineProperty(error, 'code', {
    value: error_code,
  })
  throw error
}

export const pretreat = async <T>(res: Response) => {
  if (res.status === HttpStatus.NotFound) {
    throw new NotFoundException()
  }

  const parsed: T | ErrorResponse = await res.json()

  if ('errors' in parsed && parsed.errors.status === ServerErrorCode.UseEthHash) {
    throw new GwHashException(parsed.errors.detail)
  }

  if (isError(parsed)) {
    return handleError(parsed)
  }
  return parsed
}

export namespace API {
  type Timestamp = number // second from server
  export namespace Home {
    type Tx = Record<'hash' | 'from' | 'to' | 'type', string> & { success: boolean; timestamp: Timestamp }
    export interface Raw {
      block_list: Array<Record<'hash' | 'number' | 'tx_count', string> & { timestamp: Timestamp }>
      tx_list: Array<Tx>
      statistic: Record<'block_count' | 'tx_count' | 'tps' | 'account_count', string> & { average_block_time: number }
    }
    export interface Parsed {
      blockList: Array<Record<'hash' | 'number' | 'txCount', string> & { timestamp: Timestamp }>
      txList: Array<Tx>
      statistic: Record<'blockCount' | 'txCount' | 'tps' | 'accountCount' | 'averageBlockTime', string>
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
      | 'from'
      | 'to'
      | 'nonce'
      | 'args'
      | 'type'
      | 'value'
      | 'gas_price'
      | 'fee'
      | 'gas_limit',
      string
    > & {
      timestamp: Timestamp
      gas_used: number
      input?: string
      l1_block: number
      l2_block: number
      status: 'committed' | 'finalized'
    }
    export type Parsed = Record<
      | 'hash'
      | 'finalizeState'
      | 'l2Block'
      | 'l1Block'
      | 'from'
      | 'to'
      | 'nonce'
      | 'input'
      | 'args'
      | 'type'
      | 'fee'
      | 'status'
      | 'gasLimit'
      | 'gasUsed'
      | 'gasPrice'
      | 'value',
      string
    > & { timestamp: Timestamp }
  }

  export namespace Account {
    export type UDT = {
      name: string
      balance: string
      icon: string | null
      decimal: number
      type: 'native' | 'bridge'
      id: number
    }
    export type RawScript = Record<'args' | 'code_hash' | 'hash_type' | 'name', string>
    export type ParsedScript = Record<'args' | 'codeHash' | 'hashType' | 'name', string>
    export type Raw = Record<'id' | 'type' | 'ckb' | 'tx_count' | 'eth_addr', string> &
      Partial<{
        meta_contract: {
          status: 'running' | 'halting'
          account_merkle_state: Record<'account_count' | 'account_merkle_root', number>
          block_merkle_state: Record<'block_count' | 'block_merkle_root', number>
          last_finalized_block_number: number
          reverted_block_root: string
        }
        sudt: Record<'decimal' | 'holders' | 'name' | 'supply' | 'symbol' | 'icon' | 'script_hash', string> & {
          type_script: RawScript | null
        }
        user: {
          ckb_lock_script: RawScript | null
          nonce: string
          udt_list: Array<UDT>
        }
        polyjuice: {
          script: RawScript
          script_hash: string
        }
        smart_contract: {
          tx_hash: string
          udt_list: Array<UDT>
          abi?: Array<any>
          compiler_file_format?: string
          compiler_version?: string
          constructor_arguments?: string
          contract_source_code?: string
          deployment_tx_hash?: string
          name?: string
          other_info?: string
        }
      }>
    export type Parsed = Record<'id' | 'type' | 'ckb' | 'txCount' | 'ethAddr', string> &
      Partial<{
        metaContract: {
          status: 'running' | 'halting'
          accountMerkleState: Record<'accountCount' | 'accountMerkleRoot', string>
          blockMerkleState: Record<'blockCount' | 'blockMerkleRoot', string>
          lastFinalizedBlockNumber: string
          revertedBlockRoot: string
        }
        sudt: Record<'decimal' | 'holders' | 'name' | 'supply' | 'symbol' | 'icon' | 'scriptHash', string> & {
          typeScript: ParsedScript | null
        }
        user: {
          ckbLockScript: ParsedScript | null
          nonce: string
          udtList: Array<UDT>
        }
        polyjuice: { script: ParsedScript; scriptHash: string }
        smartContract: {
          txHash: string
          udtList: Array<UDT>
          abi: Array<any>
          compilerFileFormat: string
          compilerVersion: string
          constructorArguments: string
          contractSourceCode: string
          deploymentTxHash: string
          name: string
          otherInfo: string
        }
      }>
  }

  export namespace Txs {
    export interface Raw {
      page: string
      total_count: string
      txs: Array<
        Record<'hash' | 'block_number' | 'from' | 'to' | 'type', string> & {
          success: boolean
          timestamp: Timestamp
          value?: string
          transfer_count?: string
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
          value: string
          transferCount: string
        }
      >
    }
  }

  export namespace Tokens {
    export type TokenType = 'bridge' | 'native'
    interface RawToken {
      attributes: {
        icon: string | null
        decimal: number
        description: string | null
        holder_count: number
        id: number
        name: string
        official_site: string | null
        script_hash: string
        short_address: string
        eth_address: string
        supply: string | null
        symbol: string
        transfer_count: number
        type: TokenType
        type_script: null
        value: null
      }
      id: string
      type: 'udt'
    }

    interface ParsedToken {
      icon: string | null
      decimal: number
      description: string | null
      holderCount: number
      id: number
      name: string
      officialSite: string | null
      scriptHash: string
      address: string
      supply: string | null
      symbol: string
      transferCount: number
      type: TokenType
      typeScript: null
      value: null
    }
    export interface Raw {
      meta: Record<'current_page' | 'total_page', number>
      data: Array<RawToken>
    }
    export interface Parsed {
      meta: Record<'current' | 'total', number>
      tokens: Array<ParsedToken>
    }
  }
  export namespace Token {
    export interface Raw {
      data: {
        attributes: {
          decimal: number
          description: string | null
          holder_count: number
          icon: string | null
          id: number
          name: string
          official_site: string | null
          script_hash: string
          short_address: string | null
          eth_address: string | null
          supply: string | null
          symbol: string
          transfer_count: number
          type: 'bridge' | 'native'
          type_script: {
            args: string
            code_hash: string
            hash_type: 'data' | 'type'
          }
          value: string | null
        }
        id: string
        type: 'udt'
      }
    }
    export interface Parsed {
      decimal: number
      description: string | null
      holderCount: number
      icon: string | null
      id: number
      name: string
      officialSite: string | null
      scriptHash: string
      address: string | null
      supply: string | null
      symbol: string
      transferCount: number
      type: 'bridge' | 'native'
      // typeScript: {
      //   args: string
      //   codeHash: string
      //   hashType: 'data' | 'type'
      // }
      value: string | null
    }
  }
}
