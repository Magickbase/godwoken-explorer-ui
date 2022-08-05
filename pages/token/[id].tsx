import type { GetStaticProps, GetStaticPaths } from 'next'
import { useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import { Skeleton } from '@mui/material'
import SubpageHead from 'components/SubpageHead'
import PageTitle from 'components/PageTitle'
import Tabs from 'components/Tabs'
import InfoList from 'components/InfoList'
import ERC20TransferList, { fetchTokenTransferList } from 'components/ERC20TransferList'
import BridgedRecordList from 'components/BridgedRecordList'
import TokenHolderList from 'components/TokenHolderList'
import HashLink from 'components/HashLink'
import DownloadMenu, { DOWNLOAD_HREF_LIST } from 'components/DownloadMenu'
import { fetchToken, fetchBridgedRecordList, fetchTokenHolderList, formatAmount } from 'utils'

import type { API } from 'utils/api/utils'
import { SIZES } from 'components/PageSize'
import TokenLogo from 'components/TokenLogo'

const tabs = ['transfers', 'bridged', 'holders']

type Props = {
  token: API.Token.Parsed
}

const Token: React.FC<Props> = () => {
  const [t, { language }] = useTranslation('tokens')
  const {
    replace,
    query: { id, tab = 'transfers', page = '1', before = null, after = null, page_size = SIZES[1] },
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
    ['token-transfer-list', token?.address, page_size, before, after],
    () =>
      fetchTokenTransferList({
        address: token?.address,
        limit: +page_size,
        before: before as string,
        after: after as string,
      }),
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
      field: 'decimal',
      content: token ? token.decimal || '-' : <Skeleton animation="wave" />,
    },
    {
      field: 'type',
      content: token ? t(token.type) : <Skeleton animation="wave" />,
    },
    {
      field: 'contract',
      content: !token ? (
        <Skeleton animation="wave" />
      ) : token.address ? (
        <HashLink label={token.address} href={`/account/${token.address}`} />
      ) : (
        '-'
      ),
    },
    {
      field: 'officialSite',
      content: token ? (
        token.officialSite ? (
          <HashLink label={token.officialSite} href={token.officialSite} external />
        ) : (
          '-'
        )
      ) : (
        <Skeleton animation="wave" />
      ),
    },
    {
      field: 'description',
      content: token ? token.description || '-' : <Skeleton animation="wave" />,
    },
  ]

  const tokenData = [
    {
      field: token?.type === 'bridge' ? 'circulatingSupply' : 'totalSupply',
      content: !token ? (
        <Skeleton animation="wave" />
      ) : token.supply ? (
        formatAmount(token.supply, { symbol: token.symbol?.split('.')[0] ?? '', decimal: token.decimal })
      ) : (
        '-'
      ),
    },
    {
      field: 'holderCount',
      content: token ? token.holderCount || '-' : <Skeleton animation="wave" />,
    },
    {
      field: 'transferCount',
      content: token ? token.transferCount || '-' : <Skeleton animation="wave" />,
    },
  ]

  return (
    <>
      <SubpageHead subtitle={`${t('token')} ${token?.name || token?.symbol || '-'}`} />
      <div className={''}>
        <PageTitle>
          <div>
            <TokenLogo name={token?.name ?? ''} logo={token?.icon ?? ''} />
            {!token ? <Skeleton animation="wave" width="30px" /> : token.name || '-'}
          </div>
          <DownloadMenu items={downloadItems} />
        </PageTitle>
        <InfoList title={t(`token_info`)} list={tokenInfo} style={{ marginBottom: '2rem' }} />
        <InfoList title={t(`token_data`)} list={tokenData} style={{ marginBottom: '2rem' }} />

        <div className="list">
          <Tabs
            value={tabs.indexOf(tab as string)}
            tabs={[t('transferRecords'), t(`bridgedRecords`), t(`tokenHolders`)].map((label, idx) => ({
              label,
              href: `/token/${id}?tab=${tabs[idx]}`,
            }))}
          />
          {tab === tabs[0] ? (
            !isTransferListLoading && transferList ? (
              <ERC20TransferList token_transfers={transferList} />
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
        </div>
      </div>
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
