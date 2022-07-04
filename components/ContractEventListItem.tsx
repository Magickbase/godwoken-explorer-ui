import { useState, Dispatch, SetStateAction } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import { ParsedEventLog } from 'utils'
import TruncatedAddress from './TruncatedAddress'
import LogFieldItem from 'components/LogItemField'

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

const ContractEventListItem = ({ item }: { item: ParsedEventLog; setSearchText: Dispatch<SetStateAction<string>> }) => {
  const [expanded, setExpanded] = useState<boolean>(false)
  const { name: eventName, inputs: eventInputs } = item.parsedLog?.eventFragment ?? { name: null, inputs: [] }

  const topics = item.topics.map((value, i) => {
    const parsed =
      item.parsedLog?.eventFragment.inputs[i - 1]?.type === 'address'
        ? { type: 'address', hex: item.parsedLog.args[i - 1] }
        : item.parsedLog?.args[i - 1] ?? undefined
    return { value, parsed }
  })

  const indexedCount = item.parsedLog?.eventFragment.inputs.filter(i => i.indexed).length ?? 0
  const dataList = item.data
    ?.slice(2)
    .match(/\w{64}/g)
    .map((frag, i) => {
      const parsed =
        item.parsedLog?.eventFragment.inputs[i + indexedCount]?.type === 'address'
          ? { type: 'address', hex: item.parsedLog.args[i + indexedCount] }
          : item.parsedLog?.args[i + indexedCount] ?? undefined
      return { value: `0x${frag}`, parsed }
    })

  const handleExpand = () => {
    setExpanded(!expanded)
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
                  <Typography component="span" className="mono-font" fontSize={14} sx={{ color: '#23C09B' }}>
                    {`${input.type} `}
                  </Typography>
                  <Typography
                    component="span"
                    className="mono-font"
                    fontSize={14}
                    sx={{ color: '#F83F3F' }}
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
      <Stack direction="column" spacing={1}>
        <Stack>
          {topics.map((topic, idx) =>
            topic.value === '0x' ? null : (
              <div
                key={topic.value}
                style={{
                  display: 'flex',
                  color: idx ? '#000' : '#666666',
                }}
              >
                <Typography component="span" className="mono-font" fontSize={14} my={1} mr="1ch" noWrap>{`[topic${
                  idx + 1
                }]`}</Typography>
                <LogFieldItem {...topic} />
              </div>
            ),
          )}
        </Stack>
        <Stack>
          {dataList.map(topic => (
            <LogFieldItem key={topic.value} {...topic} />
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}

export default ContractEventListItem
