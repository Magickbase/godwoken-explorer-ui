import type { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import SubpageHead from 'components/SubpageHead'
import PageTitle from 'components/PageTitle'
import Table from 'components/Table'
import Pagination from 'components/SimplePagination'
import TokenLogo from 'components/TokenLogo'
import HashLink from 'components/HashLink'
import Tooltip from 'components/Tooltip'
import { SIZES } from 'components/PageSize'
import { GraphQLSchema } from 'utils'
import styles from './styles.module.scss'

interface NftCollectionListProps {
  entries: Array<GraphQLSchema.NftCollectionListItem>
  metadata: GraphQLSchema.PageMetadata
}

const NftCollectionList = () => {
  const [t] = useTranslation('nft')
  const {
    query: { page_size = SIZES[1] },
  } = useRouter()

  const mockNftCollectionList: NftCollectionListProps = {
    entries: Array.from({ length: +page_size }).map((_, idx) => ({
      id: idx,
      name: `name ${idx}`,
      symbol: `symbol ${idx}`,
      icon: '',
      supply: idx * 100,
      holders_count: idx * 10,
      contract_address_hash: `0x${idx.toString().padStart(64, '0')}`,
    })),
    metadata: {
      before: null,
      after: null,
      total_count: 100,
    },
  }

  const title = t(`nft-collection`)

  return (
    <>
      <SubpageHead subtitle={title} />
      <div className={styles.container}>
        <PageTitle>{title}</PageTitle>
        <div className={styles.list}>
          <div className={styles.subheader}>
            <span>
              {t(`n_kinds_in_total`, {
                ns: 'list',
                number: mockNftCollectionList.metadata.total_count.toLocaleString('en'),
              })}
            </span>
            {mockNftCollectionList.metadata.total_count ? <Pagination {...mockNftCollectionList.metadata} /> : null}
          </div>
          <Table>
            <thead>
              <tr>
                <th>{t('token')}</th>
                <th>{t('address')} </th>
                <th>{t('holder_count')} </th>
                <th>{t('minted_count')}</th>
              </tr>
            </thead>
            <tbody>
              {mockNftCollectionList.metadata.total_count ? (
                mockNftCollectionList.entries.map(item => {
                  return (
                    <tr key={item.id}>
                      <td title={item.name}>
                        <NextLink href={`/nft-collection/${item.contract_address_hash}`}>
                          <a className={styles.token}>
                            <TokenLogo name={item.name} logo={item.icon} />
                            <span>{`${item.name}(${item.symbol})`}</span>
                          </a>
                        </NextLink>
                      </td>
                      <td className={styles.addr} title={item.contract_address_hash}>
                        <HashLink label={item.contract_address_hash} href={`/account/${item.contract_address_hash}`} />
                        <Tooltip title={item.contract_address_hash} placement="top">
                          <span>
                            <HashLink
                              label={`${item.contract_address_hash.slice(0, 8)}...${item.contract_address_hash.slice(
                                -8,
                              )}`}
                              href={`/account/${item.contract_address_hash}`}
                            />
                          </span>
                        </Tooltip>
                      </td>
                      <td title={item.holders_count.toLocaleString('en')}>{item.holders_count.toLocaleString('en')}</td>
                      <td title={item.supply.toLocaleString('en')}>{item.supply.toLocaleString('en')}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className={styles.noRecords}>
                    {/* update empty list after PR #417 is merged */}
                    {t(`no_records`)}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          {mockNftCollectionList.metadata.total_count ? <Pagination {...mockNftCollectionList.metadata} /> : null}
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common', 'nft', 'list'])
  return { props: lng }
}

NftCollectionList.displayName = 'NftCollectionList'

export default NftCollectionList
