import { useTranslation } from 'next-i18next'
import { gql } from 'graphql-request'
import { useTheme } from '@mui/material/styles'
import Table from 'components/Table'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/SimplePagination'
import NoDataIcon from 'assets/icons/no-data.svg'
import { client, GraphQLSchema } from 'utils'
import styles from './styles.module.scss'
import useMediaQuery from '@mui/material/useMediaQuery'

export type HolderListProps = {
  holders: {
    entries: Array<{
      rank: number
      address_hash: string
      quantity: string
      account: {
        bit_alias: string
      }
    }>
    metadata: GraphQLSchema.PageMetadata
  }
}

const holdersListQuery = gql`
  query ($address: HashAddress!, $before: String, $after: String, $limit: Int) {
    holders: erc721_holders(input: { contract_address: $address, before: $before, after: $after, limit: $limit }) {
      entries {
        rank
        address_hash
        quantity
        account {
          bit_alias
        }
      }
      metadata {
        before
        after
        total_count
      }
    }
  }
`

export const fetchHoldersList = (variables: {
  address: string // nft collection contract address
  before: string | null
  after: string | null
  limit: number
}) =>
  client
    .request<HolderListProps>(holdersListQuery, variables)
    .then(data => data.holders)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

const NFTHolderList: React.FC<HolderListProps> = ({ holders }) => {
  const [t] = useTranslation('list')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <>
      <Table>
        <thead style={{ textTransform: 'capitalize' }}>
          <tr>
            <th>{t('rank')}</th>
            <th>{t('address')} </th>
            <th>{t('quantity')}</th>
          </tr>
        </thead>
        <tbody>
          {holders?.metadata.total_count ? (
            holders.entries.map(item => (
              <tr key={item.address_hash}>
                <td>{item.rank}</td>
                <td>
                  {isMobile ? (
                    <Address address={item.address_hash} domain={item.account?.bit_alias} />
                  ) : (
                    <Address address={item.address_hash} domain={item.account?.bit_alias} leading={22} />
                  )}
                </td>
                <td>{(+item.quantity).toLocaleString('en')}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>
                <div className={styles.noRecords}>
                  <NoDataIcon />
                  <span>{t(`no_records`)}</span>
                </div>
              </td>
            </tr>
          )}

          {/* <div className={styles.test}>
            <div>
              first floor
              <div>first -1 floor</div>
            </div>
            <div>second</div>
          </div> */}
        </tbody>
      </Table>
      {!holders?.metadata.total_count ? null : (
        <Pagination {...holders.metadata} note={t(`last-n-records`, { n: '100k' })} />
      )}
    </>
  )
}

export default NFTHolderList
