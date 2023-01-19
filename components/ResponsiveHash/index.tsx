import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import NextLink from 'next/link'
import Tooltip from 'components/Tooltip'
import CopyBtn from 'components/CopyBtn'
import OpenInNewIcon from 'assets/icons/open-in-new.svg'
import styles from './styles.module.scss'

const ResponsiveHash = ({
  label,
  labelTooltip = null,
  leading = 8,
  href = null,
  isExternalLink = false,
  ellipsisPosition = 'middle',
  monoFont = true,
  btnRight = null,
  copyAlertText = '',
}: {
  label: string
  labelTooltip?: string
  leading?: number
  href?: string
  isExternalLink?: boolean
  ellipsisPosition?: 'middle' | 'end'
  monoFont?: boolean
  btnRight?: 'copy' | 'openInNew' | ReactNode
  copyAlertText?: string
}) => {
  const [isMobile, setIsMobile] = useState(false)
  const [modifiedLabel, setModifiedLabel] = useState(label)

  useEffect(() => {
    const checkIsMobile = () => {
      if (window && window.matchMedia('(max-width: 1024px)').matches) {
        setIsMobile(true)
      } else {
        setIsMobile(false)
      }
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  useEffect(() => {
    if (isMobile && label.length > leading * 2) {
      if (ellipsisPosition === 'middle') {
        setModifiedLabel(`${label.slice(0, leading)}...${label.slice(-leading)}`)
      } else {
        setModifiedLabel(`${label.slice(0, leading)}...`)
      }
    } else {
      setModifiedLabel(label)
    }
  }, [ellipsisPosition, isMobile, label, leading])

  const hash = (
    <div style={{ paddingRight: btnRight ? '6px' : '0' }} className={`${styles.hash} ${monoFont ? 'mono-font' : ''}`}>
      {href ? (
        <NextLink href={href}>
          <a href={href} target={isExternalLink ? '_blank' : '_self'} rel="noopener noreferrer">
            {modifiedLabel}
          </a>
        </NextLink>
      ) : (
        modifiedLabel
      )}
    </div>
  )

  return (
    <div className={styles.container}>
      {labelTooltip ? (
        <Tooltip title={labelTooltip} placement="top">
          {hash}
        </Tooltip>
      ) : (
        hash
      )}

      {btnRight === 'copy' ? <CopyBtn content={label} field={copyAlertText} /> : null}

      {btnRight === 'openInNew' ? (
        <a
          href={href}
          className={styles['open-in-new']}
          target={isExternalLink ? '_blank' : '_self'}
          rel="noopener noreferrer"
        >
          <OpenInNewIcon />
        </a>
      ) : null}

      {!['copy', 'openInNew'].includes(btnRight as string) && btnRight ? btnRight : null}
    </div>
  )
}

export default ResponsiveHash
