import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { gql } from 'graphql-request'
import Table from 'components/Table'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/SimplePagination'
import Tooltip from 'components/Tooltip'
import NoDataIcon from 'assets/icons/no-data.svg'
import EmptyFilteredListIcon from 'assets/icons/empty-filtered-list.svg'
import FilterMenu from 'components/FilterMenu'
import { GraphQLSchema, client, formatDatetime, parseTokenName } from 'utils'
import { SIZES } from 'components/PageSize'
import TokenLogo from 'components/TokenLogo'
import Alert from 'components/Alert'
import SortIcon from 'assets/icons/sort.svg'
import styles from './styles.module.scss'
import RevokeButton from './RevokeButton'

export type TokenApprovalEntryType = {
  approved: boolean
  block: Pick<GraphQLSchema.Block, 'hash' | 'number' | 'status' | 'timestamp'>
  block_hash: string
  data: string
  spender_address_hash: string
  token_contract_address_hash: string
  token_owner_address_hash: string
  transaction_hash: string
  type: GraphQLSchema.ApprovalType
  udt: Pick<GraphQLSchema.Udt, 'id' | 'name' | 'eth_type' | 'icon'>
}

type TokenApprovalListProps = {
  list: {
    entries: Array<TokenApprovalEntryType>
    metadata: GraphQLSchema.PageMetadata
  }
}

const PaginatedTokenApprovalFragment = gql`
  fragment paginateTokenApprovals on PaginateTokenApprovals {
    entries {
      approved
      block {
        timestamp
      }
      block_hash
      data
      spender_address_hash
      token_contract_address_hash
      token_owner_address_hash
      transaction_hash
      type
      udt {
        id
        name
        eth_type
        icon
      }
    }
    metadata {
      total_count
      after
      before
    }
  }
`

const tokenApprovalListQuery = gql`
  ${PaginatedTokenApprovalFragment}
  query tokenApprovalListQuery(
    $address: HashAddress
    $after: String
    $before: String
    $limit: Int
    $sorter: [TokenApprovalsSorterInput]
  ) {
    erc20_list: token_approvals(
      input: { address: $address, after: $after, before: $before, limit: $limit, sorter: $sorter, token_type: ERC20 }
    ) {
      ...paginateTokenApprovals
    }
    erc721_list: token_approvals(
      input: { address: $address, after: $after, before: $before, limit: $limit, sorter: $sorter, token_type: ERC721 }
    ) {
      ...paginateTokenApprovals
    }
    erc1155_list: token_approvals(
      input: { address: $address, after: $after, before: $before, limit: $limit, sorter: $sorter, token_type: ERC1155 }
    ) {
      ...paginateTokenApprovals
    }
  }
`

const tokenApprovalListFilteredQuery = gql`
  ${PaginatedTokenApprovalFragment}
  query tokenApprovalListFilteredQuery(
    $address: HashAddress
    $after: String
    $before: String
    $limit: Int
    $sorter: [TokenApprovalsSorterInput]
    $token_type: TokenType
  ) {
    filtered_list: token_approvals(
      input: {
        address: $address
        after: $after
        before: $before
        limit: $limit
        sorter: $sorter
        token_type: $token_type
      }
    ) {
      ...paginateTokenApprovals
    }
  }
`

interface Cursor {
  limit?: number
  before: string
  after: string
}

interface TokenApprovalListVariables extends Nullable<Cursor> {
  address?: string | null
  sorter?: GraphQLSchema.TokenApprovalsSorterInput[]
  token_type?: GraphQLSchema.TokenType | null
}

type TokenApprovalResultList = {
  entries: Array<TokenApprovalEntryType>
  metadata: GraphQLSchema.PageMetadata
}

type TokenApprovalReqResult = {
  erc20_list: TokenApprovalResultList
  erc721_list: TokenApprovalResultList
  erc1155_list: TokenApprovalResultList
  filtered_list: TokenApprovalResultList
}

export const fetchTokenApprovalList = (variables: TokenApprovalListVariables) =>
  client
    .request<Partial<TokenApprovalReqResult>>(
      variables.token_type ? tokenApprovalListFilteredQuery : tokenApprovalListQuery,
      variables,
    )
    .then(data => {
      if (variables.token_type) {
        return data.filtered_list
      } else {
        const total_count =
          data.erc20_list.metadata.total_count +
          data.erc721_list.metadata.total_count +
          data.erc1155_list.metadata.total_count
        return {
          entries: [...data.erc20_list.entries, ...data.erc721_list.entries, ...data.erc1155_list.entries],
          metadata: { before: null, after: null, total_count: total_count },
        }
      }
    })
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

const FILTER_KEYS = ['asset', 'token_type']

const TokenApprovalList: React.FC<TokenApprovalListProps & { maxCount?: string; pageSize?: number }> = ({
  list: { entries, metadata },
}) => {
  const {
    query: { id, page_size = SIZES[1], sort_time = 'ASC', sort_asset = 'ASC', sort_token_type = 'ASC', ...query },
    push,
    asPath,
  } = useRouter()
  const [t, { language }] = useTranslation(['list', 'tokens', 'account'])
  const isFiltered = Object.keys(query).some(key => FILTER_KEYS.includes(key))
  const isFilterUnnecessary = !metadata.total_count && !isFiltered
  const [alert, setAlert] = useState<{ open: boolean; type?: 'success' | 'error' | 'warning'; msg?: string }>({
    open: false,
    type: 'success',
    msg: '',
  })
  const [internalEntries, setInternalEntries] = useState([])

  const handleSortClick = (type: string) => (e: React.MouseEvent<HTMLOrSVGImageElement>) => {
    const {
      dataset: { order },
    } = e.currentTarget
    push(
      `${asPath.split('?')[0] ?? ''}?${new URLSearchParams({
        ...(query as { [x: string]: string }),
        [type]: order === 'ASC' ? 'DESC' : 'ASC',
      })}`,
    )
  }

  // hide and cache:
  // - the item has revoke txn packaged successfully in a block but backend not synced yet
  const hideItem = (item: TokenApprovalEntryType) => {
    const { transaction_hash, spender_address_hash, token_contract_address_hash, data } = item
    const newItemKey = transaction_hash + spender_address_hash + token_contract_address_hash + data
    localStorage.setItem(
      'revokingItems',
      JSON.stringify([...JSON.parse(localStorage.getItem('revokingItems') ?? '[]'), newItemKey]),
    )
    setInternalEntries(
      internalEntries.filter(entry => {
        const { transaction_hash, spender_address_hash, token_contract_address_hash, data } = entry
        const entryKey = transaction_hash + spender_address_hash + token_contract_address_hash + data
        return entryKey !== newItemKey
      }),
    )
  }

  useEffect(() => {
    // only show entries that are not in the cached revoking items list
    let oldRevokingItems = JSON.parse(localStorage.getItem('revokingItems') ?? '[]')
    let newInternalEntries = []
    let newRevokingItems = []
    entries.forEach((item: TokenApprovalEntryType) => {
      const { transaction_hash, spender_address_hash, token_contract_address_hash, data } = item
      const key = transaction_hash + spender_address_hash + token_contract_address_hash + data
      if (oldRevokingItems.includes(key)) {
        newRevokingItems.push(key)
      } else {
        newInternalEntries.push(item)
      }
    })
    localStorage.setItem('revokingItems', JSON.stringify(newRevokingItems))
    setInternalEntries(newInternalEntries)
  }, [entries])

  return (
    <div className={styles.container} data-is-filter-unnecessary={isFilterUnnecessary}>
      <Alert
        open={alert?.open}
        onClose={() => setAlert({ ...alert, open: false })}
        content={alert.msg}
        type={alert.type}
      />
      <Table>
        <thead>
          <tr>
            <th>{t('txHash')}</th>
            <th>
              {t('last_update_time')}
              {/* <SortIcon onClick={handleSortClick('sort_time')} data-order={sort_time} /> */}
            </th>
            <th>
              {t('asset')}
              {/* <SortIcon onClick={handleSortClick('sort_asset')} data-order={sort_asset} /> */}
              {/* <FilterMenu filterKeys={[FILTER_KEYS[0]]} /> */}
            </th>
            <th>
              {t('token_type')}
              {/* <SortIcon onClick={handleSortClick('sort_token_type')} data-order={sort_token_type} /> */}
              <FilterMenu filterKeys={[FILTER_KEYS[1]]} />
            </th>
            <th>{t('approved_type')}</th>
            <th>{t('approved_spender')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {internalEntries.length ? (
            internalEntries.map(item => {
              const txnHash = item.transaction_hash
              const lastUpdateTime = formatDatetime(Date.parse(item.block?.timestamp), 'YYYY-MM-DD HH:mm:ss')

              return (
                <tr key={txnHash}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title={txnHash} placement="top">
                        <span>
                          <NextLink href={`/tx/${txnHash}`}>
                            <a className="mono-font">{`${txnHash.slice(0, 8)}...${item.transaction_hash.slice(-8)}`}</a>
                          </NextLink>
                        </span>
                      </Tooltip>
                    </div>
                  </td>
                  <td>
                    {lastUpdateTime ? (
                      <time className={styles.lastUpdateTime} title={lastUpdateTime}>
                        {lastUpdateTime}
                      </time>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <div className={styles.asset}>
                      <NextLink href={`/token/${item.udt.id}`}>
                        <a className={styles.logo}>
                          <TokenLogo name={item.udt.name} logo={item.udt.icon} />
                        </a>
                      </NextLink>
                      <NextLink href={`/token/${item.udt.id}`}>
                        <a>{parseTokenName(item.udt.name).name}</a>
                      </NextLink>
                    </div>
                  </td>
                  <td>{t(item.udt.eth_type as string, { ns: 'account' })}</td>
                  <td>{item.type === GraphQLSchema.ApprovalType.Approval ? 'approve' : 'approve for all'}</td>
                  <td>
                    <Address address={item.spender_address_hash} />
                  </td>
                  <td>
                    <RevokeButton setAlert={setAlert} listItem={item} account={id as string} hideItem={hideItem} />
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={7} align="center">
                {isFiltered ? (
                  <div className={styles.noRecords}>
                    <EmptyFilteredListIcon />
                    <span>{t(`no_related_content`)}</span>
                  </div>
                ) : (
                  <div className={styles.noRecords}>
                    <NoDataIcon />
                    <span>{t(`no_records`)}</span>
                  </div>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {!metadata.total_count ? null : <Pagination {...metadata} />}
    </div>
  )
}
export default TokenApprovalList
