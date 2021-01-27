import NextI18Next from 'next-i18next'
import path from 'path'
const { localeSubpaths } = require('next/config').default().publicRuntimeConfig

const nextI18Next = new NextI18Next({
  defaultLanguage: 'en-US',
  otherLanguages: ['zh-CN'],
  localeSubpaths,
  localePath: path.resolve('public', 'static', 'locales'),
  strictMode: false,
})

export const appWithTranslation = nextI18Next.appWithTranslation
export const useTranslation = nextI18Next.useTranslation
