import { ReactNode } from 'react'
import NextLink from 'next/link'
import { Box, SxProps, useMediaQuery } from '@mui/material'
import Tooltip from 'components/Tooltip'
import CopyBtn from 'components/CopyBtn'
import OpenInNewIcon from 'assets/icons/open-in-new.svg'
import { theme } from 'utils'

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
  sx = {},
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
  sx?: SxProps
}) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const originalLabel = label
  const flexLayout = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: isMobile ? 'space-between' : 'flex-start',
  }

  if (isMobile && label.length > leading * 2) {
    if (ellipsisPosition === 'middle') {
      label = `${label.slice(0, leading)}...${label.slice(-leading)}`
    } else {
      label = `${label.slice(0, leading)}...`
    }
  }

  const hash = (
    <Box pr={btnRight ? '6px' : '0'} component="span" className={monoFont ? 'mono-font' : ''}>
      {href ? (
        <NextLink href={href}>
          <a href={href} target={isExternalLink ? '_blank' : '_self'} rel="noopener noreferrer">
            {label}
          </a>
        </NextLink>
      ) : (
        label
      )}
    </Box>
  )

  return (
    <Box
      sx={{
        width: '100%',
        ...flexLayout,
        ...sx,
      }}
      component="span"
    >
      {labelTooltip ? (
        <Tooltip title={labelTooltip} placement="top">
          {hash}
        </Tooltip>
      ) : (
        hash
      )}

      {btnRight === 'copy' ? <CopyBtn content={originalLabel} field={copyAlertText} /> : null}

      {btnRight === 'openInNew' ? (
        <a
          href={href}
          className={monoFont ? 'mono-font' : ''}
          target={isExternalLink ? '_blank' : '_self'}
          rel="noopener noreferrer"
          style={{ ...flexLayout }}
        >
          <OpenInNewIcon />
        </a>
      ) : null}

      {!['copy', 'openInNew'].includes(btnRight as string) && btnRight ? btnRight : null}
    </Box>
  )
}

export default ResponsiveHash
