import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/SimplePagination'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { gql } from 'graphql-request'
import { client, GraphQLSchema } from 'utils'
import { SIZES } from 'components/PageSize'
import { useRouter } from 'next/router'
import PlaceholderIcon from 'assets/icons/nft-placeholder.svg'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { Paper, Typography } from '@mui/material'
import HashLink from 'components/HashLink'

export type NFTInventoryListProps = {
  nft_inventory_list: {
    entries: Array<{
      nft_collection: string
      token_id: string
      owner_account: string
      quantity: number
      name?: string // only in user details page
    }>
    metadata: GraphQLSchema.PageMetadata
  }
  isUserDetailsPage?: boolean
}

const nftInventoryListQuery = gql`
  query (address: String!, before: String, after: String, sorters: Sorters, filters: Filters) {
    nft_inventory_list {
      nft_collection
      token_id
      owner_account
      tokenURI
    }
    metadata {
      before
      after
      total_count
    }
  }
`

export const fetchNftInventoryList = (variables: {
  address: string
  before: string | null
  after: string | null
  // limit: number
  // sorters: { sort_type: string, sort_value: string }
  // filters: { sort_type: string, sort_value: string }
}) =>
  client
    .request<NFTInventoryListProps>(nftInventoryListQuery, variables)
    .then(data => data.nft_inventory_list)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

// styled inventory card
const Card = styled(Paper)(({ theme }) => ({
  'textAlign': 'center',
  'color': theme.palette.secondary.light,
  'padding': theme.spacing(1.5),
  'border': '1px solid #F0F0F0',
  'borderRadius': theme.spacing(2),
  'boxShadow': 'none',
  [theme.breakpoints.down('sm')]: {
    border: '0.5px solid #F0F0F0',
    borderRadius: theme.spacing(1.5),
  },
  '&:hover': {
    filter: 'drop-shadow(0px 4px 16px rgba(0, 0, 0, 0.2))',
    position: 'relative',
    top: -8,
  },
}))

const NFTInventoryList: React.FC<NFTInventoryListProps> = ({
  nft_inventory_list: { entries, metadata },
  isUserDetailsPage = false,
}) => {
  const [t] = useTranslation('nft')
  const {
    query: { id: _, page_size = SIZES[1], log_index_sort = 'ASC', ...query },
    push,
    asPath,
  } = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const fakeEntries = Array.from({ length: +page_size }).map((_, i) => ({
    nft_collection: `0x${i.toString().padStart(40, '0')}`,
    token_id: '1234567890',
    owner_account: `0x${i.toString().padStart(40, '0')}`,
    tokenURI:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAJUlEQVR42u3NQQEAAAQEsJNcdFLw2gqsMukcK4lEIpFIJBLJS7KG6yVo40DbTgAAAABJRU5ErkJggg==',
    name: '',
  }))

  const fakeMetadata = {
    before: null,
    after: null,
    total_count: 20,
  }

  return (
    <>
      <Grid container spacing={2.5} sx={{ p: { xs: '11px', md: 2.5 }, pb: { xs: 1, md: 1 } }}>
        {fakeMetadata.total_count ? (
          fakeEntries.map(item => (
            <Grid key={item.token_id} item xs={12} sm={6} md={2.4}>
              <Card elevation={0}>
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                  <Box
                    sx={{
                      bgcolor: theme.palette.primary.light,
                      width: { xs: 290, md: 192 },
                      height: { xs: 290, md: 192 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {!item.tokenURI ? (
                      <Image
                        src={item.tokenURI}
                        alt="nft-image"
                        width={isMobile ? 296 : 192}
                        height={isMobile ? 296 : 192}
                      />
                    ) : (
                      <div style={{ width: isMobile ? 168 : 112 }}>
                        <PlaceholderIcon />
                      </div>
                    )}
                  </Box>
                  {isUserDetailsPage && (
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 0.25, fontSize: 14 }}
                    >
                      <Typography fontSize={14}>{t('name')}</Typography>
                      <Typography fontSize={14} color={theme.palette.secondary.main}>
                        {item.name.length > 15 ? item.name.slice(0, 15) + '...' : item.name}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 1 }}>
                    <Typography fontSize={14}>{t('tokenID')}</Typography>
                    <HashLink
                      label={item.token_id.length > 15 ? item.token_id.slice(0, 15) + '...' : item.token_id}
                      href={`/nft-item/${item.token_id}`}
                      monoFont={false}
                      style={{ fontSize: 14 }}
                    />
                  </Box>
                  {!isUserDetailsPage && (
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 0.25, fontSize: 14 }}
                    >
                      <Typography fontSize={14}>{t('owner')}</Typography>
                      <Address
                        address={item.owner_account}
                        ellipsisPosition="end"
                        leading={15}
                        sx={{ fontSize: 14 }}
                        monoFont={false}
                      />
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12} sx={{ height: 112, display: 'grid', placeItems: 'center' }}>
            {t(`no_records`)}
          </Grid>
        )}
      </Grid>

      {/* TODO: pagesize */}
      {/* <PageSize pageSize={+page_size} /> */}
      {/* <Typography color="secondary.light" fontSize={{ xs: 12, md: 14 }}>
          {t('showLatestRecords', { ns: 'common', number: isMobile ? '100k' : '500k' })}
        </Typography> */}
      {fakeMetadata.total_count ? <Pagination {...fakeMetadata} note={t(`last-n-records`, { n: `100k` })} /> : null}
    </>
  )
}

export default NFTInventoryList
