import { useTranslation } from 'next-i18next'
import {
  Avatar,
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { API, formatBalance, nameToColor } from 'utils'

// balance, decimal, icon, id, name, type
const AssetList = ({ list = [] }: { list: Array<API.Account.UDT> }) => {
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
              <TableRow key={item.id}>
                <TableCell>
                  <Stack direction="row" alignItems="center">
                    <Avatar src={item.icon ?? null} sx={{ bgcolor: nameToColor(item.name) }}>
                      {item.name?.[0] ?? '?'}
                    </Avatar>
                    <Typography variant="body2" ml={2}>
                      {item.name}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                  {t(item.type === 'native' ? 'native' : 'bridged')}
                </TableCell>
                <TableCell align="right">
                  <Box overflow="hidden" textOverflow="ellipsis" maxWidth={{ xs: '30vw', sm: '100%' }} ml="auto">
                    {`${formatBalance(item.balance)}`}
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
