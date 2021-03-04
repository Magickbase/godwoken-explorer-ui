import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { IMG_URL, SEARCH_FIELDS } from 'utils'

const Custom404 = () => {
  const [t] = useTranslation('common')
  const { query, back } = useRouter()
  return (
    <div className="notFound">
      {query.keyword ? (
        <>
          {t('notFoundMessage', { keyword: query.keyword })}
          <b className="block mt-1">{SEARCH_FIELDS}</b>
        </>
      ) : (
        <>{t('pageNotFound')}</>
      )}
      <span className="flex items-center text-secondary text-sm mt-6 gap-1" onClick={back}>
        <Image
          src={`${IMG_URL}arrow-down.svg`}
          width="12"
          height="12"
          layout="fixed"
          loading="lazy"
          className="transform rotate-90"
        />
        {t('back')}
      </span>
    </div>
  )
}

export const getStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common'])
  return {
    props: lng,
  }
}

export default Custom404
