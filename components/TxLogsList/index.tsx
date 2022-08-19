import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { Link } from '@mui/material'
import { ParsedEventLog } from 'utils'
import LogFieldItem from 'components/LogItemField'
import NoDataIcon from 'assets/icons/no-data.svg'
import styles from './styles.module.scss'

const TxLogsList = ({ list }: { list: ParsedEventLog[] }) => {
  const [t] = useTranslation('tx')

  return list?.length ? (
    <div className={styles.container}>
      <div className={styles.title}>{t('txReceiptEventLogs')}</div>
      {list.map((log, i) => {
        const topics = log.topics.map((value, i) => {
          const parsed =
            log.parsedLog?.eventFragment.inputs[i - 1]?.type === 'address'
              ? { type: 'address', hex: log.parsedLog.args[i - 1] }
              : log.parsedLog?.args[i - 1] ?? undefined
          return { value, parsed }
        })

        const indexedCount = log.parsedLog?.eventFragment.inputs.filter(i => i.indexed).length ?? 0
        const dataList = log.data
          ?.slice(2)
          .match(/\w{64}/g)
          .map((frag, i) => {
            const parsed =
              log.parsedLog?.eventFragment.inputs[i + indexedCount]?.type === 'address'
                ? { type: 'address', hex: log.parsedLog.args[i + indexedCount] }
                : log.parsedLog?.args[i + indexedCount] ?? undefined
            return { value: `0x${frag}`, parsed }
          })

        return (
          <div key={log.id} className={styles.logItem}>
            <div className={styles.logIndex}>{i}</div>
            <div style={{ flex: 1 }}>
              <div className={styles.contractAddr}>
                <div className={styles.field}>{t(`address`)}</div>
                <NextLink href={`/account/${log.addressHash}`}>
                  <a href={`/account/${log.addressHash}`} className="mono-font">
                    {log.addressHash}
                  </a>
                </NextLink>
              </div>
              {log.parsedLog ? (
                <div className={styles.eventSignature}>
                  <div className={styles.field}>{t(`name`)}</div>
                  <div className="mono-font">
                    <span>{`${log.parsedLog.eventFragment.name} (`}</span>
                    {log.parsedLog.eventFragment.inputs.map((inp, idx) => {
                      return (
                        <div key={inp.name}>
                          {inp.indexed ? <span>{`index_topic_${idx + 1}`}</span> : null}
                          <span style={{ color: '#23C09B', padding: '0 8px' }}>{inp.type}</span>
                          <span style={{ color: '#F83F3F' }}>{inp.name}</span>
                          {idx === log.parsedLog.eventFragment.inputs.length - 1 ? null : ', '}
                        </div>
                      )
                    })}
                    <span>)</span>
                  </div>
                  <NextLink href={`/account/${log.addressHash}?tab=contract`}>
                    <Link
                      href={`/account/${log.addressHash}?tab=contract`}
                      underline="none"
                      color="primary.main"
                      whiteSpace="nowrap"
                      ml={2}
                    >
                      {t(`viewSource`)}
                    </Link>
                  </NextLink>
                </div>
              ) : null}
              <div className={styles.topics}>
                <div className={styles.field}>{t(`topics`)}</div>
                <div className={styles.topicList}>
                  {topics.map((topic, idx) =>
                    topic.value === '0x' ? null : (
                      <div key={`${topic.value}-${idx}`} className={styles.topicItem}>
                        <div className={styles.topicIndex}>{idx}</div>
                        <LogFieldItem {...topic} />
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className={styles.data}>
                <div className={styles.field}>{t(`data`)}</div>
                <div className={styles.dataList}>
                  {dataList.map((d, idx) => (
                    <div key={`${d.value}-${idx}`} className={styles.dataItem}>
                      <LogFieldItem {...d} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  ) : (
    <div className={styles.noRecords}>
      <NoDataIcon />
      <span>{t('noLogs')}</span>
    </div>
  )
}

export default TxLogsList
