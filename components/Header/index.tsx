import styles from './header.module.scss'

const Header = () => (
  <header className={styles.container}>
    <div>Agera</div>
    <div className={styles.search}>
      <input type="text" placeholder="Search block, transaction, account..." />
    </div>
    <div></div>
  </header>
)
export default Header
