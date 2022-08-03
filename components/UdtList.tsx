import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { gql } from 'graphql-request'
import { Avatar } from '@mui/material'
import Table from 'components/Table'
import { client, formatAmount, nameToColor, GraphQLSchema } from 'utils'

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
                <div>
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
              <td>{t(item.udt.type === GraphQLSchema.UdtType.Native ? 'native' : 'bridged')}</td>
              <td>{formatAmount(item.value, item.udt)}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={3} align="center">
              {t(`emptyAssetList`)}
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  )
}

export default AssetList
