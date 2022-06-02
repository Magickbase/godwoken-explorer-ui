import { useReducer } from 'react'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import {
  Box,
  Stack,
  Typography,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Link,
  FormControl,
  InputBase,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { ParsedEventLog } from 'utils'
import TruncatedAddress from './TruncatedAddress'

const argsFormatReducer = (state, action) => {
  switch (action.type) {
    case 'topic1':
      return { ...state, topic1: action.payload }
    case 'topic2':
      return { ...state, topic2: action.payload }
    case 'data':
      return { ...state, data: action.payload }
  }
}

const TopicAndDataDisplay = ({
  format,
  argType,
  hexValue,
  decodedValue,
}: {
  format: 'hex' | 'decoded'
  argType: string
  hexValue: string
  decodedValue: string
}) => {
  return format === 'hex' ? (
    <Typography fontSize={14} variant="body2" className="mono-font">
      {hexValue}
    </Typography>
  ) : argType === 'address' ? (
    <TruncatedAddress address={decodedValue} leading={30} size="normal" />
  ) : (
    <Typography fontSize={14} variant="body2" className="mono-font">
      {decodedValue}
    </Typography>
  )
}

const CustomizedInput = styled(InputBase)`
  .MuiInputBase-input {
    padding: 4px 8px;
    border: 1px solid #ced4da;
  }
`

const TxLogsListItem = ({ item }: { item: ParsedEventLog }) => {
  const [t] = useTranslation('tx')
  const [argsFormatState, dispatch] = useReducer(argsFormatReducer, {
    topic1: 'decoded',
    topic2: 'decoded',
    data: 'decoded',
  })
  const { name: eventName, inputs: eventInputs } = item.parsedLog.eventFragment

  const ArgsFormatSelector = ({ type, arg }: { type: 'select' | 'button'; arg: string }) => {
    const handleChange = event => {
      dispatch({ type: arg, payload: event.target.value })
    }
    if (type === 'select') {
      return (
        <FormControl sx={{ m: 1, minWidth: 60 }} size="small">
          <Select
            value={argsFormatState[arg]}
            onChange={handleChange}
            size="small"
            renderValue={(v: string) => (
              <Typography variant="body2">{v.charAt(0).toUpperCase() + v.slice(1, 3)}</Typography>
            )}
            input={<CustomizedInput />}
          >
            <MenuItem value={'decoded'}>Decoded</MenuItem>
            <MenuItem value={'hex'}>Hex</MenuItem>
          </Select>
        </FormControl>
      )
    } else {
      return (
        <ToggleButtonGroup color="primary" size="small" value={argsFormatState[arg]} exclusive onChange={handleChange}>
          <ToggleButton sx={{ textTransform: 'unset' }} value={'decoded'}>
            {'Dec'}
          </ToggleButton>
          <ToggleButton sx={{ textTransform: 'unset' }} value={'hex'}>
            {'Hex'}
          </ToggleButton>
        </ToggleButtonGroup>
      )
    }
  }

  return (
    <Box key={item.id} sx={{ display: 'flex', m: 2, maxWith: '100%' }}>
      <Box sx={{ flex: '0 1 60px', bgcolor: 'primary.main', borderRadius: '50%' }}>
        <Typography variant="body2" fontSize={14}>
          {item.id}
        </Typography>
      </Box>
      <Box sx={{ flex: '1 1 auto', width: '100%' }}>
        <Box sx={{ display: 'flex' }}>
          <Typography fontSize={14} variant="body2" sx={{ width: 70 }}>
            {t('address')}
          </Typography>
          <TruncatedAddress address={item.addressHash} leading={30} size="normal" />
        </Box>
        <Box sx={{ display: 'flex' }}>
          <Typography fontSize={14} variant="body2" sx={{ width: 70 }}>
            {t('name')}
          </Typography>
          <Typography component="span" fontSize={14} sx={{}}>
            <Typography component="span" className="mono-font" fontSize={14}>{`${eventName} (`}</Typography>
            {eventInputs.map((input, i) => (
              <>
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
              </>
            ))}
            <Typography component="span" className="mono-font" fontSize={14}>{`) `}</Typography>
            <NextLink href={`/account/${item.addressHash}?tab=contract`} passHref>
              <Link href={`/account/${item.addressHash}?tab=contract`} underline="none" color="secondary" fontSize={14}>
                {t('viewSource')}
              </Link>
            </NextLink>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex' }}>
          <Typography fontSize={14} variant="body2" sx={{ width: 70 }}>
            {t('topics')}
          </Typography>
          <Stack>
            <Box key={0} sx={{ display: 'flex' }}>
              <Typography variant="body2" sx={{ borderRadius: 1 }}>
                0
              </Typography>
              <Typography variant="body2" className="mono-font">
                {item.parsedLog.topic}
              </Typography>
            </Box>
            {item.topics.slice(1).map(
              (topic, i) =>
                topic && (
                  <Box key={i} sx={{ display: 'flex' }}>
                    <Typography variant="body2" sx={{ borderRadius: 1 }}>
                      {i + 1}
                    </Typography>
                    <ArgsFormatSelector type="select" arg={`topic${i + 1}`} />
                    <Box>
                      <TopicAndDataDisplay
                        format={argsFormatState[`topic${i + 1}`]}
                        argType={eventInputs[i].type}
                        hexValue={item.topics[i]}
                        decodedValue={item.parsedLog.args[i]}
                      />
                    </Box>
                  </Box>
                ),
            )}
          </Stack>
        </Box>
        <Box sx={{ display: 'flex' }}>
          <Typography fontSize={14} variant="body2" sx={{ width: 70 }}>
            {t('data')}
          </Typography>
          <Typography fontSize={14} component="span">
            {eventInputs[2].name + ': '}
          </Typography>
          <TopicAndDataDisplay
            format={argsFormatState.data}
            argType={eventInputs[2].type}
            hexValue={item.data}
            decodedValue={item.parsedLog.args[2].hex}
          />
          <ArgsFormatSelector type="button" arg="data" />
        </Box>
      </Box>
    </Box>
  )
}

export default TxLogsListItem
