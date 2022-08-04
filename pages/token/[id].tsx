import type { GetStaticProps, GetStaticPaths } from 'next'
import { useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import { Container, Stack, Avatar, Typography, Link, Skeleton, Box } from '@mui/material'
import Tabs from 'components/Tabs'
import SubpageHead from 'components/SubpageHead'
import PageTitle from 'components/PageTitle'
import ERC20TransferList from 'components/ERC20TransferList'
import BridgedRecordList from 'components/BridgedRecordList/index'
import TokenHolderList from 'components/TokenHolderList/index'
import Address from 'components/TruncatedAddress'
import DownloadMenu, { DOWNLOAD_HREF_LIST } from 'components/DownloadMenu'
import OpenInNewIcon from 'assets/icons/open-in-new.svg'
import {
  fetchToken,
  fetchERC20TransferList,
  nameToColor,
  fetchBridgedRecordList,
  fetchTokenHolderList,
  formatAmount,
} from 'utils'

import type { API } from 'utils/api/utils'
import InfoList from 'components/InfoList'

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
        { label: t('tokenHolders'), href: DOWNLOAD_HREF_LIST.udtHolderList(token.id.toString()) },
      ].filter(i => i)
    : []

  useEffect(() => {
    if (!isTokenLoading && !token) {
      replace(`/${language}/404?query=${id}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      value: token ? (
        <Typography variant="body2" color="secondary">
          {token.decimal || '-'}
        </Typography>
      ) : (
        <Skeleton animation="wave" />
      ),
    },
    {
      label: 'type',
      value: token ? (
        <Typography variant="body2" color="secondary">
          {t(token.type)}
        </Typography>
      ) : (
        <Skeleton animation="wave" />
      ),
    },
    {
      label: 'contract',
      value: !token ? (
        <Skeleton animation="wave" />
      ) : token.address ? (
        <Address address={token.address} leading={35} sx={{ overflowWrap: 'anywhere' }} />
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
              <Typography variant="body2" overflow="hidden" textOverflow="ellipsis">
                {token.officialSite}
              </Typography>
              <OpenInNewIcon style={{ marginLeft: 8 }} />
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
        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
          {token.supply
            ? formatAmount(token.supply, { symbol: token.symbol?.split('.')[0] ?? '', decimal: token.decimal })
            : '-'}
        </Typography>
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
      <Container sx={{ px: { xs: 2, sm: 3, md: 2, lg: 0 }, pb: { xs: 5.5, md: 11 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: { xs: 1.75, md: 0.5 } }}>
          <PageTitle>
            <Stack direction="row" alignItems="center">
              <Avatar
                src={token?.icon ?? null}
                sx={{
                  bgcolor: token?.icon ? '#f0f0f0' : nameToColor(token?.name ?? ''),
                  mr: 1,
                  img: { objectFit: 'fill' },
                  width: { xs: 24, md: 32 },
                  height: '100%',
                }}
              >
                {token?.name?.[0] ?? '?'}
              </Avatar>
              <Typography fontSize="inherit" fontWeight={500} sx={{ textTransform: 'none' }}>
                {!token ? <Skeleton animation="wave" width="30px" /> : token.name || '-'}
              </Typography>
            </Stack>
          </PageTitle>

          <Box sx={{ mt: { xs: 2.25, md: 0 } }}>
            <DownloadMenu items={downloadItems} />
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 4 }} mb={{ xs: 2, md: 3 }}>
          <div style={{ flex: '1 1 50%' }}>
            <InfoList
              title={t(`info`)}
              list={tokenInfo.filter(v => v).map(field => ({ field: t(field.label), content: field.value }))}
              style={{ color: '#333' }}
            />
          </div>
          <div style={{ flex: '1 1 50%' }}>
            <InfoList
              title={t(`stats`)}
              list={tokenData.filter(v => v).map(field => ({ field: t(field.label), content: field.value }))}
              style={{ color: '#333' }}
            />
          </div>
        </Stack>

        <Box
          sx={{
            bgcolor: '#fff',
            border: '1px solid var(--border-color)',
            borderRadius: { xs: 2, md: 4 },
            overflowY: 'hidden',
          }}
        >
          <Tabs
            value={tabs.indexOf(tab as string)}
            tabs={['transferRecords', 'bridgedRecords', 'tokenHolders'].map((label, idx) => ({
              label: t(label),
              href: `/token/${id}?tab=${tabs[idx]}`,
            }))}
          />
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
        </Box>
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
