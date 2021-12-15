import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { EXPLORER_TITLE, IMG_URL } from 'utils'

const Header = () => {
  const [t] = useTranslation('common')
  return (
    <>
      <header className="fixed t-0 l-0 w-full h-14 bg-black flex z-50">
        <div className="main-container flex-row items-center">
          <Image src={`${IMG_URL}nervina-logo.svg`} loading="lazy" width="31" height="20" layout="fixed" alt="logo" />
          <Link href="/">
            <a title={EXPLORER_TITLE} className="text-xl whitespace-nowrap leading-default text-white font-bold ml-2">
              {EXPLORER_TITLE}
            </a>
          </Link>
        </div>
      </header>

      <div className="fixed top-0 flex items-center text-white group z-[100] left-[280px] xl:left-[calc(50%-350px)]">
        <div className="h-14 flex items-center">{t(`token`)}</div>
        <div className="absolute flex flex-col top-12 right-1/2 transform translate-x-1/2 whitespace-nowrap bg-white shadow-md rounded-lg px-0.5 py-0.5 duration-300 opacity-0 invisible group-hover:visible group-hover:opacity-100">
          {['bridge', 'native'].map(type => (
            <Link href={`/tokens/${type}`} key={type}>
              <a href={`/tokens/${type}`} className="px-4 py-2 rounded-md hover:text-white hover:bg-secondary">
                {t(`${type}-udt`)}
              </a>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
export default Header
