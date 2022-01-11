import { GetStaticProps } from 'next'
import { Container } from '@mui/material'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'

const CustomError = () => {
  const { query } = useRouter()
  return (
    <Container className="full-height" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {query.message ?? 'Unknown error'}
    </Container>
  )
}
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common'])
  return {
    props: lng,
  }
}

export default CustomError
