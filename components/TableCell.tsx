import { TableCell, tableCellClasses } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.root}`]: {
    color: theme.palette.secondary.main,
    fontWeight: 400,
    width: '20%',
    padding: 8,
    borderColor: '#f0f0f0',
    [theme.breakpoints.down('sm')]: {
      minWidth: 120,
    },
  },
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#fafafa',
    color: theme.palette.secondary.light,
    whiteSpace: 'nowrap',
    height: 48,
    fontSize: 14,
    [theme.breakpoints.down('sm')]: {
      fontSize: 12,
      height: 32,
    },
  },
  [`&.${tableCellClasses.body}`]: {
    height: 64,
    [theme.breakpoints.down('sm')]: {
      height: 52.5,
    },
  },
}))

export default StyledTableCell
