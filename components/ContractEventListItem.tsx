import { useState, Dispatch, SetStateAction } from 'react'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { Box, Stack, Typography, Select, MenuItem, FormControl, InputBase, SxProps, Tooltip } from '@mui/material'
import { styled } from '@mui/material/styles'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import { ParsedEventLog, IMG_URL } from 'utils'
import TruncatedAddress from './TruncatedAddress'
import { CustomizedInput, ArgsValueDisplay } from './TxLogListItem'
import { EventFilterIcon } from './ContractEventsList'

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
  ({ theme }) => ({
    'paddingBottom': theme.spacing(1),
    'backgroundColor': '#FAFAFA',
    '&:before': {
      display: 'none',
    },
  }),
)

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />} {...props} />
))(({ theme }) => ({
  'minHeight': '0',
  'width': 'max-content',
  'flexDirection': 'row-reverse',
  'padding': '0',
  'paddingBottom': theme.spacing(0.5),
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    margin: `0 0 0 ${theme.spacing(1)}`,
  },
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: 0,
  paddingLeft: theme.spacing(2.5),
}))

const ContractEventListItem = ({
  item,
  setSearchText,
}: {
  item: ParsedEventLog
  setSearchText: Dispatch<SetStateAction<string>>
}) => {
  const [expanded, setExpanded] = useState<boolean>(false)
  const [dataFormat, setDataFormat] = useState<'hex' | 'decoded'>('hex')
  const [t] = useTranslation('list')
  const { name: eventName, inputs: eventInputs } = item.parsedLog.eventFragment

  const handleExpand = () => {
    setExpanded(!expanded)
  }

  const handleToggleButton = e => {
    setDataFormat(e.target.value)
  }

  return (
    <Stack sx={{ my: 2, p: 2, width: '100%', background: '#FAFAFA', borderRadius: 2 }}>
      <Accordion expanded={expanded} onChange={handleExpand}>
        <AccordionSummary>
          <Typography component="span" fontSize={14} sx={{ display: 'flex' }}>
            <Typography
              key="eventname"
              component="span"
              className="mono-font"
              fontSize={14}
              sx={{ flex: '0 0 auto ' }}
            >{`${eventName} (`}</Typography>
            {eventInputs.map((input, i) => (
              <Typography key={i} sx={{ flex: '0 0 auto ', p: 0 }} fontSize={14} component="span">
                <Typography component="span" className="mono-font" fontSize={14}>
                  {input.indexed && `index_topic_${i + 1}  `}
                </Typography>
                <Typography component="span" className="mono-font" fontSize={14} sx={{ color: '#00c9a7' }}>
                  {`${input.type} `}
                </Typography>
                <Typography
                  component="span"
                  className="mono-font"
                  fontSize={14}
                  sx={{ color: '#de4437' }}
                >{`${input.name}`}</Typography>
                {i < eventInputs.length - 1 && (
                  <Typography component="span" className="mono-font" fontSize={14}>
                    {', '}
                  </Typography>
                )}
              </Typography>
            ))}
            <Typography component="span" className="mono-font" fontSize={14}>{`) `}</Typography>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={0.5}>
            <Box key="topic0">
              <Typography component="span" className="mono-font" fontSize={14} sx={{ color: '#666666' }}>
                {`${eventInputs[0].type} `}
              </Typography>
              <Typography component="span" className="mono-font" fontSize={14}>
                {`${eventInputs[0].name}`}
              </Typography>
            </Box>
            <TruncatedAddress
              address={item.parsedLog.args[0]}
              leading={30}
              size="normal"
              sx={{ width: 'fit-content' }}
            />
            <Box key="topic1">
              <Typography component="span" className="mono-font" fontSize={14} sx={{ color: '#666666' }}>
                {`${eventInputs[1].type} `}
              </Typography>
              <Typography component="span" className="mono-font" fontSize={14}>
                {`${eventInputs[1].name}`}
              </Typography>
            </Box>
            <TruncatedAddress
              address={item.parsedLog.args[1]}
              leading={30}
              size="normal"
              sx={{ width: 'fit-content' }}
            />
            <Box key="topic2">
              <Typography component="span" className="mono-font" fontSize={14} sx={{ color: '#666666' }}>
                {`${eventInputs[2].type} `}
              </Typography>
              <Typography component="span" className="mono-font" fontSize={14}>
                {`${eventInputs[2].name}`}
              </Typography>
            </Box>
            <Typography fontSize={14} variant="body2" className="mono-font">
              {item.data}
            </Typography>
          </Stack>
        </AccordionDetails>
      </Accordion>
      <Stack direction="row" spacing={1}>
        <EventFilterIcon
          setSearchText={setSearchText}
          tooltip={t('filterEventBy', { filter: `Topic0=${item.topics[0]}` })}
          value={item.topics[0]}
        />
        <Stack>
          <Typography
            component="span"
            className="mono-font"
            fontSize={14}
            sx={{ color: '#666666' }}
            noWrap
          >{`[topic0] ${item.topics[0]}`}</Typography>
          <Typography component="span" className="mono-font" fontSize={14}>{`[topic1] ${item.topics[1]}`}</Typography>
          <Typography component="span" className="mono-font" fontSize={14}>{`[topic2] ${item.topics[2]}`}</Typography>
          <Stack direction="row" alignItems="center">
            <FormControl sx={{ my: 1, mr: 1 }} size="small">
              <Select
                value={dataFormat}
                onChange={handleToggleButton}
                size="small"
                sx={{ width: '64px' }}
                renderValue={(v: string) => (
                  <Typography variant="body2">{v.charAt(0).toUpperCase() + v.slice(1, 3)}</Typography>
                )}
                input={<CustomizedInput />}
              >
                <MenuItem value={'decoded'}>Decoded</MenuItem>
                <MenuItem value={'hex'}>Hex</MenuItem>
              </Select>
            </FormControl>
            <Image
              src={`${IMG_URL}arrow-right-slim.svg`}
              loading="lazy"
              width="17"
              height="17"
              layout="fixed"
              alt="arrow-right"
            />
            <ArgsValueDisplay
              format={dataFormat}
              argType={eventInputs[2].type}
              hexValue={item.data}
              decodedValue={item.parsedLog.args[2].hex}
            />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default ContractEventListItem
