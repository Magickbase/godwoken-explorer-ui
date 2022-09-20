import styles from './styles.module.scss'

export interface InfoItermProps {
  field: string
  content: React.ReactNode
  expandable?: boolean
  tooltipTitle?: string
}

const InfoList: React.FC<{
  title?: string | React.ReactNode
  list: Array<InfoItermProps>
  style?: React.CSSProperties
  type?: 'one-column' | 'two-columns'
}> = ({ title, list, style, type = 'one-column' }) => {
  const midIndex = Math.floor(list.length / 2)

  return (
    <div className={styles.container} style={style}>
      <div role="list" className={styles.list} data-type={type}>
        {title ? (
          <dl role="listitem" className={styles.title}>
            <dt>{title}</dt>
          </dl>
        ) : null}
        {list
          .filter(v => v)
          .map(({ field, content, expandable, tooltipTitle }, idx) => {
            const overflow = tooltipTitle ? 'visible' : 'hidden'
            const tooltipStyle = tooltipTitle ? { overflow: 'visible', display: 'grid' } : {}

            return (
              <dl
                key={field}
                role="listitem"
                title={field}
                className={styles.item}
                style={{
                  overflow,
                  order: type === 'one-column' ? 1 : idx >= midIndex ? (idx - midIndex) * 2 + 1 : idx * 2,
                }}
              >
                <dt className={styles.term}>{field}</dt>
                <dd
                  style={{
                    ...tooltipStyle,
                  }}
                  className={`${styles.desc} ${tooltipTitle ? 'tooltip' : ''}`}
                  data-tooltip={tooltipTitle}
                  data-expandable={expandable}
                >
                  {content}
                </dd>
              </dl>
            )
          })}
      </div>
    </div>
  )
}

export default InfoList
