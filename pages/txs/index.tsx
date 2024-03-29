import type { GetStaticProps } from 'next'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useQuery } from 'react-query'
import { Container, Typography, Box, Stack, TableContainer, Skeleton, Tooltip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Table from 'components/Table'
import PageTitle from 'components/PageTitle'
import SubpageHead from 'components/SubpageHead'
import TxListComp, { fetchTxList } from 'components/TxList'
import FilterIcon from 'assets/icons/filter.svg'
import PendingIcon from 'assets/icons/pending.svg'
import IsPendingListIcon from 'assets/icons/is-pending-tx-list.svg'
import { SIZES } from 'components/PageSize'
import { isEthAddress, PCKB_UDT_INFO } from 'utils'
import styles from './styles.module.scss'

const TxList = () => {
  const [t] = useTranslation('list')
  const {
    query: {
      page_size = SIZES[1],
      before = null,
      after = null,
      block_from = null,
      block_to = null,
      status = 'ON_CHAINED',
      address_from = null,
      address_to = null,
      age_range_start = null,
      age_range_end = null,
      method_id = null,
      method_name = null,
    },
  } = useRouter()

  useEffect(() => {
    if (['A'].includes(document.activeElement.tagName)) {
      ;(document.activeElement as HTMLInputElement).blur()
    }
  }, [status])

  const isPendingList = status === 'pending'
  const { isLoading, data: txList } = useQuery(
    [
      'transactions',
      before,
      after,
      block_from,
      block_to,
      page_size,
      status,
      address_from,
      address_to,
      age_range_start,
      age_range_end,
      method_id,
      method_name,
    ],
    () =>
      fetchTxList({
        limit: +page_size as number,
        before: before as string | null,
        after: after as string | null,
        start_block_number: block_from ? +block_from : null,
        end_block_number: block_to ? +block_to : null,
        status: isPendingList ? 'PENDING' : 'ON_CHAINED',
        address_from: isEthAddress(address_from as string) ? (address_from as string) : null,
        address_to: isEthAddress(address_from as string) ? (address_to as string) : null,
        from_script_hash: !isEthAddress(address_from as string) ? (address_from as string) : null,
        to_script_hash: !isEthAddress(address_to as string) ? (address_to as string) : null,
        age_range_start: age_range_start as string | null,
        age_range_end: age_range_end as string | null,
        method_id: method_id as string | null,
        method_name: method_name as string | null,
        combine_from_to: address_from && address_to ? false : true,
      }),
  )
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const title = t('tx_list_title')
  if (isLoading || !txList) {
    return (
      <>
        <SubpageHead subtitle={title} />
        <Container sx={{ px: { xs: 2, lg: 0 }, pb: { xs: 5.5, md: 11 } }}>
          <PageTitle>
            <Typography variant="inherit" display="inline" pr={1}>
              {title}
            </Typography>
          </PageTitle>
          <Box
            sx={{
              borderRadius: {
                xs: 2,
                sm: 4,
              },
              border: {
                xs: '0.5px solid #F0F0F0',
                md: '1px solid #F0F0F0',
              },
              pt: { xs: 1.5, md: 2 },
              pb: 2,
              mt: { xs: 2, md: 3 },
              bgcolor: '#fff',
            }}
          >
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="space-between"
              alignItems="center"
              mb={{ xs: 1.5, md: 2 }}
              px={{ xs: 1.5, md: 3 }}
            >
              <Skeleton animation="wave" width={50} height={24} />
              <Skeleton animation="wave" width={50} height={24} />
            </Stack>
            <TableContainer>
              <Table>
                <thead style={{ textTransform: 'capitalize', fontSize: isMobile ? 12 : 14 }}>
                  <tr>
                    <th>{t('txHash')}</th>
                    <th>
                      <Stack direction="row" alignItems="center" whiteSpace="nowrap">
                        {t('block')}
                      </Stack>
                    </th>
                    <th>{t('age')} </th>
                    <th style={{ display: isMobile ? 'none' : 'table-cell' }}>{t('from')}</th>
                    <th style={{ display: isMobile ? 'none' : 'table-cell' }}>{t('to')}</th>
                    <th style={{ display: isMobile ? 'none' : 'table-cell' }}>{t('transfer')}</th>
                    <th style={{ whiteSpace: 'nowrap', textTransform: 'none' }}>{`${t('value')} (${
                      PCKB_UDT_INFO.symbol
                    })`}</th>
                    <th>{t('type')}</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: +page_size }).map((_, idx) => (
                    <tr key={idx}>
                      <td colSpan={7} style={{ display: isMobile ? 'table-cell' : 'none' }}>
                        <Skeleton animation="wave" height={25} />
                      </td>
                      <td colSpan={8} style={{ display: isMobile ? 'none' : 'table-cell' }}>
                        <Skeleton animation="wave" height={25} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="space-between"
              alignItems="center"
              mt={{ xs: 1.5, md: 2 }}
              px={{ xs: 1.5, md: 3 }}
            >
              <Skeleton animation="wave" width={50} height={24} />
              <Skeleton animation="wave" width={50} height={24} />
            </Stack>
          </Box>
        </Container>
      </>
    )
  }

  return (
    <>
      <SubpageHead subtitle={title} />
      <Container sx={{ px: { xs: 2, lg: 0 }, pb: { xs: 5.5, md: 11 } }}>
        <PageTitle>{title}</PageTitle>
        <Box
          sx={{
            borderRadius: {
              xs: 2,
              sm: 4,
            },
            border: {
              xs: '0.5px solid #F0F0F0',
              md: '1px solid #F0F0F0',
            },
            mt: { xs: 2, md: 3 },
            bgcolor: '#fff',
          }}
        >
          {txList.entries.length >= 2 ? (
            <Stack
              direction="row"
              flexWrap="wrap"
              alignItems="center"
              mb={{ xs: 1.5, md: 2 }}
              px={{ xs: 1.5, md: 3 }}
              pt={{ xs: 1.5, md: 2 }}
            >
              <Typography variant="inherit" color="secondary" fontWeight={500} fontSize={{ xs: 14, md: 16 }}>
                {isPendingList
                  ? t('tx_in_mem_pool')
                  : t(`tx_in_block_from_to`, {
                      to: txList.entries.find(t => t.block)?.block?.number ?? '-',
                      from: txList.entries[txList.entries.length - 1].block?.number ?? '-',
                    })}
              </Typography>
              <div className={styles.filter}>
                <Tooltip title={t('view-filter')} placement="top">
                  <label htmlFor="filter">
                    <FilterIcon />
                    <input id="filter" readOnly />
                  </label>
                </Tooltip>
                <ul>
                  <li data-active={isPendingList}>
                    <NextLink href={isPendingList ? '/txs' : 'txs?status=pending'}>
                      <a>
                        <PendingIcon />
                        <span>{t(`view-pending-txs`)}</span>
                        <IsPendingListIcon />
                      </a>
                    </NextLink>
                  </li>
                </ul>
              </div>
            </Stack>
          ) : null}

          {txList && <TxListComp transactions={txList} maxCount={isMobile ? '100k' : '500k'} pageSize={+page_size} />}
        </Box>
      </Container>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common', 'list'])
  return { props: lng }
}

export default TxList
