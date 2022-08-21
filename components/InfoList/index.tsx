import styles from './styles.module.scss'

const InfoList: React.FC<{
  title?: string
  list: Array<{ field: string; content: React.ReactNode; expandable?: boolean }>
  style?: React.CSSProperties
  type?: 'one-column' | 'two-columns'
  titleSuffix?: Array<React.ReactNode>
}> = ({ title, list, style, type = 'one-column', titleSuffix }) => {
  const midIndex = Math.floor(list.length / 2)

  return (
    <div className={styles.container} style={style}>
      <div role="list" className={styles.list} data-type={type}>
        {title ? (
          <dl role="listitem" className={styles.title}>
            <dt>{title}</dt>
            <dd>{titleSuffix}</dd>
          </dl>
        ) : null}
        {list
          .filter(v => v)
          .map(({ field, content, expandable }, idx) => {
            return (
              <dl
                key={field}
                role="listitem"
                title={field}
                className={styles.item}
                style={{ order: type === 'one-column' ? 1 : idx >= midIndex ? (idx - midIndex) * 2 + 1 : idx * 2 }}
              >
                <dt className={styles.term}>{field}</dt>
                <dd className={styles.desc} data-expandable={expandable}>
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
