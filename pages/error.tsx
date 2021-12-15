import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'

const CustomError = () => {
  const { query } = useRouter()
  return <div className="errorPage">{query.message ?? 'Unknown error'}</div>
}
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common'])
  return {
    props: lng,
  }
}

export default CustomError
