import { useTranslation } from 'next-i18next'
import BigNumber from 'bignumber.js'
import Table from 'components/Table'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/Pagination'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { getTokenHolderListRes } from 'utils'
import { Stack, Typography } from '@mui/material'

type ParsedTokenHolderList = ReturnType<typeof getTokenHolderListRes>

const TokenHolderList: React.FC<{
  list: ParsedTokenHolderList
}> = ({ list }) => {
  const [t] = useTranslation('list')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <>
      <Table>
        <thead style={{ textTransform: 'capitalize' }}>
          <tr>
            <th>{t('rank')}</th>
            <th>{t('address')} </th>
            <th>{t('balance')}</th>
            <th>{t('percentage')}</th>
            <th style={{ textAlign: 'end' }}>{t('txCount')} </th>
          </tr>
        </thead>
        <tbody>
          {+list.meta.total ? (
            list.holders.map(h => (
              <tr key={h.address}>
                <td style={{ minWidth: isMobile ? 55 : 100 }}>{h.rank}</td>
                <td>
                  <div style={{ width: 'min-content' }}>
                    <Address address={h.address} leading={isMobile ? 10 : 30} />
                  </div>
                </td>
                <td>{new BigNumber(h.balance ?? '0').toFormat()}</td>
                <td>{`${h.percentage}%`}</td>
                <td style={{ textAlign: 'end' }}>{h.txCount?.toLocaleString('en') ?? '0'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} align="center" style={{ textAlign: 'center' }}>
                {t(`no_records`)}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Stack
        direction="row"
        flexWrap="wrap"
        justifyContent={isMobile ? 'center' : 'end'}
        alignItems="center"
        mt={{ xs: 0, md: 2 }}
        pb={{ xs: 1.5, md: 2 }}
        px={{ xs: 1.5, md: 3 }}
      >
        {/* TODO: pagesize */}
        {/* <PageSize pageSize={+page_size} /> */}
        {/* <Typography color="secondary.light" fontSize={{ xs: 12, md: 14 }}>
          {t('showLatestRecords', { ns: 'common', number: isMobile ? '100k' : '500k' })}
        </Typography> */}
        <Pagination total={+list.meta.total} page={+list.meta.page} />
      </Stack>
    </>
  )
}
export default TokenHolderList
