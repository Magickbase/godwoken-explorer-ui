import type { GetStaticProps, GetStaticPaths } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import {
  Container,
  Stack,
  Grid,
  Paper,
  Tabs,
  Tab,
  Divider,
  List,
  ListSubheader,
  ListItem,
  ListItemText,
  Avatar,
  Typography,
  Link,
  Skeleton,
} from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import BigNumber from 'bignumber.js'
import SubpageHead from 'components/SubpageHead'
import PageTitle from 'components/PageTitle'
import ERC20TransferList from 'components/ERC20TransferList'
import BridgedRecordList from 'components/BridgedRecordList'
import TokenHolderList from 'components/TokenHolderList'
import Address from 'components/AddressInHalfPanel'
import {
  handleApiError,
  fetchToken,
  fetchERC20TransferList,
  nameToColor,
  fetchBridgedRecordList,
  fetchTokenHolderList,
} from 'utils'
import type { API } from 'utils/api/utils'

const tabs = ['transfers', 'bridged', 'holders']

type Props = {
  token: API.Token.Parsed
}

const Token: React.FC<Props> = ({ token }) => {
  const [t] = useTranslation('tokens')
  const {
    push,
    query: { tab = 'transfers', page = '1' },
  } = useRouter()

  const { isLoading: isTransferListLoading, data: transferList } = useQuery(
    ['token-transfer-list', token.address, page],
    () => fetchERC20TransferList({ udt_address: token.address, page: page as string }),
    { enabled: tab === tabs[0] && !!token.address },
  )

  const { isLoading: isBridgedListLoading, data: bridgedRecordList } = useQuery(
    ['token-bridged-list', token.id, page],
    () => fetchBridgedRecordList({ udt_id: token.id.toString(), page: page as string }),
    { enabled: tab === tabs[1] && !!token.id },
  )

  const { isLoading: isHolderListLoading, data: holderList } = useQuery(
    ['token-holder-list', token.id, page],
    () => fetchTokenHolderList({ udt_id: token.id.toString(), page: page as string }),
    { enabled: tab === tabs[2] && !!token.id },
  )

  const tokenInfo = [
    { label: 'decimal', value: <Typography variant="body2">{token.decimal || '-'}</Typography> },
    { label: 'type', value: <Typography variant="body2">{t(token.type)}</Typography> },
    {
      label: 'contract',
      value: token.address ? <Address address={token.address} /> : <Typography variant="body2">-</Typography>,
    },
    // {
    //   label: 'layer1Lock',
    //   value: token.typeScript.codeHash ? (
    //     <pre className="text-xs">{`{\n\t"code_hash": "${token.typeScript.codeHash}",\n\t"args": "${token.typeScript.args}",\n\t"hash_type": "${token.typeScript.hashType}"\n}`}</pre>
    //   ) : (
    //     '-'
    //   ),
    // },
    {
      label: 'officialSite',
      value: (
        <Typography variant="body2">
          {token.officialSite ? (
            <Link
              href={token.officialSite}
              underline="none"
              target="_blank"
              rel="noopener noreferrer"
              display="flex"
              alignItems="center"
              color="secondary"
            >
              <Typography variant="body2" overflow="hidden" textOverflow="ellipsis" className="mono-font">
                {token.officialSite}
              </Typography>
              <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
            </Link>
          ) : (
            '-'
          )}
        </Typography>
      ),
    },
    {
      label: 'description',
      value: <Typography variant="body2">{token.description || '-'}</Typography>,
    },
  ]
  const tokenData = [
    {
      label: token.type === 'bridge' ? 'circulatingSupply' : 'totalSupply',
      value: <Typography variant="body2">{token.supply ? new BigNumber(token.supply).toFormat() : '-'}</Typography>,
    },
    { label: 'holderCount', value: <Typography variant="body2">{token.holderCount || '-'}</Typography> },
    { label: 'transferCount', value: <Typography variant="body2">{token.transferCount || '-'}</Typography> },
  ]

  return (
    <>
      <SubpageHead subtitle={`${t('token')} ${token.name || token.symbol || '-'}`} />
      <Container sx={{ py: 6 }}>
        <PageTitle>
          <Stack direction="row" alignItems="center">
            <Avatar
              src={token.icon ?? null}
              sx={{ bgcolor: token.icon ? '#f0f0f0' : nameToColor(token.name ?? ''), mr: 2 }}
            >
              {token.name?.[0] ?? '?'}
            </Avatar>
            <Typography variant="h5" fontWeight="inherit" sx={{ textTransform: 'none' }}>
              {token.name || '-'}
            </Typography>
            {token.symbol ? (
              <Typography
                fontWeight="inherit"
                color="primary.light"
                whiteSpace="pre"
                sx={{ textTransform: 'none' }}
              >{` (${token.symbol})`}</Typography>
            ) : null}
          </Stack>
        </PageTitle>
        <Stack spacing={2}>
          <Paper>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List subheader={<ListSubheader sx={{ bgcolor: 'transparent' }}>{t('tokenInfo')}</ListSubheader>}>
                  <Divider variant="middle" />
                  {tokenInfo.map(field => (
                    <ListItem key={field.label}>
                      <ListItemText
                        primary={t(field.label)}
                        secondary={field.value}
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List subheader={<ListSubheader sx={{ bgcolor: 'transparent' }}>{t('tokenData')}</ListSubheader>}>
                  <Divider variant="middle" />
                  {tokenData.map(field => (
                    <ListItem key={field.label}>
                      <ListItemText primary={t(field.label)} secondary={field.value} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Paper>
          <Paper>
            <Tabs value={tabs.indexOf(tab as string)} variant="scrollable" scrollButtons="auto">
              {[t('transferRecords'), t(`bridgedRecords`), t(`tokenHolders`)].map((label, idx) => (
                <Tab
                  key={label}
                  label={label}
                  onClick={e => {
                    e.stopPropagation()
                    e.preventDefault()
                    push(`/token/${token.id}?tab=${tabs[idx]}`, undefined, { scroll: false })
                  }}
                />
              ))}
            </Tabs>
            <Divider />
            {tab === tabs[0] ? (
              !isTransferListLoading && transferList ? (
                <ERC20TransferList list={transferList} />
              ) : (
                <Skeleton animation="wave" />
              )
            ) : null}
            {tab === tabs[1] ? (
              !isBridgedListLoading && bridgedRecordList ? (
                <BridgedRecordList list={bridgedRecordList} showUser />
              ) : (
                <Skeleton animation="wave" />
              )
            ) : null}
            {tab === tabs[2] ? (
              !isHolderListLoading && holderList ? (
                <TokenHolderList list={holderList} />
              ) : (
                <Skeleton animation="wave" />
              )
            ) : null}
          </Paper>
        </Stack>
      </Container>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: 'blocking',
})

export const getStaticProps: GetStaticProps<Props, { id: string }> = async ({ locale, params }) => {
  const { id } = params

  try {
    const [token, lng] = await Promise.all([
      fetchToken(id),
      serverSideTranslations(locale, ['common', 'tokens', 'list']),
    ])

    return {
      props: { token, ...lng },
    }
  } catch (err) {
    return handleApiError(err, null, locale)
  }
}

export default Token
