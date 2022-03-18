import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { Box, Link, Table, TableContainer, TableHead, TableBody, TableRow, TableCell } from '@mui/material'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/Pagination'
import { getTokenHolderListRes } from 'utils'

type ParsedTokenHolderList = ReturnType<typeof getTokenHolderListRes>

const TokenHolderList: React.FC<{
  list: ParsedTokenHolderList
}> = ({ list }) => {
  const [t] = useTranslation('list')
  return (
    <Box sx={{ px: 1, py: 2 }}>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ textTransform: 'capitalize' }}>
            <TableRow>
              <TableCell component="th">{t('rank')}</TableCell>
              <TableCell component="th"> {t('address')} </TableCell>
              <TableCell component="th">{t('balance')}</TableCell>
              <TableCell component="th">{t('percentage')}</TableCell>
              <TableCell component="th">{`${t('txCount')}`}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {+list.meta.total ? (
              list.holders.map(item => (
                <TableRow key={item.address}>
                  <TableCell>{item.rank}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <NextLink href={`account/${item.address}`}>
                      <Link href={`account/${item.address}`} underline="none" color="secondary" className="mono-font">
                        {item.address}
                      </Link>
                    </NextLink>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'table-cell', md: 'none' } }} title={item.address}>
                    <Address address={item.address} />
                  </TableCell>
                  <TableCell title={item.balance}>{item.balance}</TableCell>
                  <TableCell title={item.percentage}>{`${item.percentage}%`}</TableCell>
                  <TableCell title={`${item.txCount}`}> {item.txCount.toLocaleString('en')} </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {t(`no_records`)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination total={+list.meta.total} page={+list.meta.page} />
    </Box>
  )
}
export default TokenHolderList
