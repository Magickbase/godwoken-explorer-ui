const { i18n } = require('./next-i18next.config')

module.exports = {
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
}
