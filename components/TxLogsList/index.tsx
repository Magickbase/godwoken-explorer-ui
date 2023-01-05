import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { Link } from '@mui/material'
import { utils, providers } from 'ethers'
import { LogFieldItemInTx as LogFieldItem } from 'components/LogItemField'
import NoDataIcon from 'assets/icons/no-data.svg'
import styles from './styles.module.scss'

const TxLogsList = ({
  list,
  abiList,
}: {
  list: Array<providers.Log>
  abiList: Record<string, { abi: Array<any> | null }>
}) => {
  const [t] = useTranslation('tx')

  return list?.length ? (
    <div className={styles.container}>
      <div className={styles.title}>{t('txReceiptEventLogs')}</div>
      {list.map((log, i) => {
        const address = log.address.toLowerCase()
        const abi = abiList[`contract_${address}`]?.abi ?? null
        let parsed = null
        if (abi) {
          try {
            parsed = new utils.Interface(abi).parseLog(log)
          } catch (e) {
            console.warn(e.message)
            // ignore
          }
        }
        const inputs = [
          ...log.topics,
          ...log.data
            .slice(2)
            .match(/\w{64}/g)
            .map(v => `0x${v}`),
        ].map((value, idx) => {
          const parsedInput = parsed?.eventFragment.inputs[idx - 1]
          return {
            value,
            type: parsedInput?.type || 'hex',
            indexed: parsedInput?.indexed || false,
            parsed: parsed?.args[idx - 1] ?? null,
          }
        })

        return (
          <div key={log.logIndex} className={styles.logItem}>
            <div className={styles.logIndex}>{i}</div>
            <div style={{ flex: 1 }}>
              <div className={styles.contractAddr}>
                <div className={styles.field}>{t(`address`)}</div>
                <NextLink href={`/account/${address}`}>
                  <a href={`/account/${address}`} className="mono-font">
                    {address}
                  </a>
                </NextLink>
              </div>
              {parsed ? (
                <div className={styles.eventSignature}>
                  <div className={styles.field}>{t(`name`)}</div>
                  <div className="mono-font">
                    <span>{`${parsed.eventFragment.name} (`}</span>
                    {parsed.eventFragment.inputs.map((inp, idx) => {
                      return (
                        <div key={inp.name}>
                          {inp.indexed ? <span>{`index_topic_${idx + 1}`}</span> : null}
                          <span style={{ color: '#23C09B', padding: '0 8px' }}>{inp.type}</span>
                          <span style={{ color: '#F83F3F' }}>{inp.name}</span>
                          {idx === parsed.eventFragment.inputs.length - 1 ? null : ', '}
                        </div>
                      )
                    })}
                    <span>)</span>
                  </div>
                  <NextLink href={`/account/${address}?tab=contract`}>
                    <Link
                      href={`/account/${log.address}?tab=contract`}
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
                  {inputs.slice(0, log.topics.length).map((topic, idx) => (
                    <div key={`${topic.value}-${idx}`} className={styles.topicItem}>
                      <div className={styles.topicIndex}>{idx}</div>
                      <LogFieldItem {...topic} />
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.data}>
                <div className={styles.field}>{t(`data`)}</div>
                <div className={styles.dataList}>
                  {inputs.slice(log.topics.length).map((d, idx) => (
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
