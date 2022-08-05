import styles from './styles.module.scss'

const TxType = ({ type }: { type: string }) =>
  type ? <div className={styles.container}>{type.replace(/_/g, ' ').toLowerCase()}</div> : null

export default TxType
