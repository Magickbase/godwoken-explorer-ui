import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { SIZES } from 'components/PageSize'
import HashLink from 'components/HashLink'
import Table from 'components/Table'
import Pagination from 'components/SimplePagination'
import TokenLogo from 'components/TokenLogo'
import FilterMenu from 'components/FilterMenu'
import RoundedAmount from 'components/RoundedAmount'
import Address from 'components/TruncatedAddress'
import Tooltip from 'components/Tooltip'
import { GraphQLSchema, ZERO_ADDRESS } from 'utils'
import SortIcon from 'assets/icons/sort.svg'
import ChangeIcon from 'assets/icons/change.svg'
import NoDataIcon from 'assets/icons/no-data.svg'
import EmptyFilteredListIcon from 'assets/icons/empty-filtered-list.svg'
import styles from './styles.module.scss'

type udtType = Nullable<Pick<GraphQLSchema.Udt, 'decimal' | 'name' | 'symbol' | 'id' | 'icon'>>

export type TransferListItem = {
  amount: string
  from_address: string
  to_address: string
  from_account: {
    eth_address: string
    bit_alias: string
  }
  to_account: {
    eth_address: string
    bit_alias: string
  }
  log_index: number
  transaction_hash: string
  udt: udtType
  block?: Nullable<Pick<GraphQLSchema.Block, 'number' | 'timestamp'>>
  token_contract_address_hash?: string
  token_id?: number
}

export type TransferListProps = {
  entries: Array<TransferListItem>
  handleTokenName?: (udt: udtType, ...rest: any) => string
  metadata: GraphQLSchema.PageMetadata
  isShowValue?: boolean
  type: TransferlistType
}
export enum TransferlistType {
  'Erc20' = 'Erc20',
  'Erc721' = 'Erc721',
  'Erc1155' = 'Erc1155',
}

const FILTER_KEYS = ['address_from', 'address_to']

const TransferList: React.FC<TransferListProps> = ({ entries, metadata, type, handleTokenName }) => {
  const [isShowLogo, setIsShowLogo] = useState(true)
  const [t] = useTranslation('list')
  const {
    query: { id: _, page_size = SIZES[1], log_index_sort = 'ASC', ...query },
    push,
    asPath,
  } = useRouter()

  const isFiltered = Object.keys(query).some(key => FILTER_KEYS.includes(key))
  const isFilterUnnecessary = !metadata?.total_count && !isFiltered

  const handleTokenLink = (item: TransferListItem, type: TransferlistType) => {
    switch (type) {
      case TransferlistType.Erc20:
        return `/token/${item.udt.id}`
      case TransferlistType.Erc721:
        return `/nft-item/${item.token_contract_address_hash}/${item.token_id}`
      case TransferlistType.Erc1155:
        return `/multi-token-item/${item.token_contract_address_hash}/${item.token_id}`
      default:
        return ''
    }
  }

  const handleLogIndexSortClick = (e: React.MouseEvent<HTMLOrSVGImageElement>) => {
    const {
      dataset: { order },
    } = e.currentTarget
    push(
      `${asPath.split('?')[0] ?? ''}?${new URLSearchParams({
        ...query,
        log_index_sort: order === 'ASC' ? 'DESC' : 'ASC',
      })}`,
    )
  }

  const handleTokenDisplayChange = () => setIsShowLogo(show => !show)

  return (
    <div className={styles.container} data-is-filter-unnecessary={isFilterUnnecessary}>
      <Table>
        <thead>
          <tr>
            <th>
              <div className={styles.index}>
                {t(`log_index`)}
                <SortIcon onClick={handleLogIndexSortClick} data-order={log_index_sort} />
              </div>
            </th>
            <th>
              <div className={styles.from}>
                {t('from')}
                <FilterMenu filterKeys={[FILTER_KEYS[0]]} />
              </div>
            </th>
            <th>
              <div className={styles.to}>
                {t('to')}
                <FilterMenu filterKeys={[FILTER_KEYS[1]]} />
              </div>
            </th>
            <th className={styles.tokenLogo}>
              <div className={styles.token}>
                {t('token')}
                <ChangeIcon onClick={handleTokenDisplayChange} />
              </div>
            </th>
            {type === TransferlistType.Erc20 && <th className={styles['ta-r']}>{`${t('value')}`}</th>}
          </tr>
        </thead>
        <tbody>
          {metadata?.total_count ? (
            entries?.map(item => {
              const from_bit_alias = item.from_account?.bit_alias
              const from_address = item.from_account?.eth_address
              const to_bit_alias = item.to_account?.bit_alias
              const to_address = item.to_account?.eth_address

              return (
                <tr key={`${item.transaction_hash}-${item.log_index}`}>
                  <td>{item.log_index}</td>
                  <td className={styles.address}>
                    {from_bit_alias ? (
                      <Address address={from_address} domain={from_bit_alias} />
                    ) : (
                      <Tooltip title={item.from_address} placement="top">
                        <span className="mono-font">
                          {item.from_address === ZERO_ADDRESS ? (
                            'zero address'
                          ) : (
                            <HashLink
                              label={`${item?.from_address?.slice(0, 8)}...${item?.from_address?.slice(-8)}`}
                              href={`/account/${item?.from_address}`}
                            />
                          )}
                        </span>
                      </Tooltip>
                    )}
                  </td>
                  <td className={styles.address}>
                    {to_bit_alias ? (
                      <Address address={to_address} domain={to_bit_alias} />
                    ) : (
                      <Tooltip title={item.to_address} placement="top">
                        <span className="mono-font">
                          {item.to_address === ZERO_ADDRESS ? (
                            'zero address'
                          ) : (
                            <HashLink
                              label={`${item.to_address.slice(0, 8)}...${item.to_address.slice(-8)}`}
                              href={`/account/${item.to_address}`}
                            />
                          )}
                        </span>
                      </Tooltip>
                    )}
                  </td>
                  <td className={styles.tokenLogo}>
                    <NextLink
                      href={{
                        pathname: handleTokenLink(item, type),
                      }}
                    >
                      <a>
                        {isShowLogo ? (
                          <TokenLogo name={item.udt.name} logo={item.udt.icon} />
                        ) : (
                          handleTokenName?.(item.udt, item.token_id) ?? ''
                        )}
                      </a>
                    </NextLink>
                  </td>
                  {type === TransferlistType.Erc20 && (
                    <td title={item.udt.name} className={styles['ta-r']}>
                      <RoundedAmount amount={item.amount} udt={item.udt} />
                    </td>
                  )}
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={5}>
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
      {metadata?.total_count ? <Pagination {...metadata} note={t(`last-n-records`, { n: `100k` })} /> : null}
    </div>
  )
}
export default TransferList
