import styles from './styles.module.scss'
const Table: React.FC = ({ children }) => (
  <div className={styles.container}>
    <table>{children}</table>
  </div>
)
export default Table
