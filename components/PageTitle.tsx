import { Typography } from '@mui/material'
const PageTitle: React.FC = ({ children }) => (
  <Typography
    sx={{ textTransform: 'capitalize' }}
    variant="h5"
    letterSpacing={1}
    fontWeight={600}
    py={2}
    overflow="hidden"
    textOverflow="ellipsis"
  >
    {children}
  </Typography>
)

export default PageTitle
