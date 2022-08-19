import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { gql } from 'graphql-request'
import BigNumber from 'bignumber.js'
import Table from 'components/Table'
import TokenLogo from 'components/TokenLogo'
import { parseTokenName, client, GraphQLSchema } from 'utils'
import NoDataIcon from 'assets/icons/no-data.svg'
import styles from './styles.module.scss'

export type UdtList = Array<{
  value: string
  udt: Pick<GraphQLSchema.Udt, 'id' | 'type' | 'name' | 'decimal' | 'icon' | 'symbol'>
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
  const [t] = useTranslation('account')
  return (
    <Table>
      <thead className={styles.tableHeader}>
        <tr style={{ textTransform: 'capitalize' }}>
          <th>{t(`asset`)}</th>
          <th>{t(`assetType`)}</th>
          <th>{t(`balance`)}</th>
        </tr>
      </thead>
      <tbody className={styles.tableBody}>
        {list.length ? (
          list.map(item => {
            const [amountInt, amountFrac] = new BigNumber(item.value ?? '0')
              .dividedBy(10 ** (item.udt.decimal ?? 0))
              .toFormat()
              .split('.')
            return (
              <tr key={item.udt.id}>
                <td>
                  <div className={styles.name}>
                    <NextLink href={`/token/${item.udt.id}`}>
                      <a>
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
                  <div className={styles.amount}>
                    <span>{amountInt}</span>
                    {amountFrac ? <span className={styles.frac}>{`.${amountFrac}`}</span> : null}
                  </div>
                  <span className={styles.symbol}>{item.udt.symbol ?? ''}</span>
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
