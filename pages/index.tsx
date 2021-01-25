import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useReducer } from 'react'
interface State {
  blockList: Array<Record<'number' | 'hash' | 'txCount' | 'createdAt', string>>
}
const reducer: React.Reducer<State, Record<'type' | 'payload', string>> = (state, { type, payload }) => {
  // switch action.type
  switch (type) {
    default: {
      return state
    }
  }
}
const Home = (initState: State) => {
  const [{ blockList }, dispatch] = useReducer(reducer, initState)
  return (
    <main>
      <div>
        <input />
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th>Block Number</th>
              <th>Block Hash</th>
              <th>Tx Count</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {blockList.map(block => {
              return (
                <tr key={block.hash}>
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
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async () => {
  return {
    props: {
      blockList: Array.from({ length: 10 }).map((_, idx) => ({
        number: `number-${idx}`,
        hash: `hash-${idx}`,
        txCount: `txCount-${idx}`,
        createdAt: Date.now().toString(),
      })),
    },
  }
}

export default Home
