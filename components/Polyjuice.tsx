import type { PolyjuiceCreator as PolyjuiceCreatorProps } from './AccountOverview'
import { useTranslation } from 'next-i18next'
import ScriptCode from 'components/ScriptCode'
import TitleWithDomain from 'components/TitleWithDomain'
import Tooltip from './Tooltip'
import InfoList, { InfoItermProps } from './InfoList'

const Polyjuice = ({
  script,
  scriptHash,
  domain,
}: {
  script: PolyjuiceCreatorProps['script']
  scriptHash: string
  domain: string
}) => {
  const [t] = useTranslation('account')
  const list: Array<InfoItermProps> = [
    {
      field: t('type'),
      content: `Polyjuice`,
    },
    {
      field: t(`l2ScriptHash`),
      content: scriptHash ? (
        <Tooltip title={scriptHash} placement="top">
          <span className="mono-font">{scriptHash}</span>
        </Tooltip>
      ) : (
        '-'
      ),
    },
    {
      field: t(`l2Script`),
      content: <ScriptCode name={t(`l2Script`)} script={script} />,
      expandable: true,
    },
  ]
  return <InfoList title={domain ? <TitleWithDomain domain={domain} /> : t('basicInfo')} list={list} />
}

export default Polyjuice
