import { createTheme } from '@mui/material/styles'
import { red, green, orange } from '@mui/material/colors'

export const theme = createTheme({
  palette: {
    primary: {
      light: '#525b66',
      main: '#29323c',
      dark: '#000a16',
      contrastText: '#fff',
    },
    secondary: {
      light: '#a255ff',
      main: '#651fff',
      dark: '#0100ca',
    },
    success: {
      light: green.A400,
      main: green[300],
      dark: green[800],
    },
    error: {
      main: red.A400,
    },
    info: {
      light: orange[500],
      main: orange[700],
      dark: orange[900],
    },
  },
})
