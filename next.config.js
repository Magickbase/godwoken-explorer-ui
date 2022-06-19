const withPWA = require('next-pwa')
const { i18n } = require('./next-i18next.config')

module.exports = withPWA({
  i18n,
  experimental: { esmExternals: true },
  async rewrites() {
    return [
      {
        source: '/address/:addr*',
        destination: '/account/:addr*',
      },
    ]
  },
  pwa: {
    dest: 'public',
  },
})
