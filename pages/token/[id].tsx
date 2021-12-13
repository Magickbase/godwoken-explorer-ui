import { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { API, handleApiError, fetchToken, fetchTxList, formatBigInt, timeDistance } from 'utils'
import { PageNonPositiveException, PageOverflowException } from 'utils/exceptions'

type Props = {
  token: API.Token.Parsed
  txList: {
    txs: API.Txs.Parsed['txs']
    meta: Record<'current' | 'total', number>
  }
}

const Token = ({ token, txList }: Props) => {
  const [t, { language }] = useTranslation('tokens')
  const { push } = useRouter()
  const tokenInfo = [
    { label: 'decimal', value: token.decimal ?? '-' },
    { label: 'type', value: t(token.type) },
    {
      label: 'contract_address',
      value:
        (
          <Link href={`/account/${token.shortAddress}`}>
            <a className="font-mono">{token.shortAddress}</a>
          </Link>
        ) ?? '-',
    },
    // {
    //   label: 'layer1Lock',
    //   value: token.typeScript.codeHash ? (
    //     <pre className="text-xs">{`{\n\t"code_hash": "${token.typeScript.codeHash}",\n\t"args": "${token.typeScript.args}",\n\t"hash_type": "${token.typeScript.hashType}"\n}`}</pre>
    //   ) : (
    //     '-'
    //   ),
    // },
    {
      label: 'officialSite',
      value: token.officialSite ? (
        <a href={token.officialSite} target="_blank" rel="noopener noreferrer">
          {token.officialSite}
        </a>
      ) : (
        '-'
      ),
    },
    { label: 'description', value: <div className="whitespace-pre">{token.description ?? '-'}</div> },
  ]
  const tokenData = [
    { label: 'totalSupply', value: token.supply ?? '-' },
    // {label: 'value', value: token.supply ?? '-'},
    { label: 'holderCount', value: token.holderCount ?? '-' },
    { label: 'transferCount', value: token.transferCount ?? '-' },
  ]

  const headers = [
    { key: 'hash' },
    { key: 'from', label: 'from' },
    { key: 'to', label: 'to' },
    { key: 'value' },
    { key: 'age' },
  ]
  const handlePageChange = (e: React.SyntheticEvent<HTMLSelectElement>) => {
    const p = +e.currentTarget.value
    if (Number.isNaN(p) || p === txList.meta.current) {
      return
    }
    push(`/token/${token.id}?page=${p}`)
  }

  return (
    <div className="pt-10">
      <div className="flex items-center mb-5">
        {token.icon ? (
          <img src={token.icon} className="inline-block w-10 h-10 rounded-full mr-2" />
        ) : (
          <div className="inline-flex justify-center items-center w-10 h-10 rounded-full mr-2 bg-gray-100 text-lg">
            {token.name?.[0] ?? '?'}
          </div>
        )}
        <div>{`${token.name ?? '-'}${token.symbol ? '(' + token.symbol + ')' : ''}`}</div>
      </div>
      <div className="flex flex-col lg:flex-row">
        <div className="bg-white rounded-md shadow-md px-4 lg:w-1/2 lg:mr-2">
          <table className="border-collapse w-full overflow-hidden text-left whitespace-nowrap border-gray-400">
            <thead>
              <tr>
                <td colSpan={2} className="py-5 font-bold">
                  {t(`tokenInfo`)}
                </td>
              </tr>
            </thead>
            <tbody>
              {tokenInfo.map(field => (
                <tr key={field.label} className="text-sm leading-6 border-t border-gray-300 hover:bg-hover-bg">
                  <td className="pr-4 h-14 select-none">{`${t(field.label)}:`}</td>
                  <td className="w-full">{field.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-md shadow-md self-start px-4 mt-10 lg:mt-0 lg:w-1/2 lg:ml-2">
          <table className="border-collapse w-full text-left whitespace-nowrap border-gray-400">
            <thead>
              <tr>
                <td colSpan={2} className="py-5 font-bold">
                  {t(`tokenData`)}
                </td>
              </tr>
            </thead>
            <tbody>
              {tokenData.map(field => (
                <tr key={field.label} className="text-sm leading-6 border-t border-gray-300 hover:bg-hover-bg">
                  <td className="pr-4 h-14 select-none">{`${t(field.label)}:`}</td>
                  <td className="w-full">{field.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-md px-4 mt-10 py-4">
        <table className="table-auto border-collapse w-full text-left whitespace-nowrap border-t border-b border-gray-400">
          <thead>
            <tr>
              {headers.map(h => (
                <th key={h.key} title={t(h.label ?? h.key)} className="px-2 py-4">
                  {t(h.label ?? h.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="align-baseline">
            {txList.txs.map(tx => (
              <tr key={tx.hash} className="text-sm leading-6 border-t border-gray-300 hover:bg-hover-bg">
                <td className="p-2">
                  <Link href={`/tx/${tx.hash}`}>
                    <a title={tx.hash} className="hashLink font-mono flex-1 select-none">
                      {`${tx.hash.slice(0, 8)}...${tx.hash.slice(-8)}`}
                    </a>
                  </Link>
                </td>
                <td className="font-mono overflow-hidden overflow-ellipsis text-secondary max-w-0 md:max-w-min">
                  <Link href={`/account/${tx.from}`}>
                    <a title={tx.from} className="font-mono select-none">
                      {tx.from.startsWith('0x') ? `${tx.from.slice(0, 8)}...${tx.from.slice(-8)}` : tx.from}
                    </a>
                  </Link>
                </td>
                <td className="font-mono overflow-hidden overflow-ellipsis text-secondary max-w-0 md:max-w-min">
                  <Link href={`/account/${tx.to}`}>
                    <a title={tx.to} className="font-mono select-none">
                      {tx.to.startsWith('0x') ? `${tx.to.slice(0, 8)}...${tx.to.slice(-8)}` : tx.to}
                    </a>
                  </Link>
                </td>
                <td className="p-2">{formatBigInt(tx.value ?? '0')}</td>
                <td>
                  <time
                    dateTime={new Date(+tx.timestamp).toISOString()}
                    className="flex justify-start items-center list-datetime"
                    title={t('timestamp')}
                  >
                    {timeDistance(tx.timestamp, language)}
                  </time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end items-center mt-2">
          {txList.meta.current === 1 ? null : (
            <Link href={`/token/${token.id}?page=${txList.meta.current - 1}`}>{t(`prev`, { ns: 'common' })}</Link>
          )}
          <select className="mx-2 bg-gray-100" onChange={handlePageChange} value={txList.meta.current}>
            {Array.from({ length: txList.meta.total }).map((_, idx) => (
              <option key={idx} defaultValue={idx}>
                {idx + 1}
              </option>
            ))}
          </select>
          {txList.meta.total > txList.meta.current ? (
            <Link href={`/token/${token.id}?page=${txList.meta.current + 1}`}>{t(`next`, { ns: 'common' })}</Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<Props, { id: string }> = async ({ locale, res, params, query }) => {
  const { id } = params
  const { page } = query

  try {
    if (+page < 1) {
      throw new PageNonPositiveException()
    }
    const q = { account_id: id }
    if (typeof page === 'string' && !Number.isNaN(+page)) {
      q['page'] = page
    }

    const token = await fetchToken(id)
    const txListRes = await fetchTxList(q)
    const totalPage = Math.ceil(+txListRes.totalCount / 10)
    if (totalPage < +page) {
      throw new PageOverflowException(totalPage)
    }

    const lng = await serverSideTranslations(locale, ['common', 'tokens'])
    return {
      props: {
        token,
        txList: {
          txs: txListRes.txs,
          meta: {
            current: +txListRes.page,
            total: totalPage,
          },
        },
        ...lng,
      },
    }
  } catch (err) {
    switch (true) {
      case err instanceof PageNonPositiveException: {
        return {
          redirect: {
            destination: `/${locale}/token/${id}`,
            permanent: false,
          },
        }
      }
      case err instanceof PageOverflowException: {
        return {
          redirect: {
            destination: `/${locale}/token/${id}?page=${err.page}`,
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

export default Token
