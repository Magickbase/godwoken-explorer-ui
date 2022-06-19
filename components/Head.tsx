import NextHead from 'next/head'
import { EXPLORER_TITLE, theme } from 'utils'

const DESCRIPTION = 'A blockchain explorer for godwoken'

const Head = () => (
  <NextHead>
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={DESCRIPTION} />

    <meta property="og:title" content={EXPLORER_TITLE} />
    <meta property="og:description" content={DESCRIPTION} />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="/icons/favicon.svg" />

    <meta name="application-name" content={EXPLORER_TITLE} />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content={EXPLORER_TITLE} />
    <meta name="theme-color" content={theme.palette.primary.main} />
    <meta name="format-detection" content="telephone=no" />

    <title>{EXPLORER_TITLE}</title>
    <link rel="icon" type="image/svg+xml" sizes="32x32" href="/favicon.svg" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="manifest" href="/manifest.json" />
  </NextHead>
)

export default Head
