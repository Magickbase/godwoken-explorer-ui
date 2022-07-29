import type { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useQuery } from 'react-query'
import { Avatar, Container, Stack, Link, TableContainer, Typography, Skeleton, Box, Button } from '@mui/material'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import SubpageHead from 'components/SubpageHead'
import Pagination from 'components/Pagination'
import Table from 'components/Table'
import PageTitle from 'components/PageTitle'
import { fetchTokenList, formatAmount, nameToColor, PAGE_SIZE } from 'utils'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Address from 'components/TruncatedAddress'
// import TokenLogo from 'components/TokenLogo'

const BRIDGED_TOKEN_TEMPLATE_URL =
  'https://github.com/magickbase/godwoken_explorer/issues/new?assignees=Keith-CY&labels=Token+Registration&template=register-a-new-bridged-token.yml&title=%5BBridged+Token%5D+%2A%2AToken+Name%2A%2A'
const NATIVE_TOKEN_TEMPLATE_URL =
  'https://github.com/magickbase/godwoken_explorer/issues/new?assignees=Keith-CY&labels=Token+Registration&template=register-a-new-native-erc20-token.yml&title=%5BNative+ERC20+Token%5D+%2A%2AToken+Name%2A%2A'

const TokenList = () => {
  const [t] = useTranslation(['tokens', 'common', 'list'])
  const {
    query: { page = '1', type },
  } = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const headers = [
    { key: 'token' },
    { key: 'address', label: 'address' },
    { key: type === 'bridge' ? 'circulatingSupply' : 'totalSupply' },
    { key: 'holderCount' },
    // TODO: in split UAN feature, add origin and bridge for bridge token
    // { key: 'origin' },
    // { key: 'bridge' },
  ]

  const { isLoading, data } = useQuery(
    ['tokens', type, page],
    () => fetchTokenList({ page: page as string, type: type as string }),
    {
      refetchInterval: 10000,
    },
  )

  const title = t(`${type}-udt-list`)
  return (
    <>
      <SubpageHead subtitle={title} />
      <Container sx={{ px: { xs: 2, sm: 3, md: 2, lg: 0 }, pb: { xs: 5.5, md: 11 } }}>
        <PageTitle>
          <Typography variant="inherit" display="inline" pr={1}>
            {title}
          </Typography>
        </PageTitle>
        <Box
          sx={{
            borderRadius: {
              xs: 2,
              sm: 4,
            },
            border: {
              xs: '0.5px solid #F0F0F0',
              md: '1px solid #F0F0F0',
            },
            pt: { xs: 1.5, md: 2 },
            pb: 2,
            mt: { xs: 2, md: 3 },
            bgcolor: '#fff',
          }}
        >
          {!isLoading ? (
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="space-between"
              alignItems="center"
              mb={{ xs: 1.5, md: 2 }}
              px={{ xs: 1.5, md: 3 }}
            >
              <Typography variant="inherit" color="secondary" fontWeight={500} fontSize={{ xs: 14, md: 16 }}>
                {t('n_kinds_in_total', {
                  ns: 'list',
                  number: data.tokens.length,
                })}
              </Typography>
              <Button
                endIcon={<AddCircleOutlineRoundedIcon sx={{ fontSize: 13 }} />}
                component={Link}
                href={type === 'bridge' ? BRIDGED_TOKEN_TEMPLATE_URL : NATIVE_TOKEN_TEMPLATE_URL}
                target="_blank"
                rel="noreferrer noopener"
                sx={{
                  'bgcolor': theme.palette.primary.light,
                  'borderRadius': 2,
                  'textTransform': 'none',
                  'height': 40,
                  'px': { xs: 1, md: 2 },
                  'fontWeight': 500,
                  'fontSize': { xs: 13, md: 14 },
                  '& .MuiButton-endIcon': {
                    marginLeft: 0.5,
                  },
                }}
              >
                {t(type === 'bridge' ? 'add-bridged-token' : 'add-native-erc20-token')}
              </Button>
            </Stack>
          ) : (
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="space-between"
              alignItems="center"
              mb={{ xs: 1.5, md: 2 }}
              px={{ xs: 1.5, md: 3 }}
            >
              <Skeleton animation="wave" width={50} />
              <Skeleton animation="wave" width={50} />
            </Stack>
          )}

          <TableContainer sx={{ width: '100%' }}>
            <Table>
              <thead style={{ textTransform: 'capitalize', fontSize: isMobile ? 12 : 14 }}>
                <tr>
                  {headers.map((h, idx) => (
                    <th
                      key={h.key}
                      title={t(h.label ?? h.key)}
                      style={{
                        whiteSpace: 'nowrap',
                        textAlign: idx === headers.length - 1 ? 'end' : 'left',
                      }}
                    >
                      {t(h.label ?? h.key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 20 }).map((_, idx) => (
                    <tr key={idx}>
                      <td colSpan={headers.length}>
                        <Skeleton animation="wave" />
                      </td>
                    </tr>
                  ))
                ) : data.tokens.length ? (
                  data.tokens.map(token => (
                    <tr key={token.id.toString()}>
                      <td>
                        <Stack direction="row" alignItems="center">
                          <Avatar
                            src={token.icon ?? null}
                            sx={{
                              bgcolor: token.icon ? '#f0f0f0' : nameToColor(token.name),
                              img: { objectFit: 'fill' },
                              width: isMobile ? 24 : 32,
                              height: isMobile ? 24 : 32,
                            }}
                          >
                            {token.name?.[0] ?? '?'}
                          </Avatar>
                          {/* TODO: Change Avatar to this */}
                          {/* <TokenLogo name={token.udt.name} logo={token.udt.icon} /> */}
                          <NextLink href={`/token/${token.id}`} passHref>
                            <Link
                              href={`/token/${token.id}`}
                              underline="none"
                              color="primary"
                              ml={1}
                              whiteSpace="nowrap"
                            >
                              {token.name || '-'}
                            </Link>
                          </NextLink>
                        </Stack>
                      </td>
                      <td>
                        <Address address={token.address} leading={isMobile ? 8 : 30} sx={{ width: 'min-content' }} />
                      </td>
                      <td style={{ whiteSpace: 'nowrap', width: type === 'bridge' ? '15%' : '25%' }}>
                        {formatAmount(token.supply || '0', {
                          symbol: token.symbol?.split('.')[0] ?? '',
                          decimal: token.decimal,
                        })}
                      </td>
                      {/* TODO: in split UAN feature, fix this textAlign */}
                      <td style={{ textAlign: type === 'bridge' ? 'end' : 'end' }}>{token.holderCount || '0'}</td>
                      {/* TODO: in split UAN feature, add origin and bridge for bridge token */}
                      {/* {type === 'bridge' && <td>{token.origin || '0'}</td>}
                      {type === 'bridge' && <td style={{ textAlign: 'end' }}>{token.bridge || '0'}</td>} */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length}>{t(`no_records`)}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>

          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent={isMobile ? 'center' : 'end'}
            alignItems="center"
            mt={{ xs: 0, md: 2 }}
            px={{ xs: 1.5, md: 3 }}
          >
            {isLoading ? (
              <Skeleton animation="wave" width="20px" />
            ) : (
              <Pagination page={data.meta.current} total={data.meta.total * PAGE_SIZE} />
            )}
          </Stack>
        </Box>
      </Container>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [{ params: { type: 'native' } }, { params: { type: 'bridge' } }],
  fallback: true,
})

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common', 'tokens', 'list'])
  return { props: lng }
}

export default TokenList
