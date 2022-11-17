import { useState } from 'react'
import NextLink from 'next/link'
import BigNumber from 'bignumber.js'
import { Link } from '@mui/material'
import styles from './styles.module.scss'

const LogFieldItem: React.FC<{ value: string; parsed?: Record<'type' | 'hex', string> }> = ({ value, parsed }) => {
  const [fmt, setFmt] = useState<'dec' | 'hex'>(parsed ? 'dec' : 'hex')

  let comp = null

  switch (parsed?.type) {
    case 'address': {
      comp = (
        <NextLink href={`/account/${parsed.hex.toLowerCase()}`}>
          <Link
            href={`/account/${parsed.hex.toLowerCase()}`}
            underline="none"
            color="primary.main"
            className="mono-font"
            whiteSpace="nowrap"
          >
            {parsed.hex.toLowerCase()}
          </Link>
        </NextLink>
      )

      break
    }
    case 'BigNumber': {
      comp = new BigNumber(parsed.hex).toFormat().replace(/,/g, '')
      break
    }
    default: {
      comp = value
    }
  }
  return (
    <div className={styles.logItemWithToggle}>
      <div className={`mono-font ${styles.content}`}>{fmt === 'hex' ? value : comp}</div>
      {parsed ? (
        <div className={styles.toggle}>
          {['dec', 'hex'].map(label => (
            <span key={label} data-active={label === fmt} onClick={() => setFmt(label as any)}>
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

LogFieldItem.displayName = 'LogFieldItem'

export const LogFieldItemInTx: React.FC<{ value: string; type: string; indexed: boolean; parsed: any }> = ({
  value,
  type,
  parsed,
}) => {
  const [isDecoded, setIsDecoded] = useState(true)

  if (type === 'hex') {
    return (
      <div className={styles.logItemWithToggle}>
        <div className={`mono-font ${styles.content}`}>{value}</div>
      </div>
    )
  }

  switch (type) {
    case 'address': {
      return (
        <div className={styles.logItemWithToggle}>
          <div className={`mono-font ${styles.content}`}>
            {
              <NextLink href={`/account/${value}`}>
                <Link
                  href={`/account/${value}`}
                  underline="none"
                  color="primary.main"
                  className="mono-font"
                  whiteSpace="nowrap"
                >
                  {parsed.toLowerCase()}
                </Link>
              </NextLink>
            }
          </div>
        </div>
      )
    }

    default: {
      return (
        <div className={styles.logItemWithToggle}>
          <div className={`mono-font ${styles.content}`}>{isDecoded ? `${parsed}` : value}</div>
          <div className={styles.toggle}>
            {['dec', 'hex'].map(label => (
              <span key={label} data-active={isDecoded && label === 'dec'} onClick={() => setIsDecoded(d => !d)}>
                {label}
              </span>
            ))}
          </div>
        </div>
      )
    }
  }
}

export default LogFieldItem
