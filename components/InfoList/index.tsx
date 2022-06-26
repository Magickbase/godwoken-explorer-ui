import styles from './styles.module.scss'

const InfoList: React.FC<{ list: Array<{ field: string; content: React.ReactNode }>; style?: React.CSSProperties }> = ({
  list,
  style,
}) => {
  return (
    <div className={styles.container} style={style}>
      <div role="list">
        {list.map(({ field, content }) => {
          return (
            <dl key={field} role="listitem">
              <dt>{field}</dt>
              <dd>{content}</dd>
            </dl>
          )
        })}
      </div>
    </div>
  )
}

export default InfoList
