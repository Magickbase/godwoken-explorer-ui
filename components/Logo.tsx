import { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import LogoSvg from '../assets/icons/nervina-logo.svg'
import { EXPLORER_TITLE, fetchVersion } from 'utils'

function Logo(props: SvgIconProps) {
  const [version, setVersion] = useState<string | null>(null)

  useEffect(() => {
    fetchVersion()
      .then(versions => {
        setVersion(versions.godwokenVersion?.split(' ')[0])
      })
      .catch(() => {
        /* ignore */
      })
  }, [setVersion])

  return (
    <Box>
      <SvgIcon {...props} sx={{ height: 16 }} component={LogoSvg} viewBox="0 0 27 16" />
      <Typography
        component="span"
        fontFamily="DIN Pro"
        fontStyle="italic"
        sx={{ mr: '1px', fontSize: { xs: '14.67px', md: '16px' } }}
      >
        {EXPLORER_TITLE}
      </Typography>
      {version ? (
        <Typography
          component="span"
          fontFamily="DIN Pro"
          fontStyle="italic"
          sx={{ fontSize: { xs: '10px', md: '12px' }, fontVariant: 'all-petite-caps' }}
        >
          V{version}
        </Typography>
      ) : null}
    </Box>
  )
}

export default Logo
