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
  const { name: eventName, inputs: eventInputs } = item.parsedLog?.eventFragment ?? { name: null, inputs: [] }
  const unindexedInputs = eventInputs.filter(input => input.indexed === false)
  const unindexedParsedArgs = item.parsedLog?.args.filter(arg => typeof arg !== 'string')

  const handleExpand = () => {
    setExpanded(!expanded)
  }

  const handleToggleButton = e => {
    setDataFormat(e.target.value)
  }

  return (
    <Stack sx={{ my: 2, p: 2, width: '100%', background: '#FAFAFA', borderRadius: 2 }}>
      {item.parsedLog ? (
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
              {eventInputs.map((eventInput, idx) => (
                <>
                  <Box key={`topic-${idx}`}>
                    <Typography component="span" className="mono-font" fontSize={14} sx={{ color: '#666666' }}>
                      {`${eventInput.type} `}
                    </Typography>
                    <Typography component="span" className="mono-font" fontSize={14}>
                      {`${eventInput.name}`}
                    </Typography>
                  </Box>
                  {eventInput.type === 'address' ? (
                    <TruncatedAddress
                      address={item.parsedLog?.args[0]}
                      leading={30}
                      size="normal"
                      sx={{ width: 'fit-content' }}
                    />
                  ) : (
                    <Typography fontSize={14} variant="body2" className="mono-font">
                      {item.data}
                    </Typography>
                  )}
                </>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ) : null}
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
          {item.topics
            .slice(1)
            .map((topic, idx) =>
              topic !== '0x' ? (
                <Typography key={topic} component="span" className="mono-font" fontSize={14}>{`[topic${
                  idx + 1
                }] ${topic}`}</Typography>
              ) : null,
            )}
          {item.data && (
            <Stack direction="row" alignItems="center">
              {unindexedInputs.length ? (
                <>
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
                </>
              ) : (
                <span style={{ whiteSpace: 'pre', alignSelf: 'flex-start' }}>{`Data:         `}</span>
              )}
              {item.data
                .slice(2)
                .split(/(.{64})/)
                .filter(str => str.length > 0)
                .map((data, i) => (
                  <ArgsValueDisplay
                    key={i}
                    format={dataFormat}
                    argType={unindexedInputs[i]?.type}
                    hexValue={data}
                    decodedValue={unindexedParsedArgs ? unindexedParsedArgs[i]?.hex : data}
                    sx={{ ml: 1 }}
                  />
                ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}

export default ContractEventListItem
