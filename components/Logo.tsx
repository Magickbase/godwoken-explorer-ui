import { Box, Typography } from '@mui/material'
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import LogoSvg from '../assets/nervina-logo.svg'
import { EXPLORER_TITLE, GW_VERSION } from 'utils'

function Logo(props: SvgIconProps) {
  return (
    <Box sx={{ width: 90 }}>
      <SvgIcon {...props} sx={{ height: 16 }} component={LogoSvg} viewBox="0 0 27 16" />
      <Typography component="span" fontFamily="DIN Pro" fontSize={14} fontStyle="italic" sx={{ mr: '1px' }}>
        {EXPLORER_TITLE}
      </Typography>
      <Typography component="span" fontFamily="DIN Pro" fontSize={7.3} fontStyle="italic">
        V{GW_VERSION}
      </Typography>
    </Box>
  )
}

export default Logo
