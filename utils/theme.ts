import { createTheme } from '@mui/material/styles'
import { red } from '@mui/material/colors'

export const theme = createTheme(
  process.env.NEXT_PUBLIC_CHAIN_TYPE === 'mainnet'
    ? {
        palette: {
          primary: {
            light: '#F0F0FC',
            main: '#4C2CE4',
            dark: '#2D2C3E',
            contrastText: '#fff',
          },
          secondary: {
            light: '#999999',
            main: '#333333',
          },
          success: {
            light: '#F0FCF1',
            main: '#2BD46F',
          },
          error: {
            main: red.A400,
          },
          warning: {
            light: '#FFF5E5',
            main: '#FF9900',
          },
          info: {
            main: '#E8F4FF',
          },
        },
      }
    : {
        palette: {
          primary: {
            light: '#F1FAFD',
            main: '#2C97E4',
            dark: '#274B82',
          },
        },
      },
)
