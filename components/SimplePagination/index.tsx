import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import NextPageIcon from 'assets/icons/next-page.svg'
import styles from './styles.module.scss'

const SimplePagination: React.FC<Record<'before' | 'after', string | null>> = ({ before, after }) => {
  const [t] = useTranslation('common')
  const {
    query: { before: _before, after: _after, id: _, ...query },
    asPath,
  } = useRouter()
  const url = asPath.split('?')[0] ?? ''

  if (!before && !after) {
    return null
  }

  const prevPage = `${url}?${new URLSearchParams({ ...query, before })}`
  const nextPage = `${url}?${new URLSearchParams({ ...query, after })}`

  return (
    <div className={styles.container}>
      {before ? (
        <NextLink href={prevPage}>
          <a title={t(`prev`)} className={styles.prev}>
            <NextPageIcon />
          </a>
        </NextLink>
      ) : null}
      {after ? (
        <NextLink href={nextPage}>
          <a title={t(`next`)} className={styles.next}>
            <NextPageIcon />
          </a>
        </NextLink>
      ) : null}
    </div>
  )
}

export default SimplePagination
