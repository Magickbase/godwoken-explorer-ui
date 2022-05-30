import { useTranslation } from 'next-i18next'
import { Box, Stack, Typography, Divider } from '@mui/material'
import { formatBalance, nameToColor, ParsedEventLog } from 'utils'
import { useEffect } from 'react'
import TruncatedAddress from './TruncatedAddress'

const TxLogsList = ({ list }: { list: ParsedEventLog[] }) => {
  const [t] = useTranslation('tx')

  useEffect(() => {
    console.log(list)
  }, [])

  return (
    <Stack direction="column" justifyContent="center" alignItems="center" spacing={0}>
      {list?.length ? (
        list.map(item => (
          <Box key={item.id} sx={{ display: 'flex', m: 3 }}>
            <Box sx={{ flex: '0 1 60px', bgcolor: 'primary.main', borderRadius: '50%' }}>
              <Typography variant="body2">{item.id}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 auto' }}>
              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ p: 1 }}>{t('address')}</Typography>
                <TruncatedAddress address={item.addressHash} leading={30} size="normal" />
              </Box>
              <Box sx={{ display: 'flex' }}>
                <Typography>{t('name')}</Typography>
                <Typography variant="body2">{item.parsedLog.signature}</Typography>
              </Box>
              <Box sx={{ display: 'flex' }}>
                <Typography>{t('topics')}</Typography>
                <Stack>
                  <Box key={0} sx={{ display: 'flex' }}>
                    <Typography variant="body2" sx={{ borderRadius: 1 }}>
                      0
                    </Typography>
                    <Typography variant="body2" className="mono-font">
                      {item.parsedLog.topic}
                    </Typography>
                  </Box>
                  <Box key={1} sx={{ display: 'flex' }}>
                    <Typography variant="body2" sx={{ borderRadius: 1 }}>
                      1
                    </Typography>
                    <Box>
                      <Typography variant="body2" className="mono-font">
                        {item.parsedLog.args[0]}
                      </Typography>
                    </Box>
                  </Box>
                  <Box key={2} sx={{ display: 'flex' }}>
                    <Typography variant="body2" sx={{ borderRadius: 1 }}>
                      2
                    </Typography>
                    <Box>
                      <Typography variant="body2" className="mono-font">
                        {item.parsedLog.args[1]}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
              <Box sx={{ display: 'flex' }}>
                <Typography>{t('data')}</Typography>
                <Typography variant="body2">{item.parsedLog.args[2].hex}</Typography>
              </Box>
            </Box>
            <Divider />
          </Box>
        ))
      ) : (
        <Box>{t('noLogs')}</Box>
      )}
    </Stack>
  )
}

export default TxLogsList
