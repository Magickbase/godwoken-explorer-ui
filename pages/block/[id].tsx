import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { fetchBlock, handleApiError, API, formatDatetime, CKB_EXPLORER_URL } from 'utils'
import CardFieldsetList from 'components/CardFieldsetList'

type State = API.Block.Parsed

const Block = (initState: State) => {
  const [block, setBlock] = useState(initState)
  const [t] = useTranslation('block')

  useEffect(() => {
    setBlock(initState)
  }, [setBlock, initState])

  const fieldsetList: Array<Array<{ label: Exclude<keyof State, 'number'>; value: React.ReactNode }>> = [
    [
      {
        label: 'timestamp',
        value: (
          <time dateTime={new Date(block.timestamp).toISOString()} title={t('timestamp')}>
            {formatDatetime(block.timestamp)}
          </time>
        ),
      },
      {
        label: 'l1Block',
        value: block.l1Block ? (
          <Link href={`${CKB_EXPLORER_URL}/block/${block.l1Block}`}>
            <a title={t('l1Block')} className="hashLink">
              {BigInt(block.l1Block).toLocaleString('en')}
            </a>
          </Link>
        ) : (
          t('pending')
        ),
      },
      {
        label: 'txHash',
        value: block.txHash ? (
          <Link href={`${CKB_EXPLORER_URL}/transaction/${block.txHash}`}>
            <a title={t('txHash')}>{block.txHash}</a>
          </Link>
        ) : (
          t('pending')
        ),
      },
    ],
    [
      {
        label: 'finalizeState',
        value: (
          <span className="capitalize" title={t('finalizeState')}>
            {t(block.finalizeState)}
          </span>
        ),
      },
      {
        label: 'txCount',
        value: <span title={t('txCount')}>{BigInt(block.txCount).toLocaleString('en')}</span>,
      },
      {
        label: 'aggregator',
        value: <span title={t('aggregator')}>{block.aggregator}</span>,
      },
    ],
  ]
  return (
    <div className="card-container mt-8">
      <h2 className="card-header">
        {t('block')}
        <span>{`#${BigInt(block.number).toLocaleString('en')}`}</span>
      </h2>
      <CardFieldsetList fieldsetList={fieldsetList} t={t} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ locale, res, params }) => {
  const { id } = params
  try {
    const block = await fetchBlock(id as string)
    const lng = await serverSideTranslations(locale, ['block'])
    return { props: { ...block, ...lng } }
  } catch (err) {
    return handleApiError(err, res)
  }
}

export default Block
