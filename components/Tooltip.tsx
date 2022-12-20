import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'

export default styled(({ className, ...props }: TooltipProps) => (
  <Tooltip
    TransitionProps={{ timeout: 200 }}
    arrow
    classes={{ popper: className, tooltip: className }}
    enterTouchDelay={0}
    leaveTouchDelay={1000}
    {...props}
  />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    backgroundColor: '#000000',
    opacity: '1 !important',
    fontSize: 14,
  },
}))
