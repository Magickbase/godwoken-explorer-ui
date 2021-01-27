const { nextI18NextRewrites } = require('next-i18next/rewrites')

const localeSubpaths = {
  'en-US': 'en-US',
  'zh-CN': 'zh-CN',
}

module.exports = {
  rewrites: async () => nextI18NextRewrites(localeSubpaths),
  publicRuntimeConfig: {
    localeSubpaths,
  },
}
