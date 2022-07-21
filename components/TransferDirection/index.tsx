import styles from './styles.module.scss'

const TransferDirection: React.FC<Record<'from' | 'to' | 'viewer', string>> = ({ from, to, viewer }) => {
  switch (true) {
    case from === to: {
      return (
        <div className={styles.container} data-type="self">
          self
        </div>
      )
    }
    case from === viewer: {
      return (
        <div className={styles.container} data-type="out">
          out
        </div>
      )
    }
    case to === viewer: {
      return (
        <div className={styles.container} data-type="in">
          in
        </div>
      )
    }
    default: {
      return null
    }
  }
}

TransferDirection.displayName = 'TransferDirection'

export default TransferDirection
