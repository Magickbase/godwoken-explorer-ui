import { GetStaticProps } from 'next'
import { Container } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import SubpageHead from 'components/SubpageHead'

const Notification = () => {
  const [t] = useTranslation('notification')
  return (
    <>
      <SubpageHead subtitle={'notification'} />
      <Container className="full-height" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {t(`under-upgrade`)}
      </Container>
    </>
  )
}
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common', 'notification'])
  return {
    props: lng,
  }
}

export default Notification
