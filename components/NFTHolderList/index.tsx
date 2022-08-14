import { useTranslation } from 'next-i18next'
import BigNumber from 'bignumber.js'
import Table from 'components/Table'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/SimplePagination'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { gql } from 'graphql-request'
import { client, GraphQLSchema } from 'utils'
import { SIZES } from 'components/PageSize'
import { useRouter } from 'next/router'

export type NFTHolderListProps = {
  holders_list: {
    entries: Array<{
      rank: number
      address: string
      quantity: number
    }>
    metadata: GraphQLSchema.PageMetadata
  }
}

const nftHoldersListQuery = gql`
  query ($address: String!, $before: String, $after: String, $limit: Int) {
    holders_list(input: { address: $address, before: $before, after: $after, limit: $limit }) {
      entries {
        rank
        address
        quantity
      }
      metadata {
        before
        after
        total_count
      }
    }
  }
`

export const fetchNftHoldersList = (variables: {
  address: string // nft collection
  before: string | null
  after: string | null
  limit: number
}) =>
  client
    .request<NFTHolderListProps>(nftHoldersListQuery, variables)
    .then(data => data.holders_list)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

const NFTHolderList: React.FC<NFTHolderListProps> = ({ holders_list: { entries, metadata } }) => {
  const [t] = useTranslation('list')
  const {
    query: { id: _, page_size = SIZES[1], log_index_sort = 'ASC', ...query },
    push,
    asPath,
  } = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const fakeEntries = Array.from({ length: +page_size }).map((_, i) => ({
    rank: i + 1,
    address: `0x${i.toString().padStart(40, '0')}`,
    quantity: i * 100,
  }))

  const fakeMetadata = {
    before: null,
    after: null,
    total_count: 10,
  }

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
          {fakeMetadata.total_count ? (
            fakeEntries.map(item => (
              <tr key={item.address}>
                <td style={{ minWidth: isMobile ? 55 : 100 }}>{item.rank}</td>
                <td>
                  <div style={{ width: 'min-content' }}>
                    <Address address={item.address} leading={isMobile ? 10 : 30} />
                  </div>
                </td>
                <td>{new BigNumber(item.quantity ?? '0').toFormat()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} align="center" style={{ textAlign: 'center' }}>
                {t(`no_records`)}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* TODO: pagesize */}
      {/* <PageSize pageSize={+page_size} /> */}
      {/* <Typography color="secondary.light" fontSize={{ xs: 12, md: 14 }}>
          {t('showLatestRecords', { ns: 'common', number: isMobile ? '100k' : '500k' })}
        </Typography> */}
      {fakeMetadata.total_count ? <Pagination {...fakeMetadata} note={t(`last-n-records`, { n: `100k` })} /> : null}
    </>
  )
}

export default NFTHolderList
