import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'

export default styled(({ className, ...props }: TooltipProps) => (
  <Tooltip TransitionProps={{ timeout: 200 }} arrow classes={{ popper: className, tooltip: className }} {...props} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    backgroundColor: '#000',
    opacity: '0.8 !important',
    fontSize: 14,
  },
}))
