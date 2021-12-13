module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  mode: 'jit',
  theme: {
    extend: {
      colors: {
        'primary': '#6C2AF6',
        'secondary': '#9A5FE4',
        'light-grey': '#CCCCCC',
        'dark-grey': '#666666',
        'ink': '#333',
        'tag-primary': '#F69E4C',
        'tag-secondary': '#FFF1DE',
        'code-bg': '#E6E6E6',
        'hover-bg': '#f5f5f5',
      },
      fontFamily: {
        sans: [
          'Lato',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
      },
      lineHeight: {
        default: '1.2',
      },
    },
  },
  plugins: [require('postcss-import'), require('tailwindcss/nesting'), require('tailwindcss'), require('autoprefixer')],
}
