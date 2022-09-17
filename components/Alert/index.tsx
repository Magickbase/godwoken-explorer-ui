import { AlertProps, SnackbarProps, Snackbar, Alert as MuiAlert, AlertColor } from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ErrorIcon from '@mui/icons-material/Error'
import { useEffect, useState } from 'react'

const StyledSnackbar = styled((props: SnackbarProps) => <Snackbar {...props} />)(({ theme }) => ({
  '&.MuiSnackbar-root': {
    top: theme.spacing(20),
    [theme.breakpoints.down('sm')]: {
      top: theme.spacing(1),
    },
    div: {
      'borderRadius': 8,
      '.MuiAlert-filledSuccess': {
        backgroundColor: '#F0FCF1',
        color: '#2BD56F',
        svg: {
          color: '#2BD56F',
        },
      },
      '.MuiAlert-filledError': {
        backgroundColor: '#FCF0F0',
        color: '#F83F3F',
        svg: {
          color: '#F83F3F',
        },
      },
      '.MuiAlert-filledWarning': {
        backgroundColor: '#FAF0E1',
        color: '#F3B515',
        svg: {
          color: '#F3B515',
        },
      },
    },
  },
}))

const StyledAlert = styled((props: AlertProps) => <MuiAlert {...props} />)(({ theme }) => ({
  '&.MuiAlert-filled': {
    display: 'flex',
    alignItems: 'center',
    width: 'auto',
    height: '48px',
    [theme.breakpoints.down('sm')]: {
      height: '40px',
    },
  },
  '& .MuiAlert-icon': {
    marginRight: theme.spacing(1),
    svg: {
      fontSize: 16,
      [theme.breakpoints.down('sm')]: {
        fontSize: 14,
      },
    },
  },
  '& .MuiAlert-message': {
    fontSize: 14,
    [theme.breakpoints.down('sm')]: {
      fontSize: 13,
    },
  },
}))

// extent mui SnackBar + Alert with custom styles
const Alert: React.FC<SnackbarProps & { content: string; type: 'error' | 'success' | 'warning' }> = ({
  content,
  type,
  ...rest
}) => {
  const [severity, setSeverity] = useState<AlertColor>()

  useEffect(() => {
    if (type) {
      setSeverity(type)
    }
  }, [type])

  return (
    <StyledSnackbar
      anchorOrigin={{
        horizontal: 'center',
        vertical: 'top',
      }}
      autoHideDuration={3000}
      color="secondary"
      {...rest}
    >
      <div>
        <StyledAlert
          severity={severity}
          variant="filled"
          iconMapping={{ error: <CancelIcon />, success: <CheckCircleIcon />, warning: <ErrorIcon /> }}
        >
          {content}
        </StyledAlert>
      </div>
    </StyledSnackbar>
  )
}
export default Alert
