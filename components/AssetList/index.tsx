import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { gql } from 'graphql-request'
import { Avatar } from '@mui/material'
import Table from 'components/Table'
import { client, formatAmount, nameToColor, GraphQLSchema } from 'utils'
import styles from './styles.module.scss'

export type UdtList = Array<{
  value: string
  udt: Pick<GraphQLSchema.Udt, 'id' | 'type' | 'name' | 'decimal' | 'icon' | 'symbol'>
}>

type NewUdtList = Array<{
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
`

const newUdtListQuery = gql`
  query ($address_hashes: [String], $script_hashes: [String]) {
    account_current_bridged_udts(input: { address_hashes: $address_hashes, script_hashes: $script_hashes }) {
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
    account_current_udts(input: { address_hashes: $address_hashes, script_hashes: $script_hashes }) {
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
  Promise.all([
    client
      .request<{ account_udts: UdtList }>(udtListQuery, variables)
      .then(data => data.account_udts.filter(u => u.udt.id !== CKB_UDT_ID))
      .catch(() => null),
    client
      .request<{ account_current_bridged_udts: NewUdtList; account_current_udts: NewUdtList }>(
        newUdtListQuery,
        variables,
      )
      .then(data =>
        [...data.account_current_bridged_udts, ...data.account_current_udts].filter(u => u.udt.id !== CKB_UDT_ID),
      )
      .catch(() => null),
  ]).then(([l1, l2]) => l1 || l2 || [])

const AssetList = ({ list = [] }: { list: UdtList }) => {
  const [t] = useTranslation('account')
  return (
    <Table>
      <thead>
        <tr style={{ textTransform: 'capitalize' }}>
          <th>{t(`asset`)}</th>
          <th>{t(`assetType`)}</th>
          <th>{t(`balance`)}</th>
        </tr>
      </thead>
      <tbody>
        {list.length ? (
          list.map(item => (
            <tr key={item.udt.id}>
              <td>
                <div className={styles.name}>
                  <Avatar
                    src={item.udt.icon}
                    sx={{
                      bgcolor: item.udt.icon ? '#f0f0f0' : nameToColor(item.udt.name),
                      textTransform: 'capitalize',
                      img: {
                        objectFit: 'fill',
                      },
                    }}
                  >
                    {item.udt.name?.[0] ?? '?'}
                  </Avatar>
                  <NextLink href={`/token/${item.udt.id}`}>
                    <a>{`${item.udt.name || '-'}${item.udt.symbol ? '(' + item.udt.symbol + ')' : ''}`}</a>
                  </NextLink>
                </div>
              </td>
              <td className={styles.type}>
                {t(item.udt.type === GraphQLSchema.UdtType.Native ? 'native' : 'bridged')}
              </td>
              <td>{formatAmount(item.value, item.udt)}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={3} align="center" className={styles.noRecords}>
              {t(`emptyAssetList`)}
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  )
}

export default AssetList
