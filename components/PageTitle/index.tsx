import { PropsWithChildren } from 'react'
import styles from './styles.module.scss'
interface Props {
  children: React.ReactNode
}

const PageTitle: React.FC<PropsWithChildren<Props>> = ({ children }) => <h5 className={styles.container}>{children}</h5>

export default PageTitle
