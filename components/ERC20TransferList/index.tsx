import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { Stack, Typography } from '@mui/material'
import BigNumber from 'bignumber.js'
import Table from 'components/Table'
import Tooltip from 'components/Tooltip'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/Pagination'
import TxStatusIcon from 'components/TxStatusIcon'
import TransferDirection from 'components/TransferDirection'
import { timeDistance, getERC20TransferListRes } from 'utils'
import styles from './styles.module.scss'

type ParsedTransferList = ReturnType<typeof getERC20TransferListRes>

const TransferList: React.FC<{
  list: ParsedTransferList
  viewer?: string
}> = ({ list, viewer }) => {
  const [t, { language }] = useTranslation('list')
  return (
    <div className={styles.container}>
      <Table>
        <thead>
          <tr>
            <th>{t('txHash')}</th>
            <th>{t('block')} </th>
            <th>{t('age')} </th>
            <th>{t('from')}</th>
            <th>{t('to')}</th>
            <th>{`${t('value')}`}</th>
          </tr>
        </thead>
        <tbody>
          {+list.totalCount ? (
            list.txs.map(item => (
              <tr key={item.hash + item.logIndex}>
                <td>
                  <div className={styles.hash}>
                    <Tooltip title={item.hash} placement="top">
                      <span>
                        <NextLink href={`/tx/${item.hash}`}>
                          <a className="mono-font">{`${item.hash.slice(0, 8)}...${item.hash.slice(-8)}`}</a>
                        </NextLink>
                      </span>
                    </Tooltip>
                    <TxStatusIcon status={item.status} isSuccess={item.isSuccess} />
                  </div>
                </td>
                <td>
                  <NextLink href={`/block/${item.blockNumber}`}>
                    <a>{(+item.blockNumber).toLocaleString('en')}</a>
                  </NextLink>
                </td>
                <td>
                  <time dateTime={new Date(+item.timestamp).toISOString()}>
                    {timeDistance(item.timestamp, language)}
                  </time>
                </td>
                <td>
                  <Address address={item.from} />
                </td>
                <td>{item.to ? <Address address={item.to} /> : null}</td>
                <td>
                  <div style={{ display: 'flex', whiteSpace: 'nowrap' }}>
                    <TransferDirection from={item.from} to={item.to} viewer={viewer ?? ''} />
                    {item.transferValue
                      ? `${new BigNumber(item.transferValue).toFormat()} ${item.udtSymbol ?? ''}`
                      : null}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} align="center" className={styles.noRecords}>
                {t(`no_records`)}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Pagination total={+list.totalCount} page={+list.page} />
      <Stack direction="row-reverse">
        <Typography color="primary.light" variant="caption">
          {t(`last-n-records`, { n: `100k` })}
        </Typography>
      </Stack>
    </div>
  )
}
export default TransferList
