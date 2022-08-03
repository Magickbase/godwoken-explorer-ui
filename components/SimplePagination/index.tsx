import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import NextPageIcon from 'assets/icons/next-page.svg'
import PageSize, { SIZES } from 'components/PageSize'
import styles from './styles.module.scss'

const SimplePagination: React.FC<Partial<Record<'before' | 'after' | 'pageSize' | 'note', string>>> = ({
  before,
  after,
  pageSize,
  note,
}) => {
  const [t] = useTranslation('common')
  const {
    query: { before: _before, after: _after, id: _, ...query },
    asPath,
  } = useRouter()
  const url = asPath.split('?')[0] ?? ''

  const prevPage = `${url}?${new URLSearchParams({ ...query, before })}`
  const nextPage = `${url}?${new URLSearchParams({ ...query, after })}`

  return (
    <div className={styles.container}>
      <PageSize pageSize={Number.isNaN(+pageSize) ? +SIZES[1] : +pageSize} />

      {note ? <div className={styles.note}>{note}</div> : null}

      <div className={styles.pages}>
        <NextLink href={prevPage}>
          <a title={t(`prev`)} data-disabled={!before}>
            <NextPageIcon />
          </a>
        </NextLink>
        <NextLink href={nextPage}>
          <a title={t(`next`)} data-disabled={!after}>
            <NextPageIcon />
          </a>
        </NextLink>
      </div>
    </div>
  )
}

export default SimplePagination
