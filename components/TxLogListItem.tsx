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

const TopicAndDataValueDisplay = ({
  format,
  argType,
  hexValue,
  decodedValue,
}: {
  format: 'hex' | 'decoded'
  argType: string
  hexValue: string
  decodedValue: string
}) => (
  <Box sx={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1 1 auto', px: 1 }}>
    {format === 'hex' ? (
      <Typography fontSize={14} variant="body2" className="mono-font">
        {hexValue}
      </Typography>
    ) : argType === 'address' ? (
      <TruncatedAddress address={decodedValue} leading={30} size="normal" />
    ) : (
      <Typography fontSize={14} variant="body2" className="mono-font">
        {decodedValue}
      </Typography>
    )}
  </Box>
)

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
        <ToggleButtonGroup
          color="primary"
          size="small"
          value={argsFormatState[arg]}
          exclusive
          onChange={handleChange}
          sx={{ alignSelf: 'flex-end' }}
        >
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
    <Box key={item.id} sx={{ display: 'flex', my: 2, width: '100%' }}>
      <Box
        sx={{ flex: '0 0 40px', height: '40px', mr: 1, color: '#2BD56F', background: '#F0FCF1', borderRadius: '50%' }}
      >
        <Typography variant="body2" fontSize={14} sx={{ textAlign: 'center', lineHeight: '40px' }}>
          {item.id}
        </Typography>
      </Box>
      <Box sx={{ flex: '1 1 auto', mt: 1, width: '100%' }}>
        <Box key="address" sx={{ display: 'flex', mb: 2 }}>
          <Typography fontSize={14} variant="body2" sx={{ flex: '0 0 60px', mr: 3, textAlign: 'right' }}>
            {t('address')}
          </Typography>
          <TruncatedAddress
            address={item.addressHash}
            leading={30}
            size="normal"
            sx={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}
          />
        </Box>
        <Box key="name" sx={{ display: 'flex', mb: 2 }}>
          <Typography fontSize={14} variant="body2" sx={{ flex: '0 0 60px', mr: 3, textAlign: 'right' }}>
            {t('name')}
          </Typography>
          <Typography component="span" fontSize={14}>
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
        <Box key="topics" sx={{ display: 'flex', mb: 2 }}>
          <Typography fontSize={14} variant="body2" sx={{ flex: '0 0 60px', mr: 3, textAlign: 'right' }}>
            {t('topics')}
          </Typography>
          <Stack
            sx={{
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              background: '#FAFAFA',
              p: 2,
              borderRadius: 2,
            }}
          >
            <Box key={0} sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#666666',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  mr: 1,
                  background: '#F0F0F0',
                  height: 'fit-content',
                }}
              >
                0
              </Typography>
              <Typography variant="body2" className="mono-font" sx={{ px: 1 }}>
                {item.parsedLog.topic}
              </Typography>
            </Box>
            {item.topics.slice(1).map(
              (topic, i) =>
                topic && (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666666',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        mr: 1,
                        background: '#F0F0F0',
                        height: 'fit-content',
                      }}
                    >
                      {i + 1}
                    </Typography>
                    <ArgsFormatSelector type="select" arg={`topic${i + 1}`} />
                    <Box>
                      <TopicAndDataValueDisplay
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
        <Box key="data" sx={{ display: 'flex', width: '100%' }}>
          <Typography fontSize={14} variant="body2" sx={{ flex: '0 0 60px', mr: 3, textAlign: 'right' }}>
            {t('data')}
          </Typography>
          <Box sx={{ display: 'flex', width: '100%', background: '#FAFAFA', p: 2, borderRadius: 2 }}>
            {argsFormatState.data === 'decoded' && (
              <Typography fontSize={14} component="span">
                {eventInputs[2].name + ':'}
              </Typography>
            )}
            <TopicAndDataValueDisplay
              format={argsFormatState.data}
              argType={eventInputs[2].type}
              hexValue={item.data}
              decodedValue={item.parsedLog.args[2].hex}
            />
            <ArgsFormatSelector type="button" arg="data" />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default TxLogsListItem
