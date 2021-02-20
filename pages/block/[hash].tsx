import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useTranslation, fetchBlock, handleApiError, API, formatDatetime, ckbExplorerUrl } from 'utils'

type State = API.Block.Parsed

const Block = (initState: State) => {
  const [block, setBlock] = useState(initState)
  const [t] = useTranslation('block')
  const infoList: Array<{ label: keyof State; value: string | React.ReactNode }> = [
    {
      label: 'number',
      value: block.number,
    },
    {
      label: 'timestamp',
      value: formatDatetime(+block.timestamp),
    },
    {
      label: 'l1Block',
      value: (
        <Link href={`${ckbExplorerUrl}/block/${block.l1Block}`}>
          <a>{block.l1Block}</a>
        </Link>
      ),
    },
    {
      label: 'txHash',
      value: (
        <Link href={`${ckbExplorerUrl}/transaction/${block.txHash}`}>
          <a>{block.txHash}</a>
        </Link>
      ),
    },
    {
      label: 'finalizeState',
      value: block.finalizeState,
    },
    {
      label: 'txCount',
      value: block.txCount,
    },
    {
      label: 'aggregator',
      value: block.aggregator,
    },
  ]
  return (
    <div className="basic-info-list">
      {infoList.map(info => (
        <div key={info.label}>
          <span>{t(info.label)}</span>
          <div>{info.value}</div>
        </div>
      ))}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ res, params }) => {
  const { hash } = params
  try {
    const block = await fetchBlock(hash as string)
    return { props: block }
  } catch (err) {
    return handleApiError(err, res)
  }
}

export default Block
