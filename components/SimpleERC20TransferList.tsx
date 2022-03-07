import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import {
  Stack,
  Box,
  Link,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from '@mui/material'
import BigNumber from 'bignumber.js'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/Pagination'
import { getERC20TransferListRes } from 'utils'

// TODO: add token logo and link

type ParsedTransferList = ReturnType<typeof getERC20TransferListRes>

const SimpleTransferList: React.FC<{
  list: ParsedTransferList
}> = ({ list }) => {
  const [t] = useTranslation('list')
  return (
    <Box sx={{ px: 1, py: 2 }}>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ textTransform: 'capitalize' }}>
            <TableRow>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }} component="th">
                {t('from')}
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }} component="th">
                {t('to')}
              </TableCell>
              <TableCell sx={{ display: { xs: 'table-cell', md: 'none' } }} component="th">
                {t('transfer')}
              </TableCell>
              <TableCell component="th">{`${t('value')}`}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {+list.totalCount ? (
              list.txs.map(item => (
                <TableRow key={item.hash}>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <NextLink href={`/account/${item.from}`}>
                      <Link href={`/account/${item.from}`} underline="none" color="secondary" className="mono-font">
                        {item.from}
                      </Link>
                    </NextLink>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <NextLink href={`/account/${item.to}`}>
                      <Link href={`/account/${item.to}`} underline="none" color="secondary" className="mono-font">
                        {item.to}
                      </Link>
                    </NextLink>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'table-cell', md: 'none' } }}>
                    <Stack>
                      <Stack direction="row">
                        <Typography
                          fontSize={12}
                          sx={{ minWidth: '35px', textTransform: 'capitalize', mr: 1, whiteSpace: 'nowrap' }}
                        >{`${t('from')}:`}</Typography>
                        <Address leading={8} address={item.from} />
                      </Stack>

                      <Stack direction="row">
                        <Typography
                          fontSize={12}
                          sx={{ minWidth: '35px', textTransform: 'capitalize', mr: 1, whiteSpace: 'nowrap' }}
                        >{`${t('to')}:`}</Typography>
                        <Address address={item.to} leading={8} />
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {item.transferValue
                      ? `${new BigNumber(item.transferValue).toFormat()} ${item.udtSymbol ?? ''}`
                      : null}
                  </TableCell>
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
      <Pagination total={+list.totalCount} current={+list.page} />
    </Box>
  )
}
export default SimpleTransferList
