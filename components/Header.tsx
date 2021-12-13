import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { EXPLORER_TITLE, IMG_URL } from 'utils'

const Header = () => {
  const [t] = useTranslation('common')
  const { pathname } = useRouter()
  const isHomepage = pathname === '/'
  const isErrorPage = ['/404', '/error'].includes(pathname)
  const isTokenMenuPositionFixed = isHomepage || isErrorPage
  return (
    <header className="fixed t-0 l-0 w-full h-14 bg-black flex z-50">
      <div className="main-container flex-row items-center">
        <Image src={`${IMG_URL}nervina-logo.svg`} loading="lazy" width="31" height="20" layout="fixed" alt="logo" />
        <Link href="/">
          <a title={EXPLORER_TITLE} className="text-xl whitespace-nowrap leading-default text-white font-bold ml-2">
            {EXPLORER_TITLE}
          </a>
        </Link>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            marginLeft: 'auto',
            color: '#fff',
          }}
          className={isTokenMenuPositionFixed ? 'mr-12 group' : 'mr-12  md:mr-[344px] group'}
        >
          <span>{t(`token`)}</span>
          <div
            className="absolute flex flex-col top-8 transform whitespace-nowrap bg-white shadow-md rounded-lg px-0.5 py-0.5 duration-300 opacity-0 invisible group-hover:visible group-hover:opacity-100"
            style={{
              right: isTokenMenuPositionFixed ? '0' : '50%',
              transform: isTokenMenuPositionFixed ? 'translateX(0)' : 'translateX(50%)',
            }}
          >
            {['bridge', 'native'].map(type => (
              <Link href={`/tokens/${type}`} key={type}>
                <a href={`/tokens/${type}`} className="px-4 py-2 rounded-md hover:text-white hover:bg-secondary">
                  {t(`${type}-udt`)}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
export default Header
