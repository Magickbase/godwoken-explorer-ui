import type { GetStaticProps, GetStaticPaths } from 'next'
import { useEffect } from 'react'
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
import DownloadMenu, { DOWNLOAD_HREF_LIST } from 'components/DownloadMenu'
import { fetchToken, fetchERC20TransferList, nameToColor, fetchBridgedRecordList, fetchTokenHolderList } from 'utils'

import type { API } from 'utils/api/utils'

const tabs = ['transfers', 'bridged', 'holders']

type Props = {
  token: API.Token.Parsed
}

const Token: React.FC<Props> = () => {
  const [t, { language }] = useTranslation('tokens')
  const {
    replace,
    push,
    query: { id, tab = 'transfers', page = '1' },
  } = useRouter()

  const { isLoading: isTokenLoading, data: token } = useQuery(['token', id], () => fetchToken(id.toString()))

  const downloadItems = token
    ? [
        { label: t('transferRecords'), href: DOWNLOAD_HREF_LIST.udtTransferList(token.address) },
        token.type === 'bridge'
          ? { label: t('bridgedRecords'), href: DOWNLOAD_HREF_LIST.udtBridgeRecordList(token.id.toString()) }
          : null,
        // { label: t('tokenHolders'), href: DOWNLOAD_HREF_LIST.udtHolderList(token.id.toString()) }, // TODO: re-enable when API is fixed
      ].filter(i => i)
    : []

  useEffect(() => {
    if (!isTokenLoading && !token) {
      replace(`/${language}/404?query=${id}`)
    }
  }, [isTokenLoading, token, replace])

  const { isLoading: isTransferListLoading, data: transferList } = useQuery(
    ['token-transfer-list', token?.address, page],
    () => fetchERC20TransferList({ udt_address: token?.address, page: page as string }),
    { enabled: tab === tabs[0] && !!token?.address },
  )

  const { isLoading: isBridgedListLoading, data: bridgedRecordList } = useQuery(
    ['token-bridged-list', id, page],
    () => fetchBridgedRecordList({ udt_id: id.toString(), page: page as string }),
    { enabled: tab === tabs[1] },
  )

  const { isLoading: isHolderListLoading, data: holderList } = useQuery(
    ['token-holder-list', id, page],
    () => fetchTokenHolderList({ udt_id: id.toString(), page: page as string }),
    { enabled: tab === tabs[2] },
  )

  const tokenInfo = [
    {
      label: 'decimal',
      value: token ? <Typography variant="body2">{token.decimal || '-'}</Typography> : <Skeleton animation="wave" />,
    },
    {
      label: 'type',
      value: token ? <Typography variant="body2">{t(token.type)}</Typography> : <Skeleton animation="wave" />,
    },
    {
      label: 'contract',
      value: !token ? (
        <Skeleton animation="wave" />
      ) : token.address ? (
        <Address address={token.address} />
      ) : (
        <Typography variant="body2">-</Typography>
      ),
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
      value: token ? (
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
      ) : (
        <Skeleton animation="wave" />
      ),
    },
    {
      label: 'description',
      value: token ? (
        <Typography variant="body2">{token.description || '-'}</Typography>
      ) : (
        <Skeleton animation="wave" />
      ),
    },
  ]
  const tokenData = [
    {
      label: token?.type === 'bridge' ? 'circulatingSupply' : 'totalSupply',
      value: !token ? (
        <Skeleton animation="wave" />
      ) : (
        <Typography variant="body2">{token.supply ? new BigNumber(token.supply).toFormat() : '-'}</Typography>
      ),
    },
    {
      label: 'holderCount',
      value: token ? (
        <Typography variant="body2">{token.holderCount || '-'}</Typography>
      ) : (
        <Skeleton animation="wave" />
      ),
    },
    {
      label: 'transferCount',
      value: token ? (
        <Typography variant="body2">{token.transferCount || '-'}</Typography>
      ) : (
        <Skeleton animation="wave" />
      ),
    },
  ]

  return (
    <>
      <SubpageHead subtitle={`${t('token')} ${token?.name || token?.symbol || '-'}`} />
      <Container sx={{ py: 6 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <PageTitle>
            <Stack direction="row" alignItems="center">
              <Avatar
                src={token?.icon ?? null}
                sx={{ bgcolor: token?.icon ? '#f0f0f0' : nameToColor(token?.name ?? ''), mr: 2 }}
              >
                {token?.name?.[0] ?? '?'}
              </Avatar>
              <Typography variant="h5" fontWeight="inherit" sx={{ textTransform: 'none' }}>
                {!token ? <Skeleton animation="wave" width="30px" /> : token.name || '-'}
              </Typography>
              {token?.symbol ? (
                <Typography
                  fontWeight="inherit"
                  color="primary.light"
                  whiteSpace="pre"
                  sx={{ textTransform: 'none' }}
                >{` (${token.symbol})`}</Typography>
              ) : null}
            </Stack>
          </PageTitle>

          <DownloadMenu items={downloadItems} />
        </Stack>
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common', 'tokens', 'list'])
  return { props: lng }
}

export default Token
