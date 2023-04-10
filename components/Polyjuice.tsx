import type { PolyjuiceCreator as PolyjuiceCreatorProps } from './AccountOverview'
import { useTranslation } from 'next-i18next'
import ScriptCode from 'components/ScriptCode'
import Tooltip from './Tooltip'
import InfoList, { InfoItemProps } from './InfoList'

const Polyjuice = ({ script, scriptHash }: { script: PolyjuiceCreatorProps['script']; scriptHash: string }) => {
  const [t] = useTranslation('account')
  const list: Array<InfoItemProps> = [
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
  return <InfoList title={t('basicInfo')} list={list} />
}

export default Polyjuice
