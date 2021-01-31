const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: '#212c3d',
        secondary: colors.teal,
        neurtral: colors.gray,
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['odd', 'hover', 'focus'],
      borderColor: ['hover', 'focus'],
    },
  },
  plugins: [],
}
