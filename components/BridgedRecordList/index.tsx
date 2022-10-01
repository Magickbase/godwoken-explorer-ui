import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import Table from 'components/Table'
import HashLink from 'components/HashLink'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/Pagination'
import NoDataIcon from 'assets/icons/no-data.svg'
import Amount from 'components/Amount'
import { timeDistance, getBridgedRecordListRes, CKB_EXPLORER_URL, PCKB_UAN, PCKB_UDT_INFO } from 'utils'
import styles from './styles.module.scss'
import Tooltip from 'components/Tooltip'

type ParsedList = ReturnType<typeof getBridgedRecordListRes>

const BridgedRecordList: React.FC<{ list: ParsedList; showUser?: boolean }> = ({ list, showUser }) => {
  const [t, { language }] = useTranslation('list')
  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>{t('type')}</th>
            <th>{t('value')} </th>
            <th>{PCKB_UDT_INFO.symbol}</th>
            <th>{t('age')} </th>
            {showUser ? <th>{t('account')} </th> : null}
            <th>{t('layer1Txn')} </th>
            <th>{t('block')} </th>
          </tr>
        </thead>
        <tbody>
          {+list.meta.total ? (
            list.records.map(r => (
              <tr key={r.layer1.output.hash + r.layer1.output.index}>
                <td>{t(r.type)}</td>
                <td>
                  {r.token?.symbol !== PCKB_UAN ? (
                    <Amount amount={r.value ?? '0'} udt={{ ...r.token, decimal: 0 }} showSymbol />
                  ) : (
                    '0'
                  )}
                </td>
                <td>
                  <Amount amount={r.capacity ?? '0'} udt={{ decimal: 8, symbol: PCKB_UDT_INFO.symbol }} />
                </td>
                <td>
                  {r.timestamp > 0 ? (
                    <time dateTime={new Date(+r.timestamp).toISOString()}>{timeDistance(r.timestamp, language)}</time>
                  ) : (
                    t('pending')
                  )}
                </td>
                {showUser ? (
                  <td>
                    <Address address={r.to} />
                  </td>
                ) : null}
                <td>
                  {r.layer1.output.hash ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title={r.layer1.output.hash} placement="top">
                        <div>
                          <HashLink
                            label={`${r.layer1.output.hash.slice(0, 8)}...${r.layer1.output.hash.slice(-8)}`}
                            href={`${CKB_EXPLORER_URL}/transaction/${r.layer1.output.hash}#${r.layer1.output.index}`}
                            external
                          />
                        </div>
                      </Tooltip>
                    </div>
                  ) : (
                    t(`pending`)
                  )}
                </td>
                <td>
                  {r.block.hash ? (
                    <NextLink href={`/block/${r.block.hash}`}>
                      <a>{(+r.block.number).toLocaleString('en')}</a>
                    </NextLink>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={showUser ? 7 : 6}>
                <div className={styles.noRecords}>
                  <NoDataIcon />
                  <span>{t(`no_records`)}</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {+list.meta.total ? (
        <div className={styles.pagination}>
          <Pagination total={+list.meta.total} page={+list.meta.page} />
        </div>
      ) : null}
    </>
  )
}
export default BridgedRecordList
