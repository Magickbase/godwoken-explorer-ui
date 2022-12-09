import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { gql } from 'graphql-request'
import dayjs from 'dayjs'
import BigNumber from 'bignumber.js'
import Tooltip from 'components/Tooltip'
import Table from 'components/Table'
import TokenLogo from 'components/TokenLogo'
import Amount from 'components/Amount'
import NoDataIcon from 'assets/icons/no-data.svg'
import UsdIcon from 'assets/icons/usd.svg'
import { parseTokenName, client, GraphQLSchema } from 'utils'
import styles from './styles.module.scss'

export type UdtList = Array<{
  value: string
  udt: Pick<GraphQLSchema.Udt, 'id' | 'type' | 'name' | 'decimal' | 'icon' | 'symbol' | 'token_exchange_rate'>
}>

const udtListQuery = gql`
  query ($address_hashes: [String], $script_hashes: [String]) {
    account_udts(input: { address_hashes: $address_hashes, script_hashes: $script_hashes }) {
      value
      udt {
        id
        type
        name
        icon
        decimal
        symbol
        token_exchange_rate {
          exchange_rate
          symbol
          timestamp
        }
      }
    }
  }
`

type EthAccountUdtListVariables = Record<'address_hashes', Array<string>>
type GwAccountUdtListVariables = Record<'script_hashes', Array<string>>
type Variables = EthAccountUdtListVariables | GwAccountUdtListVariables

const CKB_UDT_ID = '1'
export const fetchUdtList = (variables: Variables) =>
  client
    .request<{ account_udts: UdtList }>(udtListQuery, variables)
    .then(data => data.account_udts.filter(u => u.udt.id !== CKB_UDT_ID && u.udt.type === GraphQLSchema.UdtType.Native))
    .catch(err => {
      console.error(err)
      return []
    })

const AssetList = ({ list = [] }: { list: UdtList }) => {
  const [t] = useTranslation(['account', 'list'])
  const [isShowUsd, setIsShowUsd] = useState(false)

  const handleBalanceDisplayChange = () => setIsShowUsd(show => !show)

  return (
    <Table>
      <thead className={styles.tableHeader}>
        <tr style={{ textTransform: 'capitalize' }}>
          <th>{t(`asset`)}</th>
          <th>{t(`assetType`)}</th>
          <th>
            <div className={styles.balance}>
              {isShowUsd ? t(`USD`, { ns: 'list' }) : t(`balance`)}
              <span style={{ color: isShowUsd ? 'var(--primary-color)' : '#ccc' }}>
                <UsdIcon onClick={handleBalanceDisplayChange} />
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody className={styles.tableBody}>
        {list.length ? (
          list.map(item => {
            return (
              <tr key={item.udt.id}>
                <td>
                  <div className={styles.name}>
                    <NextLink href={`/token/${item.udt.id}`}>
                      <a className={styles.logo}>
                        <TokenLogo name={item.udt.name} logo={item.udt.icon} />
                      </a>
                    </NextLink>
                    <NextLink href={`/token/${item.udt.id}`}>
                      <a>{parseTokenName(item.udt.name).name}</a>
                    </NextLink>
                  </div>
                </td>
                <td className={styles.type}>
                  {t(item.udt.type === GraphQLSchema.UdtType.Native ? 'native' : 'bridged')}
                </td>
                <td>
                  {isShowUsd ? (
                    <Tooltip
                      title={t('price-updated-at', {
                        time: dayjs(item.udt.token_exchange_rate?.timestamp).format('YYYY-MM-DD HH:mm:ss'),
                        ns: 'list',
                      })}
                      placement="top"
                      hidden={!item.udt.token_exchange_rate?.exchange_rate}
                    >
                      <span>
                        {item.udt.token_exchange_rate?.exchange_rate
                          ? `$${new BigNumber(item.value ?? 0)
                              .dividedBy(10 ** item.udt.decimal)
                              .multipliedBy(item.udt.token_exchange_rate?.exchange_rate)
                              .toFixed(2)}`
                          : '-'}
                      </span>
                    </Tooltip>
                  ) : (
                    <Amount amount={item.value} udt={item.udt} />
                  )}
                </td>
              </tr>
            )
          })
        ) : (
          <tr>
            <td colSpan={3} align="center">
              <div className={styles.noRecords}>
                <NoDataIcon />
                <span>{t(`emptyAssetList`)}</span>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  )
}

export default AssetList
