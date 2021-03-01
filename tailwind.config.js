
module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: '#6C2AF6',
        secondary: '#9A5FE4',
        "light-grey": "#CCCCCC",
        "dark-grey": '#666666',
        "tag-primary": "#F69E4C",
        "tag-secondary": "#FFF1DE",
        "code-bg": "#E6E6E6"
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['odd', 'even', 'hover', 'focus'],
      borderColor: ['hover', 'focus'],
      padding: ['odd', 'even', 'first', 'last'],
      borderWidth: ['last'],
    },
  },
  plugins: [],
}
