module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss': {},
    'postcss-preset-env': { stage: 3, autoprefixer: { flexbox: 'no-2009' }, feature: { 'custom-properties': false } },
    'postcss-flexbugs-fixes': {},
    'postcss-nesting': {},
  },
}
