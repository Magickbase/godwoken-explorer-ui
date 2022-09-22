import { CSSProperties } from 'react'
import styles from './styles.module.scss'

const Table: React.FC<JSX.IntrinsicElements['div']> = ({ children, style }) => (
  <div style={{ ...style }} className={styles.container}>
    <table>{children}</table>
  </div>
)
export default Table
