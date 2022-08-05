import NextLink from 'next/link'
import styles from './styles.module.scss'

interface TabsProps {
  tabs: Array<Record<'label' | 'href', string>>
  value: number
}

const Tabs: React.FC<TabsProps> = ({ tabs, value }) => {
  return (
    <div className={styles.container} data-role="tabs">
      <div className={styles.tabs}>
        {tabs.map(({ label, href }, idx) =>
          href ? (
            <NextLink href={href} key={label} scroll={false}>
              <a title={label} data-active={idx === value} role="tab">
                {label}
              </a>
            </NextLink>
          ) : (
            <span key={label} title={label} data-active={idx === value} role="tab">
              {label}
            </span>
          ),
        )}
      </div>
    </div>
  )
}

export default Tabs
