import type { Udt as UdtProps } from './AccountOverview'
// import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import ScriptCode from 'components/ScriptCode'
import InfoList from 'components/InfoList'

interface SudtProps extends Pick<UdtProps, 'udt' | 'script'> {
  script_hash: string
}

const SUDT = ({ udt, script, script_hash }: SudtProps) => {
  const [t] = useTranslation('account')

  const list = [
    { field: t(`type`), content: `sUDT` },
    {
      field: t('name'),
      content: udt.name ?? '-',
      // TODO: token id of a bridge one leads to 404, wait for an update
      // content: (
      //   <NextLink href={`/token/${udt.id}`}>
      //     <a>{udt.name ?? '-'}</a>
      //   </NextLink>
      // ),
    },
    {
      field: t('symbol'),
      content: udt.symbol,
    },
    { field: t('decimal'), content: udt.decimal },
    script_hash
      ? {
          field: t(`l2Script`),
          content: <span className="mono-font">{script_hash}</span>,
        }
      : null,
    script
      ? {
          field: t(`l2Script`),
          content: <ScriptCode script={script} name={t(`l2Script`)} />,
          expandable: true,
        }
      : null,
  ]

  return <InfoList title={t(`basicInfo`)} list={list} />
}

export default SUDT
