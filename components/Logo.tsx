import { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import LogoSvg from '../assets/nervina-logo.svg'
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
    <Box sx={{ width: 100 }}>
      <SvgIcon {...props} sx={{ height: 16 }} component={LogoSvg} viewBox="0 0 27 16" />
      <Typography component="span" fontFamily="DIN Pro" fontSize={14} fontStyle="italic" sx={{ mr: '1px' }}>
        {EXPLORER_TITLE}
      </Typography>
      <Typography component="span" fontFamily="DIN Pro" fontSize={7.3} fontStyle="italic">
        V{version}
      </Typography>
    </Box>
  )
}

export default Logo
