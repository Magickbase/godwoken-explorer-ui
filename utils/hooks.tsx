import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Socket } from 'phoenix'
import { CHANNEL, IMG_URL, WS_ENDPOINT } from './constants'

export const useIsHidden = () => {
  const [isHidden, setisHidden] = useState(true)
  return useMemo(() => {
    const handleShowScript = () => setisHidden(h => !h)
    const HiddenIcon = () => (
      <span
        onClick={handleShowScript}
        className="flex items-center cursor-pointer"
        style={{ transform: isHidden ? 'unset' : 'rotate(0.5turn)' }}
        aria-label="toggle"
      >
        <Image loading="lazy" src={`${IMG_URL}show-more.svg`} width="17" height="17" alt="toggle" layout="fixed" />
      </span>
    )
    return [isHidden, HiddenIcon] as [boolean, () => JSX.Element]
  }, [isHidden, setisHidden])
}

export const useWS = (
  channel: CHANNEL | string,
  onJoin: (res?: any) => void,
  onReceivingData: (res?: any) => void,
  deps = [],
) => {
  useEffect(() => {
    if (!channel) {
      return
    }
    const socket = new Socket(WS_ENDPOINT)
    socket.connect()
    const _channel = socket.channel(channel)
    _channel.on('refresh', onReceivingData)
    _channel.join().receive('ok', onJoin).receive('error', console.warn)
    return () => {
      socket.disconnect(() => {
        console.info(`disconnect to ${channel}`)
      })
    }
  }, deps)
}

const debounce = (func: Function, wait: number) => {
  let timer: NodeJS.Timeout
  return (...args: any) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

export const useDebounce = (func: Function, wait: number = 300) => {
  const createDebouncedCallback = useCallback(
    (func: Function) => {
      return debounce(func, wait)
    },
    [wait],
  )

  const debouncedCallbackRef = useRef(createDebouncedCallback(func))

  useEffect(() => {
    debouncedCallbackRef.current = createDebouncedCallback(func)
  }, [func, createDebouncedCallback])

  return debouncedCallbackRef.current
}
