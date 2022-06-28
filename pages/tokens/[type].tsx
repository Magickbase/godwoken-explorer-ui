import type { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import {
  Avatar,
  Container,
  Paper,
  IconButton,
  Stack,
  Link,
  Tooltip,
  TableContainer,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
} from '@mui/material'
import BigNumber from 'bignumber.js'
import SubpageHead from 'components/SubpageHead'
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import Pagination from 'components/Pagination'
import { fetchTokenList, handleApiError, nameToColor, PAGE_SIZE } from 'utils'
import { PageNonPositiveException, PageOverflowException, TypeNotFoundException } from 'utils/exceptions'
import type { API } from 'utils/api/utils'

type State = API.Tokens.Parsed & { type: 'native' | 'bridge' }

const BRIDGED_TOKEN_TEMPLATE_URL =
  'https://github.com/nervina-labs/godwoken_explorer/issues/new?assignees=Keith-CY&labels=Token+Registration&template=register-a-new-bridged-token.yml&title=%5BBridged+Token%5D+%2A%2AToken+Name%2A%2A'
const NATIVE_TOKEN_TEMPLATE_URL =
  'https://github.com/nervina-labs/godwoken_explorer/issues/new?assignees=Keith-CY&labels=Token+Registration&template=register-a-new-native-erc20-token.yml&title=%5BNative+ERC20+Token%5D+%2A%2AToken+Name%2A%2A'

const TokenList = ({ meta, tokens, type }: State) => {
  const [t] = useTranslation(['tokens', 'common'])

  const headers = [
    { key: 'token' },
    { key: 'address', label: 'address' },
    { key: type === 'bridge' ? 'circulatingSupply' : 'totalSupply' },
    { key: 'holderCount' },
  ]

  const title = t(`${type}-udt-list`)
  return (
    <>
      <SubpageHead subtitle={title} />
      <Container sx={{ py: 6 }}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontWeight={600}>{title}</Typography>
            <Stack direction="row" alignItems="center">
              <Tooltip title={t(type === 'bridge' ? 'add-bridged-token' : 'add-native-erc20-token')} placement="top">
                <Link
                  href={type === 'bridge' ? BRIDGED_TOKEN_TEMPLATE_URL : NATIVE_TOKEN_TEMPLATE_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <IconButton>
                    <AddBoxOutlinedIcon className="pointer-events-none" />
                  </IconButton>
                </Link>
              </Tooltip>
            </Stack>
          </Stack>
          <TableContainer sx={{ width: '100%' }}>
            <Table size="small">
              <TableHead sx={{ textTransform: 'capitalize' }}>
                <TableRow>
                  {headers.map((h, idx) => (
                    <TableCell
                      component="th"
                      key={h.key}
                      title={t(h.label ?? h.key)}
                      sx={{
                        whiteSpace: 'nowrap',
                        display: idx === 1 ? { xs: 'none', sm: 'table-cell' } : 'table-cell',
                      }}
                    >
                      {t(h.label ?? h.key)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tokens.length ? (
                  tokens.map(token => (
                    <TableRow key={token.id.toString()}>
                      <TableCell>
                        <Stack direction="row" alignItems="center">
                          <Avatar
                            src={token.icon ?? null}
                            sx={{ bgcolor: token.icon ? '#f0f0f0' : nameToColor(token.name) }}
                          >
                            {token.name?.[0] ?? '?'}
                          </Avatar>
                          <NextLink href={`/token/${token.id}`}>
                            <Link href={`/token/${token.id}`} underline="none" color="secondary" ml={2}>
                              {`${token.name || '-'}${token.symbol ? '(' + token.symbol + ')' : ''}`}
                            </Link>
                          </NextLink>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <NextLink href={`/token/${token.id}`}>
                          <Link
                            href={`/token/${token.id}`}
                            display="flex"
                            alignItems="center"
                            underline="none"
                            color="secondary"
                            className="mono-font"
                          >
                            <Typography
                              fontSize="inherit"
                              fontFamily="inherit"
                              sx={{
                                display: {
                                  xs: 'none',
                                  md: 'flex',
                                },
                              }}
                            >
                              {token.address}
                            </Typography>
                            <Typography
                              fontSize="inherit"
                              fontFamily="inherit"
                              sx={{
                                display: {
                                  xs: 'flex',
                                  md: 'none',
                                },
                              }}
                            >
                              {`${token.address.slice(0, 8)}...${token.address.slice(-8)}`}
                            </Typography>
                          </Link>
                        </NextLink>
                      </TableCell>
                      <TableCell>{new BigNumber(token.supply || '0').toFormat() || '-'}</TableCell>
                      <TableCell>{token.holderCount || '0'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={headers.length}>{t(`no_records`)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination page={meta.current} total={meta.total * PAGE_SIZE} />
        </Paper>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<State, { type: 'bridge' | 'native' }> = async ({
  locale,
  res,
  query,
  params,
}) => {
  const { type } = params
  const { page } = query
  try {
    if (!['native', 'bridge'].includes(type)) {
      throw new TypeNotFoundException('native')
    }
    if (+page < 1) {
      throw new PageNonPositiveException()
    }
    const q = { type }
    if (typeof page === 'string' && !Number.isNaN(+page)) {
      q['page'] = page
    }

    const res = await fetchTokenList(q)

    if (res.meta.total < +page) {
      throw new PageOverflowException(res.meta.total)
    }

    const lng = await serverSideTranslations(locale, ['common', 'tokens'])
    return { props: { ...lng, ...res, type } }
  } catch (err) {
    switch (true) {
      case err instanceof TypeNotFoundException: {
        return {
          redirect: {
            destination: `/${locale}/tokens/${err.fallback}`,
            permanent: false,
          },
        }
      }
      case err instanceof PageNonPositiveException: {
        return {
          redirect: {
            destination: `/${locale}/tokens/${type}`,
            permanent: false,
          },
        }
      }
      case err instanceof PageOverflowException: {
        return {
          redirect: {
            destination: `/${locale}/tokens/${type}?page=${err.page}`,
            permanent: false,
          },
        }
      }
      default: {
        return handleApiError(err, res, locale)
      }
    }
  }
}

export default TokenList
