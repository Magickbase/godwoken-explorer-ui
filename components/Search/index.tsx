import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { IMG_URL, SEARCH_FIELDS, fetchSearch } from 'utils'
import styles from './search.module.css'

const TOP = 50
type Position = 'home' | 'header' | 'middle'
const Search = () => {
  let defaultPosition: Position = 'header'

  const { pathname, push, locale } = useRouter() // '/' | '/404' |'other'
  switch (pathname) {
    case '/': {
      defaultPosition = 'home'
      break
    }
    case '/404': {
      defaultPosition = 'middle'
      break
    }
    case '/error': {
      defaultPosition = 'middle'
      break
    }
    default: {
      break
    }
  }

  const [position, setPosition] = useState<Position>(defaultPosition)
  const [isDisplay, setIsDisplay] = useState(false)

  useEffect(() => {
    let timer
    clearTimeout(timer)

    if (defaultPosition !== 'home') {
      setPosition(defaultPosition)
      return
    }

    const updatePosition = () => {
      if (window.pageYOffset >= TOP) {
        setPosition('header')
      } else {
        setPosition(defaultPosition)
      }
    }

    updatePosition()

    const listener = () => {
      timer = setTimeout(updatePosition, 100)
    }

    window.addEventListener('scroll', listener)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', listener)
    }
  }, [setPosition, defaultPosition])

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const keyword = e.currentTarget['search']?.value
    fetchSearch(keyword)
      .then(push)
      .catch(err => window.alert(err.message))
  }

  return (
    <form className={styles.container} onSubmit={handleSubmit} attr-position={position} attr-display={`${isDisplay}`}>
      <div className={styles.toggle} onClick={() => setIsDisplay(is => !is)}>
        {isDisplay ? (
          <Image src={`${IMG_URL}close.svg`} width="24" height="24" loading="lazy" layout="fixed" />
        ) : (
          <Image src={`${IMG_URL}search.svg`} width="24" height="24" loading="lazy" layout="fixed" />
        )}
      </div>
      <div className={styles.icon}>
        <Image src={`${IMG_URL}search.svg`} width="18" height="17" loading="lazy" layout="fixed" title="search" />
      </div>
      <input id="search" type="text" placeholder={SEARCH_FIELDS} autoFocus title={SEARCH_FIELDS} />
      <button type="submit">{locale === 'zh-CN' ? '搜索' : 'Search'}</button>
    </form>
  )
}

export default Search
