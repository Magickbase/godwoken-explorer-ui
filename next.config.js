const withPWA = require('next-pwa')
const { i18n } = require('./next-i18next.config')

module.exports = withPWA({
  i18n,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
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
