import NextLink from 'next/link'
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Stack,
  Box,
  Link,
  Tooltip,
  Typography,
} from '@mui/material'
import Address from 'components/TruncatedAddress'
import { useTranslation } from 'next-i18next'
import { API, timeDistance, formatBalance } from 'utils'

const ERC20TransferList: React.FC<{ list: API.Txs.Parsed['txs'] }> = ({ list }) => {
  const [t, { language }] = useTranslation('list')
  return (
    <TableContainer sx={{ px: 1, pt: 2 }}>
      <Table size="small">
        <TableHead sx={{ textTransform: 'capitalize' }}>
          <TableRow>
            <TableCell component="th">{t(`hash`)}</TableCell>
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }} component="th">
              {t(`from`)}
            </TableCell>
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }} component="th">
              {t(`to`)}
            </TableCell>
            <TableCell sx={{ display: { xs: 'table-cell', md: 'none' } }} component="th">
              {t(`transfer`)}
            </TableCell>
            <TableCell component="th">{t(`value`)}</TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t(`age`)}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list.map(item => (
            <TableRow key={item.hash}>
              <TableCell>
                {
                  <Tooltip title={item.hash} placement="top">
                    <Box sx={{ fontSize: { xs: 12, sm: 14 } }}>
                      <NextLink href={`/tx/${item.hash}`}>
                        <Link
                          href={`/tx/${item.hash}`}
                          underline="none"
                          color="secondary"
                          className="mono-font"
                          fontSize={12}
                        >{`${item.hash.slice(0, 8)}...${item.hash.slice(-8)}`}</Link>
                      </NextLink>
                    </Box>
                  </Tooltip>
                }
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                <Address address={item.from} />
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                <Address address={item.to} />
              </TableCell>
              <TableCell sx={{ display: { xs: 'table-cell', md: 'none' } }}>
                <Stack>
                  <Typography
                    variant="inherit"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    noWrap
                  >
                    <Typography fontSize={12} sx={{ textTransform: 'capitalize', mr: 1 }}>{`${t('from')}:`}</Typography>
                    <Address leading={5} address={item.from} />
                  </Typography>
                  <Typography
                    variant="inherit"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    noWrap
                  >
                    <Typography fontSize={12} sx={{ textTransform: 'capitalize', mr: 1 }}>{`${t('to')}:`}</Typography>
                    <Address leading={5} address={item.to} />
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="inherit" overflow="hidden" textOverflow="ellipsis">
                  {formatBalance(item.transferCount)}
                </Typography>
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                <Typography variant="inherit" noWrap>
                  {timeDistance(item.timestamp, language)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
export default ERC20TransferList
