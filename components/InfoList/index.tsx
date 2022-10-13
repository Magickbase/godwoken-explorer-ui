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
  className?: string
  type?: 'one-column' | 'two-columns'
}> = ({ title, list, style, type = 'one-column', className = '' }) => {
  const midIndex = Math.floor(list.length / 2)

  return (
    <div className={`${styles.container} ${className}`} style={style} data-testid="infoList">
      <div role="list" className={styles.list} data-type={type}>
        {title ? (
          <dl role="listitem" className={styles.title}>
            <dt data-testid="title">{title}</dt>
          </dl>
        ) : null}
        {list
          .filter(v => v)
          .map(({ field, content, expandable, tooltipTitle }, idx) => {
            return (
              <dl
                key={field}
                role="listitem"
                title={field}
                className={styles.item}
                data-show-tooltip={!!tooltipTitle}
                style={{
                  order: type === 'one-column' ? 1 : idx >= midIndex ? (idx - midIndex) * 2 + 1 : idx * 2,
                }}
              >
                <dt className={styles.term}>{field}</dt>
                <dd
                  className={`${styles.desc} ${tooltipTitle ? 'tooltip' : ''}`}
                  data-tooltip={tooltipTitle}
                  data-show-tooltip={!!tooltipTitle}
                  data-expandable={expandable}
                  data-testid="item-content"
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
