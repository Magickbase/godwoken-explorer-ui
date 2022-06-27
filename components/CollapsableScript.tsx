import type { BasicScript } from './AccountOverview'
import { Chip, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { useTranslation } from 'next-i18next'

const CollapsableScript: React.FC<{ script: BasicScript; name: string }> = ({ script, name }) => {
  const [t] = useTranslation('account')
  return (
    <Accordion sx={{ boxShadow: 'none', width: '100%' }} disabled={!script}>
      <AccordionSummary sx={{ p: 0, textTransform: 'capitalize' }} expandIcon={<ExpandMore />}>
        <Typography sx={{ flexGrow: 1 }}>{name}</Typography>
        <Chip label={name || t('unknownScript')} color="info" variant="outlined" size="small" />
      </AccordionSummary>
      <AccordionDetails sx={{ overflow: 'auto', textOverflow: 'ellipsis', bgcolor: '#fafafa', textTransform: 'none' }}>
        <pre style={{ tabSize: '2ch', fontSize: '0.8em' }}>{`{\n\t"code_hash": "${
          script?.code_hash ?? ''
        }",\n\t"args": "${script?.args ?? ''}",\n\t"hash_type": "${script?.hash_type ?? ''}"\n}`}</pre>
      </AccordionDetails>
    </Accordion>
  )
}

export default CollapsableScript
