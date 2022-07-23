import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { gql } from 'graphql-request'
import {
  Avatar,
  Box,
  Stack,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { client, formatAmount, nameToColor, GraphQLSchema } from 'utils'

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
    <TableContainer sx={{ px: 1, py: 2 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow sx={{ textTransform: 'capitalize' }}>
            <TableCell component="th" sx={{ whiteSpace: 'nowrap' }}>
              {t(`asset`)}
            </TableCell>
            <TableCell component="th" sx={{ whiteSpace: 'nowrap' }}>
              {t(`assetType`)}
            </TableCell>
            <TableCell component="th" align="right" sx={{ whiteSpace: 'nowrap' }}>
              {t(`balance`)}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list.length ? (
            list.map(item => (
              <TableRow key={item.udt.id}>
                <TableCell>
                  <Stack direction="row" alignItems="center">
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
                      <Link href={`/token/${item.udt.id}`} underline="none" color="secondary" ml={2}>
                        {`${item.udt.name || '-'}${item.udt.symbol ? '(' + item.udt.symbol + ')' : ''}`}
                      </Link>
                    </NextLink>
                  </Stack>
                </TableCell>
                <TableCell sx={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                  {t(item.udt.type === GraphQLSchema.UdtType.Native ? 'native' : 'bridged')}
                </TableCell>
                <TableCell align="right">
                  <Box overflow="hidden" textOverflow="ellipsis" maxWidth={{ xs: '30vw', sm: '100%' }} ml="auto">
                    {formatAmount(item.value, item.udt)}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} align="center">
                {t(`emptyAssetList`)}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default AssetList
