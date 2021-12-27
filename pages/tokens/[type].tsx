import type { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { IconButton, Tooltip } from '@mui/material'
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import { fetchTokenList, handleApiError, API, formatBigInt } from 'utils'
import { PageNonPositiveException, PageOverflowException, TypeNotFoundException } from 'utils/exceptions'

type State = API.Tokens.Parsed & { type: 'native' | 'bridge' }

const BRIDGED_TOKEN_TEMPLATE_URL =
  'https://github.com/nervina-labs/godwoken_explorer/issues/new?assignees=Keith-CY&labels=Token+Registration&template=register-a-new-bridged-token.yml&title=%5BBridged+Token%5D+%2A%2AToken+Name%2A%2A'
const NATIVE_TOKEN_TEMPLATE_URL =
  'https://github.com/nervina-labs/godwoken_explorer/issues/new?assignees=Keith-CY&labels=Token+Registration&template=register-a-new-native-erc20-token.yml&title=%5BNative+ERC20+Token%5D+%2A%2AToken+Name%2A%2A'

const TokenList = ({ meta, tokens, type }: State) => {
  const [t] = useTranslation(['tokens', 'common'])

  const { push } = useRouter()
  const headers = [
    { key: 'token' },
    { key: 'address', label: 'id/address' },
    { key: 'totalSupply' },
    { key: 'holderCount' },
  ]

  const handlePageChange = (e: React.SyntheticEvent<HTMLSelectElement>) => {
    const p = +e.currentTarget.value
    if (Number.isNaN(p) || p === meta.current) {
      return
    }
    push(`/tokens/${type}?page=${p}`)
  }

  return (
    <div className="bg-white rounded-md shadow-md px-4 mt-10 pb-2">
      <div className="flex py-4 items-center justify-between text-sm sm:text-base">
        <span>{t(`${type}-udt-list`)}</span>
        <div className="flex items-center">
          <span className="mr-2">{t(`total-count-of-udt`, { total: (meta.total - 1) * 10 + tokens.length })}</span>
          <Tooltip title={t(type === 'bridge' ? 'add-bridged-token' : 'add-native-erc20-token')} placement="top">
            <a
              href={type === 'bridge' ? BRIDGED_TOKEN_TEMPLATE_URL : NATIVE_TOKEN_TEMPLATE_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              <IconButton>
                <AddBoxOutlinedIcon className="pointer-events-none" />
              </IconButton>
            </a>
          </Tooltip>
        </div>
      </div>
      <table className="table-auto border-collapse w-full text-left whitespace-nowrap border-t border-b border-gray-400">
        <thead>
          <tr>
            {headers.map(h => (
              <th
                key={h.key}
                title={t(h.label ?? h.key)}
                className={h.key === 'address' ? 'px-2 py-4 hidden sm:table-cell' : 'px-2 py-4'}
              >
                {t(h.label ?? h.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="align-baseline">
          {tokens.length ? (
            tokens.map(token => (
              <tr key={token.id.toString()} className="text-sm leading-6 border-t border-gray-300 hover:bg-hover-bg">
                <td className="p-2">
                  {token.icon ? (
                    <img src={token.icon} className="inline-block w-10 h-10 rounded-full mr-2" />
                  ) : (
                    <div className="inline-flex justify-center items-center w-10 h-10 rounded-full mr-2 bg-gray-100 text-lg">
                      {token.name?.[0] ?? '?'}
                    </div>
                  )}
                  <Link href={`/token/${token.id}`}>{`${token.name || '-'}${
                    token.symbol ? '(' + token.symbol + ')' : ''
                  }`}</Link>
                </td>
                <td className="font-mono overflow-hidden overflow-ellipsis text-secondary max-w-0 hidden sm:table-cell md:max-w-min">
                  <Link href={`/token/${token.id}`}>{token.shortAddress}</Link>
                </td>
                <td className="p-2">{formatBigInt(token.supply) || '-'}</td>
                <td className="p-2">{token.holderCount || '0'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="text-center py-4 text-gray-400">
                {t(`no_records`)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {meta.total ? (
        <div className="flex justify-end items-center mt-2">
          {meta.current === 1 ? null : (
            <Link href={`/tokens/${type}?page=${meta.current - 1}`}>{t(`prev`, { ns: 'common' })}</Link>
          )}
          <select className="mx-2 bg-gray-100" onChange={handlePageChange} value={meta.current}>
            {Array.from({ length: meta.total }).map((_, idx) => (
              <option key={idx} defaultValue={idx}>
                {idx + 1}
              </option>
            ))}
          </select>
          {meta.total > meta.current ? (
            <Link href={`/tokens/${type}?page=${meta.current + 1}`}>{t(`next`, { ns: 'common' })}</Link>
          ) : null}
        </div>
      ) : null}
    </div>
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
