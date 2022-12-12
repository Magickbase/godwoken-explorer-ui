import type { GetStaticProps, GetStaticPaths } from 'next'
import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { Skeleton } from '@mui/material'
import { ConnectorAlreadyConnectedError, useConnect, UserRejectedRequestError } from 'wagmi'
import SubpageHead from 'components/SubpageHead'
import PageTitle from 'components/PageTitle'
import Tabs from 'components/Tabs'
import InfoList from 'components/InfoList'
import ERC20TransferList, { fetchTokenTransferList } from 'components/ERC20TransferList'
import BridgedRecordList from 'components/BridgedRecordList'
import TokenHolderList from 'components/TokenHolderList/index'
import HashLink from 'components/HashLink'
import DownloadMenu, { DOWNLOAD_HREF_LIST } from 'components/DownloadMenu'
import Amount from 'components/Amount'
import Alert from 'components/Alert'
import { fetchToken, fetchBridgedRecordList, fetchTokenHolderList, client, currentChain, withWagmi } from 'utils'
import styles from './styles.module.scss'

import type { API } from 'utils/api/utils'
import { SIZES } from 'components/PageSize'
import TokenLogo from 'components/TokenLogo'

const tabs = ['transfers', 'bridged', 'holders']

const isEtheremInjected = (ethereum: any): ethereum is { networkVersion: string; request: Function } => {
  return ethereum && 'request' in ethereum && typeof ethereum.request === 'function'
}

type Props = {
  token: API.Token.Parsed
}

interface TokenInfoProps {
  token: {
    id: number
    name: string
    symbol: string | null
    icon: string | null
    type: 'NATIVE' | 'BRIDGE'
    bridge_account_id: null
    eth_type: 'ERC20' | 'ERC721' | 'ERC1155'
    decimal: null
    official_site: string | null
    description: string | null
    supply: string
    holders_count: number
    minted_count: number
    contract_address_hash: string
  }
}

const tokenInfoQuery = gql`
  query ($id: Int) {
    token: udt(input: { id: $id }) {
      id
      name
      symbol
      icon
      type
      bridge_account_id
      eth_type
      decimal
      official_site
      description
      supply
      holders_count
      minted_count
      contract_address_hash
    }
  }
`

interface Variables {
  id: number
}

const fetchTokenInfo = (variables: Variables): Promise<TokenInfoProps['token'] | undefined> =>
  client
    .request<TokenInfoProps>(tokenInfoQuery, variables)
    .then(data => data.token)
    .catch(() => undefined)

const Token: React.FC<Props> = () => {
  const [t, { language }] = useTranslation(['tokens', 'list'])
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string }>(null)
  const {
    replace,
    query: {
      id,
      tab = 'transfers',
      page = '1',
      before = null,
      after = null,
      block_from = null,
      block_to = null,
      page_size = SIZES[1],
      address_from = null,
      address_to = null,
      age_range_start = null,
      age_range_end = null,
    },
  } = useRouter()

  const { data: stats } = useQuery(['token-basic-info', id], () => fetchToken(id.toString()))
  const { isLoading: isTokenLoading, data: token } = useQuery(['token', id], () => fetchTokenInfo({ id: +id }), {
    refetchInterval: 10000,
  })

  const downloadItems = [
    token
      ? { label: t('transferRecords'), href: DOWNLOAD_HREF_LIST.udtTransferList(token.contract_address_hash) }
      : null,
    { label: t('bridgedRecords'), href: DOWNLOAD_HREF_LIST.udtBridgeRecordList(id as string) },
    { label: t('tokenHolders'), href: DOWNLOAD_HREF_LIST.udtHolderList(id as string) },
  ].filter(i => i)

  useEffect(() => {
    if (!isTokenLoading && !token) {
      replace(`/${language}/404?query=${id}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTokenLoading, token, replace])

  const { isLoading: isTransferListLoading, data: transferList } = useQuery(
    [
      'token-transfer-list',
      token?.contract_address_hash,
      page_size,
      before,
      after,
      block_from,
      block_to,
      address_from,
      address_to,
      age_range_start,
      age_range_end,
    ],
    () =>
      fetchTokenTransferList({
        contract_address: token?.contract_address_hash,
        limit: +page_size,
        before: before as string,
        after: after as string,
        block_from: block_from ? +block_from : null,
        block_to: block_to ? +block_to : null,
        address_from: address_from as string,
        address_to: address_to as string,
        age_range_start: age_range_start as string,
        age_range_end: age_range_end as string,
        combine_from_to: address_from && address_to ? false : true,
      }),
    { enabled: tab === tabs[0] && !!token?.contract_address_hash },
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

  const { connectAsync, connectors } = useConnect({
    chainId: currentChain.id,
  })
  const connector = connectors[0]

  const tokenInfo = [
    {
      field: t('decimal'),
      content: token ? token.decimal || '-' : <Skeleton animation="wave" />,
    },
    {
      field: t('type'),
      content: token ? t(token.eth_type) : <Skeleton animation="wave" />,
    },
    {
      field: t('contract'),
      content: !token ? (
        <Skeleton animation="wave" />
      ) : token.contract_address_hash ? (
        <div className={styles.contract}>
          <HashLink label={token.contract_address_hash} href={`/account/${token.contract_address_hash}`} />
        </div>
      ) : (
        '-'
      ),
    },
    {
      field: t('officialSite'),
      content: token ? (
        token.official_site ? (
          <HashLink label={token.official_site} href={token.official_site} external />
        ) : (
          '-'
        )
      ) : (
        <Skeleton animation="wave" />
      ),
    },
    {
      field: t('description'),
      content: token ? token.description || '-' : <Skeleton animation="wave" />,
    },
  ]

  const tokenData = [
    {
      field: t(token?.type === 'BRIDGE' ? 'circulatingSupply' : 'totalSupply'),
      content: !token ? (
        <Skeleton animation="wave" />
      ) : token.supply ? (
        <>
          <Amount amount={token.supply || '0'} udt={token} showSymbol />
        </>
      ) : (
        '-'
      ),
    },
    {
      field: t('holderCount'),
      content: token ? token.holders_count || '-' : <Skeleton animation="wave" />,
    },
    {
      field: t('transferCount'),
      content: stats ? stats.transferCount || '-' : <Skeleton animation="wave" />,
    },
    {
      field: '',
      content: <div data-role="placeholder" style={{ height: `5rem` }}></div>,
    },
  ]

  const handleImportIntoMetamask = async () => {
    if (!token) {
      setMsg({ type: 'error', text: t(`wait-for-token-info`) })
    }

    const ethereum: unknown | undefined = window['ethereum']
    if (isEtheremInjected(ethereum)) {
      try {
        await connectAsync({ connector, chainId: currentChain.id })
      } catch (err) {
        if (err instanceof UserRejectedRequestError) {
          setMsg({ type: 'error', text: t('user-rejected', { ns: 'list' }) })
        } else if (!(err instanceof ConnectorAlreadyConnectedError)) {
          setMsg({ type: 'error', text: err.message })
        }
        return
      }
      const symbol = token.symbol?.split('.')[0] || ''
      try {
        await ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: token.eth_type,
            options: {
              address: token.contract_address_hash,
              symbol,
              decimals: token.decimal,
              image: token.icon,
            },
          },
        })
        setMsg({ type: 'success', text: t(`import-token-success`) })
      } catch (err) {
        if (err.code === 4001) {
          setMsg({ type: 'error', text: t(`rejected-by-metamask`) })
          return
        }
        setMsg({ type: 'error', text: err.message })
      }
      return
    }
    setMsg({ type: 'error', text: t(`ethereum-is-not-injected`) })
  }

  return (
    <>
      <SubpageHead subtitle={`${t('token')} ${token?.name || token?.symbol || '-'}`} />
      <div className={styles.container}>
        <PageTitle>
          <div className={styles.title}>
            <TokenLogo name={token?.name ?? ''} logo={token?.icon ?? ''} />
            {!token ? (
              <Skeleton animation="wave" width="30px" />
            ) : (
              <span className={styles.name}>{token.name || '-'}</span>
            )}
          </div>
          <DownloadMenu items={downloadItems} />
        </PageTitle>
        <div className={styles.overview}>
          <InfoList
            className={styles['info-width']}
            title={
              <div className={styles.infoTitle}>
                {t(`tokenInfo`)}
                {token?.eth_type === 'ERC20' ? (
                  <div className="tooltip" data-tooltip={t('import-token-into-metamask')}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/logos/metamask.png"
                      alt="MetaMask"
                      className={styles.metamask}
                      title={t('import-token-into-metamask')}
                      onClick={handleImportIntoMetamask}
                    />
                  </div>
                ) : null}
              </div>
            }
            list={tokenInfo}
          />
          <InfoList title={t(`tokenData`)} list={tokenData} />
        </div>

        <div className={styles.list}>
          <Tabs
            value={tabs.indexOf(tab as string)}
            tabs={[t('transferRecords'), t(`bridgedRecords`), t(`tokenHolders`)].map((label, idx) => ({
              label,
              href: `/token/${id}?tab=${tabs[idx]}`,
            }))}
          />
          {tab === tabs[0] ? (
            !isTransferListLoading && transferList ? (
              <ERC20TransferList token_transfers={transferList} showToken={false} viewer={id as string} />
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
      <Alert open={!!msg} onClose={() => setMsg(null)} content={msg?.text} type={msg?.type} />
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

export default withWagmi<Props>(Token)
