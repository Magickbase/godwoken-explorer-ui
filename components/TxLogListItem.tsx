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
  SxProps,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { ParsedEventLog } from 'utils'
import TruncatedAddress from './TruncatedAddress'

const argsFormatReducer = (state, action) => {
  switch (action.type) {
    case 'topic0':
    case 'topic1':
    case 'topic2':
    case 'topic3':
    case 'data':
      return { ...state, [action.type]: action.payload }
    default: {
      return state
    }
  }
}

export const ArgsValueDisplay = ({
  format,
  argType,
  hexValue,
  decodedValue,
  sx = {},
}: {
  format: 'hex' | 'decoded'
  argType: string
  hexValue: string
  decodedValue: string
  sx?: SxProps
}) => (
  <Box
    sx={{
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
      flex: '1 1 auto',
      mx: 1,
      ...sx,
    }}
  >
    {format === 'hex' ? (
      <Typography fontSize={14} variant="body2" className="mono-font">
        {hexValue}
      </Typography>
    ) : argType === 'address' ? (
      <TruncatedAddress address={decodedValue} leading={30} />
    ) : (
      <Typography fontSize={14} variant="body2" className="mono-font">
        {decodedValue}
      </Typography>
    )}
  </Box>
)

export const CustomizedInput = styled(InputBase)`
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
    topic3: 'decoded',
    data: 'decoded',
  })
  const { name: eventName, inputs: eventInputs } = item.parsedLog?.eventFragment ?? { name: null, inputs: [] }
  const unindexedInputs = eventInputs.filter(input => input.indexed === false)
  const unindexedParsedArgs = item.parsedLog?.args.filter(arg => typeof arg !== 'string')

  const ArgsFormatSelector = ({ type, arg }: { type: 'select' | 'button'; arg: string }) => {
    const handleChange = event => {
      dispatch({ type: arg, payload: event.target.value })
    }
    if (type === 'select') {
      return (
        <FormControl sx={{ m: 0.5, minWidth: 60 }} size="small">
          <Select
            value={argsFormatState[arg]}
            onChange={handleChange}
            size="small"
            sx={{ width: '64px' }}
            renderValue={(v: string) => (
              <Typography variant="body2">{v.charAt(0).toUpperCase() + v.slice(1, 3)}</Typography>
            )}
            input={<CustomizedInput />}
          >
            <MenuItem key="decoded" value={'decoded'}>
              Decoded
            </MenuItem>
            <MenuItem key="hex" value={'hex'}>
              Hex
            </MenuItem>
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
          <ToggleButton key="decoded" sx={{ textTransform: 'unset' }} value={'decoded'}>
            {'Dec'}
          </ToggleButton>
          <ToggleButton key="hex" sx={{ textTransform: 'unset' }} value={'hex'}>
            {'Hex'}
          </ToggleButton>
        </ToggleButtonGroup>
      )
    }
  }

  return (
    <Box sx={{ display: 'flex', my: 2, width: '100%' }}>
      <Box
        key="id"
        sx={{ flex: '0 0 40px', height: '40px', mr: 1, color: '#2BD56F', background: '#F0FCF1', borderRadius: '50%' }}
      >
        <Typography variant="body2" fontSize={14} sx={{ textAlign: 'center', lineHeight: '40px' }}>
          {item.id}
        </Typography>
      </Box>
      <Box key="details" sx={{ flex: '1 1 auto', mt: 1, width: '100%' }}>
        <Box key="address" sx={{ display: 'flex', mb: 2 }}>
          <Typography
            fontSize={14}
            variant="body2"
            sx={{ flex: '0 0 60px', mr: 3, textAlign: 'right', fontWeight: 500 }}
          >
            {t('address')}
          </Typography>
          <TruncatedAddress
            address={item.addressHash}
            leading={30}
            sx={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}
          />
        </Box>
        {item.parsedLog ? (
          <Box key="name" sx={{ display: 'flex', mb: 2 }}>
            <Typography key="name" fontSize={14} variant="body2" sx={{ flex: '0 0 60px', mr: 3, textAlign: 'right' }}>
              {t('name')}
            </Typography>
            <Typography key="eventfullname" component="span" fontSize={14}>
              <Typography
                key="eventname"
                component="span"
                className="mono-font"
                fontSize={14}
              >{`${eventName} (`}</Typography>
              {eventInputs.map((input, i) => (
                <Typography key={i} component="span">
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
              <NextLink href={`/account/${item.addressHash}?tab=contract`} passHref>
                <Link
                  href={`/account/${item.addressHash}?tab=contract`}
                  underline="none"
                  color="secondary"
                  fontSize={14}
                >
                  {t('viewSource')}
                </Link>
              </NextLink>
            </Typography>
          </Box>
        ) : null}
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
              width: '100%',
            }}
          >
            {item.topics.map(
              (topic, i) =>
                topic !== '0x' && (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
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
                      {i}
                    </Typography>
                    <ArgsValueDisplay
                      format={argsFormatState[`topic${i}`]}
                      argType={item.parsedLog?.eventFragment.inputs[i - 1]?.type}
                      hexValue={item.topics[i]}
                      decodedValue={i > 0 ? item.parsedLog?.args[i - 1]?.toString() || item.topics[i] : item.topics[0]}
                      sx={{ flex: '0 1 auto' }}
                    />
                  </Box>
                ),
            )}
          </Stack>
        </Box>
        {item.data && (
          <Box key="data" sx={{ display: 'flex', width: '100%' }}>
            <Typography fontSize={14} variant="body2" sx={{ flex: '0 0 60px', mr: 3, textAlign: 'right' }}>
              {t('data')}
            </Typography>

            <Stack sx={{ width: '100%', background: '#FAFAFA', p: 2, borderRadius: 2 }}>
              {item.data
                .slice(2)
                .split(/(.{64})/)
                .filter(str => str.length > 0)
                .map((data, i) => (
                  <Box sx={{ display: 'flex' }} key={i}>
                    {item.parsedLog && argsFormatState.data === 'decoded' ? (
                      <Typography fontSize={14} component="span">
                        {unindexedInputs[i].name + ':'}
                      </Typography>
                    ) : null}
                    <ArgsValueDisplay
                      format={argsFormatState.data}
                      argType={unindexedInputs[i]?.type}
                      hexValue={data}
                      decodedValue={unindexedParsedArgs ? unindexedParsedArgs[i]?.hex : data}
                    />
                  </Box>
                ))}
              {item.parsedLog ? <ArgsFormatSelector type="button" arg="data" /> : null}
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default TxLogsListItem
