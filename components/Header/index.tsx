import styles from './header.module.scss'
import Search from 'components/Search'

const Header = () => (
  <header className={styles.container}>
    <div>Agera</div>
    <Search />
    <div></div>
  </header>
)
export default Header
