import Link from 'next/link'
import { useTranslation } from 'utils/i18n'

type Block = Record<'number' | 'hash' | 'txCount' | 'createdAt', string>
export type BlockListProps = { list: Array<Block> }

const fields = ['number', 'hash', 'txCount', 'createdAt']

const Block = ({ block }: { block: Block }) => (
  <tr className="odd:bg-gray-100">
    <td>
      <Link href={`/block/${block.hash}`}>
        <a>{block.number}</a>
      </Link>
    </td>
    <td>
      <Link href={`/block/${block.hash}`}>
        <a>{block.hash}</a>
      </Link>
    </td>
    <td>{block.txCount}</td>
    <td>{new Date(+block.createdAt).toLocaleDateString()}</td>
  </tr>
)

const BlockList = ({ list }: BlockListProps) => {
  const [t] = useTranslation('block')
  return (
    <table className="table-auto w-full">
      <thead>
        <tr>
          {fields.map(field => (
            <th key={field}>{t(field)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {list.map(block => (
          <Block key={block.hash} block={block} />
        ))}
      </tbody>
    </table>
  )
}
export default BlockList
