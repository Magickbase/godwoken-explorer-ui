import styles from './styles.module.scss'

const InfoList: React.FC<{
  title?: string
  list: Array<{ field: string; content: React.ReactNode }>
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
          .map(({ field, content }, idx) => {
            return (
              <dl
                key={field}
                role="listitem"
                title={field}
                className={styles.item}
                style={{ order: type === 'one-column' ? 1 : idx >= midIndex ? (idx - midIndex) * 2 + 1 : idx * 2 }}
              >
                <dt className={styles.term}>{field}</dt>
                <dd className={styles.desc}>{content}</dd>
              </dl>
            )
          })}
      </div>
    </div>
  )
}

export default InfoList
