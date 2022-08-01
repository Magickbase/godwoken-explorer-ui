import NextHead from 'next/head'
import { EXPLORER_TITLE, theme } from 'utils'

const DESCRIPTION = 'A blockchain explorer for godwoken'

const Head = () => (
  <NextHead>
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="description" content={DESCRIPTION} />

    <meta property="og:title" content={EXPLORER_TITLE} />
    <meta property="og:description" content={DESCRIPTION} />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="/icon-512x512.png" />

    <meta name="application-name" content={EXPLORER_TITLE} />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content={EXPLORER_TITLE} />
    <meta name="theme-color" content={theme.palette.primary.main} />
    <meta name="format-detection" content="telephone=no" />

    <title>{EXPLORER_TITLE}</title>
    <link rel="icon" type="image/png" sizes="192" href="/icon-192x192.png" />
    <link rel="icon" type="image/png" sizes="512" href="/icon-512x512.png" />
    <link rel="apple-touch-icon" href="/icon-192x192.png" />
    <link rel="apple-touch-icon" sizes="152x152" href="/icon-192x192.png" />
    <link rel="apple-touch-icon" sizes="167x167" href="/icon-192x192.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="manifest" href="/manifest.json" />
    <script src="/scripts/crisp.js" defer />
  </NextHead>
)

export default Head
