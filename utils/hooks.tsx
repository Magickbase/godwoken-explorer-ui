import Image from 'next/image'
import { useState, useMemo } from 'react'
import { IMG_URL } from './constants'

export const useIsHidden = () => {
  const [isHidden, setisHidden] = useState(true)
  return useMemo(() => {
    const handleShowScript = () => setisHidden(h => !h)
    const HiddenIcon = () => (
      <span
        onClick={handleShowScript}
        className="flex items-center cursor-pointer"
        style={{ transform: isHidden ? 'unset' : 'rotate(0.5turn)' }}
      >
        <Image loading="lazy" src={`${IMG_URL}show-more.svg`} width="17" height="17" alt="toggle" layout="fixed" />
      </span>
    )
    return [isHidden, HiddenIcon] as [boolean, () => JSX.Element]
  }, [isHidden, setisHidden])
}
